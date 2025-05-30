"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from demandes.views import RequestUpdateView, LoginView,NotificationListView, UserProfileView, UserListCreateView, UserDetailView, RegisterView,ChangePasswordView,  logout_view,RequestDeleteView,  RequestViewSet, CreateRequestAPIView,add_feedback, get_request_by_id,UpdateRequestStatusView,CustomTokenObtainPairView,StatsView, get_all_requests, FeedbackListView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/register/', RegisterView.as_view()),
    path('api/requests/all/', get_all_requests, name='get_all_requests'),
    path('api/requests/', RequestViewSet.as_view({'get': 'list', 'post': 'create'}), name='request-list'),
    path('api/requests/<int:request_id>/status/', UpdateRequestStatusView.as_view(), name='update-request-status'),
    path('api/requests/<int:request_id>/feedback/', add_feedback, name='add-feedback'),
    path('api/requests/<int:request_id>/', get_request_by_id, name='get-request-by-id'),
    path('api/requests/<int:pk>/update/', RequestUpdateView.as_view(), name='request-update'),
    path('api/requests/delete/<int:request_id>/', RequestDeleteView.as_view(), name='request-delete'),
    path('notifications/', NotificationListView.as_view(), name='notification-list'),
    path('notifications/<int:pk>/read/', NotificationListView.as_view(), name='notification-mark-read'),
    path('notifications/<int:pk>/', NotificationListView.as_view(), name='notification-detail'),
    path('api/feedbacks/', FeedbackListView.as_view(), name='feedback-list'),
    path('api/users/me/', UserProfileView.as_view(), name='user-profile'),
    path('api/users/', UserListCreateView.as_view(), name='user-list-create'),
    path('api/users/<int:pk>/', UserDetailView.as_view(), name='user-detail'),
    path('api/change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('api/requests/create/', CreateRequestAPIView.as_view(), name='create-request'),
    path('api/stats/', StatsView.as_view(), name='stats'),
    path('api/logout/', logout_view),
]
