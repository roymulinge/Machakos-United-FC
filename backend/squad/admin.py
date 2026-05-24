# squad/admin.py
from django.contrib import admin
from .models import Player


@admin.register(Player)
class PlayerAdmin(admin.ModelAdmin):
    # columns in the list view
    list_display   = (
        'squad_number', 'name', 'position',
        'nationality', 'appearances', 'goals', 'is_active'
    )
    # sidebar filters
    list_filter    = ('position', 'nationality', 'is_active')
    # search by name or nationality
    search_fields  = ('name', 'nationality')
    # click squad_number or name to open the player form
    list_display_links = ('squad_number', 'name')
    # allow toggling is_active directly from the list — no need to open the form
    list_editable  = ('is_active',)
    # group form fields into logical sections
    fieldsets = (
        ('Identity', {
            'fields': ('name', 'squad_number', 'position', 'nationality', 'date_of_birth', 'photo')
        }),
        ('Bio', {
            'fields': ('bio',),
            'classes': ('collapse',),  # collapsible section
        }),
        ('Stats', {
            'fields': ('appearances', 'goals', 'assists', 'clean_sheets')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
    )