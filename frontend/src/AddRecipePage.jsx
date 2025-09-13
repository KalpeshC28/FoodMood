import React, { useState } from 'react';
import AddRecipeForm from './components/AddRecipeForm';

function AddRecipePage() {
  const [addedRecipe, setAddedRecipe] = useState(null);
  return (
    <div className="container py-4">
      <AddRecipeForm onRecipeAdded={setAddedRecipe} />
      {addedRecipe && (
        <div className="alert alert-success mt-3">
          Recipe "{addedRecipe.title}" added successfully!
        </div>
      )}
    </div>
  );
}

export default AddRecipePage;
