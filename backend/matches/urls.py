# matches/urls.py
from django.urls import path
from . import views

app_name = 'matches'

urlpatterns = [
    # /api/matches/fixtures/        → upcoming fixtures only
    path('fixtures/',        views.UpcomingFixturesView.as_view(), name='upcoming-fixtures'),
    # /api/matches/fixtures/all/    → full schedule
    path('fixtures/all/',    views.AllFixturesView.as_view(),      name='all-fixtures'),
    # /api/matches/fixtures/3/      → single fixture detail
    path('fixtures/<int:pk>/', views.FixtureDetailView.as_view(),  name='fixture-detail'),
    # /api/matches/results/         → all results
    path('results/',         views.ResultsView.as_view(),          name='results'),
]