// filepath: frontend/src/components/RecipeList.jsx
import React from 'react';

const token = localStorage.getItem('token');

const RecipeList = ({ recipes }) => {
    return (
        <div
            className="recipe-list"
            style={{
                display: 'flex',
                overflowX: 'auto',
                scrollBehavior: 'smooth',
                gap: '2rem',
                padding: '1rem 0',
                scrollSnapType: 'x mandatory',
                WebkitOverflowScrolling: 'touch',
            }}
        >
            {recipes.map((recipe) => (
                <div
                    key={recipe.id}
                    className="recipe-card"
                    style={{
                        minWidth: '340px',
                        scrollSnapAlign: 'center',
                        flex: '0 0 auto',
                        transition: 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
                    }}
                >
                    <h3>{recipe.title}</h3>
                    <p>{recipe.description}</p>
                </div>
            ))}
        </div>
    );
};

export default RecipeList;