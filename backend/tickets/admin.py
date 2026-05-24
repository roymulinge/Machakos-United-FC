# tickets/admin.py
from django.contrib import admin
from .models import TicketOrder


@admin.register(TicketOrder)
class TicketOrderAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'buyer_name', 'buyer_phone', 'fixture',
        'quantity', 'total_amount', 'status', 'created_at'
    )
    list_filter  = ('status', 'fixture')
    search_fields = ('buyer_name', 'buyer_phone', 'mpesa_receipt_number', 'ticket_code')
    # make these read-only in admin — they're set by the system not manually
    readonly_fields = (
        'mpesa_checkout_request_id', 'mpesa_receipt_number',
        'ticket_code', 'total_amount', 'created_at', 'updated_at'
    )
    # don't let admin change status manually — it's set by MPesa callback
    list_editable = ()