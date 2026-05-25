# tickets/views.py
import uuid
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from matches.models import Fixture
from .models import TicketOrder
from .serializers import TicketOrderSerializer, InitiatePaymentSerializer
from .mpesa import initiate_stk_push


class InitiatePaymentView(APIView):
    """
    POST /api/tickets/initiate/
    1. Validates the request
    2. Creates a PENDING ticket order
    3. Fires MPesa STK Push to customer's phone
    4. Returns the order + CheckoutRequestID to frontend
    """
    # IsAuthenticated — user must be logged in to buy tickets
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = InitiatePaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        # ── fetch the fixture ─────────────────────────────────────────────
        try:
            fixture = Fixture.objects.get(id=data['fixture_id'])
        except Fixture.DoesNotExist:
            return Response(
                {'error': 'Fixture not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # ── check availability ────────────────────────────────────────────
        if fixture.tickets_available < data['quantity']:
            return Response(
                {'error': f'Only {fixture.tickets_available} tickets remaining'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # ── calculate amount ──────────────────────────────────────────────
        unit_price   = fixture.ticket_price
        total_amount = unit_price * data['quantity']

        # ── create PENDING order ──────────────────────────────────────────
        # We create the order BEFORE calling MPesa so we have an ID to reference
        order = TicketOrder.objects.create(
            fixture      = fixture,
            user         = request.user,
            buyer_name   = data['buyer_name'],
            buyer_phone  = data['buyer_phone'],
            buyer_email  = data.get('buyer_email', ''),
            quantity     = data['quantity'],
            unit_price   = unit_price,
            total_amount = total_amount,
            status       = 'PENDING',
        )

        # ── fire STK Push ─────────────────────────────────────────────────
        try:
            mpesa_response = initiate_stk_push(
                phone_number = data['buyer_phone'],
                amount       = total_amount,
                order_id     = order.id,
                fixture_name = str(fixture),
            )
            order.mpesa_checkout_request_id = mpesa_response.get('CheckoutRequestID')
            order.save()

        except Exception as e:
            # TEMPORARY — print the full error so we can diagnose
            import traceback
            traceback.print_exc()  # prints full stack trace to Django terminal
            print(f"MPesa error: {e}")  # prints the actual error message

            order.status = 'FAILED'
            order.save()
            return Response(
                {'error': f'MPesa request failed: {str(e)}'},
                status=status.HTTP_502_BAD_GATEWAY
            )

        return Response({
            'order_id':             order.id,
            'checkout_request_id':  order.mpesa_checkout_request_id,
            'total_amount':         str(total_amount),
            'message':              'Check your phone and enter your MPesa PIN',
        }, status=status.HTTP_201_CREATED)


@method_decorator(csrf_exempt, name='dispatch')
class MpesaCallbackView(APIView):
    """
    POST /api/tickets/mpesa-callback/
    Safaricom calls this URL after the customer completes (or cancels) payment.
    Must be publicly accessible — no auth required (Safaricom doesn't send tokens).
    csrf_exempt because Safaricom doesn't send CSRF tokens.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        # Safaricom sends the callback as JSON in the request body
        callback_data = request.data
        body = callback_data.get('Body', {})
        stk_callback = body.get('stkCallback', {})

        # ResultCode 0 = success, anything else = failure/cancel
        result_code   = stk_callback.get('ResultCode')
        checkout_id   = stk_callback.get('CheckoutRequestID')

        # find the order by CheckoutRequestID
        try:
            order = TicketOrder.objects.get(mpesa_checkout_request_id=checkout_id)
        except TicketOrder.DoesNotExist:
            # return 200 even on error — Safaricom retries on non-200 responses
            # which would cause duplicate processing
            return Response({'ResultCode': 0, 'ResultDesc': 'Accepted'})

        # ── idempotency guard ─────────────────────────────────────────────
        # if callback already processed, don't process again
        # prevents duplicate ticket generation if Safaricom sends callback twice
        if order.status != 'PENDING':
            return Response({'ResultCode': 0, 'ResultDesc': 'Already processed'})

        if result_code == 0:
            # payment successful — extract receipt details
            items = stk_callback.get('CallbackMetadata', {}).get('Item', [])

            # build a dict from the callback items list
            # Safaricom returns: [{'Name': 'Amount', 'Value': 500}, ...]
            meta = {item['Name']: item.get('Value') for item in items}

            # update order to COMPLETE
            order.status               = 'COMPLETE'
            order.mpesa_receipt_number = meta.get('MpesaReceiptNumber', '')

            # generate a unique ticket code using uuid4 (random)
            # slice to first 12 chars: e.g. "A3F9-B2D1-CC"
            order.ticket_code = str(uuid.uuid4()).upper()[:12]
            order.save()

            # reduce available tickets on the fixture
            fixture = order.fixture
            fixture.tickets_available = max(
                0,  # never go below 0
                fixture.tickets_available - order.quantity
            )
            fixture.save()

        else:
            # payment failed or was cancelled
            order.status = 'FAILED'
            order.save()

        # always return 200 with this exact format — Safaricom requires it
        return Response({'ResultCode': 0, 'ResultDesc': 'Accepted'})


class UserOrdersView(generics.ListAPIView):
    """
    GET /api/tickets/my-orders/
    Returns all ticket orders for the logged-in user.
    """
    serializer_class   = TicketOrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # filter by request.user — users only see their own orders
        return TicketOrder.objects.filter(
            user=self.request.user
        ).select_related('fixture')


class OrderDetailView(generics.RetrieveAPIView):
    """
    GET /api/tickets/orders/<id>/
    Returns a single order — for the confirmation/status polling page.
    """
    serializer_class   = TicketOrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # users can only fetch their own orders — not other people's
        return TicketOrder.objects.filter(user=self.request.user)