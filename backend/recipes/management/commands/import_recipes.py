import json
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from recipes.models import Recipe, Category, Cuisine, Diet, Ingredient, Instruction

class Command(BaseCommand):
    help = 'Bulk import recipes from a JSON file.'

    def add_arguments(self, parser):
        parser.add_argument('json_path', type=str, help='Path to the JSON file containing recipes.')

    def handle(self, *args, **options):
        json_path = options['json_path']
        with open(json_path, 'r', encoding='utf-8') as f:
            recipes = json.load(f)
        User = get_user_model()
        default_user = User.objects.first()
        for data in recipes:
            category = Category.objects.get_or_create(name=data['category'])[0]
            cuisine = Cuisine.objects.get_or_create(name=data.get('cuisine', ''))[0] if data.get('cuisine') else None
            recipe = Recipe.objects.create(
                title=data['title'],
                description=data['description'],
                author=default_user,
                category=category,
                cuisine=cuisine,
                prep_time=data.get('prep_time', 0),
                cook_time=data.get('cook_time', 0),
                servings=data.get('servings', 1),
                difficulty=data.get('difficulty', 'medium'),
                calories_per_serving=data.get('calories_per_serving'),
                protein=data.get('protein'),
                carbs=data.get('carbs'),
                fat=data.get('fat'),
            )
            # Diets
            for diet_name in data.get('diets', []):
                diet = Diet.objects.get_or_create(name=diet_name)[0]
                recipe.diets.add(diet)
            # Ingredients
            for ing in data['ingredients']:
                Ingredient.objects.create(
                    recipe=recipe,
                    name=ing['name'],
                    quantity=ing['quantity'],
                    unit=ing.get('unit', '')
                )
            # Instructions
            for idx, ins in enumerate(data['instructions'], 1):
                Instruction.objects.create(
                    recipe=recipe,
                    step_number=idx,
                    text=ins
                )
        self.stdout.write(self.style.SUCCESS(f"Imported {len(recipes)} recipes."))
