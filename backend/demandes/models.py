from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

class User(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('client', 'Client'),
    ]
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=50, choices=ROLE_CHOICES, default='client')
    created_at = models.DateTimeField(auto_now_add=True)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email

class Request(models.Model):
    STATUS_CHOICES = [
        ('en_attente', 'En attente'),
        ('en_cours', 'En cours'),
        ('resolue', 'Résolue'),
        ('rejetee', 'Rejetée'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='requests')
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='en_attente')
    category = models.CharField(max_length=100, default='Autre')
    admin_comment = models.TextField(blank=True, null=True)
    title = models.CharField(max_length=255, default='Titre par défaut')
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    rating = models.FloatField(null=True, blank=True)  # Ajouter rating

    def save(self, *args, **kwargs):
        old_instance = Request.objects.filter(id=self.id).first()
        if self.status == 'resolue' and not self.resolved_at:
            self.resolved_at = timezone.now()
        elif self.status != 'resolue':
            self.resolved_at = None
        super().save(*args, **kwargs)
        if old_instance and self.user.role != 'admin':
            if old_instance.status != self.status or (
                old_instance.admin_comment != self.admin_comment and self.admin_comment
            ):
                message = f"Votre demande '{self.title}' a été mise à jour : "
                if old_instance.status != self.status:
                    message += f"Statut changé à '{self.get_status_display()}'."
                if self.admin_comment and old_instance.admin_comment != self.admin_comment:
                    message += f" Commentaire de l'admin : {self.admin_comment}"
                Notification.objects.create(
                    user=self.user,
                    request=self,
                    message=message
                )
                channel_layer = get_channel_layer()
                if channel_layer:
                    async_to_sync(channel_layer.group_send)(
                        f'user_{self.user.id}',
                        {
                            'type': 'send_notification',
                            'message': message,
                            'request_id': self.id,
                            'request_title': self.title,
                            'created_at': self.updated_at.isoformat(),
                        }
                    )

    def __str__(self):
        return f'Demande {self.id} de {self.user.username}'

class Feedback(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='feedbacks', null=True, blank=True)
    request = models.OneToOneField(Request, on_delete=models.CASCADE, related_name='feedback')
    rating = models.PositiveIntegerField()
    comment = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)  # Supprimer la synchronisation avec Request.rating

    def __str__(self):
        return f'Feedback pour la demande {self.request.id}'

class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    request = models.ForeignKey(Request, on_delete=models.CASCADE, related_name='notifications')
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['user', '-created_at']),
        ]

    def __str__(self):
        return f'Notification pour {self.user.email} - Demande {self.request.id}'


from django.db import models
from django.conf import settings

class AIConversation(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    message = models.TextField()
    sender = models.CharField(max_length=10, choices=[('user', 'User'), ('ai', 'AI')])
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.sender}: {self.message[:50]}"