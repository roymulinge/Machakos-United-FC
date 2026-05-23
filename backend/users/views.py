from django.shortcuts import render
from rest_framework import generics, permissions, status
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer, UserProfileSerializer
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.conf import settings
from django.urls import reverse
from .models import UserProfile
from rest_framework.views import APIView
from django.contrib.auth import get_user_model

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    "signup new user"
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        # Generate JWT tokens for auto-login after registration (optional)
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)

class LoginView(APIView):
    """Log in returns jwt tokens"""
    permission_classes = [permissions.AllowAny]
    serializer_class = LoginSerializer

    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_200_OK)
    
class ProfileView(generics.RetrieveUpdateAPIView):
    """Get or update the logged-in user's profile"""
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        # Each user has a OneToOne profile (auto-created by signal)
        profile, _ = UserProfile.objects.get_or_create(user=self.request.user)
        return profile
    
class PasswordResetRequestView(APIView):
    """Send password reset email"""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email is required'}, status=400)
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # For security, still return success (don't reveal if email exists)
            return Response({'message': 'If that email exists, we sent a reset link.'}, status=200)

        token = default_token_generator.make_token(user)
        # Build reset link – frontend will handle it
        reset_url = f"{settings.FRONTEND_URL}/reset-password?uid={user.pk}&token={token}"
        send_mail(
            subject='Password Reset Request',
            message=f'Click the link to reset your password: {reset_url}',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
        return Response({'message': 'Password reset email sent.'}, status=200)
    
class PasswordResetConfirmView(APIView):
    """Set new password using uid and token"""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        uid = request.data.get('uid')
        token = request.data.get('token')
        new_password = request.data.get('new_password')
        if not all([uid, token, new_password]):
            return Response({'error': 'Missing fields'}, status=400)
        try:
            user = User.objects.get(pk=uid)
        except User.DoesNotExist:
            return Response({'error': 'Invalid user'}, status=400)
        if not default_token_generator.check_token(user, token):
            return Response({'error': 'Invalid or expired token'}, status=400)
        user.set_password(new_password)
        user.save()
        return Response({'message': 'Password reset successful'}, status=200)
