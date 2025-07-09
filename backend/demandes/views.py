from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import LoginSerializer
from .models import User, Notification
from django.contrib.auth.hashers import make_password
from django.contrib.auth import authenticate
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from rest_framework.decorators import api_view
from django.http import JsonResponse
from rest_framework import viewsets, mixins 

User = get_user_model()

class LoginView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response({"detail": "Email et mot de passe requis"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"detail": "Identifiants invalides"}, status=status.HTTP_401_UNAUTHORIZED)

        if not user.check_password(password):
            return Response({"detail": "Mot de passe incorrect"}, status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(user)

        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "username": user.username,
            "role": user.role
        })

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "first_name": user.first_name or "",
            "role": user.role,
            "created_at": user.date_joined
        })

    def put(self, request):
        user = request.user
        data = request.data
        new_email = data.get('email')
        new_username = data.get('username')
        new_first_name = data.get('first_name', '')
        if not new_email or not new_username:
            return Response({"error": "Les champs email et username sont requis."}, status=status.HTTP_400_BAD_REQUEST)
        user.email = new_email
        user.username = new_username
        user.first_name = new_first_name
        try:
            user.save()
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response({
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "first_name": user.first_name,
            "role": user.role,
            "created_at": user.date_joined
        })

from rest_framework.validators import ValidationError

class RegisterView(APIView):
    def post(self, request):
        name = request.data.get('name')
        email = request.data.get('email')
        password = request.data.get('password')

        if not name or not email or not password:
            return Response({'detail': 'Tous les champs sont requis'}, status=status.HTTP_400_BAD_REQUEST)

        if len(password) < 6:
            return Response({'detail': 'Le mot de passe doit contenir au moins 6 caractères'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=email).exists():
            return Response({'detail': 'Cet utilisateur existe déjà'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create(
            username=email,
            email=email,
            first_name=name,
            password=make_password(password),
            role='client'
        )
        return Response({'detail': 'Utilisateur créé'}, status=status.HTTP_201_CREATED)
    

@api_view(['POST'])
def logout_view(request):
    try:
        refresh_token = request.data["refresh"]
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response(status=status.HTTP_205_RESET_CONTENT)
    except Exception as e:
        return Response(status=status.HTTP_400_BAD_REQUEST)


from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from .models import Request
from .serializers import RequestSerializer
from rest_framework.decorators import api_view, permission_classes

@api_view(['GET'])
@permission_classes([IsAuthenticated])  # optionnel si tu veux sécuriser
def get_all_requests(request):
    requests = Request.objects.all().order_by('-created_at')
    serializer = RequestSerializer(requests, many=True)
    return Response(serializer.data)

class RequestViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,  # Add for PUT/PATCH
    viewsets.GenericViewSet
):
    serializer_class = RequestSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        user = self.request.user
        print(f"User authentifié : {user} (ID: {user.id})")

        if user.is_anonymous:
            return Request.objects.none()

        return Request.objects.filter(user=user)

    def perform_create(self, serializer):
        # Enregistre la demande avec l'utilisateur connecté
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        # Ensure the user can only update their own request
        serializer.save(user=self.request.user)

class RequestUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        try:
            # Fetch request owned by the user
            request_obj = Request.objects.get(pk=pk, user=request.user)
        except Exception:
            return Response({"status": 400, "message": "Request not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = RequestSerializer(request_obj, data=request.data, partial=True)  # partial=True for PATCH-like behavior
        if serializer.is_valid():
            serializer.save()
            return Response({"status": 200, "message": "Request updated successfully", "data": serializer.data}, status=status.HTTP_200_OK)
        return Response({"status": 400, "message": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

def get_stats(request):
    try:
        # Exemple de statistiques
        total_requests = Request.objects.count()  # Nombre total de demandes
        resolved_requests = Request.objects.filter(status='resolue').count()  # Nombre de demandes résolues
        total_users = User.objects.count()  # Nombre total d'utilisateurs
        pending_requests = Request.objects.filter(status='en_attente').count()  # Nombre de demandes en attente

        stats = {
            "total_requests": total_requests,
            "resolved_requests": resolved_requests,
            "total_users": total_users,
            "pending_requests": pending_requests,
        }

        return JsonResponse(stats, status=200)
    
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
# Create your views here.

from .serializers import RequestSerializer
from rest_framework.permissions import IsAuthenticated

class CreateRequestAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Crée la demande avec le serializer
        serializer = RequestSerializer(data=request.data, context={"request": request})

        
        if serializer.is_valid():
            # Sauvegarde la demande avec l'utilisateur connecté
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        # Si les données du serializer sont invalides, retourne une erreur
        return Response(
            {"detail": "Données invalides", "errors": serializer.errors}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    

from .models import Request, Feedback
from .serializers import FeedbackSerializer

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_feedback(request, request_id):
    try:
        req = Request.objects.get(pk=request_id, user=request.user)
        if req.status != 'resolue':
            return Response({"error": "La demande doit être résolue pour être évaluée"}, status=status.HTTP_400_BAD_REQUEST)
        if hasattr(req, 'feedback') and req.feedback:
            return Response({"error": "Feedback déjà fourni pour cette demande"}, status=status.HTTP_400_BAD_REQUEST)

        serializer = FeedbackSerializer(data=request.data, context={'request': request, 'request_obj': req})
        if serializer.is_valid():
            serializer.save()
            request_serializer = RequestSerializer(req)
            return Response(request_serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Request.DoesNotExist:
        return Response({"error": "Demande introuvable ou non autorisée"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_SERVER_ERROR)


from django.views.decorators.http import require_http_methods

@require_http_methods(["GET"])  # On accepte uniquement les requêtes GET
@api_view(['GET'])
def get_request_by_id(request, request_id):
    try:
        request_obj = Request.objects.get(id=request_id)
        serializer = RequestSerializer(request_obj)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Request.DoesNotExist:
        return Response({"error": "Demande introuvable"}, status=status.HTTP_404_NOT_FOUND)
    
class UpdateRequestStatusView(APIView):
    permission_classes = [IsAuthenticated]  # Empêche accès sans token JWT valide

    def put(self, request, request_id):
        try:
            request_data = Request.objects.get(id=request_id)
            new_status = request.data.get('status')  # On récupère les données JSON

            if new_status:
                request_data.status = new_status
                request_data.save()
                return Response({"message": "Request status updated successfully"}, status=status.HTTP_200_OK)
            else:
                return Response({"error": "Status is required"}, status=status.HTTP_400_BAD_REQUEST)
        except Request.DoesNotExist:
            return Response({"error": "Request not found"}, status=status.HTTP_404_NOT_FOUND)

    

from rest_framework.response import Response
from django.db.models import Count, Avg
from .models import Request

class StatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        total_requests = Request.objects.count()

        # Comptage par statut
        status_counts = Request.objects.values('status').annotate(count=Count('status'))
        status_dict = {'en_attente': 0, 'en_cours': 0, 'resolue': 0, 'rejetee': 0}
        for item in status_counts:
            status_dict[item['status']] = item['count']

        # Moyenne des notes
        avg_rating = Feedback.objects.aggregate(Avg('rating'))['rating__avg'] or 0

        # Moyenne du temps de résolution (calculé en Python)
        resolved_requests = Request.objects.filter(status='resolue', resolved_at__isnull=False)
        total_seconds = 0
        count = resolved_requests.count()

        for req in resolved_requests:
            delta = req.resolved_at - req.created_at
            total_seconds += delta.total_seconds()

        avg_resolution_time = (total_seconds / count / 86400) if count > 0 else 0

        # Requêtes récentes
        recent_requests = Request.objects.order_by('-created_at')[:5].values(
            'id', 'title', 'status', 'created_at', 'category'
        )

        stats = {
            'total': total_requests,
            'statusCounts': status_dict,
            'avgRating': round(avg_rating, 1),
            'avgResolutionTime': round(avg_resolution_time, 1),  # en jours
            'recentRequests': list(recent_requests),
        }
        return Response(stats)


class RequestDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, request_id):
        return Response({"message": "GET fonctionne"})

    def delete(self, request, request_id):
        request_data = Request.objects.get(id = request_id)
        request_data.delete()
        return Response({"message": "DELETE fonctionne"})
    
class FeedbackListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        feedbacks = Feedback.objects.select_related('user', 'request').all().order_by('-created_at')
        serializer = FeedbackSerializer(feedbacks, many=True)
        return Response(serializer.data)

    def post(self, request, request_id=None):
        data = request.data.copy()
        data['user'] = request.user.id
        data['request'] = request_id

        serializer = FeedbackSerializer(data=data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import authenticate
from .models import User  # Replace with your app's name
import re
import logging

logger = logging.getLogger(__name__)

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            current_password = request.data.get('currentPassword')
            new_password = request.data.get('newPassword')

            if not current_password or not new_password:
                return Response(
                    {"message": "Le mot de passe actuel et le nouveau mot de passe sont requis."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Verify current password using email
            user = authenticate(email=request.user.email, password=current_password)
            if not user:
                return Response(
                    {"message": "Le mot de passe actuel est incorrect."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Validate new password strength
            password_regex = r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
            if not re.match(password_regex, new_password):
                return Response(
                    {
                        "message": (
                            "Le nouveau mot de passe doit contenir au moins 8 caractères, "
                            "incluant une majuscule, une minuscule, un chiffre et un caractère spécial."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Update password
            user.set_password(new_password)
            user.save()
            return Response(
                {"message": "Mot de passe changé avec succès."},
                status=status.HTTP_200_OK
            )

        except Exception as e:
            logger.error(f"Error in ChangePasswordView: {str(e)}", exc_info=True)
            return Response(
                {"message": f"Erreur serveur lors du changement de mot de passe: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import IsAuthenticated
from .models import Notification
from .serializers import NotificationSerializer

class NotificationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        notifications = Notification.objects.filter(user=request.user).order_by('-created_at')
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data)

    def put(self, request, pk=None):
        try:
            notification = Notification.objects.get(pk=pk, user=request.user)
            notification.is_read = True
            notification.save()
            serializer = NotificationSerializer(notification)
            return Response(serializer.data)
        except Notification.DoesNotExist:
            return Response({"error": "Notification introuvable ou non autorisée"}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, pk=None):
        try:
            notification = Notification.objects.get(pk=pk, user=request.user)
            notification.delete()
            return Response({"status": "Notification supprimée"}, status=status.HTTP_204_NO_CONTENT)
        except Notification.DoesNotExist:
            return Response(
                {"error": "Notification introuvable ou non autorisée"},
                status=status.HTTP_404_NOT_FOUND
            )
        
class NotificationUpdateView(generics.UpdateAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    queryset = Notification.objects.all()

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

from rest_framework.permissions import IsAuthenticated, BasePermission

class IsAdminUser(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'

from .serializers import UserSerializer

class UserListCreateView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
            serializer = UserSerializer(user)
            return Response(serializer.data)
        except User.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

    def put(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
            serializer = UserSerializer(user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
            user.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except User.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)


# ai_assistant/views.py

# demandes/views.
import requests
import time
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from .models import AIConversation
from .serializers import AIConversationSerializer
from rest_framework.permissions import IsAuthenticated

class AIAssistantView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        print("Utilisateur connecté:", request.user.email)
        message = request.data.get('message')
        if not message:
            print("Erreur: aucun message fourni")
            return Response({'error': 'Message requis'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            print("Sauvegarde du message utilisateur:", message)
            AIConversation.objects.create(
                user=request.user,
                message=message,
                sender='user'
            )
        except Exception as e:
            print("Erreur lors de la sauvegarde du message utilisateur:", str(e))
            return Response(
                {'error': f'Erreur lors de la sauvegarde du message: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # Vérifier si la clé API Mistral est définie
        if not settings.MISTRAL_API_KEY:
            print("Erreur: MISTRAL_API_KEY non configurée")
            return Response(
                {'error': 'Clé API Mistral non configurée. Veuillez ajouter MISTRAL_API_KEY dans .env.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # Paramètres pour la logique de réessai
        max_retries = 3
        retry_delay = 5  # Délai initial en secondes

        for attempt in range(max_retries):
            try:
                headers = {
                    'Authorization': f'Bearer {settings.MISTRAL_API_KEY}',
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                }
                print("Envoi de la requête à Mistral AI (tentative {}): {}".format(attempt + 1, message))
                response = requests.post(
                    'https://api.mistral.ai/v1/chat/completions',
                    json={
                        'model': 'mistral-large-latest',
                        'messages': [{'role': 'user', 'content': message}],
                        'max_tokens': 200,
                        'temperature': 0.7
                    },
                    headers=headers,
                    timeout=10  # Ajout d'un timeout de 10 secondes
                )
                print("Réponse Mistral AI:", response.status_code, response.text)

                if response.status_code == 400:
                    return Response(
                        {'error': f'Erreur 400: Requête invalide. Détails: {response.text}'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                if response.status_code == 401:
                    return Response(
                        {'error': 'Clé API Mistral invalide. Vérifiez votre clé API.'},
                        status=status.HTTP_401_UNAUTHORIZED
                    )
                if response.status_code == 429:
                    if attempt < max_retries - 1:
                        print(f"Erreur 429: Quota dépassé, réessai dans {retry_delay} secondes...")
                        time.sleep(retry_delay)
                        retry_delay *= 2  # Backoff exponentiel
                        continue
                    else:
                        return Response(
                            {'error': 'Quota de requêtes Mistral dépassé. Réessayez plus tard.'},
                            status=status.HTTP_429_TOO_MANY_REQUESTS
                        )
                if response.status_code == 503:
                    return Response(
                        {'error': 'Service Mistral indisponible. Réessayez plus tard.'},
                        status=status.HTTP_503_SERVICE_UNAVAILABLE
                    )
                response.raise_for_status()
                ai_response = response.json()['choices'][0]['message']['content']

                print("Sauvegarde de la réponse AI:", ai_response)
                AIConversation.objects.create(
                    user=request.user,
                    message=ai_response,
                    sender='ai'
                )
                return Response({'response': ai_response}, status=status.HTTP_200_OK)
            except requests.Timeout:
                print("Erreur: Timeout lors de l'appel à l'API Mistral")
                return Response(
                    {'error': 'Délai d\'attente dépassé lors de l\'appel à l\'API Mistral.'},
                    status=status.HTTP_504_GATEWAY_TIMEOUT
                )
            except requests.RequestException as e:
                print("Erreur Mistral AI:", str(e))
                return Response(
                    {'error': f'Erreur lors de l\'appel à l\'API Mistral: {str(e)}'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

class AIAssistantHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            print("Récupération de l'historique pour:", request.user.email)
            conversations = AIConversation.objects.filter(user=request.user).order_by('created_at')
            serializer = AIConversationSerializer(conversations, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            print("Erreur lors de la récupération de l'historique:", str(e))
            return Response(
                {'error': f'Erreur lors de la récupération de l\'historique: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )