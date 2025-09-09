import React from 'react';
import * as helpers from '../utils/helpers';

function RecipeCard({ recipe, onViewDetails, onToggleFavorite, isFavorited, user }) {
    const defaultImage = 'https://images.unsplash.com/photo-1546548970-71785318a17b?w=400&h=300&fit=crop&auto=format';
    
    const handleFavorite = () => {
        if (onToggleFavorite) {
            onToggleFavorite(recipe.id || recipe.spoonacular_id);
        }
    };

    const handleViewDetails = () => {
        if (onViewDetails) {
            onViewDetails(recipe);
        }
    };

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        
        for (let i = 0; i < fullStars; i++) {
            stars.push(<i key={i} className="fas fa-star text-warning"></i>);
        }
        
        if (hasHalfStar) {
            stars.push(<i key="half" className="fas fa-star-half-alt text-warning"></i>);
        }
        
        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<i key={`empty-${i}`} className="far fa-star text-warning"></i>);
        }
        
        return stars;
    };

    const getDifficultyColor = (difficulty) => {
        switch(difficulty?.toLowerCase()) {
            case 'easy': return 'success';
            case 'medium': return 'warning';
            case 'hard': return 'danger';
            default: return 'secondary';
        }
    };

    return (
        <div className="recipe-card h-100">
            <div className="card-image-container position-relative">
                <img 
                    src={recipe.image_url || defaultImage} 
                    className="card-img-top recipe-card-image" 
                    alt={recipe.title}
                    onError={(e) => {
                        e.target.src = defaultImage;
                    }}
                />
                <div className="recipe-overlay">
                    <div className="recipe-overlay-content">
                        {recipe.difficulty && (
                            <span className={`badge bg-${getDifficultyColor(recipe.difficulty)} difficulty-badge`}>
                                {helpers.capitalize(recipe.difficulty)}
                            </span>
                        )}
                        {user && (
                            <button 
                                className={`btn btn-sm favorite-btn ${isFavorited ? 'favorited' : ''}`}
                                onClick={handleFavorite}
                            >
                                <i className={`${isFavorited ? 'fas' : 'far'} fa-heart`}></i>
                            </button>
                        )}
                    </div>
                </div>
            </div>
            
            <div className="card-body d-flex flex-column">
                <h5 className="card-title recipe-title">{recipe.title}</h5>
                
                <p className="card-text recipe-description">
                    {recipe.description?.length > 120 
                        ? `${recipe.description.substring(0, 120)}...` 
                        : recipe.description || 'Delicious recipe waiting for you to try!'}
                </p>

                <div className="recipe-meta mb-3">
                    <div className="row g-2">
                        {recipe.prep_time && (
                            <div className="col-6">
                                <div className="meta-item">
                                    <i className="fas fa-clock text-primary me-1"></i>
                                    <small className="text-muted">{recipe.prep_time} min</small>
                                </div>
                            </div>
                        )}
                        {recipe.servings && (
                            <div className="col-6">
                                <div className="meta-item">
                                    <i className="fas fa-users text-primary me-1"></i>
                                    <small className="text-muted">{recipe.servings} servings</small>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {recipe.average_rating > 0 && (
                    <div className="recipe-rating mb-2">
                        <div className="d-flex align-items-center">
                            <div className="stars me-2">
                                {renderStars(recipe.average_rating)}
                            </div>
                            <small className="text-muted">
                                ({recipe.average_rating.toFixed(1)})
                            </small>
                        </div>
                    </div>
                )}

                <div className="recipe-tags mb-3">
                    {recipe.category && (
                        <span className="badge bg-light text-dark me-1 mb-1">
                            <i className="fas fa-tag me-1"></i>
                            {helpers.capitalize(recipe.category.name)}
                        </span>
                    )}
                    {recipe.cuisine && (
                        <span className="badge bg-light text-dark me-1 mb-1">
                            <i className="fas fa-globe me-1"></i>
                            {helpers.capitalize(recipe.cuisine.name)}
                        </span>
                    )}
                    {recipe.diet && (
                        <span className="badge bg-success me-1 mb-1">
                            <i className="fas fa-leaf me-1"></i>
                            {helpers.capitalize(recipe.diet.name)}
                        </span>
                    )}
                </div>

                <div className="mt-auto d-flex justify-content-between align-items-center">
                    <button 
                        className="btn btn-primary btn-sm view-recipe-btn"
                        onClick={handleViewDetails}
                        style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            border: 'none',
                            borderRadius: '25px',
                            padding: '8px 20px',
                            fontWeight: '500',
                            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                        }}
                    >
                        <i className="fas fa-eye me-2"></i>
                        View Recipe
                    </button>
                    
                    {recipe.meal_types && recipe.meal_types.length > 0 && (
                        <span className="text-secondary small">
                            <i className="fas fa-utensils me-1"></i>
                            {helpers.capitalize(recipe.meal_types[0])}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

export default RecipeCard;
