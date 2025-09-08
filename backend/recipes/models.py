from django.db import models
from django.contrib.auth.models import User


class SavedRecipe(models.Model):
    """
    Model to store user's saved recipes.
    Ready for Spoonacular API integration.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    recipe_id = models.CharField(max_length=100)  # Spoonacular recipe ID
    recipe_title = models.CharField(max_length=200)
    recipe_image = models.URLField(blank=True, null=True)
    saved_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'recipe_id')
    
    def __str__(self):
        return f"{self.user.username} - {self.recipe_title}"