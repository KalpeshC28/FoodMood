from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from recipes.models import Category, Cuisine, Diet, Recipe, Ingredient, Instruction


class Command(BaseCommand):
    help = 'Populate database with sample recipe data'

    def handle(self, *args, **options):
        self.stdout.write('Creating sample data...')
        
        # Create or get admin user
        admin_user, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@admin.com',
                'is_staff': True,
                'is_superuser': True
            }
        )
        if created:
            admin_user.set_password('admin123')
            admin_user.save()
            self.stdout.write('Created admin user')
        
        # Create categories
        categories_data = [
            ('Breakfast', 'Morning meals and brunch dishes'),
            ('Lunch', 'Midday meals and light dishes'),
            ('Dinner', 'Evening meals and hearty dishes'),
            ('Dessert', 'Sweet treats and desserts'),
            ('Snacks', 'Quick bites and appetizers'),
            ('Beverages', 'Drinks and smoothies')
        ]
        
        for name, desc in categories_data:
            Category.objects.get_or_create(name=name, defaults={'description': desc})
        
        # Create cuisines
        cuisines_data = [
            ('Italian', 'Traditional Italian cuisine'),
            ('Mexican', 'Traditional Mexican cuisine'),
            ('Asian', 'Asian fusion cuisine'),
            ('American', 'Traditional American cuisine'),
            ('Mediterranean', 'Mediterranean cuisine'),
            ('Indian', 'Traditional Indian cuisine')
        ]
        
        for name, desc in cuisines_data:
            Cuisine.objects.get_or_create(name=name, defaults={'description': desc})
        
        # Create diets
        diets_data = [
            ('Vegetarian', 'No meat, fish, or poultry'),
            ('Vegan', 'No animal products'),
            ('Gluten-Free', 'No gluten-containing ingredients'),
            ('Keto', 'Low-carb, high-fat diet'),
            ('Paleo', 'Stone-age inspired diet'),
            ('Dairy-Free', 'No dairy products')
        ]
        
        for name, desc in diets_data:
            Diet.objects.get_or_create(name=name, defaults={'description': desc})
        
        # Create sample recipes
        recipes_data = [
            {
                'title': 'Classic Spaghetti Carbonara',
                'description': 'A traditional Italian pasta dish with eggs, cheese, and pancetta.',
                'category': 'Dinner',
                'cuisine': 'Italian',
                'prep_time': 10,
                'cook_time': 20,
                'servings': 4,
                'difficulty': 'medium',
                'calories_per_serving': 520,
                'ingredients': [
                    ('Spaghetti', '400', 'g'),
                    ('Pancetta', '150', 'g'),
                    ('Eggs', '3', 'large'),
                    ('Parmesan cheese', '100', 'g'),
                    ('Black pepper', '1', 'tsp'),
                    ('Salt', 'to taste', ''),
                ],
                'instructions': [
                    'Cook spaghetti in salted boiling water until al dente.',
                    'Meanwhile, dice pancetta and cook in a large pan until crispy.',
                    'Beat eggs with grated Parmesan and black pepper.',
                    'Drain pasta, reserving some pasta water.',
                    'Add hot pasta to pancetta pan, remove from heat.',
                    'Quickly stir in egg mixture, adding pasta water as needed.',
                    'Serve immediately with extra Parmesan and black pepper.'
                ]
            },
            {
                'title': 'Chicken Tacos',
                'description': 'Delicious and easy chicken tacos with fresh toppings.',
                'category': 'Dinner',
                'cuisine': 'Mexican',
                'prep_time': 15,
                'cook_time': 25,
                'servings': 4,
                'difficulty': 'easy',
                'calories_per_serving': 380,
                'ingredients': [
                    ('Chicken breast', '500', 'g'),
                    ('Taco seasoning', '1', 'packet'),
                    ('Corn tortillas', '8', 'pieces'),
                    ('Lettuce', '1', 'head'),
                    ('Tomatoes', '2', 'medium'),
                    ('Cheddar cheese', '100', 'g'),
                    ('Sour cream', '200', 'ml'),
                    ('Lime', '2', 'pieces'),
                ],
                'instructions': [
                    'Season chicken with taco seasoning and cook in a pan until done.',
                    'Warm tortillas in a dry pan or microwave.',
                    'Shred lettuce and dice tomatoes.',
                    'Grate cheese and cut lime into wedges.',
                    'Slice cooked chicken into strips.',
                    'Assemble tacos with chicken, lettuce, tomatoes, and cheese.',
                    'Serve with sour cream and lime wedges.'
                ]
            },
            {
                'title': 'Vegetarian Buddha Bowl',
                'description': 'A nutritious bowl packed with fresh vegetables, grains, and protein.',
                'category': 'Lunch',
                'cuisine': 'Asian',
                'prep_time': 20,
                'cook_time': 30,
                'servings': 2,
                'difficulty': 'medium',
                'calories_per_serving': 450,
                'diets': ['Vegetarian'],
                'ingredients': [
                    ('Quinoa', '200', 'g'),
                    ('Sweet potato', '1', 'large'),
                    ('Broccoli', '200', 'g'),
                    ('Chickpeas', '400', 'g'),
                    ('Avocado', '1', 'piece'),
                    ('Tahini', '2', 'tbsp'),
                    ('Lemon juice', '2', 'tbsp'),
                    ('Olive oil', '2', 'tbsp'),
                ],
                'instructions': [
                    'Cook quinoa according to package instructions.',
                    'Roast diced sweet potato at 200°C for 25 minutes.',
                    'Steam broccoli until tender, about 5 minutes.',
                    'Drain and rinse chickpeas.',
                    'Slice avocado just before serving.',
                    'Mix tahini, lemon juice, and olive oil for dressing.',
                    'Arrange all ingredients in bowls and drizzle with dressing.'
                ]
            },
            {
                'title': 'Chocolate Chip Cookies',
                'description': 'Classic homemade chocolate chip cookies that are crispy outside and chewy inside.',
                'category': 'Dessert',
                'cuisine': 'American',
                'prep_time': 15,
                'cook_time': 12,
                'servings': 24,
                'difficulty': 'easy',
                'calories_per_serving': 180,
                'ingredients': [
                    ('All-purpose flour', '250', 'g'),
                    ('Butter', '115', 'g'),
                    ('Brown sugar', '100', 'g'),
                    ('White sugar', '50', 'g'),
                    ('Egg', '1', 'large'),
                    ('Vanilla extract', '1', 'tsp'),
                    ('Baking soda', '1/2', 'tsp'),
                    ('Salt', '1/2', 'tsp'),
                    ('Chocolate chips', '200', 'g'),
                ],
                'instructions': [
                    'Preheat oven to 190°C.',
                    'Cream butter with both sugars until light and fluffy.',
                    'Beat in egg and vanilla extract.',
                    'Mix flour, baking soda, and salt in separate bowl.',
                    'Gradually add dry ingredients to wet ingredients.',
                    'Fold in chocolate chips.',
                    'Drop rounded tablespoons of dough onto baking sheets.',
                    'Bake for 10-12 minutes until edges are golden.',
                    'Cool on baking sheets for 5 minutes before transferring.'
                ]
            },
            {
                'title': 'Green Smoothie',
                'description': 'A healthy and refreshing green smoothie packed with nutrients.',
                'category': 'Beverages',
                'cuisine': 'American',
                'prep_time': 5,
                'cook_time': 0,
                'servings': 2,
                'difficulty': 'easy',
                'calories_per_serving': 150,
                'diets': ['Vegan', 'Gluten-Free'],
                'ingredients': [
                    ('Spinach', '2', 'cups'),
                    ('Banana', '1', 'large'),
                    ('Apple', '1', 'medium'),
                    ('Coconut water', '250', 'ml'),
                    ('Lime juice', '1', 'tbsp'),
                    ('Fresh ginger', '1', 'tsp'),
                    ('Ice cubes', '1', 'cup'),
                ],
                'instructions': [
                    'Wash spinach thoroughly.',
                    'Peel and slice banana.',
                    'Core and chop apple.',
                    'Add all ingredients to blender.',
                    'Blend until smooth and creamy.',
                    'Add more coconut water if needed for desired consistency.',
                    'Serve immediately in chilled glasses.'
                ]
            }
        ]
        
        for recipe_data in recipes_data:
            # Get related objects
            category = Category.objects.get(name=recipe_data['category'])
            cuisine = Cuisine.objects.get(name=recipe_data['cuisine'])
            
            # Create recipe
            recipe, created = Recipe.objects.get_or_create(
                title=recipe_data['title'],
                defaults={
                    'description': recipe_data['description'],
                    'author': admin_user,
                    'category': category,
                    'cuisine': cuisine,
                    'prep_time': recipe_data['prep_time'],
                    'cook_time': recipe_data['cook_time'],
                    'servings': recipe_data['servings'],
                    'difficulty': recipe_data['difficulty'],
                    'calories_per_serving': recipe_data['calories_per_serving'],
                }
            )
            
            if created:
                # Add diets if specified
                if 'diets' in recipe_data:
                    for diet_name in recipe_data['diets']:
                        diet = Diet.objects.get(name=diet_name)
                        recipe.diets.add(diet)
                
                # Add ingredients
                for name, quantity, unit in recipe_data['ingredients']:
                    Ingredient.objects.create(
                        recipe=recipe,
                        name=name,
                        quantity=quantity,
                        unit=unit
                    )
                
                # Add instructions
                for i, text in enumerate(recipe_data['instructions'], 1):
                    Instruction.objects.create(
                        recipe=recipe,
                        step_number=i,
                        text=text
                    )
                
                self.stdout.write(f'Created recipe: {recipe.title}')
            else:
                self.stdout.write(f'Recipe already exists: {recipe.title}')
        
        self.stdout.write(self.style.SUCCESS('Successfully populated database with sample data!'))
