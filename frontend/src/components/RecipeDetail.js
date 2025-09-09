import React, { useState, useEffect } from "react";
import * as helpers from "../utils/helpers";
import * as apiService from "../services/api";

function RecipeDetail({ recipe, isOpen, onClose, currentUser }) {
    const [detailedRecipe, setDetailedRecipe] = useState(null);
    const [servings, setServings] = useState(recipe?.servings || 1);
    const [isLoading, setIsLoading] = useState(false);
    const [userRating, setUserRating] = useState(0);
    const [userReview, setUserReview] = useState('');
    const [ratings, setRatings] = useState([]);
    const [showIngredients, setShowIngredients] = useState(true);
    const [showInstructions, setShowInstructions] = useState(false);
    const [showNutrition, setShowNutrition] = useState(false);

    useEffect(() => {
        if (isOpen && recipe) {
            loadRecipeDetails();
            loadRatings();
            setServings(recipe.servings || 1);
        }
    }, [isOpen, recipe]);

    const loadRecipeDetails = async () => {
        setIsLoading(true);
        try {
            const response = await apiService.getRecipeDetail(recipe.id || recipe.spoonacular_id);
            setDetailedRecipe(response);
        } catch (error) {
            console.error('Error loading recipe details:', error);
            helpers.showToast('Error loading recipe details', 'danger');
        } finally {
            setIsLoading(false);
        }
    };

    const loadRatings = async () => {
        try {
            const response = await apiService.getRecipeRatings(recipe.id || recipe.spoonacular_id);
            setRatings(response.ratings || []);
        } catch (error) {
            console.error('Error loading ratings:', error);
        }
    };

    const handleServingsChange = async (newServings) => {
        if (newServings < 1 || newServings > 12) return;
        
        setServings(newServings);
        setIsLoading(true);
        
        try {
            const response = await apiService.getRecipeDetail(recipe.spoonacular_id || recipe.id, newServings);
            setDetailedRecipe(response.recipe);
        } catch (error) {
            console.error('Error adjusting servings:', error);
            helpers.showToast('Error adjusting servings', 'danger');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRatingSubmit = async () => {
        if (!currentUser) {
            helpers.showToast('Please login to rate recipes', 'warning');
            return;
        }

        if (userRating === 0) {
            helpers.showToast('Please select a rating', 'warning');
            return;
        }

        try {
            await apiService.rateRecipe(recipe.spoonacular_id || recipe.id, userRating, userReview);
            helpers.showToast('Rating submitted successfully', 'success');
            loadRatings();
            setUserRating(0);
            setUserReview('');
        } catch (error) {
            helpers.showToast('Error submitting rating: ' + error.message, 'danger');
        }
    };

    const createShoppingList = async () => {
        if (!currentUser) {
            helpers.showToast('Please login to create shopping lists', 'warning');
            return;
        }

        try {
            await apiService.createShoppingList([recipe.spoonacular_id || recipe.id], `Shopping list for ${recipe.title}`);
            helpers.showToast('Shopping list created successfully', 'success');
        } catch (error) {
            helpers.showToast('Error creating shopping list: ' + error.message, 'danger');
        }
    };

    if (!isOpen || !recipe) return null;

    const currentRecipe = detailedRecipe || recipe;

    return (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-xl modal-dialog-scrollable">
                <div className="modal-content">
                    <div className="modal-header">
                        <h4 className="modal-title">{currentRecipe.title}</h4>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    
                    <div className="modal-body">
                        {isLoading && (
                            <div className="loading">
                                <div className="spinner-border"></div>
                                <p>Loading recipe details...</p>
                            </div>
                        )}

                        {!isLoading && (
                            <>
                                {/* Recipe Image */}
                                {currentRecipe.image && (
                                    <img 
                                        src={currentRecipe.image} 
                                        alt={currentRecipe.title}
                                        className="recipe-detail-image mb-3 img-fluid rounded"
                                        style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }}
                                    />
                                )}

                                {/* Recipe Meta */}
                                <div className="row mb-4">
                                    <div className="col-md-3">
                                        <div className="text-center">
                                            <i className="fas fa-clock fa-2x text-primary mb-2"></i>
                                            <p><strong>Prep Time</strong></p>
                                            <p>{currentRecipe.prep_time} minutes</p>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="text-center">
                                            <i className="fas fa-users fa-2x text-success mb-2"></i>
                                            <p><strong>Servings</strong></p>
                                            <div className="input-group">
                                                <button 
                                                    className="btn btn-outline-secondary"
                                                    onClick={() => handleServingsChange(servings - 1)}
                                                    disabled={servings <= 1}
                                                >
                                                    -
                                                </button>
                                                <span className="form-control text-center">{servings}</span>
                                                <button 
                                                    className="btn btn-outline-secondary"
                                                    onClick={() => handleServingsChange(servings + 1)}
                                                    disabled={servings >= 12}
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="text-center">
                                            <i className="fas fa-signal fa-2x text-warning mb-2"></i>
                                            <p><strong>Difficulty</strong></p>
                                            <span className={`badge ${currentRecipe.difficulty === 'easy' ? 'bg-success' : currentRecipe.difficulty === 'hard' ? 'bg-danger' : 'bg-warning'}`}>
                                                {currentRecipe.difficulty || 'Medium'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="text-center">
                                            <i className="fas fa-star fa-2x text-warning mb-2"></i>
                                            <p><strong>Rating</strong></p>
                                            <p>{currentRecipe.average_rating ? currentRecipe.average_rating.toFixed(1) : 'No ratings'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Recipe Summary */}
                                {currentRecipe.description && (
                                    <div className="mb-4">
                                        <h5>About This Recipe</h5>
                                        <p>{currentRecipe.description}</p>
                                    </div>
                                )}

                                {/* Navigation Tabs */}
                                <ul className="nav nav-tabs mb-3">
                                    <li className="nav-item">
                                        <button 
                                            className={`nav-link ${showIngredients ? 'active' : ''}`}
                                            onClick={() => {
                                                setShowIngredients(true);
                                                setShowInstructions(false);
                                                setShowNutrition(false);
                                            }}
                                        >
                                            <i className="fas fa-list me-2"></i>Ingredients
                                        </button>
                                    </li>
                                    <li className="nav-item">
                                        <button 
                                            className={`nav-link ${showInstructions ? 'active' : ''}`}
                                            onClick={() => {
                                                setShowIngredients(false);
                                                setShowInstructions(true);
                                                setShowNutrition(false);
                                            }}
                                        >
                                            <i className="fas fa-utensils me-2"></i>Instructions
                                        </button>
                                    </li>
                                    <li className="nav-item">
                                        <button 
                                            className={`nav-link ${showNutrition ? 'active' : ''}`}
                                            onClick={() => {
                                                setShowIngredients(false);
                                                setShowInstructions(false);
                                                setShowNutrition(true);
                                            }}
                                        >
                                            <i className="fas fa-heartbeat me-2"></i>Nutrition
                                        </button>
                                    </li>
                                </ul>

                                {/* Ingredients Tab */}
                                {showIngredients && (
                                    <div className="ingredients-list">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h5>Ingredients</h5>
                                            <button className="btn btn-outline-primary btn-sm" onClick={createShoppingList}>
                                                <i className="fas fa-shopping-cart me-2"></i>Add to Shopping List
                                            </button>
                                        </div>
                                        {currentRecipe.ingredients && currentRecipe.ingredients.length > 0 ? (
                                            <div className="row">
                                                {currentRecipe.ingredients.map((ingredient, index) => (
                                                    <div key={ingredient.id || index} className="col-md-6 mb-2">
                                                        <div className="ingredient-item p-2 border rounded">
                                                            <span className="ingredient-amount fw-bold">
                                                                {ingredient.quantity} {ingredient.unit}
                                                            </span>
                                                            <span className="ms-2">{ingredient.name}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-4">
                                                <i className="fas fa-list fa-3x text-muted mb-3"></i>
                                                <p className="text-muted">No ingredient information available.</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Instructions Tab */}
                                {showInstructions && (
                                    <div>
                                        <h5>Instructions</h5>
                                        {currentRecipe.instructions && currentRecipe.instructions.length > 0 ? (
                                            <div className="instructions-list">
                                                {currentRecipe.instructions.map((instruction, index) => (
                                                    <div key={instruction.id || index} className="instruction-step mb-3 p-3 border rounded">
                                                        <div className="d-flex align-items-start">
                                                            <span className="badge bg-primary me-3">{instruction.step_number || index + 1}</span>
                                                            <p className="mb-0">{instruction.text}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-4">
                                                <i className="fas fa-utensils fa-3x text-muted mb-3"></i>
                                                <p className="text-muted">No cooking instructions available for this recipe.</p>
                                                <p className="text-muted small">This might be a recipe imported from an external source.</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Nutrition Tab */}
                                {showNutrition && (
                                    <div>
                                        <h5>Nutrition Information</h5>
                                        {currentRecipe.calories_per_serving ? (
                                            <div className="row">
                                                <div className="col-md-3">
                                                    <div className="nutrition-item text-center p-3 border rounded">
                                                        <div className="nutrition-value h4 text-primary">{currentRecipe.calories_per_serving}</div>
                                                        <div className="nutrition-label">Calories</div>
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="nutrition-item text-center p-3 border rounded">
                                                        <div className="nutrition-value h4 text-success">-</div>
                                                        <div className="nutrition-label">Protein</div>
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="nutrition-item text-center p-3 border rounded">
                                                        <div className="nutrition-value h4 text-warning">-</div>
                                                        <div className="nutrition-label">Carbs</div>
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="nutrition-item text-center p-3 border rounded">
                                                        <div className="nutrition-value h4 text-info">-</div>
                                                        <div className="nutrition-label">Fat</div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center py-4">
                                                <i className="fas fa-heartbeat fa-3x text-muted mb-3"></i>
                                                <p className="text-muted">No nutrition information available.</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Rating Section */}
                                {currentUser && (
                                    <div className="mt-4 p-3 bg-light rounded">
                                        <h6>Rate This Recipe</h6>
                                        <div className="rating-stars mb-2">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <i
                                                    key={star}
                                                    className={`fas fa-star star ${star <= userRating ? 'filled' : ''}`}
                                                    onClick={() => setUserRating(star)}
                                                ></i>
                                            ))}
                                        </div>
                                        <textarea
                                            className="form-control mb-2"
                                            placeholder="Write a review (optional)..."
                                            value={userReview}
                                            onChange={(e) => setUserReview(e.target.value)}
                                            rows="3"
                                        ></textarea>
                                        <button className="btn btn-primary btn-sm" onClick={handleRatingSubmit}>
                                            Submit Rating
                                        </button>
                                    </div>
                                )}

                                {/* Reviews Section */}
                                {ratings.length > 0 && (
                                    <div className="mt-4">
                                        <h6>Reviews</h6>
                                        {ratings.slice(0, 5).map(rating => (
                                            <div key={rating.id} className="border-bottom pb-2 mb-2">
                                                <div className="d-flex justify-content-between">
                                                    <strong>{rating.user}</strong>
                                                    <div>
                                                        {[1, 2, 3, 4, 5].map(star => (
                                                            <i
                                                                key={star}
                                                                className={`fas fa-star ${star <= rating.rating ? 'text-warning' : 'text-muted'}`}
                                                            ></i>
                                                        ))}
                                                    </div>
                                                </div>
                                                {rating.review && <p className="mb-1">{rating.review}</p>}
                                                <small className="text-muted">{helpers.formatDate(rating.created_at)}</small>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RecipeDetail;
