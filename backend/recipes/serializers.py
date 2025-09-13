from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Recipe, Ingredient, Instruction, Category, Cuisine, Diet, Rating, Favorite, ShoppingListItem


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'description']


class CuisineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cuisine
        fields = ['id', 'name', 'description']


class DietSerializer(serializers.ModelSerializer):
    class Meta:
        model = Diet
        fields = ['id', 'name', 'description']


class IngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingredient
        fields = ['id', 'name', 'quantity', 'unit']


class InstructionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Instruction
        fields = ['id', 'step_number', 'text']


class RatingSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Rating
        fields = ['id', 'user', 'score', 'comment', 'created_at']


class RecipeListSerializer(serializers.ModelSerializer):
    """Simplified serializer for recipe lists"""
    author = UserSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    cuisine = CuisineSerializer(read_only=True)
    average_rating = serializers.ReadOnlyField()
    total_time = serializers.ReadOnlyField()
    is_favorited = serializers.SerializerMethodField()
    
    class Meta:
        model = Recipe
        fields = [
            'id', 'title', 'description', 'author', 'category', 'cuisine',
            'prep_time', 'cook_time', 'total_time', 'servings', 'difficulty',
            'image', 'calories_per_serving', 'average_rating', 'is_favorited',
            'created_at'
        ]
    
    def get_is_favorited(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Favorite.objects.filter(user=request.user, recipe=obj).exists()
        return False


class RecipeDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for recipe detail view"""
    author = UserSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    cuisine = CuisineSerializer(read_only=True)
    diets = DietSerializer(many=True, read_only=True)
    ingredients = IngredientSerializer(many=True, read_only=True)
    instructions = InstructionSerializer(many=True, read_only=True)
    ratings = RatingSerializer(many=True, read_only=True)
    average_rating = serializers.ReadOnlyField()
    total_time = serializers.ReadOnlyField()
    is_favorited = serializers.SerializerMethodField()
    
    class Meta:
        model = Recipe
        fields = [
            'id', 'title', 'description', 'author', 'category', 'cuisine', 'diets',
            'prep_time', 'cook_time', 'total_time', 'servings', 'difficulty',
            'image', 'calories_per_serving', 'ingredients', 'instructions',
            'ratings', 'average_rating', 'is_favorited', 'created_at', 'updated_at'
        ]
    
    def get_is_favorited(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Favorite.objects.filter(user=request.user, recipe=obj).exists()
        return False


class RecipeCreateUpdateSerializer(serializers.ModelSerializer):
    def to_internal_value(self, data):
        import json
        print('DEBUG: incoming data for RecipeCreateUpdateSerializer:', dict(data))
        flat_data = data.copy()
        # Parse JSON for ingredients/instructions/diet_ids if needed
        for field in ['ingredients', 'instructions', 'diet_ids']:
            value = flat_data.get(field)
            # If value is a list with one string, get the string
            if isinstance(value, list) and len(value) == 1 and isinstance(value[0], str):
                value = value[0]
            if isinstance(value, str):
                try:
                    flat_data[field] = json.loads(value)
                except Exception:
                    self.fail('invalid', field=field)
        # Ensure required fields are present and correct types
        if 'ingredients' not in flat_data or not isinstance(flat_data['ingredients'], list):
            flat_data['ingredients'] = []
        if 'instructions' not in flat_data or not isinstance(flat_data['instructions'], list):
            flat_data['instructions'] = []
        # Bulletproof diet_ids parsing and final type enforcement
        if 'diet_ids' in flat_data:
            val = flat_data['diet_ids']
            print('DEBUG: raw diet_ids type:', type(val), 'value:', val)
            # If it's a list with one string that looks like a JSON array, parse it
            if isinstance(val, list) and len(val) == 1 and isinstance(val[0], str) and val[0].strip().startswith('['):
                try:
                    val = json.loads(val[0])
                except Exception:
                    pass
            # If it's a string, try to parse as JSON or as a single int
            elif isinstance(val, str):
                try:
                    parsed = json.loads(val)
                    if isinstance(parsed, list):
                        val = parsed
                    else:
                        val = [parsed]
                except Exception:
                    val = [val]
            # If it's not a list, make it a list
            if not isinstance(val, list):
                val = [val]
            # Final: force all to int
            try:
                val = [int(x) for x in val]
            except Exception:
                self.fail('invalid', field='diet_ids')
            flat_data['diet_ids'] = val
        # Final: ensure ingredients and instructions are lists of dicts
        if 'ingredients' in flat_data and isinstance(flat_data['ingredients'], list):
            flat_data['ingredients'] = [dict(x) for x in flat_data['ingredients']]
        if 'instructions' in flat_data and isinstance(flat_data['instructions'], list):
            flat_data['instructions'] = [dict(x) for x in flat_data['instructions']]
        print('DEBUG: parsed ingredients:', flat_data['ingredients'])
        print('DEBUG: parsed instructions:', flat_data['instructions'])
        print('DEBUG: parsed diet_ids:', flat_data.get('diet_ids'))
        return super().to_internal_value(flat_data)
    """Serializer for creating and updating recipes"""
    ingredients = IngredientSerializer(many=True)
    instructions = InstructionSerializer(many=True)
    diet_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )

    class Meta:
        model = Recipe
        fields = [
            'title', 'description', 'category', 'cuisine', 'diet_ids',
            'prep_time', 'cook_time', 'servings', 'difficulty',
            'image', 'calories_per_serving', 'ingredients', 'instructions'
        ]

    def create(self, validated_data):
        ingredients_data = validated_data.pop('ingredients')
        instructions_data = validated_data.pop('instructions')
        diet_ids = validated_data.pop('diet_ids', [])

        recipe = Recipe.objects.create(**validated_data)

        # Add diets
        if diet_ids:
            recipe.diets.set(diet_ids)

        # Create ingredients
        for ingredient_data in ingredients_data:
            Ingredient.objects.create(recipe=recipe, **ingredient_data)

        # Create instructions
        for instruction_data in instructions_data:
            Instruction.objects.create(recipe=recipe, **instruction_data)

        return recipe

    def update(self, instance, validated_data):
        ingredients_data = validated_data.pop('ingredients', None)
        instructions_data = validated_data.pop('instructions', None)
        diet_ids = validated_data.pop('diet_ids', None)

        # Update basic fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update diets
        if diet_ids is not None:
            instance.diets.set(diet_ids)

        # Update ingredients
        if ingredients_data is not None:
            instance.ingredients.all().delete()
            for ingredient_data in ingredients_data:
                Ingredient.objects.create(recipe=instance, **ingredient_data)

        # Update instructions
        if instructions_data is not None:
            instance.instructions.all().delete()
            for instruction_data in instructions_data:
                Instruction.objects.create(recipe=instance, **instruction_data)

        return instance


class FavoriteSerializer(serializers.ModelSerializer):
    recipe = RecipeListSerializer(read_only=True)
    
    class Meta:
        model = Favorite
        fields = ['id', 'recipe', 'created_at']


class ShoppingListItemSerializer(serializers.ModelSerializer):
    recipe = RecipeListSerializer(read_only=True)
    
    class Meta:
        model = ShoppingListItem
        fields = [
            'id', 'recipe', 'ingredient_name', 'quantity', 'unit',
            'is_purchased', 'created_at'
        ]
