# config/admin_urls.py
# All admin API endpoints in one place — separate from public API
from django.urls import path
from matches.views import (
    AdminFixtureListCreateView,
    AdminFixtureDetailView,
    AdminResultCreateView,
    AdminResultDetailView,
)
from squad.views import (
    AdminPlayerListCreateView,
    AdminPlayerDetailView,
)
from tickets.views import (
    AdminTicketListView,
    AdminVerifyTicketView,
    AdminDashboardStatsView,
)

urlpatterns = [
    # dashboard stats
    path('stats/',                  AdminDashboardStatsView.as_view(),    name='admin-stats'),
    # fixtures
    path('fixtures/',               AdminFixtureListCreateView.as_view(), name='admin-fixtures'),
    path('fixtures/<int:pk>/',      AdminFixtureDetailView.as_view(),     name='admin-fixture-detail'),
    # results
    path('results/',                AdminResultCreateView.as_view(),      name='admin-results'),
    path('results/<int:pk>/',       AdminResultDetailView.as_view(),      name='admin-result-detail'),
    # squad
    path('squad/',                  AdminPlayerListCreateView.as_view(),  name='admin-squad'),
    path('squad/<int:pk>/',         AdminPlayerDetailView.as_view(),      name='admin-player-detail'),
    # tickets
    path('tickets/',                AdminTicketListView.as_view(),        name='admin-tickets'),
    path('tickets/verify/',         AdminVerifyTicketView.as_view(),      name='admin-verify-ticket'),
]