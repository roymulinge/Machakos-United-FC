# matches/serializers.py
from rest_framework import serializers
from .models import Fixture, MatchResult


class MatchResultSerializer(serializers.ModelSerializer):
    class Meta:
        model  = MatchResult
        fields = (
            'id', 'home_score', 'away_score',
            'outcome', 'scorers', 'match_report',
        )


class FixtureSerializer(serializers.ModelSerializer):
    # SerializerMethodField calls get_<fieldname>() to compute the value
    # used for computed properties that aren't DB columns
    is_sold_out = serializers.SerializerMethodField()

    # source='result' matches the related_name on MatchResult.fixture
    # read_only=True — frontend can't POST a result through this serializer
    result      = MatchResultSerializer(read_only=True)

    # competition_display shows "Kenyan Premier League" instead of "KPL"
    competition_display = serializers.CharField(
        source='get_competition_display',  # Django auto-generates this method for choice fields
        read_only=True,
    )

    class Meta:
        model  = Fixture
        fields = (
            'id', 'home_team', 'away_team', 'match_date',
            'venue', 'competition', 'competition_display',
            'matchday', 'ticket_price', 'tickets_available',
            'is_sold_out', 'result',
        )

    def get_is_sold_out(self, obj):
        # obj is the Fixture instance being serialized
        return obj.is_sold_out
class MatchResultWithFixtureSerializer(serializers.ModelSerializer):
    """
    Used by ResultsView and HomePage — includes the full nested fixture.
    We keep MatchResultSerializer separate (no fixture) so FixtureSerializer
    can embed it without creating a circular reference.
    Circular reference = MatchResult embeds Fixture embeds MatchResult → infinite loop.
    """
    # source='fixture' tells DRF to serialize the related Fixture object
    # using FixtureSerializer — but we exclude 'result' to avoid the circular loop
    fixture = FixtureSerializer(read_only=True)

    class Meta:
        model  = MatchResult
        fields = (
            'id', 'home_score', 'away_score',
            'outcome', 'scorers', 'match_report',
            'fixture',   # ← nested fixture now included
        )