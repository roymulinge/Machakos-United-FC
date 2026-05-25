# matches/views.py
from rest_framework import generics, permissions
from django.utils import timezone
from .models import Fixture, MatchResult
from .serializers import FixtureSerializer,  MatchResultSerializer, MatchResultWithFixtureSerializer
from rest_framework.response import Response
from rest_framework.views import APIView

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


class IsStaffOrContentManager(permissions.BasePermission):
    """
    Custom permission — only staff or users with manager/owner role can pass.
    Used on all admin write endpoints.
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if request.user.is_staff:
            return True
        # check the profile role
        profile = getattr(request.user, 'profile', None)
        return profile and profile.can_manage_content


# ── Admin Fixture endpoints ───────────────────────────────────────────────────

class AdminFixtureListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/admin/fixtures/     → list all fixtures (past + future)
    POST /api/admin/fixtures/     → create a new fixture
    """
    serializer_class   = FixtureSerializer
    permission_classes = [IsStaffOrContentManager]

    def get_queryset(self):
        return Fixture.objects.all().select_related('result').order_by('-match_date')


class AdminFixtureDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/admin/fixtures/<id>/   → get single fixture
    PUT    /api/admin/fixtures/<id>/   → full update
    PATCH  /api/admin/fixtures/<id>/   → partial update
    DELETE /api/admin/fixtures/<id>/   → delete fixture
    """
    serializer_class   = FixtureSerializer
    permission_classes = [IsStaffOrContentManager]
    queryset           = Fixture.objects.all().select_related('result')


# ── Admin Result endpoints ────────────────────────────────────────────────────

class AdminResultCreateView(generics.CreateAPIView):
    """
    POST /api/admin/results/   → add a result to a fixture
    """
    serializer_class   = MatchResultSerializer
    permission_classes = [IsStaffOrContentManager]

    def perform_create(self, serializer):
        # perform_create is called by CreateAPIView after validation
        # we can add extra logic here before saving
        serializer.save()


class AdminResultDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET/PATCH/DELETE /api/admin/results/<id>/
    """
    serializer_class   = MatchResultSerializer
    permission_classes = [IsStaffOrContentManager]
    queryset           = MatchResult.objects.all()