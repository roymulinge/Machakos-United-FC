from django.urls import path
from . import views

app_name = 'users'

urlpatterns =[
    path('api/register/', views.RegisterView.as_view(), name='register'),
    path('api/login/', views.LoginView.as_view(), name='login'),
    path('api/profile/', views.ProfileView.as_view(), name='profile'),
    path('api/password-reset/', views.PasswordResetRequestView.as_view(), name='password_reset'),
    path('api/password-reset/confirm/', views.PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
]