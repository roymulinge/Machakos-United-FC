# squad/models.py
from django.db import models


class Player(models.Model):
    """
    Represents a first-team player.
    Admin manages this entirely through Django admin.
    """

    # ── position choices ──────────────────────────────────────────────────
    POSITION_CHOICES = [
        ('GK',  'Goalkeeper'),
        ('DEF', 'Defender'),
        ('MID', 'Midfielder'),
        ('FWD', 'Forward'),
    ]

    # ── core fields ───────────────────────────────────────────────────────
    name           = models.CharField(max_length=100)
    squad_number   = models.PositiveIntegerField(unique=True)  # unique=True — no two players share a number
    position       = models.CharField(max_length=3, choices=POSITION_CHOICES)
    nationality    = models.CharField(max_length=100, default='Kenyan')
    date_of_birth  = models.DateField(null=True, blank=True)

    # ── optional profile fields ───────────────────────────────────────────
    bio            = models.TextField(blank=True)
    # upload_to defines the subfolder inside MEDIA_ROOT
    # so photos go to: media/players/player-name.jpg
    photo          = models.ImageField(upload_to='players/', blank=True, null=True)

    # ── stats ─────────────────────────────────────────────────────────────
    appearances    = models.PositiveIntegerField(default=0)
    goals          = models.PositiveIntegerField(default=0)
    assists        = models.PositiveIntegerField(default=0)
    clean_sheets   = models.PositiveIntegerField(default=0,
                       help_text='Relevant for goalkeepers only')

    # ── status ────────────────────────────────────────────────────────────
    is_active      = models.BooleanField(default=True,
                       help_text='Uncheck to hide player without deleting')

    # auto_now_add = set once on creation, never changes
    created_at     = models.DateTimeField(auto_now_add=True)

    class Meta:
        # default sort: by squad number (1, 2, 3...)
        ordering            = ['squad_number']
        verbose_name        = 'Player'
        verbose_name_plural = 'Players'

    def __str__(self):
        return f"#{self.squad_number} {self.name} ({self.get_position_display()})"

    @property
    def age(self):
        """Computed age — no DB column needed"""
        if not self.date_of_birth:
            return None
        from django.utils import timezone
        today = timezone.now().date()
        dob   = self.date_of_birth
        # subtract 1 if birthday hasn't happened yet this year
        return today.year - dob.year - (
            (today.month, today.day) < (dob.month, dob.day)
        )