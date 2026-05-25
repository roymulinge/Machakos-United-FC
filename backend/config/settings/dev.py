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
    'default':{
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('DB_NAME'),
        'USER': config('DB_USER'),
        'PASSWORD': config('DB_PASSWORD'),
        'HOST': config('DB_HOST'),
        'PORT': config('DB_PORT'),
    }

}

EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
]

#M-Pesa sandbox keys (use environment variables)
MPESA_CONSUMER_KEY = os.getenv('MPESA_CONSUMER_KEY')
MPESA_CONSUMER_SECRET = os.getenv('MPESA_CONSUMER_SECRET')
MPESA_PASSKEY = os.getenv('MPESA_PASSKEY')
MPESA_SHORTCODE = os.getenv('MPESA_SHORTCODE')
MPESA_CALLBACK_URL = os.getenv('MPESA_CALLBACK_URL')#for local testing with ngrok

#Redis optional caching in dev 
CACHES = {
    'default':{
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
    }
}

FRONTEND_URL = config('FRONTEND_URL')