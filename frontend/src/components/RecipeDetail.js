
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as helpers from "../utils/helpers";
import * as apiService from "../services/api";

function RecipeDetail({ recipe, isOpen, onClose, currentUser, onEdit, onDelete }) {
    const [videoLoading, setVideoLoading] = useState(true);
    const navigate = useNavigate();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    // Handler for deleting a recipe (only for author)
    const handleDelete = async () => {
        if (!currentUser || !detailedRecipe || !detailedRecipe.author || currentUser.id !== detailedRecipe.author.id) {
            helpers.showToast('You are not allowed to delete this recipe.', 'danger');
            return;
        }
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        try {
            await apiService.deleteRecipe(detailedRecipe.id);
            helpers.showToast('Recipe deleted successfully.', 'success');
            if (onDelete) onDelete(detailedRecipe.id);
            setShowDeleteConfirm(false);
            window.location.href = "/";
        } catch (error) {
            helpers.showToast('Error deleting recipe: ' + error.message, 'danger');
            setShowDeleteConfirm(false);
        }
    };
    const [detailedRecipe, setDetailedRecipe] = useState(null);
    // Removed servings state
    const [isLoading, setIsLoading] = useState(false);
    // Removed ratings and reviews state
    const [showIngredients, setShowIngredients] = useState(true);
    const [showInstructions, setShowInstructions] = useState(false);
    const [showNutrition, setShowNutrition] = useState(false);
    const [showVideo, setShowVideo] = useState(false);

    useEffect(() => {
        if (isOpen && recipe) {
            loadRecipeDetails();
            // Removed loadRatings
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

    // Removed loadRatings

    // Removed handleServingsChange

    // Removed handleRatingSubmit

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

    // Helper to extract YouTube video ID and build embed URL
    const getYouTubeEmbedUrl = (url) => {
        if (!url) return null;
        const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/\S+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([\w-]{11})/);
        return match ? `https://www.youtube.com/embed/${match[1]}` : null;
    };

    return (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-xl modal-dialog-scrollable">
                <div className="modal-content">
                    <div className="modal-header">
                        <h4 className="modal-title">{currentRecipe.title}</h4>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    {/* Edit/Delete buttons for author only */}
                    {currentUser && detailedRecipe && detailedRecipe.author && currentUser.id === detailedRecipe.author.id && (
                        <div className="d-flex justify-content-end gap-2 px-3 pt-2">
                            <button className="btn btn-warning" onClick={() => onEdit && onEdit(detailedRecipe)}>
                                <i className="fas fa-edit me-1"></i>Edit
                            </button>
                            <button className="btn btn-danger" onClick={handleDelete}>
                                <i className="fas fa-trash me-1"></i>Delete
                            </button>
                        </div>
                    )}

                    {/* Custom Delete Confirmation Modal */}
                    {showDeleteConfirm && (
                        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                            <div className="modal-dialog modal-dialog-centered">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title">Confirm Delete</h5>
                                        <button type="button" className="btn-close" onClick={() => setShowDeleteConfirm(false)}></button>
                                    </div>
                                    <div className="modal-body">
                                        <p>Are you sure you want to delete this recipe? This action cannot be undone.</p>
                                    </div>
                                    <div className="modal-footer">
                                        <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
                                        <button className="btn btn-danger" onClick={confirmDelete}>Yes, Delete</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="modal-body">
                        {isLoading && (
                            <div className="loading">
                                <div className="spinner-border"></div>
                                <p>Loading recipe details...</p>
                            </div>
                        )}

                        {!isLoading && (
                            <>
                                {/* Image and About side-by-side */}
                                <div className="d-flex flex-row align-items-start mb-4" style={{ gap: '2rem' }}>
                                    {currentRecipe.image && (
                                        <img 
                                            src={currentRecipe.image} 
                                            alt={currentRecipe.title}
                                            className="recipe-detail-image mb-3 img-fluid rounded"
                                            style={{ width: '340px', maxHeight: '300px', objectFit: 'cover' }}
                                        />
                                    )}
                                    {currentRecipe.description && (
                                        <div className="about-recipe-box p-3" style={{ minWidth: '260px', maxWidth: '400px' }}>
                                            <h5>👨‍🍳 About This Recipe</h5>
                                            <p>{currentRecipe.description}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Recipe Meta */}
                                <div className="row mb-4">
                                    <div className="col-md-3">
                                        <div className="text-center">
                                            <i className="fas fa-clock fa-2x text-primary mb-2"></i>
                                            <p><strong>Expected Preparation Time</strong></p>
                                            <p>{currentRecipe.prep_time} minutes</p>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="text-center">
                                            <i className="fas fa-fire fa-2x text-danger mb-2"></i>
                                            <p><strong>Cooking Time</strong></p>
                                            <p>{currentRecipe.cook_time} minutes</p>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="text-center">
                                            <i className="fas fa-users fa-2x text-success mb-2"></i>
                                            <p><strong>Servings</strong></p>
                                            <span className="form-control text-center">{currentRecipe.servings}</span>
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
                                    {/* Removed rating meta */}
                                </div>

                                {/* Navigation Tabs */}
                                <ul className="nav nav-tabs mb-3">
                                    <li className="nav-item">
                                        <button 
                                            className={`nav-link ${showIngredients ? 'active' : ''}`}
                                            onClick={() => {
                                                setShowIngredients(true);
                                                setShowInstructions(false);
                                                setShowNutrition(false);
                                                setShowVideo(false);
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
                                                setShowVideo(false);
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
                                                setShowVideo(false);
                                            }}
                                        >
                                            <i className="fas fa-heartbeat me-2"></i>Nutrition
                                        </button>
                                    </li>
                                    {currentRecipe.video_url && getYouTubeEmbedUrl(currentRecipe.video_url) && (
                                        <li className="nav-item">
                                            <button 
                                                className={`nav-link ${showVideo ? 'active' : ''}`}
                                                onClick={() => {
                                                    setShowIngredients(false);
                                                    setShowInstructions(false);
                                                    setShowNutrition(false);
                                                    setShowVideo(true);
                                                }}
                                            >
                                                <i className="fab fa-youtube me-2"></i>Video
                                            </button>
                                        </li>
                                    )}
                                </ul>
                                {/* Video Tab with loading spinner */}
                                {showVideo && currentRecipe.video_url && getYouTubeEmbedUrl(currentRecipe.video_url) && (
                                    <div className="video-embed-box p-3 mb-4" style={{ maxWidth: '700px', margin: '0 auto' }}>
                                        <h5>Recipe Video</h5>
                                        <div className="ratio ratio-16x9" style={{ position: 'relative' }}>
                                            {videoLoading && (
                                                <div className="d-flex justify-content-center align-items-center" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(255,255,255,0.7)', zIndex: 2 }}>
                                                    <div className="spinner-border text-danger" role="status">
                                                        <span className="visually-hidden">Loading...</span>
                                                    </div>
                                                </div>
                                            )}
                                            <iframe
                                                src={getYouTubeEmbedUrl(currentRecipe.video_url)}
                                                title="Recipe Video"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                                style={{ border: 0, width: '100%', height: '340px', borderRadius: '8px', zIndex: 1 }}
                                                onLoad={() => setVideoLoading(false)}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Ingredients Tab */}
                                {showIngredients && (
                                    <div className="ingredients-list">
                                        <div className="mb-3">
                                            <h5>Ingredients</h5>
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
                                                        <div className="nutrition-value h4 text-success">{currentRecipe.protein !== undefined && currentRecipe.protein !== null ? currentRecipe.protein + 'g' : '-'}</div>
                                                        <div className="nutrition-label">Protein</div>
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="nutrition-item text-center p-3 border rounded">
                                                        <div className="nutrition-value h4 text-warning">{currentRecipe.carbs !== undefined && currentRecipe.carbs !== null ? currentRecipe.carbs + 'g' : '-'}</div>
                                                        <div className="nutrition-label">Carbs</div>
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="nutrition-item text-center p-3 border rounded">
                                                        <div className="nutrition-value h4 text-info">{currentRecipe.fat !== undefined && currentRecipe.fat !== null ? currentRecipe.fat + 'g' : '-'}</div>
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

                                {/* Rating and Reviews removed as requested */}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RecipeDetail;
