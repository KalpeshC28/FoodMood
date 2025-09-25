
import React, { useState, useEffect, useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import Login from "./Login";
import ReactDOM from "react-dom/client";
import RecipeCard from "./components/RecipeCard";
import RecipeDetail from "./components/RecipeDetail";
import RecipeFilter from "./components/RecipeFilter";
import UserHistory from "./components/UserHistory";
import * as apiService from "./services/api";
import * as helpers from "./utils/helpers";
import AddRecipePage from "./AddRecipePage";
import AddRecipeForm from "./components/AddRecipeForm";
import './App.css';

// Particle Effect Component
function ParticleBackground() {
    useEffect(() => {
        const createParticle = () => {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 8 + 's';
            particle.style.animationDuration = (Math.random() * 3 + 5) + 's';
            document.body.appendChild(particle);
            
            setTimeout(() => {
                particle.remove();
            }, 8000);
        };
        
        const interval = setInterval(createParticle, 300);
        return () => clearInterval(interval);
    }, []);
    
    return null;
}

// Main App Component
function App() {
    // AuthContext
    const { token, login, logout } = useContext(AuthContext);
    // State management
    const [currentUser, setCurrentUser] = useState(null);
    const [recipes, setRecipes] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authMode, setAuthMode] = useState('login');
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [showRecipeDetail, setShowRecipeDetail] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [searchFilters, setSearchFilters] = useState({
        query: '',
        cuisine: '',
        meal_type: '',
        diet: '',
        max_results: 12
    });
    const [showEditModal, setShowEditModal] = useState(false);
    const [editRecipe, setEditRecipe] = useState(null);



    // Handler for deleting a recipe
    const handleRecipeDelete = async (deletedId) => {
        setRecipes(prev => prev.filter(r => (r.id || r.spoonacular_id) !== deletedId));
        setFavorites(prev => prev.filter(r => (r.id || r.spoonacular_id) !== deletedId));
        setShowRecipeDetail(false);
        setShowEditModal(false);
        setEditRecipe(null);
        helpers.showToast('Recipe deleted!', 'success');
        setTimeout(() => {
            window.location.reload();
        }, 350);
    };

    // Handler for editing a recipe (show edit modal or page)
    const handleRecipeEdit = (recipe) => {
        setEditRecipe(recipe);
        setShowEditModal(true);
    };

    const handleRecipeUpdated = (updatedRecipe) => {
        setRecipes(prev => prev.map(r => ((r.id || r.spoonacular_id) === (updatedRecipe.id || updatedRecipe.spoonacular_id) ? updatedRecipe : r)));
        setFavorites(prev => prev.map(r => ((r.id || r.spoonacular_id) === (updatedRecipe.id || updatedRecipe.spoonacular_id) ? updatedRecipe : r)));
        setShowEditModal(false);
        setEditRecipe(null);
        setShowRecipeDetail(false);
        performSearch(); // Refresh recipes from backend
        loadFavorites(); // Refresh favorites from backend
        helpers.showToast('Recipe updated!', 'success');
    };

    // Initialize app
    useEffect(() => {
        const initializeApp = async () => {
            if (token) {
                try {
                    // Fetch user profile with token
                    const response = await apiService.getCurrentUser(token);
                    if (response.user) {
                        setCurrentUser(response.user);
                        loadFavorites(token);
                    }
                } catch (error) {
                    setCurrentUser(null);
                }
            } else {
                setCurrentUser(null);
            }
            performSearch();
        };
        initializeApp();
    }, [token]);

    const loadFavorites = async (tokenOverride) => {
        try {
            const response = await apiService.getFavorites(tokenOverride || token);
            // If favorites are Favorite objects, extract the recipe field
            const favs = (response.favorites || []).map(fav => fav.recipe ? fav.recipe : fav);
            setFavorites(favs);
        } catch (error) {
            console.error('Error loading favorites:', error);
        }
    };

    // Authentication functions
    // Used by AuthModal (legacy)
    const handleLogin = async (credentials) => {
        try {
            const response = await apiService.login(credentials);
            if (response.token) {
                login(response.token);
                // Immediately fetch and set user profile after login
                try {
                    const userResp = await apiService.getCurrentUser(response.token);
                    if (userResp.user) {
                        setCurrentUser(userResp.user);
                        loadFavorites(response.token);
                    }
                } catch (e) {
                    setCurrentUser(null);
                }
                setShowAuthModal(false);
                helpers.showToast('Welcome back! 🎉', 'success');
            }
        } catch (error) {
            throw error;
        }
    };

    // Used by AuthModal (legacy)
    const handleRegister = async (userData) => {
        try {
            const response = await apiService.register(userData);
            if (response.token) {
                login(response.token);
                setShowAuthModal(false);
                helpers.showToast('Welcome to FoodMood! 🍳', 'success');
            }
        } catch (error) {
            throw error;
        }
    };

    const handleLogout = async () => {
        try {
            await apiService.logout();
            logout();
            setCurrentUser(null);
            setFavorites([]);
            helpers.showToast('See you soon! 👋', 'success');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    // Recipe functions
    const performSearch = async (filters = searchFilters) => {
        setIsLoading(true);
        try {
            const response = await apiService.searchRecipes(filters);
            setRecipes(response.recipes || []);
            if (response.recipes?.length === 0) {
                helpers.showToast('No recipes found. Try different ingredients! 🔍', 'info');
            }
        } catch (error) {
            console.error('Search error:', error);
            
            if (error.message.includes('402') || error.message.includes('Payment Required')) {
                helpers.showToast('API quota exceeded. Please try again later! ⏰', 'warning');
                setRecipes([]);
            } else {
                helpers.showToast('Oops! Something went wrong: ' + error.message, 'danger');
                setRecipes([]);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleFavorite = async (recipeId) => {
        if (!currentUser) {
            helpers.showToast('Please login to save favorites! ❤️', 'warning');
            return;
        }

        try {
            const isFavorited = favorites.some(fav => 
                (fav.spoonacular_id || fav.id) === recipeId
            );

            if (isFavorited) {
                await apiService.removeFavorite(recipeId);
                setFavorites(prev => prev.filter(fav => 
                    (fav.spoonacular_id || fav.id) !== recipeId
                ));
                helpers.showToast('Removed from favorites 💔', 'success');
            } else {
                await apiService.addFavorite(recipeId);
                loadFavorites();
                helpers.showToast('Added to favorites! ❤️', 'success');
            }
        } catch (error) {
            throw error;
        }
    };

    const isFavorited = (recipeId) => {
        return favorites.some(fav => 
            (fav.spoonacular_id || fav.id) === recipeId
        );
    };

    // UI event handlers
    const navigate = useNavigate();
    const handleFilterChange = (newFilters) => {
        setSearchFilters(newFilters);
    };

    const handleSearch = (filters) => {
        setSearchFilters(filters);
        performSearch(filters);
        // No setCurrentView needed with React Router
    };

    const handleRecipeSelect = (recipe) => {
        let selected = recipe;
        // If it's a Spoonacular recipe, ensure id is prefixed and source is set
        if (recipe.spoonacular_id || recipe.source === 'spoonacular') {
            const spoonId = recipe.spoonacular_id || recipe.id;
            selected = {
                ...recipe,
                id: `spoonacular_${spoonId}`,
                source: 'spoonacular',
            };
        }
        setSelectedRecipe(selected);
        setShowRecipeDetail(true);
    };

    const handleHistorySelect = (searchParams) => {
        setSearchFilters(searchParams);
        performSearch(searchParams);
        // No setCurrentView needed with React Router
    };

    return (
        <>
            <div className="App">
                <ParticleBackground />
                {/* Navigation */}
                <nav className="navbar navbar-expand-lg">
                    <div className="container">
                        <Link className="navbar-brand clickable" to="/">
                            <i className="fas fa-utensils me-2"></i>
                            FoodMood
                        </Link>
                        <div className="navbar-nav ms-auto">
                            <Link className="nav-link btn btn-link" to="/">
                                <i className="fas fa-search me-2"></i>Search
                            </Link>
                            {currentUser && (
                                <>
                                    <Link className="nav-link btn btn-link" to="/favorites">
                                        <i className={`fas fa-heart me-2 ${favorites.length > 0 ? 'heart-animate' : ''}`}></i>
                                        Favorites ({favorites.length})
                                    </Link>
                                    <button className="nav-link btn btn-link" onClick={() => setShowHistory(true)}>
                                        <i className="fas fa-history me-2"></i>History
                                    </button>
                                    <Link className="nav-link btn btn-link" to="/add">
                                        <i className="fas fa-plus me-2"></i>Add Recipe
                                    </Link>
                                    <div className="nav-item dropdown">
                                        <button className="nav-link dropdown-toggle btn btn-link" data-bs-toggle="dropdown">
                                            <i className="fas fa-user me-2"></i>{currentUser.username}
                                        </button>
                                        <ul className="dropdown-menu glass">
                                            <li>
                                                <button className="dropdown-item clickable" onClick={handleLogout}>
                                                    <i className="fas fa-sign-out-alt me-2"></i>Logout
                                                </button>
                                            </li>
                                        </ul>
                                    </div>
                                </>
                            )}
                            {!currentUser && (
                                <button className="btn btn-outline-light" onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}>
                                    <i className="fas fa-sign-in-alt me-2"></i>Login
                                </button>
                            )}
                        </div>
                    </div>
                </nav>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={
                        <>
                            <section className="hero-section">
                                <div className="container">
                                    <div className="hero-content">
                                        <h1 className="hero-title">Discover Amazing Recipes ✨</h1>
                                        <p className="hero-subtitle">
                                            🍳 Find delicious recipes from around the world, adjust serving sizes, 
                                            and save your favorites! 🌟
                                        </p>
                                    </div>
                                </div>
                            </section>
                            <div className="container">
                                <RecipeFilter onFilterChange={handleFilterChange} onSearch={handleSearch} isLoading={isLoading} />
                                {isLoading && (
                                    <div className="loading">
                                        <div className="spinner-border mb-3"></div>
                                        <p>🔍 Searching for delicious recipes...</p>
                                    </div>
                                )}
                                {!isLoading && recipes.length > 0 && (
                                    <div className="recipe-grid">
                                        {recipes.map(recipe => (
                                            <div key={recipe.id || recipe.spoonacular_id} className="recipe-card">
                                                <RecipeCard
                                                    recipe={recipe}
                                                    onViewDetails={handleRecipeSelect}
                                                    onToggleFavorite={handleToggleFavorite}
                                                    isFavorited={isFavorited(recipe.spoonacular_id || recipe.id)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {!isLoading && recipes.length === 0 && (
                                    <div className="text-center py-5">
                                        <i className="fas fa-search fa-3x text-white mb-3"></i>
                                        <h4 className="text-white">Start Your Culinary Journey! 🚀</h4>
                                        <p className="text-white opacity-75">
                                            🥘 Use the search above to find recipes by ingredients, cuisine, or meal type.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </>
                    } />
                    <Route path="/favorites" element={
                        <div className="container">
                            <div className="text-center mb-4">
                                <h2>
                                    <i className="fas fa-heart text-danger me-2 heart-animate"></i>
                                    Your Favorite Recipes ❤️
                                </h2>
                                <p className="text-muted">
                                    {favorites.length === 0 ?
                                        '🍽️ No favorites yet. Start searching and save recipes you love!' :
                                        `🎉 You have ${favorites.length} favorite recipe${favorites.length !== 1 ? 's' : ''}`
                                    }
                                </p>
                            </div>
                            {isLoading && (
                                <div className="loading">
                                    <div className="spinner-border mb-3"></div>
                                    <p>🔍 Loading favorites...</p>
                                </div>
                            )}
                            {!isLoading && favorites.length > 0 && (
                                <div className="recipe-grid">
                                    {favorites.map(recipe => (
                                        <div key={recipe.id || recipe.spoonacular_id} className="recipe-card">
                                            <RecipeCard
                                                recipe={recipe}
                                                onViewDetails={handleRecipeSelect}
                                                onToggleFavorite={handleToggleFavorite}
                                                isFavorited={isFavorited(recipe.spoonacular_id || recipe.id)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                            {!isLoading && favorites.length === 0 && (
                                <div className="text-center py-5">
                                    <i className="fas fa-heart fa-3x text-white mb-3"></i>
                                    <h4 className="text-white">No Favorites Yet 💫</h4>
                                    <p className="text-white opacity-75">
                                        ✨ Start searching for recipes and click the heart icon to save your favorites.
                                    </p>
                                    <Link className="btn btn-primary clickable" to="/">
                                        <i className="fas fa-search me-2"></i>Search Recipes 🍳
                                    </Link>
                                </div>
                            )}
                        </div>
                    } />
                    <Route path="/add" element={
                        <AddRecipePage onRecipeAdded={() => { performSearch(); if (navigate) navigate('/'); }} />
                    } />
                </Routes>
                {/* Modals */}
                {showAuthModal && (
                    <AuthModal
                        mode={authMode}
                        isOpen={showAuthModal}
                        onClose={() => setShowAuthModal(false)}
                        onLogin={handleLogin}
                        onRegister={handleRegister}
                        onSwitchMode={(mode) => setAuthMode(mode)}
                    />
                )}
                <RecipeDetail
                    recipe={selectedRecipe}
                    isOpen={showRecipeDetail}
                    onClose={() => setShowRecipeDetail(false)}
                    currentUser={currentUser}
                    onEdit={handleRecipeEdit}
                    onDelete={handleRecipeDelete}
                />
                {showEditModal && (
                    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <div className="modal-dialog modal-lg">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h4 className="modal-title">Edit Recipe</h4>
                                    <button type="button" className="btn-close" onClick={() => { setShowEditModal(false); setEditRecipe(null); }}></button>
                                </div>
                                <div className="modal-body">
                                    <AddRecipeForm
                                        recipe={editRecipe}
                                        onRecipeUpdated={handleRecipeUpdated}
                                        onClose={() => { setShowEditModal(false); setEditRecipe(null); }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <UserHistory
                    isOpen={showHistory}
                    onClose={() => setShowHistory(false)}
                    onSelectSearch={handleHistorySelect}
                />
            </div>
            <footer style={{
                width: '100%',
                textAlign: 'center',
                marginTop: '3rem',
                padding: '1.5rem 0',
                background: 'rgba(0,0,0,0.15)',
                color: '#000000ff',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '1.1rem',
                letterSpacing: '0.04em',
                borderTop: '1.5px solid #0084ffff',
                boxShadow: '0 -2px 16px 0 #6366f133',
            }}>
                <span>
                    © {new Date().getFullYear()} | Made with ❤️ by <a href="https://github.com/KalpeshC28" target="_blank" rel="noopener noreferrer" style={{color: '#e5ff00ff', textDecoration: 'underline'}}>KalpeshC28</a>
                </span>
            </footer>
        </>
    );
}

// Enhanced Auth Modal Component
function AuthModal({ mode, isOpen, onClose, onLogin, onRegister, onSwitchMode }) {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const resetForm = () => {
        setFormData({
            username: '',
            email: '',
            password: '',
            confirmPassword: ''
        });
        setError('');
    };

    useEffect(() => {
        if (isOpen) {
            resetForm();
        }
    }, [isOpen, mode]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (mode === 'register') {
                if (formData.password !== formData.confirmPassword) {
                    throw new Error('Passwords do not match');
                }
                if (!helpers.isValidEmail(formData.email)) {
                    throw new Error('Please enter a valid email address');
                }
                await onRegister({
                    username: formData.username,
                    email: formData.email,
                    password: formData.password
                });
            } else {
                await onLogin({
                    username: formData.username,
                    password: formData.password
                });
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            {mode === 'login' ? '🔐 Welcome Back!' : '🎉 Join FoodMood!'}
                        </h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>
                    
                    <div className="modal-body">
                        {error && (
                            <div className="alert alert-danger">{error}</div>
                        )}
                        
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">👤 Username</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={formData.username}
                                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                                    required
                                    placeholder="Enter your username"
                                />
                            </div>
                            
                            {mode === 'register' && (
                                <div className="form-group">
                                    <label className="form-label">📧 Email</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        required
                                        placeholder="Enter your email"
                                    />
                                </div>
                            )}
                            
                            <div className="form-group">
                                <label className="form-label">🔒 Password</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    required
                                    placeholder="Enter your password"
                                />
                            </div>
                            
                            {mode === 'register' && (
                                <div className="form-group">
                                    <label className="form-label">🔒 Confirm Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                                        required
                                        placeholder="Confirm your password"
                                    />
                                </div>
                            )}
                            
                            <button 
                                type="submit" 
                                className="btn btn-primary w-100 clickable"
                                disabled={isLoading}
                            >
                                {isLoading && <span className="spinner-border spinner-border-sm me-2"></span>}
                                {mode === 'login' ? '🚀 Login' : '✨ Create Account'}
                            </button>
                        </form>
                        
                        <div className="text-center mt-3">
                            <button 
                                className="btn btn-link clickable"
                                onClick={() => onSwitchMode(mode === 'login' ? 'register' : 'login')}
                            >
                                {mode === 'login' ? 
                                    '🆕 Need an account? Sign up' : 
                                    '👋 Already have an account? Login'
                                }
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;