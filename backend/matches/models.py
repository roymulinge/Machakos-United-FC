# matches/models.py
from django.db import models


class Fixture(models.Model):
    """
    Represents an upcoming or scheduled match.
    Admin creates these through the Django admin panel.
    """

    # Competition choices — keeps data consistent, no typos like "KPL" vs "kpl"
    COMPETITION_CHOICES = [
        ('KPL', 'Kenyan Premier League'),
        ('FKF_CUP', 'FKF Cup'),
        ('CAF', 'CAF Confederation Cup'),
        ('FRIENDLY', 'Friendly'),
    ]

    # home_team is always "Machakos United" but we store it for flexibility
    home_team       = models.CharField(max_length=100)
    away_team       = models.CharField(max_length=100)
    match_date      = models.DateTimeField()          # stores date AND time
    venue           = models.CharField(max_length=200)
    competition     = models.CharField(max_length=20, choices=COMPETITION_CHOICES, default='KPL')
    matchday        = models.PositiveIntegerField(default=1)  # e.g. Matchday 12
    ticket_price    = models.DecimalField(max_digits=8, decimal_places=2, default=500.00)
    tickets_available = models.PositiveIntegerField(default=1000)

    # auto_now_add=True sets this once when the record is created — never changes
    created_at      = models.DateTimeField(auto_now_add=True)

    class Meta:
        # default ordering: soonest match first
        ordering = ['match_date']
        # human-readable names in Django admin
        verbose_name        = 'Fixture'
        verbose_name_plural = 'Fixtures'

    def __str__(self):
        # e.g. "Machakos United vs Gor Mahia — 28 May 2026"
        return f"{self.home_team} vs {self.away_team} — {self.match_date.strftime('%d %b %Y')}"

    @property
    def is_sold_out(self):
        """Computed property — no DB column needed, calculated on the fly"""
        return self.tickets_available == 0


class MatchResult(models.Model):
    """
    Stores the final score of a played match.
    OneToOne with Fixture — every fixture can have at most one result.
    """

    OUTCOME_CHOICES = [
        ('WIN', 'Win'),
        ('DRAW', 'Draw'),
        ('LOSS', 'Loss'),
    ]

    # OneToOneField = each fixture has exactly one result
    # on_delete=CASCADE = if fixture is deleted, delete its result too
    # related_name='result' lets us do fixture.result from a Fixture instance
    fixture         = models.OneToOneField(Fixture, on_delete=models.CASCADE, related_name='result')
    home_score      = models.PositiveIntegerField(default=0)
    away_score      = models.PositiveIntegerField(default=0)
    outcome         = models.CharField(max_length=4, choices=OUTCOME_CHOICES)
    scorers         = models.TextField(blank=True, help_text="e.g. Ochieng' 12', Mwangi 90+3'")
    match_report    = models.TextField(blank=True)  # optional post-match write-up
    created_at      = models.DateTimeField(auto_now_add=True)

    class Meta:
        # most recent result first
        ordering = ['-fixture__match_date']
        verbose_name        = 'Match Result'
        verbose_name_plural = 'Match Results'

    def __str__(self):
        return (
            f"{self.fixture.home_team} {self.home_score} - "
            f"{self.away_score} {self.fixture.away_team}"
        )