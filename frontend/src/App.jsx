import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import RecipeCard from "./components/RecipeCard";
import RecipeDetail from "./components/RecipeDetail";
import RecipeFilter from "./components/RecipeFilter";
import UserHistory from "./components/UserHistory";
import * as apiService from "./services/api";
import * as helpers from "./utils/helpers";
import AddRecipePage from "./AddRecipePage";
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
    const [currentView, setCurrentView] = useState('search');
    // Add a view for adding recipes
    const handleShowAddRecipe = () => setCurrentView('add-recipe');
    const [searchFilters, setSearchFilters] = useState({
        query: '',
        cuisine: '',
        meal_type: '',
        diet: '',
        max_results: 12
    });

    // Initialize app
    useEffect(() => {
        initializeApp();
    }, []);

    const initializeApp = async () => {
        try {
            const response = await apiService.getCurrentUser();
            if (response.user) {
                setCurrentUser(response.user);
                loadFavorites();
            }
        } catch (error) {
            console.log('User not authenticated');
        }
        
        // Load initial recipes
        performSearch();
    };

    const loadFavorites = async () => {
        try {
            const response = await apiService.getFavorites();
            // If favorites are Favorite objects, extract the recipe field
            const favs = (response.favorites || []).map(fav => fav.recipe ? fav.recipe : fav);
            setFavorites(favs);
        } catch (error) {
            console.error('Error loading favorites:', error);
        }
    };

    // Authentication functions
    const handleLogin = async (credentials) => {
        try {
            const response = await apiService.login(credentials);
            setCurrentUser(response.user);
            setShowAuthModal(false);
            helpers.showToast('Welcome back! 🎉', 'success');
            loadFavorites();
        } catch (error) {
            throw error;
        }
    };

    const handleRegister = async (userData) => {
        try {
            const response = await apiService.register(userData);
            setCurrentUser(response.user);
            setShowAuthModal(false);
            helpers.showToast('Welcome to FoodMood! 🍳', 'success');
            loadFavorites();
        } catch (error) {
            throw error;
        }
    };

    const handleLogout = async () => {
        try {
            await apiService.logout();
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
    const handleFilterChange = (newFilters) => {
        setSearchFilters(newFilters);
    };

    const handleSearch = (filters) => {
        setSearchFilters(filters);
        performSearch(filters);
        setCurrentView('search');
    };

    const handleRecipeSelect = (recipe) => {
        setSelectedRecipe(recipe);
        setShowRecipeDetail(true);
    };

    const handleHistorySelect = (searchParams) => {
        setSearchFilters(searchParams);
        performSearch(searchParams);
        setCurrentView('search');
    };

    const displayedRecipes = currentView === 'favorites' ? favorites : recipes;

    return (
        <>
            <div className="App">
                <ParticleBackground />
                
                {/* Navigation */}
                <nav className="navbar navbar-expand-lg">
                    <div className="container">
                        <a className="navbar-brand clickable" href="#">
                            <i className="fas fa-utensils me-2"></i>
                            FoodMood
                        </a>
                        
                        <div className="navbar-nav ms-auto">
                            <button 
                                className={`nav-link btn btn-link ${currentView === 'search' ? 'active' : ''}`}
                                onClick={() => setCurrentView('search')}
                            >
                                <i className="fas fa-search me-2"></i>Search
                            </button>
                            
                            {currentUser && (
                                <>
                                    <button 
                                        className={`nav-link btn btn-link ${currentView === 'favorites' ? 'active' : ''}`}
                                        onClick={() => setCurrentView('favorites')}
                                    >
                                        <i className={`fas fa-heart me-2 ${favorites.length > 0 ? 'heart-animate' : ''}`}></i>
                                        Favorites ({favorites.length})
                                    </button>
                                    <button 
                                        className="nav-link btn btn-link"
                                        onClick={() => setShowHistory(true)}
                                    >
                                        <i className="fas fa-history me-2"></i>History
                                    </button>
                                    <button 
                                        className={`nav-link btn btn-link ${currentView === 'add-recipe' ? 'active' : ''}`}
                                        onClick={handleShowAddRecipe}
                                    >
                                        <i className="fas fa-plus me-2"></i>Add Recipe
                                    </button>
                                    <div className="nav-item dropdown">
                                        <button 
                                            className="nav-link dropdown-toggle btn btn-link" 
                                            data-bs-toggle="dropdown"
                                        >
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
                                <button 
                                    className="btn btn-outline-light"
                                    onClick={() => {
                                        setAuthMode('login');
                                        setShowAuthModal(true);
                                    }}
                                >
                                    <i className="fas fa-sign-in-alt me-2"></i>Login
                                </button>
                            )}
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                {currentView === 'search' && (
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
                )}

                {/* Main Content */}
                <div className="container">
                    {currentView === 'add-recipe' && (
                        <AddRecipePage />
                    )}
                    {currentView === 'search' && (
                        <>
                            <RecipeFilter 
                                onFilterChange={handleFilterChange}
                                onSearch={handleSearch}
                                isLoading={isLoading}
                            />
                        </>
                    )}

                    {currentView === 'favorites' && (
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
                    )}

                    {/* Loading State */}
                    {isLoading && (
                        <div className="loading">
                            <div className="spinner-border mb-3"></div>
                            <p>🔍 Searching for delicious recipes...</p>
                        </div>
                    )}

                    {/* Recipe Grid */}
                    {!isLoading && displayedRecipes.length > 0 && (
                        <div className="recipe-grid">
                            {displayedRecipes.map(recipe => (
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

                    {/* Empty State */}
                    {!isLoading && displayedRecipes.length === 0 && currentView === 'search' && (
                        <div className="text-center py-5">
                            <i className="fas fa-search fa-3x text-white mb-3"></i>
                            <h4 className="text-white">Start Your Culinary Journey! 🚀</h4>
                            <p className="text-white opacity-75">
                                🥘 Use the search above to find recipes by ingredients, cuisine, or meal type.
                            </p>
                        </div>
                    )}

                    {!isLoading && favorites.length === 0 && currentView === 'favorites' && (
                        <div className="text-center py-5">
                            <i className="fas fa-heart fa-3x text-white mb-3"></i>
                            <h4 className="text-white">No Favorites Yet 💫</h4>
                            <p className="text-white opacity-75">
                                ✨ Start searching for recipes and click the heart icon to save your favorites.
                            </p>
                            <button 
                                className="btn btn-primary clickable"
                                onClick={() => setCurrentView('search')}
                            >
                                <i className="fas fa-search me-2"></i>Search Recipes 🍳
                            </button>
                        </div>
                    )}
                </div>

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
                />

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
                color: '#fff',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '1.1rem',
                letterSpacing: '0.04em',
                borderTop: '1.5px solid #6366f1',
                boxShadow: '0 -2px 16px 0 #6366f133',
            }}>
                <span>
                    © {new Date().getFullYear()} | Made with ❤️ by <a href="https://github.com/KalpeshC28" target="_blank" rel="noopener noreferrer" style={{color: '#00d4ff', textDecoration: 'underline'}}>KalpeshC28</a>
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