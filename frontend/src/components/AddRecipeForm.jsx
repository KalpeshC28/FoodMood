// filepath: frontend/src/components/AddRecipeForm.jsx
import React, { useState, useEffect } from 'react';


import { createRecipe } from '../services/api';

const AddRecipeForm = ({ onRecipeAdded }) => {
    // Utility to ensure value is always an array of numbers
    function toNumberArray(val) {
        if (Array.isArray(val)) return val.map(Number).filter(v => !isNaN(v));
        if (val === undefined || val === null || val === '') return [];
        return [Number(val)].filter(v => !isNaN(v));
    }
    // Utility to ensure value is always an array
    function ensureArray(val) {
        if (Array.isArray(val)) return val;
        if (val === undefined || val === null) return [];
        return [val];
    }
    // Ingredient handlers
    const handleIngredientChange = (idx, e) => {
        const { name, value } = e.target;
        const newIngredients = [...ingredients];
        newIngredients[idx][name] = value;
        setIngredients(newIngredients);
    };
    const addIngredient = () => {
        setIngredients([...ingredients, { name: '', quantity: '', unit: '' }]);
    };
    const removeIngredient = (idx) => {
        if (ingredients.length === 1) return;
        setIngredients(ingredients.filter((_, i) => i !== idx));
    };

    // Instruction handlers
    const handleInstructionChange = (idx, e) => {
        const { value } = e.target;
        const newInstructions = [...instructions];
        newInstructions[idx].text = value;
        setInstructions(newInstructions);
    };
    const addInstruction = () => {
        setInstructions([...instructions, { step_number: instructions.length + 1, text: '' }]);
    };
    const removeInstruction = (idx) => {
        if (instructions.length === 1) return;
        setInstructions(instructions.filter((_, i) => i !== idx).map((ins, i) => ({ ...ins, step_number: i + 1 })));
    };
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '', // category ID
        cuisine: '', // cuisine ID
        diets: [], // array of diet IDs
        prep_time: '',
        cook_time: '',
        servings: '',
        difficulty: 'medium',
        calories_per_serving: '',
        image: null,
    });
    const [ingredients, setIngredients] = useState([
        { name: '', quantity: '', unit: '' }
    ]);
    const [instructions, setInstructions] = useState([
        { step_number: 1, text: '' }
    ]);
    const [categories, setCategories] = useState([]);
    const [cuisines, setCuisines] = useState([]);
    const [diets, setDiets] = useState([]);
    // Fetch categories on mount
    useEffect(() => {
        fetch('http://localhost:8000/api/categories/')
            .then(res => res.json())
            .then(data => setCategories(data));
        fetch('http://localhost:8000/api/cuisines/')
            .then(res => res.json())
            .then(data => setCuisines(data));
        fetch('http://localhost:8000/api/diets/')
            .then(res => res.json())
            .then(data => setDiets(data));
    }, []);
    const [error, setError] = useState(null);
    const [addedRecipes, setAddedRecipes] = useState([]);

    const handleChange = (e) => {
        const { name, value, files, options } = e.target;
        if (name === 'image') {
            setFormData({ ...formData, image: files[0] });
        } else if (name === 'diets') {
            // Multi-select, always array of strings
            const selected = Array.from(options).filter(o => o.selected).map(o => o.value);
            setFormData({ ...formData, diets: selected.length ? selected : [] });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // Validation for required fields
        if (!formData.title.trim()) {
            setError('Title is required.');
            return;
        }
        if (!formData.description.trim()) {
            setError('Description is required.');
            return;
        }
        if (!formData.category) {
            setError('Category is required.');
            return;
        }
        if (!formData.cuisine) {
            setError('Cuisine is required.');
            return;
        }
        if (!formData.prep_time) {
            setError('Prep time is required.');
            return;
        }
        if (!formData.cook_time) {
            setError('Cook time is required.');
            return;
        }
        if (!formData.servings) {
            setError('Servings is required.');
            return;
        }

        // Remove blank ingredient rows
        const filteredIngredients = ingredients.filter(ing => ing.name.trim() && ing.quantity.trim());
        if (filteredIngredients.length === 0) {
            setError('Please add at least one ingredient with name and quantity.');
            return;
        }
        // Remove blank instruction rows
        const filteredInstructions = instructions.filter(ins => ins.text.trim());
        if (filteredInstructions.length === 0) {
            setError('Please add at least one instruction.');
            return;
        }

        // Build JSON object for backend
        let dietIdsArr = toNumberArray(formData.diets);
        if (!Array.isArray(dietIdsArr)) dietIdsArr = [dietIdsArr];
        let ingredientsArr = filteredIngredients.map(ing => ({
            name: ing.name,
            quantity: ing.quantity,
            unit: ing.unit || '',
        }));
        if (!Array.isArray(ingredientsArr)) ingredientsArr = [ingredientsArr];
        let instructionsArr = filteredInstructions.map((ins, idx) => ({
            text: ins.text,
            step_number: idx + 1,
        }));
        if (!Array.isArray(instructionsArr)) instructionsArr = [instructionsArr];

        const recipeData = {
            title: formData.title,
            description: formData.description,
            category: Number(formData.category),
            cuisine: Number(formData.cuisine),
            prep_time: Number(formData.prep_time),
            cook_time: Number(formData.cook_time),
            servings: Number(formData.servings),
            difficulty: formData.difficulty,
            calories_per_serving: formData.calories_per_serving ? Number(formData.calories_per_serving) : null,
            diet_ids: dietIdsArr,
            ingredients: ingredientsArr,
            instructions: instructionsArr,
        };

        // Final safety: force arrays for backend
        if (!Array.isArray(recipeData.diet_ids)) recipeData.diet_ids = [recipeData.diet_ids].filter(v => v !== undefined && v !== null);
        if (!Array.isArray(recipeData.ingredients)) recipeData.ingredients = [recipeData.ingredients];
        if (!Array.isArray(recipeData.instructions)) recipeData.instructions = [recipeData.instructions];

    // Ensure diet_ids is always an array of numbers
    let dietIdsArrForForm = recipeData.diet_ids;
    if (!Array.isArray(dietIdsArrForForm)) dietIdsArrForForm = [dietIdsArrForForm];
    dietIdsArrForForm = dietIdsArrForForm.map(x => Number(x)).filter(x => !isNaN(x));
    recipeData.diet_ids = dietIdsArrForForm;

        // Debug log for recipeData
        console.log('Submitting recipeData:', recipeData);

        try {
            const user = localStorage.getItem('foodmood_user');
            const token = user ? JSON.parse(user).token : null;
            const response = await fetch('http://localhost:8000/api/recipes/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: token ? `Token ${token}` : undefined,
                },
                body: JSON.stringify(recipeData),
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(JSON.stringify(errData));
            }
            const newRecipeObj = await response.json();
            setAddedRecipes(prev => [newRecipeObj, ...prev]);
            onRecipeAdded && onRecipeAdded(newRecipeObj);
        } catch (err) {
            let backendError = err;
            if (err.response && err.response.data) {
                backendError = err.response.data;
            } else if (err.message) {
                backendError = err.message;
            }
            console.error('Recipe creation error:', backendError);
            setError(typeof backendError === 'object' ? JSON.stringify(backendError, null, 2) : backendError);
        }
    };

    return (
        <>
    <form onSubmit={handleSubmit} className="add-recipe-form">
        <h2>Add Your Recipe</h2>
        {error && <p className="error">{error}</p>}
        <div>
            <label>Title</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} required />
        </div>
        <div>
            <label>Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} required />
        </div>
        <div>
            <label>Category</label>
            <select name="category" value={formData.category} onChange={handleChange} required>
                <option value="">Select category</option>
                {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
            </select>
        </div>
        <div>
            <label>Cuisine</label>
            <select name="cuisine" value={formData.cuisine} onChange={handleChange} required>
                <option value="">Select cuisine</option>
                {cuisines.map(cui => (
                    <option key={cui.id} value={cui.id}>{cui.name}</option>
                ))}
            </select>
        </div>
        <div>
            <label>Diets</label>
            <select name="diets" value={formData.diets} onChange={handleChange} multiple>
                {diets.map(diet => (
                    <option key={diet.id} value={diet.id}>{diet.name}</option>
                ))}
            </select>
        </div>
        <div>
            <label>Difficulty</label>
            <select name="difficulty" value={formData.difficulty} onChange={handleChange} required>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
            </select>
        </div>
        <div>
            <label>Calories per Serving</label>
            <input type="number" name="calories_per_serving" value={formData.calories_per_serving} onChange={handleChange} />
        </div>
        <div>
            <label>Ingredients</label>
            {ingredients.map((ing, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: 4 }}>
                    <input type="text" name="name" placeholder="Name" value={ing.name} onChange={e => handleIngredientChange(idx, e)} required />
                    <input type="text" name="quantity" placeholder="Quantity" value={ing.quantity} onChange={e => handleIngredientChange(idx, e)} required />
                    <input type="text" name="unit" placeholder="Unit" value={ing.unit} onChange={e => handleIngredientChange(idx, e)} />
                    <button type="button" onClick={() => removeIngredient(idx)} disabled={ingredients.length === 1}>-</button>
                    {idx === ingredients.length - 1 && <button type="button" onClick={addIngredient}>+</button>}
                </div>
            ))}
        </div>
        <div>
            <label>Instructions</label>
            {instructions.map((ins, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: 4 }}>
                    <span>Step {idx + 1}</span>
                    <input type="text" placeholder="Instruction" value={ins.text} onChange={e => handleInstructionChange(idx, e)} required />
                    <button type="button" onClick={() => removeInstruction(idx)} disabled={instructions.length === 1}>-</button>
                    {idx === instructions.length - 1 && <button type="button" onClick={addInstruction}>+</button>}
                </div>
            ))}
        </div>
        <div>
            <label>Prep Time (minutes)</label>
            <input type="number" name="prep_time" value={formData.prep_time} onChange={handleChange} required />
        </div>
        <div>
            <label>Cook Time (minutes)</label>
            <input type="number" name="cook_time" value={formData.cook_time} onChange={handleChange} required />
        </div>
        <div>
            <label>Servings</label>
            <input type="number" name="servings" value={formData.servings} onChange={handleChange} required />
        </div>
        <div>
            <label>Image</label>
            <input type="file" name="image" accept="image/*" onChange={handleChange} />
        </div>
        <button type="submit">Add Recipe</button>
    </form>
        {addedRecipes.length > 0 && (
            <div className="added-recipes-list" style={{marginTop: '2rem'}}>
                <h3>Recipes Added This Session</h3>
                {addedRecipes.map((recipe, idx) => (
                    <div key={recipe.id || idx} className="new-recipe-preview" style={{marginBottom: '2rem', border: '1px solid #ccc', padding: '1rem', borderRadius: '8px'}}>
                        {recipe.image && <img src={recipe.image} alt={recipe.title} style={{maxWidth: '200px', marginBottom: '1rem'}} />}
                        <h4>{recipe.title}</h4>
                        <p>{recipe.description}</p>
                        <strong>Ingredients:</strong>
                        <ul>
                            {recipe.ingredients && recipe.ingredients.map((ing, i) => (
                                <li key={i}>{ing.name}</li>
                            ))}
                        </ul>
                        <strong>Instructions:</strong>
                        <ol>
                            {recipe.instructions && recipe.instructions.map((ins, i) => (
                                <li key={i}>{ins.text}</li>
                            ))}
                        </ol>
                        <div>Prep Time: {recipe.prep_time} min</div>
                        <div>Cook Time: {recipe.cook_time} min</div>
                        <div>Servings: {recipe.servings}</div>
                    </div>
                ))}
            </div>
        )}
        </>
    );
};

export default AddRecipeForm;