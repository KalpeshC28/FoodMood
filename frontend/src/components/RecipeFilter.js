import React, { useState, useEffect } from "react";
import { addSearchToHistory } from "../utils/helpers";
import { getCuisines, getDiets, getMealTypes } from "../services/api";


function RecipeFilter({ onFilterChange, onSearch, isLoading = false }) {
    const [filters, setFilters] = useState({
        query: '',
        cuisine: '', // will store cuisine ID
        meal_type: '',
        diet: '',    // will store diet ID
        max_results: 12
    });
    const [cuisines, setCuisines] = useState([]);
    const [diets, setDiets] = useState([]);
    const [mealTypes, setMealTypes] = useState([]);

    useEffect(() => {
        async function fetchOptions() {
            try {
                const { cuisines } = await getCuisines();
                setCuisines(cuisines);
            } catch (e) { setCuisines([]); }
            try {
                const { diets } = await getDiets();
                setDiets(diets);
            } catch (e) { setDiets([]); }
            try {
                const { mealTypes } = await getMealTypes();
                setMealTypes(mealTypes);
            } catch (e) { setMealTypes([]); }
        }
        fetchOptions();
    }, []);

    const handleInputChange = (field, value) => {
        const newFilters = { ...filters, [field]: value };
        setFilters(newFilters);
        // For cuisine and diet, ensure we send the ID (not name)
        let filtersToSend = { ...newFilters };
        if (field === 'cuisine' && value) {
            const selected = cuisines.find(c => String(c.id) === String(value));
            filtersToSend.cuisine = selected ? selected.id : '';
        }
        if (field === 'diet' && value) {
            const selected = diets.find(d => String(d.id) === String(value));
            filtersToSend.diet = selected ? selected.id : '';
        }
        onFilterChange(filtersToSend);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (filters.query && filters.query.trim() !== "") {
            addSearchToHistory(filters.query);
        }
        onSearch(filters);
    };

    const clearFilters = () => {
        const clearedFilters = {
            query: '',
            cuisine: '',
            meal_type: '',
            diet: '',
            max_results: 12
        };
        setFilters(clearedFilters);
        onFilterChange(clearedFilters);
    };

    return (
        <div className="search-section mb-4">
            <div className="text-center mb-4">
                <h2>Discover Amazing Recipes</h2>
                <p className="text-secondary">Search for recipes with intelligent filters</p>
            </div>
            
            <form onSubmit={handleSearch}>
                <div className="row mb-3">
                    <div className="col-12">
                        <div className="position-relative">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search for recipes, ingredients, or cuisines..."
                                value={filters.query}
                                onChange={(e) => handleInputChange('query', e.target.value)}
                                style={{ paddingRight: '100px' }}
                            />
                            <button 
                                type="submit" 
                                className="btn btn-primary position-absolute"
                                disabled={isLoading}
                                style={{
                                    right: '10px',
                                    top: '50%',
                                    transform: 'translateY(-50%)'
                                }}
                            >
                                {isLoading ? 'Searching...' : 'Search'}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-4 mb-3">
                        <label className="form-label">Cuisine</label>
                        <select
                            className="form-select"
                            value={filters.cuisine}
                            onChange={(e) => handleInputChange('cuisine', e.target.value)}
                        >
                            <option value="">All Cuisines</option>
                            {cuisines.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="col-md-4 mb-3">
                        <label className="form-label">Meal Type</label>
                        <select
                            className="form-select"
                            value={filters.meal_type}
                            onChange={(e) => handleInputChange('meal_type', e.target.value)}
                        >
                            <option value="">All Meal Types</option>
                            {mealTypes.map((m) => (
                                <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>
                            ))}
                        </select>
                    </div>

                    <div className="col-md-4 mb-3">
                        <label className="form-label">Diet</label>
                        <select
                            className="form-select"
                            value={filters.diet}
                            onChange={(e) => handleInputChange('diet', e.target.value)}
                        >
                            <option value="">All Diets</option>
                            {diets.map((d) => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="row">
                    <div className="col-12">
                        <button 
                            type="button" 
                            className="btn btn-outline-secondary me-2"
                            onClick={clearFilters}
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default RecipeFilter;
