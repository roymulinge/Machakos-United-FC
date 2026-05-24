# matches/views.py
from rest_framework import generics, permissions
from django.utils import timezone
from .models import Fixture, MatchResult
from .serializers import FixtureSerializer,   MatchResultWithFixtureSerializer


class UpcomingFixturesView(generics.ListAPIView):
    """
    GET /api/matches/fixtures/
    Returns all fixtures whose match_date is in the future.
    Public endpoint — no login required.
    """
    serializer_class   = FixtureSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        # timezone.now() is timezone-aware — always use this, not datetime.now()
        # select_related('result') fetches the result in the SAME SQL query
        # instead of one extra query per fixture (N+1 problem prevention)
        return Fixture.objects.filter(
            match_date__gte=timezone.now()  # gte = greater than or equal to
        ).select_related('result')


class AllFixturesView(generics.ListAPIView):
    """
    GET /api/matches/fixtures/all/
    Returns ALL fixtures (past and future) — useful for a full schedule page.
    """
    serializer_class   = FixtureSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Fixture.objects.all().select_related('result')


class FixtureDetailView(generics.RetrieveAPIView):
    """
    GET /api/matches/fixtures/<id>/
    Returns a single fixture with its result (if played).
    """
    serializer_class   = FixtureSerializer
    permission_classes = [permissions.AllowAny]
    queryset           = Fixture.objects.all().select_related('result')


class ResultsView(generics.ListAPIView):
    """
    GET /api/matches/results/
    Returns all match results (past matches only), most recent first.
    """
    serializer_class   = MatchResultWithFixtureSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        # select_related('fixture') avoids N+1 when serializer accesses fixture fields
        return MatchResult.objects.all().select_related('fixture')