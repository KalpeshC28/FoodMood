// Add a search query to localStorage-based search history
export function addSearchToHistory(query) {
    const stored = localStorage.getItem('search_history');
    let arr = [];
    if (stored) {
        try {
            arr = JSON.parse(stored);
        } catch (e) { arr = []; }
    }
    const newItem = {
        id: Date.now(),
        query,
        created_at: new Date().toISOString()
    };
    // Remove duplicates (keep most recent)
    arr = arr.filter(item => item.query !== query);
    arr.unshift(newItem);
    // Limit to 20
    arr = arr.slice(0, 20);
    localStorage.setItem('search_history', JSON.stringify(arr));
}
// Helpers with all required functions
export function showToast(msg, type) { 
    console.log(`${type}: ${msg}`); 
    // You can replace this with actual toast implementation
}

export function isValidEmail(email) { 
    return /.+@.+\..+/.test(email); 
}

export function getPlaceholderImage() {
    return 'https://via.placeholder.com/300x200?text=No+Image';
}

export function capitalize(str) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : '';
}

export function formatCookingTime(minutes) {
    if (!minutes) return 'Unknown';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
}

export function getDifficultyClass(difficulty) {
    switch(difficulty?.toLowerCase()) {
        case 'easy': return 'badge-success';
        case 'medium': return 'badge-warning';
        case 'hard': return 'badge-danger';
        default: return 'badge-secondary';
    }
}

export function truncateText(text, length) {
    if (!text) return '';
    const cleanText = text.replace(/<[^>]*>/g, ''); // Remove HTML tags
    return cleanText.length > length ? cleanText.substring(0, length) + '...' : cleanText;
}

export function formatServings(servings) {
    return servings ? `${servings} ${servings === 1 ? 'serving' : 'servings'}` : 'Unknown';
}

export function getCuisineFlag(cuisine) {
    const flags = {
        'italian': '🇮🇹',
        'mexican': '🇲🇽',
        'chinese': '🇨🇳',
        'indian': '🇮🇳',
        'french': '🇫🇷',
        'japanese': '🇯🇵',
        'american': '🇺🇸',
        'thai': '🇹🇭'
    };
    return flags[cuisine?.toLowerCase()] || '🌍';
}

export function cleanHtml(html) {
    return html ? html.replace(/<[^>]*>/g, '') : '';
}

export function formatDate(date) {
    return new Date(date).toLocaleDateString();
}

export function formatDateTime(date) {
    return new Date(date).toLocaleString();
}

export function parseIngredients(ingredients) {
    if (!ingredients || !Array.isArray(ingredients)) return [];
    return ingredients.map(ing => ({
        name: ing.name || ing.original || '',
        amount: ing.amount || ing.measures?.metric?.amount || '',
        unit: ing.unit || ing.measures?.metric?.unitShort || ''
    }));
}

export function parseNutrition(nutrition) {
    if (!nutrition || !Array.isArray(nutrition)) return {};
    const result = {};
    nutrition.forEach(item => {
        switch(item.name?.toLowerCase()) {
            case 'calories':
                result.calories = item.amount;
                break;
            case 'protein':
                result.protein = item.amount;
                break;
            case 'carbohydrates':
                result.carbs = item.amount;
                break;
            case 'fat':
                result.fat = item.amount;
                break;
        }
    });
    return result;
}

export function formatNutrition(value, unit = '') {
    if (!value) return 'N/A';
    return `${Math.round(value)}${unit}`;
}
