# tickets/models.py
from django.db import models
from django.conf import settings
from matches.models import Fixture


class TicketOrder(models.Model):
    """
    Represents a ticket purchase attempt.
    Created when user initiates MPesa STK Push.
    Updated when MPesa sends the callback.
    """

    # ── status lifecycle ──────────────────────────────────────────────────
    # PENDING  → STK push sent, waiting for user to enter PIN
    # COMPLETE → MPesa confirmed payment, ticket is valid
    # FAILED   → user cancelled, timeout, or wrong PIN
    STATUS_CHOICES = [
        ('PENDING',  'Pending'),
        ('COMPLETE', 'Complete'),
        ('FAILED',   'Failed'),
    ]

    # ── relationships ─────────────────────────────────────────────────────
    # ForeignKey — one fixture can have many ticket orders
    # on_delete=PROTECT prevents deleting a fixture that has orders
    fixture = models.ForeignKey(
        Fixture,
        on_delete=models.PROTECT,
        related_name='ticket_orders',
    )

    # ForeignKey to the user who bought the ticket
    # on_delete=PROTECT — don't delete orders if user is deleted
    # null=True/blank=True — allows guest checkout in future
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='ticket_orders',
        null=True,
        blank=True,
    )

    # ── buyer details ─────────────────────────────────────────────────────
    # stored separately so guest checkout works even without a user account
    buyer_name  = models.CharField(max_length=200)
    buyer_phone = models.CharField(max_length=15)  # MPesa phone number
    buyer_email = models.EmailField(blank=True)

    # ── order details ─────────────────────────────────────────────────────
    quantity      = models.PositiveIntegerField(default=1)
    unit_price    = models.DecimalField(max_digits=8, decimal_places=2)
    total_amount  = models.DecimalField(max_digits=10, decimal_places=2)

    # ── MPesa tracking fields ─────────────────────────────────────────────
    # CheckoutRequestID — MPesa's ID for this STK push session
    # used to match the callback to the correct order
    mpesa_checkout_request_id = models.CharField(
        max_length=200, blank=True, unique=True, null=True
    )
    # MpesaReceiptNumber — the M-PESA transaction code (e.g. QHX2K8LMNO)
    # only set after successful payment
    mpesa_receipt_number = models.CharField(max_length=100, blank=True)

    # ── status ────────────────────────────────────────────────────────────
    status     = models.CharField(
        max_length=10, choices=STATUS_CHOICES, default='PENDING'
    )
    # ticket_code is the QR/entry code shown to the buyer after payment
    # blank until payment confirmed
    ticket_code = models.CharField(max_length=50, blank=True, unique=True, null=True)

    # ── timestamps ────────────────────────────────────────────────────────
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)  # auto_now updates on every save

    class Meta:
        ordering            = ['-created_at']  # newest orders first
        verbose_name        = 'Ticket Order'
        verbose_name_plural = 'Ticket Orders'

    def __str__(self):
        return f"Order #{self.id} — {self.buyer_name} — {self.status}"

    def save(self, *args, **kwargs):
        # auto-calculate total whenever the model is saved
        if self.unit_price and self.quantity:
            self.total_amount = self.unit_price * self.quantity
        super().save(*args, **kwargs)