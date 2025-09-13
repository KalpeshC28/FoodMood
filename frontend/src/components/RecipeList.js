// filepath: frontend/src/components/RecipeList.jsx
import React from 'react';

const token = localStorage.getItem('token');

const RecipeList = ({ recipes }) => {
    return (
        <div className="recipe-list">
            {recipes.map((recipe) => (
                <div key={recipe.id} className="recipe-card">
                    <h3>{recipe.title}</h3>
                    <p>{recipe.description}</p>
                </div>
            ))}
        </div>
    );
};

export default RecipeList;