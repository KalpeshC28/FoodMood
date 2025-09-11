from django.urls import path, include
from .views import CreateRecipeView
from rest_framework.routers import DefaultRouter
from .views import (
    RecipeViewSet, CategoryViewSet, CuisineViewSet, DietViewSet,
    FavoriteViewSet, ShoppingListViewSet
)

router = DefaultRouter()
router.register('recipes', RecipeViewSet)
router.register('categories', CategoryViewSet)
router.register('cuisines', CuisineViewSet)
router.register('diets', DietViewSet)
router.register('favorites', FavoriteViewSet, basename='favorite')
router.register('shopping-list', ShoppingListViewSet, basename='shoppinglist')

urlpatterns = [
    path('api/', include(router.urls)),
    path('create/', CreateRecipeView.as_view(), name='create-recipe'),
]