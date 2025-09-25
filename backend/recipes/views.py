
import os
import requests
from django.conf import settings
from django.shortcuts import get_object_or_404
from django.db.models import Q, Avg
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django_filters import rest_framework as django_filters

from .models import (
    Recipe, Category, Cuisine, Diet, Rating, Favorite, ShoppingListItem
)
from .serializers import (
    RecipeListSerializer, RecipeDetailSerializer, RecipeCreateUpdateSerializer,
    CategorySerializer, CuisineSerializer, DietSerializer, RatingSerializer,
    FavoriteSerializer, ShoppingListItemSerializer
)

SPOONACULAR_API_KEY = os.environ.get('SPOONACULAR_API_KEY')

@api_view(['GET'])
@permission_classes([AllowAny])
def spoonacular_recipe_detail(request, recipe_id):
    # Extract numeric ID from spoonacular_xxx
    if recipe_id.startswith('spoonacular_'):
        sid = recipe_id.replace('spoonacular_', '')
        try:
            response = requests.get(
                f'https://api.spoonacular.com/recipes/{sid}/information',
                params={
                    'apiKey': SPOONACULAR_API_KEY,
                    'includeNutrition': False
                }
            )
            print("Spoonacular detail status:", response.status_code)
            print("Spoonacular detail response:", response.text)
            if response.status_code == 200:
                r = response.json()
                nutrition = {}
                if 'nutrition' in r and 'nutrients' in r['nutrition']:
                    for n in r['nutrition']['nutrients']:
                        # Common nutrients: Calories, Protein, Fat, Carbohydrates
                        if n['name'] in ['Calories', 'Protein', 'Fat', 'Carbohydrates']:
                            nutrition[n['name'].lower()] = {
                                'amount': n['amount'],
                                'unit': n['unit']
                            }
                data = {
                    'id': f"spoonacular_{r.get('id')}",
                    'title': r.get('title'),
                    'image': r.get('image'),
                    'ingredients': [i['original'] for i in r.get('extendedIngredients', [])] if r.get('extendedIngredients') else [],
                    'instructions': r.get('instructions'),
                    'source': 'spoonacular',
                    'summary': r.get('summary'),
                    'readyInMinutes': r.get('readyInMinutes'),
                    'servings': r.get('servings'),
                    'sourceUrl': r.get('sourceUrl'),
                    'nutrition': nutrition,
                }
                return Response(data)
            else:
                return Response({'error': 'Recipe not found'}, status=response.status_code)
        except Exception as e:
            print("Spoonacular detail error:", e)
            return Response({'error': str(e)}, status=500)
    return Response({'error': 'Invalid Spoonacular ID'}, status=400)

@api_view(['GET'])
@permission_classes([AllowAny])
def merged_recipes(request):
    # Fetch recipes from Django DB
    django_recipes = RecipeListSerializer(Recipe.objects.all(), many=True, context={'request': request}).data

    # Try to fetch recipes from Spoonacular
    spoonacular_recipes = []
    try:
        response = requests.get(
            'https://api.spoonacular.com/recipes/random',
            params={'number': 5, 'apiKey': SPOONACULAR_API_KEY}
        )
        print("Spoonacular status:", response.status_code)
        print("Spoonacular response:", response.text)
        if response.status_code == 200:
            data = response.json()
            for r in data.get('recipes', []):
                spoonacular_recipes.append({
                    'id': f"spoonacular_{r.get('id')}",
                    'title': r.get('title'),
                    'image': r.get('image'),
                    'ingredients': [i['original'] for i in r.get('extendedIngredients', [])],
                    'instructions': r.get('instructions'),
                    'source': 'spoonacular',
                    # Add more fields as needed to match your frontend
                })
    except Exception as e:
        print("Spoonacular error:", e)

    # Combine both sources
    all_recipes = list(django_recipes) + spoonacular_recipes
    return Response({'recipes': all_recipes})
from django.shortcuts import get_object_or_404
from django.db.models import Q, Avg
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from django_filters.rest_framework import DjangoFilterBackend
from django_filters import rest_framework as django_filters

from .models import (
    Recipe, Category, Cuisine, Diet, Rating, Favorite, ShoppingListItem
)
from .serializers import (
    RecipeListSerializer, RecipeDetailSerializer, RecipeCreateUpdateSerializer,
    CategorySerializer, CuisineSerializer, DietSerializer, RatingSerializer,
    FavoriteSerializer, ShoppingListItemSerializer
)


class RecipeFilter(django_filters.FilterSet):
    title = django_filters.CharFilter(lookup_expr='icontains')
    difficulty = django_filters.ChoiceFilter(choices=Recipe.DIFFICULTY_CHOICES)
    category = django_filters.ModelChoiceFilter(queryset=Category.objects.all())
    cuisine = django_filters.ModelChoiceFilter(queryset=Cuisine.objects.all())
    diets = django_filters.ModelMultipleChoiceFilter(queryset=Diet.objects.all())
    prep_time_max = django_filters.NumberFilter(field_name='prep_time', lookup_expr='lte')
    cook_time_max = django_filters.NumberFilter(field_name='cook_time', lookup_expr='lte')
    calories_max = django_filters.NumberFilter(field_name='calories_per_serving', lookup_expr='lte')
    
    class Meta:
        model = Recipe
        fields = ['title', 'difficulty', 'category', 'cuisine', 'diets', 
                 'prep_time_max', 'cook_time_max', 'calories_max']


class RecipeViewSet(viewsets.ModelViewSet):
    from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print('DEBUG: serializer errors:', serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    queryset = Recipe.objects.all()
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = RecipeFilter
    search_fields = ['title', 'description', 'ingredients__name']
    ordering_fields = ['created_at', 'prep_time', 'cook_time', 'difficulty']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return RecipeListSerializer
        elif self.action == 'retrieve':
            return RecipeDetailSerializer
        return RecipeCreateUpdateSerializer

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def list(self, request, *args, **kwargs):
        # ...existing code...
        queryset = self.filter_queryset(self.get_queryset())
        search_query = request.query_params.get('search')
        # Get Django recipes
        page = self.paginate_queryset(queryset)
        django_recipes = RecipeListSerializer(page if page is not None else queryset, many=True, context={'request': request}).data

        # If search query, also fetch from Spoonacular
        spoonacular_recipes = []
        if search_query:
            try:
                response = requests.get(
                    'https://api.spoonacular.com/recipes/complexSearch',
                    params={
                        'query': search_query,
                        'number': 5,
                        'apiKey': SPOONACULAR_API_KEY,
                        'addRecipeInformation': True
                    }
                )
                print("Spoonacular search status:", response.status_code)
                print("Spoonacular search response:", response.text)
                if response.status_code == 200:
                    data = response.json()
                    for r in data.get('results', []):
                        spoonacular_recipes.append({
                            'id': f"spoonacular_{r.get('id')}",
                            'title': r.get('title'),
                            'image': r.get('image'),
                            'ingredients': [i['original'] for i in r.get('extendedIngredients', [])] if r.get('extendedIngredients') else [],
                            'instructions': r.get('instructions'),
                            'source': 'spoonacular',
                            # Add more fields as needed
                        })
            except Exception as e:
                print("Spoonacular search error:", e)

        # Merge results
        all_recipes = list(django_recipes) + spoonacular_recipes
        if page is not None:
            return self.get_paginated_response(all_recipes)
        return Response(all_recipes)

    # ...existing code...


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class CuisineViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Cuisine.objects.all()
    serializer_class = CuisineSerializer


class DietViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Diet.objects.all()
    serializer_class = DietSerializer


class FavoriteViewSet(viewsets.ModelViewSet):
    serializer_class = FavoriteSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        recipe_id = self.request.data.get('recipe_id')
        recipe = get_object_or_404(Recipe, id=recipe_id)
        serializer.save(user=self.request.user, recipe=recipe)


class ShoppingListViewSet(viewsets.ModelViewSet):
    serializer_class = ShoppingListItemSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return ShoppingListItem.objects.filter(user=self.request.user).order_by('-created_at')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['patch'])
    def toggle_purchased(self, request, pk=None):
        item = self.get_object()
        item.is_purchased = not item.is_purchased
        item.save()
        serializer = self.get_serializer(item)
        return Response(serializer.data)
    
    @action(detail=False, methods=['delete'])
    def clear_purchased(self, request):
        count = ShoppingListItem.objects.filter(
            user=request.user, is_purchased=True
        ).delete()[0]
        return Response({'message': f'{count} purchased items cleared'})
    

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_favorite(request, recipe_id):
    recipe = get_object_or_404(Recipe, id=recipe_id)
    Favorite.objects.get_or_create(user=request.user, recipe=recipe)
    return Response({'status': 'added'})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def remove_favorite(request, recipe_id):
    recipe = get_object_or_404(Recipe, id=recipe_id)
    Favorite.objects.filter(user=request.user, recipe=recipe).delete()
    return Response({'status': 'removed'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def is_favorite(request, recipe_id):
    recipe = get_object_or_404(Recipe, id=recipe_id)
    is_fav = Favorite.objects.filter(user=request.user, recipe=recipe).exists()
    return Response({'favorite': is_fav})