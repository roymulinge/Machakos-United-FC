# tickets/urls.py
from django.urls import path
from . import views

app_name = 'tickets'

urlpatterns = [
    # POST — initiate payment (sends STK push)
    path('initiate/',         views.InitiatePaymentView.as_view(),  name='initiate'),
    # POST — MPesa sends payment result here (public, no auth)
    path('mpesa-callback/',   views.MpesaCallbackView.as_view(),    name='mpesa-callback'),
    # GET — all orders for logged-in user
    path('my-orders/',        views.UserOrdersView.as_view(),        name='my-orders'),
    # GET — single order detail
    path('orders/<int:pk>/',  views.OrderDetailView.as_view(),       name='order-detail'),
]