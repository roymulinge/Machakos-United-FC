# users/models.py
from django.db import models
from django.contrib.auth.base_user import BaseUserManager
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db.models.signals import post_save
from django.dispatch import receiver


class CustomUserManager(BaseUserManager):
    def create_user(self, email=None, password=None, **extra_fields):
        if not email:
            raise ValueError('Email must be set')
        email = self.normalize_email(email)
        user  = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)  # fixed: self.db → self._db (private attribute)
        return user

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True')

        return self.create_user(email, password, **extra_fields)


class CustomUser(AbstractBaseUser, PermissionsMixin):
    first_name  = models.CharField(max_length=100)
    last_name   = models.CharField(max_length=100)
    email       = models.EmailField(unique=True)
    date_joined = models.DateTimeField(auto_now_add=True)
    is_active   = models.BooleanField(default=True)
    is_staff    = models.BooleanField(default=False)

    objects = CustomUserManager()

    # Django uses this field as the "username" for authentication
    USERNAME_FIELD  = 'email'
    REQUIRED_FIELDS = []  # empty because email is already USERNAME_FIELD

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


class UserProfile(models.Model):
    # ── role choices ──────────────────────────────────────────────────────
    ROLE_CHOICES = [
        ('fan',            'Fan'),             # regular supporter
        ('ticket_officer', 'Ticket Officer'),  # can verify tickets + view sales
        ('manager',        'Manager'),         # can manage fixtures, results, squad
        ('owner',          'Owner'),           # full access to everything
    ]

    user            = models.OneToOneField(
                        CustomUser, on_delete=models.CASCADE, related_name='profile'
                      )
    bio             = models.TextField(blank=True)
    profile_picture = models.ImageField(upload_to='profile_pics', blank=True, null=True)
    phone_number    = models.CharField(max_length=15, blank=True)
    date_of_birth   = models.DateField(null=True, blank=True)

    # role determines what the staff member can do in the admin dashboard
    # default is 'fan' — admin manually promotes staff
    role            = models.CharField(
                        max_length=20,
                        choices=ROLE_CHOICES,
                        default='fan',
                      )

    def __str__(self):
        return f"{self.user.first_name}'s profile"

    @property
    def is_admin_user(self):
        """True if this user can access the admin dashboard"""
        return self.user.is_staff or self.role in ('owner', 'manager', 'ticket_officer')

    @property
    def can_manage_content(self):
        """True if this user can create/edit fixtures, results, squad"""
        return self.user.is_staff or self.role in ('owner', 'manager')

    @property
    def can_manage_tickets(self):
        """True if this user can view sales and verify tickets"""
        return self.user.is_staff or self.role in ('owner', 'manager', 'ticket_officer')


@receiver(post_save, sender=CustomUser)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)


@receiver(post_save, sender=CustomUser)
def save_user_profile(sender, instance, **kwargs):
    if hasattr(instance, 'profile'):
        instance.profile.save()