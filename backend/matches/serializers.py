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