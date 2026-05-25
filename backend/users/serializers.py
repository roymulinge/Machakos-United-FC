# users/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from .models import UserProfile

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Read-only serializer — returns user data including admin role"""
    # SerializerMethodFields to expose the profile role and permission flags
    role             = serializers.SerializerMethodField()
    is_admin_user    = serializers.SerializerMethodField()
    can_manage_content  = serializers.SerializerMethodField()
    can_manage_tickets  = serializers.SerializerMethodField()

    class Meta:
        model  = User
        fields = (
            'id', 'email', 'first_name', 'last_name', 'date_joined',
            'is_staff',
            'role', 'is_admin_user', 'can_manage_content', 'can_manage_tickets',
        )

    def get_role(self, obj):
        # safely access profile — returns 'fan' if profile doesn't exist
        return getattr(obj, 'profile', None) and obj.profile.role or 'fan'

    def get_is_admin_user(self, obj):
        profile = getattr(obj, 'profile', None)
        return profile.is_admin_user if profile else False

    def get_can_manage_content(self, obj):
        profile = getattr(obj, 'profile', None)
        return profile.can_manage_content if profile else False

    def get_can_manage_tickets(self, obj):
        profile = getattr(obj, 'profile', None)
        return profile.can_manage_tickets if profile else False


class RegisterSerializer(serializers.ModelSerializer):
    """Handles new user registration with password confirmation"""

    # write_only=True means this field accepts input but never appears in output
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('email', 'first_name', 'last_name', 'password', 'confirm_password')

    def validate_email(self, value):
        # field-level validation — runs automatically for validate_<fieldname>
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate(self, data):
        # object-level validation — runs after all field-level validators pass
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return data

    def create(self, validated_data):
        # pop removes confirm_password before passing to create_user
        # create_user doesn't know what to do with that field
        validated_data.pop('confirm_password')
        return User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )


class LoginSerializer(serializers.Serializer):
    """
    Validates login credentials and returns the authenticated user.
    Uses base Serializer (not ModelSerializer) because we're not
    creating or reading a DB record — just validating input.
    """
    email    = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email    = data.get('email')
        password = data.get('password')

        # authenticate() checks the credentials against the database
        # username=email because CustomUser has USERNAME_FIELD = 'email'
        user = authenticate(
            request=self.context.get('request'),
            username=email,
            password=password,
        )

        if not user:
            # same message for both "user not found" and "wrong password"
            # — never tell attackers which one it is
            raise serializers.ValidationError("Invalid email or password.")

        if not user.is_active:
            raise serializers.ValidationError("This account is inactive.")

        # attach user to validated_data so the view can access it
        data['user'] = user
        return data


class UserProfileSerializer(serializers.ModelSerializer):
    """Get or update a user's profile — nested user is read-only"""

    # nested serializer — embeds the full user object inside the profile response
    user = UserSerializer(read_only=True)

    class Meta:
        model  = UserProfile
        fields = ('user', 'bio', 'profile_picture', 'phone_number', 'date_of_birth')
        read_only_fields = ('user',)