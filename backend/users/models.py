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
    # CASCADE means: if the user is deleted, delete their profile too
    user            = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='profile')
    bio             = models.TextField(blank=True)
    profile_picture = models.ImageField(upload_to='profile_pics', blank=True, null=True)
    phone_number    = models.CharField(max_length=15, blank=True)
    date_of_birth   = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.first_name}'s profile"


@receiver(post_save, sender=CustomUser)
def create_user_profile(sender, instance, created, **kwargs):
    # created=True only on INSERT — not on UPDATE
    # prevents creating duplicate profiles on every user save
    if created:
        UserProfile.objects.create(user=instance)


@receiver(post_save, sender=CustomUser)
def save_user_profile(sender, instance, **kwargs):
    # hasattr check prevents crash if profile somehow doesn't exist
    if hasattr(instance, 'profile'):
        instance.profile.save()