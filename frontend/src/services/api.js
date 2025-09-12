const API_BASE_URL = 'https://foodwish.onrender.com';

// Helper function to get auth token
const getAuthToken = () => {
    const user = localStorage.getItem('foodwish_user');
    if (user) {
        const userData = JSON.parse(user);
        return userData.token;
    }
    return null;
};

// Helper function to make authenticated requests
const apiRequest = async (url, options = {}) => {
    const token = getAuthToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (token) {
        headers.Authorization = `Token ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.error || `HTTP ${response.status}`);
    }

    return response.json();
};

// Recipe API functions
export const searchRecipes = async (filters = {}) => {
    try {
        const params = new URLSearchParams();
        
        if (filters.query) params.append('search', filters.query);
        if (filters.category) params.append('category', filters.category);
        if (filters.cuisine) params.append('cuisine', filters.cuisine);
        if (filters.difficulty) params.append('difficulty', filters.difficulty);
        if (filters.prep_time_max) params.append('prep_time_max', filters.prep_time_max);
        if (filters.cook_time_max) params.append('cook_time_max', filters.cook_time_max);
        if (filters.diets) params.append('diets', filters.diets);
        
        const queryString = params.toString();
        const url = `/recipes/${queryString ? `?${queryString}` : ''}`;
        
        const data = await apiRequest(url);
        
        return {
            recipes: data.results || data,
            totalResults: data.count || data.length || 0,
            next: data.next,
            previous: data.previous
        };
    } catch (error) {
        console.error('Search error:', error);
        throw error;
    }
};

export const getRecipeDetail = async (recipeId) => {
    try {
        const recipe = await apiRequest(`/recipes/${recipeId}/`);
        return recipe;
    } catch (error) {
        console.error('Recipe detail error:', error);
        throw error;
    }
};

export const getRandomRecipes = async (count = 6) => {
    try {
        const data = await apiRequest(`/recipes/?ordering=?&limit=${count}`);
        return {
            recipes: data.results || data
        };
    } catch (error) {
        console.error('Random recipes error:', error);
        // Return sample recipes in case of error
        return { recipes: [] };
    }
};

export const createRecipe = async (recipeData) => {
    try {
        const recipe = await apiRequest('/recipes/', {
            method: 'POST',
            body: JSON.stringify(recipeData)
        });
        return recipe;
    } catch (error) {
        console.error('Create recipe error:', error);
        throw error;
    }
};

export const updateRecipe = async (recipeId, recipeData) => {
    try {
        const recipe = await apiRequest(`/recipes/${recipeId}/`, {
            method: 'PUT',
            body: JSON.stringify(recipeData)
        });
        return recipe;
    } catch (error) {
        console.error('Update recipe error:', error);
        throw error;
    }
};

export const deleteRecipe = async (recipeId) => {
    try {
        await apiRequest(`/recipes/${recipeId}/`, {
            method: 'DELETE'
        });
        return { success: true };
    } catch (error) {
        console.error('Delete recipe error:', error);
        throw error;
    }
};

// User authentication
export const login = async (credentials) => {
    try {
        const response = await fetch(`${API_BASE_URL.replace('/api', '')}/api/auth/login/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Login failed');
        }

        const data = await response.json();
        
        const userWithToken = {
            ...data.user,
            token: data.token
        };
        
        localStorage.setItem('foodwish_user', JSON.stringify(userWithToken));
        return { user: userWithToken, token: data.token };
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

export const register = async (userData) => {
    try {
        const response = await fetch(`${API_BASE_URL.replace('/api', '')}/api/auth/register/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Registration failed');
        }

        const data = await response.json();
        
        const userWithToken = {
            ...data.user,
            token: data.token
        };
        
        localStorage.setItem('foodwish_user', JSON.stringify(userWithToken));
        return { user: userWithToken, token: data.token };
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
};

export const logout = async () => {
    try {
        await apiRequest('/auth/logout/', {
            method: 'POST'
        });
    } catch (error) {
        console.error('Logout error:', error);
        // Continue with local logout even if API call fails
    }
    
    localStorage.removeItem('foodwish_user');
    localStorage.removeItem('foodwish_favorites');
    return { success: true };
};

export const getCurrentUser = async () => {
    const user = localStorage.getItem('foodwish_user');
    
    if (user) {
        try {
            // Verify token is still valid
            const profile = await apiRequest('/auth/profile/');
            return { user: JSON.parse(user) };
        } catch (error) {
            // Token is invalid, clear local storage
            localStorage.removeItem('foodwish_user');
            throw new Error('Session expired');
        }
    }
    
    throw new Error('No user logged in');
};

// Favorites
export const getFavorites = async () => {
    try {
        const data = await apiRequest('/favorites/');
        return { favorites: data.results || data };
    } catch (error) {
        console.error('Get favorites error:', error);
        throw error;
    }
};

export const addFavorite = async (recipeId) => {
    try {
        await apiRequest(`/recipes/${recipeId}/favorite/`, {
            method: 'POST'
        });
        return { success: true };
    } catch (error) {
        console.error('Add favorite error:', error);
        throw error;
    }
};

export const removeFavorite = async (recipeId) => {
    try {
        await apiRequest(`/recipes/${recipeId}/unfavorite/`, {
            method: 'DELETE'
        });
        return { success: true };
    } catch (error) {
        console.error('Remove favorite error:', error);
        throw error;
    }
};

// Recipe ratings and reviews
export const rateRecipe = async (recipeId, rating, comment = '') => {
    try {
        const response = await apiRequest(`/recipes/${recipeId}/rate/`, {
            method: 'POST',
            body: JSON.stringify({ score: rating, comment })
        });
        return { 
            success: true, 
            message: 'Thank you for rating this recipe!',
            rating: response
        };
    } catch (error) {
        console.error('Rate recipe error:', error);
        throw error;
    }
};

export const submitRating = async (recipeId, rating, comment) => {
    return await rateRecipe(recipeId, rating, comment);
};

export const getRecipeRatings = async (recipeId) => {
    try {
        const recipe = await getRecipeDetail(recipeId);
        return {
            ratings: recipe.ratings || [],
            averageRating: recipe.average_rating || 0,
            totalRatings: recipe.ratings ? recipe.ratings.length : 0
        };
    } catch (error) {
        console.error('Get ratings error:', error);
        return {
            ratings: [],
            averageRating: 0,
            totalRatings: 0
        };
    }
};

// Shopping list functionality
export const createShoppingList = async (recipeId, servings = null) => {
    try {
        await apiRequest(`/recipes/${recipeId}/add_to_shopping_list/`, {
            method: 'POST',
            body: JSON.stringify({ servings })
        });
        
        return { 
            success: true, 
            message: 'Ingredients added to shopping list!'
        };
    } catch (error) {
        console.error('Create shopping list error:', error);
        throw error;
    }
};

export const getShoppingLists = async () => {
    try {
        const data = await apiRequest('/shopping-list/');
        return { 
            shoppingLists: data.results || data
        };
    } catch (error) {
        console.error('Get shopping lists error:', error);
        throw error;
    }
};

export const deleteShoppingList = async (itemId) => {
    try {
        await apiRequest(`/shopping-list/${itemId}/`, {
            method: 'DELETE'
        });
        return { success: true };
    } catch (error) {
        console.error('Delete shopping list error:', error);
        throw error;
    }
};

export const toggleShoppingListItem = async (itemId) => {
    try {
        const response = await apiRequest(`/shopping-list/${itemId}/toggle_purchased/`, {
            method: 'PATCH'
        });
        return response;
    } catch (error) {
        console.error('Toggle shopping list item error:', error);
        throw error;
    }
};

// Utility functions for getting data from backend
export const getCategories = async () => {
    try {
        const data = await apiRequest('/categories/');
        return { categories: data };
    } catch (error) {
        console.error('Get categories error:', error);
        return { categories: [] };
    }
};

export const getCuisines = async () => {
    try {
        const data = await apiRequest('/cuisines/');
        return { cuisines: data };
    } catch (error) {
        console.error('Get cuisines error:', error);
        return { cuisines: [] };
    }
};

export const getDiets = async () => {
    try {
        const data = await apiRequest('/diets/');
        return { diets: data };
    } catch (error) {
        console.error('Get diets error:', error);
        return { diets: [] };
    }
};

// Get user's own recipes
export const getMyRecipes = async () => {
    try {
        const data = await apiRequest('/recipes/my_recipes/');
        return { recipes: data.results || data };
    } catch (error) {
        console.error('Get my recipes error:', error);
        throw error;
    }
};

// Legacy compatibility functions (in case other components still use these)
export const getRecipesByIngredients = async (ingredients, number = 12) => {
    // Convert to search query
    const query = Array.isArray(ingredients) ? ingredients.join(' ') : ingredients;
    return searchRecipes({ query, max_results: number });
};

export const getRecipeNutrition = async (recipeId) => {
    // Get nutrition info from recipe detail
    const recipe = await getRecipeDetail(recipeId);
    return {
        calories: recipe.calories_per_serving,
        // Add other nutrition info if available
    };
};

export const getSimilarRecipes = async (recipeId, number = 6) => {
    // For now, return recipes from same category
    const recipe = await getRecipeDetail(recipeId);
    return searchRecipes({ 
        category: recipe.category?.id, 
        max_results: number 
    });
};

export const getMealTypes = async () => {
    // Return categories as meal types
    const { categories } = await getCategories();
    return {
        mealTypes: categories.map(cat => cat.name.toLowerCase())
    };
};