# matches/admin.py
from django.contrib import admin
from .models import Fixture, MatchResult


class MatchResultInline(admin.StackedInline):
    """
    Inline means MatchResult appears INSIDE the Fixture admin page.
    Admin can add the result without leaving the fixture form.
    """
    model  = MatchResult
    extra  = 0          # don't show empty extra forms by default
    can_delete = False  # result should be edited, not deleted


@admin.register(Fixture)
class FixtureAdmin(admin.ModelAdmin):
    # columns shown in the fixtures list view
    list_display  = ('__str__', 'competition', 'matchday', 'match_date', 'venue', 'tickets_available')
    # clickable filter sidebar on the right
    list_filter   = ('competition',)
    # which fields the search bar searches
    search_fields = ('home_team', 'away_team', 'venue')
    # embed the result form inside the fixture form
    inlines       = [MatchResultInline]


@admin.register(MatchResult)
class MatchResultAdmin(admin.ModelAdmin):
    list_display  = ('__str__', 'outcome', 'created_at')
    list_filter   = ('outcome',)