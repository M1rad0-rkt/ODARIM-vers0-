from rest_framework import serializers
from .models import User, Feedback, Notification
from django.contrib.auth import authenticate

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'username','first_name', 'role', 'created_at']
        read_only_fields = ['created_at', 'role']  # Rôle en lecture seule pour les utilisateurs non-admin

    def validate_email(self, value):
        if User.objects.filter(email=value).exclude(pk=self.instance.pk if self.instance else None).exists():
            raise serializers.ValidationError("Cet email est déjà utilisé.")
        return value

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')
        user = authenticate(email=email, password=password)

        if not user:
            raise serializers.ValidationError("Identifiants invalides")
        
        return {
            'user': user
        }

from rest_framework import serializers
from .models import Request

class FeedbackSerializer(serializers.ModelSerializer):
    client_name = serializers.SerializerMethodField()
    request_title = serializers.SerializerMethodField()
    request_id = serializers.IntegerField(source='request.id', read_only=True)

    class Meta:
        model = Feedback
        fields = ['id', 'rating', 'comment', 'created_at', 'request_id', 'request_title', 'client_name']
        read_only_fields = ['id', 'created_at', 'request_id', 'request_title', 'client_name']

    def create(self, validated_data):
        request = self.context['request']
        request_obj = self.context['request_obj']
        return Feedback.objects.create(
            user=request.user,
            request=request_obj,
            **validated_data
        )

    def get_client_name(self, obj):
        return obj.user.username

    def get_request_title(self, obj):
        return obj.request.title if hasattr(obj.request, 'title') else f"Demande {obj.request.id}"

class RequestSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    first_name = serializers.CharField(source='user.first_name')
    feedback = FeedbackSerializer(read_only=True, allow_null=True)  # Ajouter explicitement

    class Meta:
        model = Request
        fields = ['id', 'user', 'user_name', 'title','first_name', 'description', 'category', 'status', 'admin_comment', 'created_at', 'updated_at', 'feedback']
        read_only_fields = ['user', 'status', 'admin_comment', 'created_at', 'updated_at', 'feedback']

    def get_user_name(self, obj):
        return obj.user.username if obj.user else None

from rest_framework import serializers

class FeedbackSerializer(serializers.ModelSerializer):
    client_name = serializers.SerializerMethodField()
    request_title = serializers.SerializerMethodField()
    request_id = serializers.IntegerField(source='request.id', read_only=True)

    class Meta:
        model = Feedback
        fields = ['id', 'rating', 'comment', 'created_at', 'request_id', 'request_title', 'client_name']
        read_only_fields = ['id', 'created_at', 'request_id', 'request_title', 'client_name']

    def create(self, validated_data):
        request = self.context['request']
        request_obj = self.context['request_obj']
        return Feedback.objects.create(
            user=request.user,
            request=request_obj,
            **validated_data
        )

    def get_client_name(self, obj):
        return obj.user.username

    def get_request_title(self, obj):
        return obj.request.title if hasattr(obj.request, 'title') else f"Demande {obj.request.id}"


from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['email'] = user.email
        return token

    def validate(self, attrs):
        # remplacer 'username' par 'email'
        attrs['username'] = attrs.get('email')
        return super().validate(attrs)

class NotificationSerializer(serializers.ModelSerializer):
    request_id = serializers.IntegerField(source='request.id', read_only=True)
    request_title = serializers.CharField(source='request.title', read_only=True)

    class Meta:
        model = Notification
        fields = ['id', 'request_id', 'request_title', 'message', 'is_read', 'created_at']
        read_only_fields = ['id', 'request_id', 'request_title', 'message', 'created_at']