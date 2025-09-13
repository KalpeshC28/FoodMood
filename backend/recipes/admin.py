from django.contrib import admin
from .models import (
    Category, Cuisine, Diet, Recipe, Ingredient, 
    Instruction, Rating, Favorite, ShoppingListItem
)


class IngredientInline(admin.TabularInline):
    model = Ingredient
    extra = 3


class InstructionInline(admin.TabularInline):
    model = Instruction
    extra = 3


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'description']
    search_fields = ['name']


@admin.register(Cuisine)
class CuisineAdmin(admin.ModelAdmin):
    list_display = ['name', 'description']
    search_fields = ['name']


@admin.register(Diet)
class DietAdmin(admin.ModelAdmin):
    list_display = ['name', 'description']
    search_fields = ['name']


@admin.register(Recipe)
class RecipeAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'category', 'cuisine', 'difficulty', 'prep_time', 'cook_time', 'calories_per_serving', 'protein', 'carbs', 'fat', 'created_at']
    list_filter = ['category', 'cuisine', 'difficulty', 'diets', 'created_at']
    search_fields = ['title', 'description']
    filter_horizontal = ['diets']
    inlines = [IngredientInline, InstructionInline]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'author', 'image')
        }),
        ('Classification', {
            'fields': ('category', 'cuisine', 'diets')
        }),
        ('Cooking Details', {
            'fields': ('prep_time', 'cook_time', 'servings', 'difficulty', 'calories_per_serving', 'protein', 'carbs', 'fat')
        }),
    )


@admin.register(Rating)
class RatingAdmin(admin.ModelAdmin):
    list_display = ['recipe', 'user', 'score', 'created_at']
    list_filter = ['score', 'created_at']
    search_fields = ['recipe__title', 'user__username']


@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ['user', 'recipe', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__username', 'recipe__title']


@admin.register(ShoppingListItem)
class ShoppingListItemAdmin(admin.ModelAdmin):
    list_display = ['user', 'ingredient_name', 'quantity', 'unit', 'is_purchased', 'created_at']
    list_filter = ['is_purchased', 'created_at']
    search_fields = ['user__username', 'ingredient_name']
