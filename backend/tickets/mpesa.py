# tickets/mpesa.py
import base64
import requests
from datetime import datetime
from django.conf import settings


def get_mpesa_token():
    """
    Gets a short-lived OAuth access token from Safaricom.
    Every MPesa API call needs this token in the Authorization header.
    Tokens expire after 1 hour.
    """
    # base64 encode "consumer_key:consumer_secret" for Basic Auth
    # this is the standard OAuth client credentials format
    credentials = f"{settings.MPESA_CONSUMER_KEY}:{settings.MPESA_CONSUMER_SECRET}"
    encoded     = base64.b64encode(credentials.encode()).decode()

    # Safaricom sandbox token URL
    url = 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'

    response = requests.get(
        url,
        headers={'Authorization': f'Basic {encoded}'}
    )
    response.raise_for_status()  # raises HTTPError if status is 4xx or 5xx
    return response.json()['access_token']


def generate_password(shortcode, passkey, timestamp):
    """
    MPesa requires a base64-encoded password for every STK Push.
    Formula: base64(shortcode + passkey + timestamp)
    """
    raw      = f"{shortcode}{passkey}{timestamp}"
    encoded  = base64.b64encode(raw.encode()).decode()
    return encoded


def initiate_stk_push(phone_number, amount, order_id, fixture_name):
    """
    Sends an STK Push to the customer's phone.
    This triggers the MPesa PIN prompt on their device.

    Returns the full Safaricom API response dict.
    The key field we store is CheckoutRequestID.
    """
    token     = get_mpesa_token()
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')  # format: 20260524143000
    password  = generate_password(
        settings.MPESA_SHORTCODE,
        settings.MPESA_PASSKEY,
        timestamp,
    )

    # Kenyan phones: normalize to 254XXXXXXXXX format
    # MPesa rejects 07XXXXXXXX format
    phone = str(phone_number).strip()
    if phone.startswith('0'):
        phone = '254' + phone[1:]   # 0712345678 → 254712345678
    elif phone.startswith('+'):
        phone = phone[1:]           # +254712345678 → 254712345678

    payload = {
        'BusinessShortCode': settings.MPESA_SHORTCODE,
        'Password':          password,
        'Timestamp':         timestamp,
        'TransactionType':   'CustomerPayBillOnline',
        'Amount':            int(amount),        # MPesa only accepts integers
        'PartyA':            phone,              # customer phone
        'PartyB':            settings.MPESA_SHORTCODE,
        'PhoneNumber':       phone,              # phone to receive STK push
        'CallBackURL':       settings.MPESA_CALLBACK_URL,
        'AccountReference':  f'ORDER-{order_id}',
        'TransactionDesc':   f'Ticket: {fixture_name[:20]}',  # max 20 chars
    }

    response = requests.post(
        'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
        json=payload,
        headers={
            'Authorization': f'Bearer {token}',
            'Content-Type':  'application/json',
        }
    )
    response.raise_for_status()
    return response.json()