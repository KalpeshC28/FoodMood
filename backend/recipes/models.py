from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    
    class Meta:
        verbose_name_plural = "Categories"
    
    def __str__(self):
        return self.name


class Cuisine(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    
    def __str__(self):
        return self.name


class Diet(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    
    def __str__(self):
        return self.name


class Recipe(models.Model):
    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    cuisine = models.ForeignKey(Cuisine, on_delete=models.CASCADE, null=True, blank=True)
    diets = models.ManyToManyField(Diet, blank=True)
    
    prep_time = models.PositiveIntegerField(help_text="Preparation time in minutes")
    cook_time = models.PositiveIntegerField(help_text="Cooking time in minutes")
    servings = models.PositiveIntegerField(default=4)
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default='medium')
    
    image = models.ImageField(upload_to='recipe_images/', blank=True, null=True)
    calories_per_serving = models.PositiveIntegerField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title
    
    @property
    def total_time(self):
        return self.prep_time + self.cook_time
    
    @property
    def average_rating(self):
        ratings = self.ratings.all()
        if ratings:
            return sum(rating.score for rating in ratings) / len(ratings)
        return 0


class Ingredient(models.Model):
    recipe = models.ForeignKey(Recipe, related_name='ingredients', on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    quantity = models.CharField(max_length=50)
    unit = models.CharField(max_length=50, blank=True)
    
    def __str__(self):
        return f"{self.quantity} {self.unit} {self.name}".strip()


class Instruction(models.Model):
    recipe = models.ForeignKey(Recipe, related_name='instructions', on_delete=models.CASCADE)
    step_number = models.PositiveIntegerField()
    text = models.TextField()
    
    class Meta:
        ordering = ['step_number']
        unique_together = ('recipe', 'step_number')
    
    def __str__(self):
        return f"Step {self.step_number}: {self.text[:50]}..."


class Rating(models.Model):
    recipe = models.ForeignKey(Recipe, related_name='ratings', on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    score = models.PositiveIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('recipe', 'user')
    
    def __str__(self):
        return f"{self.user.username} rated {self.recipe.title}: {self.score}/5"


class Favorite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'recipe')
    
    def __str__(self):
        return f"{self.user.username} favorited {self.recipe.title}"


class ShoppingListItem(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, null=True, blank=True)
    ingredient_name = models.CharField(max_length=200)
    quantity = models.CharField(max_length=50)
    unit = models.CharField(max_length=50, blank=True)
    is_purchased = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.username}: {self.quantity} {self.unit} {self.ingredient_name}".strip()