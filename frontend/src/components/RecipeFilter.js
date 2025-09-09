import React, { useState } from "react";
import * as helpers from "../utils/helpers";

function RecipeFilter({ onFilterChange, onSearch, isLoading = false }) {
    const [filters, setFilters] = useState({
        query: '',
        cuisine: '',
        meal_type: '',
        diet: '',
        max_results: 12
    });

    const handleInputChange = (field, value) => {
        const newFilters = { ...filters, [field]: value };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const handleSearch = (e) => {
        e.preventDefault();
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
                            <option value="italian">Italian</option>
                            <option value="mexican">Mexican</option>
                            <option value="asian">Asian</option>
                            <option value="american">American</option>
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
                            <option value="breakfast">Breakfast</option>
                            <option value="lunch">Lunch</option>
                            <option value="dinner">Dinner</option>
                            <option value="snack">Snack</option>
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
                            <option value="vegetarian">Vegetarian</option>
                            <option value="vegan">Vegan</option>
                            <option value="gluten-free">Gluten Free</option>
                            <option value="keto">Keto</option>
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
