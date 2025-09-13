from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RecipeViewSet, CategoryViewSet, CuisineViewSet, DietViewSet,
    FavoriteViewSet, ShoppingListViewSet
)
from . import views

router = DefaultRouter()
router.register('recipes', RecipeViewSet)
router.register('categories', CategoryViewSet)
router.register('cuisines', CuisineViewSet)
router.register('diets', DietViewSet)
router.register('favorites', FavoriteViewSet, basename='favorite')
router.register('shopping-list', ShoppingListViewSet, basename='shoppinglist')

urlpatterns = [
    path('api/', include(router.urls)),
    path('recipes/<int:recipe_id>/favorite/', views.add_favorite, name='add_favorite'),
    path('recipes/<int:recipe_id>/unfavorite/', views.remove_favorite, name='remove_favorite'),
    path('recipes/<int:recipe_id>/is_favorite/', views.is_favorite, name='is_favorite'),
]