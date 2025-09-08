from django.urls import path
from .views import RecipeSearchView, SavedRecipesView

urlpatterns = [
    path('search/', RecipeSearchView.as_view(), name='recipe-search'),
    path('saved/', SavedRecipesView.as_view(), name='saved-recipes'),
]