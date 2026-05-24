# squad/urls.py
from django.urls import path
from . import views

app_name = 'squad'

urlpatterns = [
    # /api/squad/          → full squad list
    path('',          views.SquadListView.as_view(),   name='squad-list'),
    # /api/squad/3/        → single player detail
    path('<int:pk>/', views.PlayerDetailView.as_view(), name='player-detail'),
]