from django.shortcuts import get_object_or_404
from django.db.models import Q, Avg
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
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
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def favorite(self, request, pk=None):
        recipe = self.get_object()
        favorite, created = Favorite.objects.get_or_create(
            user=request.user, recipe=recipe
        )
        if created:
            return Response({'message': 'Recipe added to favorites'})
        else:
            return Response({'message': 'Recipe already in favorites'}, 
                          status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['delete'], permission_classes=[IsAuthenticated])
    def unfavorite(self, request, pk=None):
        recipe = self.get_object()
        try:
            favorite = Favorite.objects.get(user=request.user, recipe=recipe)
            favorite.delete()
            return Response({'message': 'Recipe removed from favorites'})
        except Favorite.DoesNotExist:
            return Response({'message': 'Recipe not in favorites'}, 
                          status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def rate(self, request, pk=None):
        recipe = self.get_object()
        score = request.data.get('score')
        comment = request.data.get('comment', '')
        
        if not score or not (1 <= int(score) <= 5):
            return Response({'error': 'Score must be between 1 and 5'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        rating, created = Rating.objects.update_or_create(
            user=request.user, recipe=recipe,
            defaults={'score': score, 'comment': comment}
        )
        
        serializer = RatingSerializer(rating)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def add_to_shopping_list(self, request, pk=None):
        recipe = self.get_object()
        
        # Add all ingredients from the recipe to the shopping list
        for ingredient in recipe.ingredients.all():
            ShoppingListItem.objects.get_or_create(
                user=request.user,
                recipe=recipe,
                ingredient_name=ingredient.name,
                defaults={
                    'quantity': ingredient.quantity,
                    'unit': ingredient.unit
                }
            )
        
        return Response({'message': 'Ingredients added to shopping list'})
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_recipes(self, request):
        queryset = self.get_queryset().filter(author=request.user)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = RecipeListSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)
        serializer = RecipeListSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def favorites(self, request):
        favorites = Favorite.objects.filter(user=request.user)
        page = self.paginate_queryset(favorites)
        if page is not None:
            serializer = FavoriteSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = FavoriteSerializer(favorites, many=True)
        return Response(serializer.data)


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