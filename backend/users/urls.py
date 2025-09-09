from django.urls import path
from . import views

urlpatterns = [
    path('api/auth/register/', views.register, name='register'),
    path('api/auth/login/', views.login, name='login'),
    path('api/auth/logout/', views.logout, name='logout'),
    path('api/auth/profile/', views.profile, name='profile'),
]