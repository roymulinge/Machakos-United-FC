# tickets/mpesa.py
import base64
import requests
from datetime import datetime
from django.conf import settings


def get_mpesa_token():
    """
    Gets OAuth access token from Safaricom.
    Token is valid for 1 hour.
    """
    credentials = f"{settings.MPESA_CONSUMER_KEY}:{settings.MPESA_CONSUMER_SECRET}"
    encoded     = base64.b64encode(credentials.encode()).decode()

    url = 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'

    response = requests.get(
        url,
        headers={'Authorization': f'Basic {encoded}'}
    )

    # log the full response so we can debug
    print(f"[MPesa] Token response status: {response.status_code}")
    print(f"[MPesa] Token response body:   {response.text}")

    response.raise_for_status()
    return response.json()['access_token']


def generate_password(shortcode, passkey, timestamp):
    """
    MPesa password = base64(shortcode + passkey + timestamp)
    """
    raw     = f"{shortcode}{passkey}{timestamp}"
    encoded = base64.b64encode(raw.encode()).decode()
    return encoded


def initiate_stk_push(phone_number, amount, order_id, fixture_name):
    """
    Sends STK Push to customer's phone.
    """
    token     = get_mpesa_token()
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    password  = generate_password(
        settings.MPESA_SHORTCODE,
        settings.MPESA_PASSKEY,
        timestamp,
    )

    # normalize phone to 254XXXXXXXXX format
    phone = str(phone_number).strip().replace(' ', '')
    if phone.startswith('0'):
        phone = '254' + phone[1:]
    elif phone.startswith('+'):
        phone = phone[1:]

    print(f"[MPesa] Initiating STK push to {phone} for KES {amount}")
    print(f"[MPesa] Using shortcode: {settings.MPESA_SHORTCODE}")

    payload = {
        'BusinessShortCode': settings.MPESA_SHORTCODE,
        'Password':          password,
        'Timestamp':         timestamp,
        'TransactionType':   'CustomerPayBillOnline',
        'Amount':            int(amount),
        'PartyA':            phone,
        'PartyB':            settings.MPESA_SHORTCODE,
        'PhoneNumber':       phone,
        'CallBackURL':       settings.MPESA_CALLBACK_URL,
        'AccountReference':  f'ORDER-{order_id}',
        'TransactionDesc':   f'Ticket: {fixture_name[:20]}',
    }

    print(f"[MPesa] STK payload: {payload}")

    url = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest'

    response = requests.post(
        url,
        json=payload,
        headers={
            'Authorization': f'Bearer {token}',
            'Content-Type':  'application/json',
        }
    )

    print(f"[MPesa] STK response status: {response.status_code}")
    print(f"[MPesa] STK response body:   {response.text}")

    response.raise_for_status()
    return response.json()