# squad/views.py
from rest_framework import generics, permissions
from .models import Player
from .serializers import PlayerSerializer
from matches.views import IsStaffOrContentManager

class SquadListView(generics.ListAPIView):
    """
    GET /api/squad/
    Returns all active players, grouped naturally by squad_number ordering.
    Frontend can then group by position.
    """
    serializer_class   = PlayerSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        # filter(is_active=True) hides players the admin deactivated
        return Player.objects.filter(is_active=True)


class PlayerDetailView(generics.RetrieveAPIView):
    """
    GET /api/squad/<id>/
    Returns a single player's full profile.
    """
    serializer_class   = PlayerSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Player.objects.filter(is_active=True)
    
class AdminPlayerListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/admin/squad/   → all players including inactive
    POST /api/admin/squad/   → create new player
    """
    serializer_class   = PlayerSerializer
    permission_classes = [IsStaffOrContentManager]

    def get_queryset(self):
        # admin sees ALL players including inactive ones
        return Player.objects.all()


class AdminPlayerDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET/PATCH/DELETE /api/admin/squad/<id>/
    """
    serializer_class   = PlayerSerializer
    permission_classes = [IsStaffOrContentManager]
    queryset           = Player.objects.all()