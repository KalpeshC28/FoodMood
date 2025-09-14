import React, { useState } from 'react';
import AddRecipeForm from './components/AddRecipeForm';


function AddRecipePage({ onRecipeAdded }) {
  const [addedRecipe, setAddedRecipe] = useState(null);
  const handleRecipeAdded = (recipe) => {
    setAddedRecipe(recipe);
    if (onRecipeAdded) onRecipeAdded(recipe);
  };
  return (
    <div className="container py-4">
      <AddRecipeForm onRecipeAdded={handleRecipeAdded} />
      {addedRecipe && (
        <div className="alert alert-success mt-3">
          Recipe "{addedRecipe.title}" added successfully!
        </div>
      )}
    </div>
  );
}

export default AddRecipePage;
