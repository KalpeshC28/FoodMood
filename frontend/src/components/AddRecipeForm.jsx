// filepath: frontend/src/components/AddRecipeForm.jsx
import React, { useState } from 'react';

const AddRecipeForm = ({ onRecipeAdded }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        ingredients: '',
        instructions: '',
        prep_time: '',
        cook_time: '',
        servings: '',
    });
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            const response = await fetch('/api/recipes/create/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to add recipe');
            }

            const newRecipe = await response.json();
            onRecipeAdded(newRecipe);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="add-recipe-form">
            <h2>Add Your Recipe</h2>
            {error && <p className="error">{error}</p>}
            <div>
                <label>Title</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} required />
            </div>
            <div>
                <label>Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} required />
            </div>
            <div>
                <label>Ingredients (comma-separated)</label>
                <textarea name="ingredients" value={formData.ingredients} onChange={handleChange} required />
            </div>
            <div>
                <label>Instructions (one per line)</label>
                <textarea name="instructions" value={formData.instructions} onChange={handleChange} required />
            </div>
            <div>
                <label>Prep Time (minutes)</label>
                <input type="number" name="prep_time" value={formData.prep_time} onChange={handleChange} required />
            </div>
            <div>
                <label>Cook Time (minutes)</label>
                <input type="number" name="cook_time" value={formData.cook_time} onChange={handleChange} required />
            </div>
            <div>
                <label>Servings</label>
                <input type="number" name="servings" value={formData.servings} onChange={handleChange} required />
            </div>
            <button type="submit">Add Recipe</button>
        </form>
    );
};

export default AddRecipeForm;