# tickets/serializers.py
from rest_framework import serializers
from .models import TicketOrder
from matches.serializers import FixtureSerializer


class TicketOrderSerializer(serializers.ModelSerializer):
    """Used to return order data to the frontend"""
    # nested fixture gives frontend all match details without a second API call
    fixture_detail = FixtureSerializer(source='fixture', read_only=True)

    class Meta:
        model  = TicketOrder
        fields = (
            'id', 'fixture', 'fixture_detail',
            'buyer_name', 'buyer_phone', 'buyer_email',
            'quantity', 'unit_price', 'total_amount',
            'status', 'ticket_code', 'created_at',
        )
        # these are set by the system — frontend never sends them
        read_only_fields = (
            'unit_price', 'total_amount', 'status',
            'ticket_code', 'created_at',
        )


class InitiatePaymentSerializer(serializers.Serializer):
    """
    Validates the data sent by the frontend when user clicks 'Buy'.
    Uses base Serializer (not ModelSerializer) because we're validating
    input before creating the order + calling MPesa — not just saving a model.
    """
    fixture_id  = serializers.IntegerField()
    quantity    = serializers.IntegerField(min_value=1, max_value=10)
    buyer_name  = serializers.CharField(max_length=200)
    buyer_phone = serializers.CharField(max_length=15)
    buyer_email = serializers.EmailField(required=False, allow_blank=True)

    def validate_buyer_phone(self, value):
        """
        Field-level validator for phone number.
        Called automatically by DRF as validate_<fieldname>.
        """
        phone = str(value).strip().replace(' ', '')
        # accept: 07XXXXXXXX (10 digits), 254XXXXXXXXX (12 digits), +254XXXXXXXXX (13 chars)
        if not (
            (phone.startswith('0')   and len(phone) == 10) or
            (phone.startswith('254') and len(phone) == 12) or
            (phone.startswith('+254')and len(phone) == 13)
        ):
            raise serializers.ValidationError(
                'Enter a valid Kenyan phone number e.g. 0712345678'
            )
        return phone