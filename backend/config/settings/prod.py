from .base import *
import os
from decouple import config
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = config('SECRET_KEY')
DEBUG = False

ALLOWED_HOSTS = config('ALLOWED_HOSTS', cast=lambda v:[s.strip() for s in v.split(',')])
#Example .env: ALLOWED_HOSTS=machakosunitedfc.co.ke, www.machakosunitedfc.co.ke

#PostgreSQL (recommended for production)
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
CORS_ALLOWED_ORIGINS = config('CORS_ALLOWED_ORIGINS', cast=lambda v: [s.strip() for s in v.split(',')])
CSRF_TRUSTED_ORIGINS = ['https://machakosunitedfc.co.ke', 'https://www.machakosunitedfc.co.ke']

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = config('EMAIL_HOST')
EMAIL_PORT = config('EMAIL_PORT')
EMAIL_USE_TLS = True
EMAIL_HOST_USER = config('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD')

#Security Middleware
SECURE_HSTS_SECONDS = 31536000 # 1year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE =True
CSRF_COOKIE_SECURE = True