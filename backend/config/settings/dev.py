from .base import *
from dotenv import load_dotenv
from decouple import config

load_dotenv()

DEBUG = True
ALLOWED_HOSTS = ['localhost', '127.0.0.1']
SECRET_KEY = config('SECRET_KEY')
# Database
# https://docs.djangoproject.com/en/6.0/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
]

#M-Pesa sandbox keys (use environment variables)
MPESA_CONSUMER_KEY = 'your_sandbox_key'
MPESA_CONSUMER_SECRET = 'your_sandbox_secret'
MPESA_SHORTCODE = '174379' #sandobox shortcode
MPESA_PASSKEY = 'your_sandbox_passkey'
MPESA_CALLBACK_URL = 'https://ngrok-url/api/tickets/mpesa-callback' #for local testing with ngrok

#Redis optional caching in dev 
CACHES = {
    'default':{
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
    }
}