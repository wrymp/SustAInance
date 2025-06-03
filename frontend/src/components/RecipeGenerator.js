import React, { useState, useEffect, useCallback } from 'react';
import { recipeAPI } from '../services/api';
import './RecipeGenerator.css';

const CATEGORIES = [
    'All',
    'Vegetables',
    'Meat & Fish',
    'Grains & Carbs',
    'Dairy',
    'Spices & Herbs',
    'Baking & Sweets',
    'Legumes & Nuts',
    'Fruits',
    'Others'
];

const DEFAULT_UNITS = ['g', 'kg', 'ml', 'l', 'cup', 'tbsp', 'tsp', 'piece', 'slice', 'clove'];

const RecipeGenerator = () => {
    const [allIngredients, setAllIngredients] = useState([]);
    const [filteredIngredients, setFilteredIngredients] = useState([]);
    const [selectedIngredients, setSelectedIngredients] = useState([]);
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [recipe, setRecipe] = useState('');
    const [loading, setLoading] = useState(false);

    const [customIngredient, setCustomIngredient] = useState({
        name: '',
        quantity: '',
        unit: 'piece'
    });

    useEffect(() => {
        loadIngredients();
    }, []);

    const filterIngredients = useCallback(() => {
        let filtered = allIngredients;

        if (activeCategory !== 'All') {
            filtered = filtered.filter(ing => ing.category === activeCategory);
        }

        if (searchTerm) {
            filtered = filtered.filter(ing =>
                ing.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredIngredients(filtered);
    }, [allIngredients, activeCategory, searchTerm]);

    useEffect(() => {
        filterIngredients();
    }, [filterIngredients]);

    const loadIngredients = async () => {
        try {
            const response = await recipeAPI.getIngredients();
            setAllIngredients(response.data);
        } catch (error) {
            console.error('Error loading ingredients:', error);
        }
    };

    const addIngredient = async (ingredient) => {
        try {
            setLoading(true);
            const response = await recipeAPI.addIngredient(ingredient);
            setSelectedIngredients(response.data);
        } catch (error) {
            console.error('Error adding ingredient:', error);
        } finally {
            setLoading(false);
        }
    };

    const removeIngredient = async (name) => {
        try {
            setLoading(true);
            const response = await recipeAPI.removeIngredient(name);
            setSelectedIngredients(response.data);
        } catch (error) {
            console.error('Error removing ingredient:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddCustom = () => {
        if (!customIngredient.name || !customIngredient.quantity) {
            alert('Please fill in name and quantity');
            return;
        }

        const ingredient = {
            name: customIngredient.name,
            quantity: parseFloat(customIngredient.quantity),
            unit: customIngredient.unit
        };

        addIngredient(ingredient);
        setCustomIngredient({ name: '', quantity: '', unit: 'piece' });
    };

    const generateRecipe = async () => {
        if (selectedIngredients.length === 0) {
            alert('Please select at least one ingredient');
            return;
        }

        try {
            setLoading(true);
            const response = await recipeAPI.generateRecipe();
            setRecipe(response.data);
        } catch (error) {
            console.error('Error generating recipe:', error);
        } finally {
            setLoading(false);
        }
    };

    // Helper function to check if ingredient is already selected
    const getSelectedIngredient = (ingredientName) => {
        return selectedIngredients.find(ing => ing.name.toLowerCase() === ingredientName.toLowerCase());
    };

    return (
        <div className="recipe-generator">
            <h1>Recipe Generator</h1>

            {/* Search and Add Custom */}
            <div className="top-controls">
                <div className="search-section">
                    <input
                        type="text"
                        placeholder="Search ingredients..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>

                <div className="custom-section">
                    <input
                        type="text"
                        placeholder="Ingredient name"
                        value={customIngredient.name}
                        onChange={(e) => setCustomIngredient({...customIngredient, name: e.target.value})}
                    />
                    <input
                        type="number"
                        placeholder="Amount"
                        value={customIngredient.quantity}
                        onChange={(e) => setCustomIngredient({...customIngredient, quantity: e.target.value})}
                    />
                    <select
                        value={customIngredient.unit}
                        onChange={(e) => setCustomIngredient({...customIngredient, unit: e.target.value})}
                    >
                        {DEFAULT_UNITS.map(unit => (
                            <option key={unit} value={unit}>{unit}</option>
                        ))}
                    </select>
                    <button onClick={handleAddCustom} disabled={loading}>
                        Add Custom
                    </button>
                </div>
            </div>

            {/* Categories */}
            <div className="categories">
                {CATEGORIES.map(category => (
                    <button
                        key={category}
                        className={`category-btn ${activeCategory === category ? 'active' : ''}`}
                        onClick={() => setActiveCategory(category)}
                    >
                        {category}
                    </button>
                ))}
            </div>

            {/* Available Ingredients */}
            <div className="ingredients-section">
                <h2>Available Ingredients</h2>
                <div className="ingredients-list">
                    {filteredIngredients.map((ingredient, index) => (
                        <IngredientItem
                            key={`${ingredient.name}-${index}`}
                            ingredient={ingredient}
                            selectedIngredient={getSelectedIngredient(ingredient.name)}
                            onAdd={addIngredient}
                            loading={loading}
                        />
                    ))}
                </div>
            </div>

            {/* Selected Ingredients */}
            <div className="selected-section">
                <h2>My Ingredients ({selectedIngredients.length})</h2>
                <div className="selected-list">
                    {selectedIngredients.map((ingredient, index) => (
                        <div key={`selected-${ingredient.name}-${index}`} className="selected-item">
                            <span>
                                {ingredient.quantity} {ingredient.unit} {ingredient.name}
                            </span>
                            <button
                                onClick={() => removeIngredient(ingredient.name)}
                                disabled={loading}
                                className="remove-btn"
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Generate Recipe Button */}
            <button
                className="generate-btn"
                onClick={generateRecipe}
                disabled={loading || selectedIngredients.length === 0}
            >
                {loading ? 'Generating...' : 'Generate Recipe'}
            </button>

            {/* Recipe Result */}
            {recipe && (
                <div className="recipe-result">
                    <h2>Your Recipe</h2>
                    <div className="recipe-content">
                        <pre>{recipe}</pre>
                    </div>
                </div>
            )}
        </div>
    );
};

// Updated Ingredient Item Component
const IngredientItem = ({ ingredient, selectedIngredient, onAdd, loading }) => {
    const [quantity, setQuantity] = useState(() => {
        return selectedIngredient ? selectedIngredient.quantity : 1;
    });
    const [unit, setUnit] = useState(() => {
        return selectedIngredient ? selectedIngredient.unit : (ingredient.unit || 'piece');
    });

    // Update local state when selectedIngredient changes
    useEffect(() => {
        if (selectedIngredient) {
            setQuantity(selectedIngredient.quantity);
            setUnit(selectedIngredient.unit);
        }
    }, [selectedIngredient]);

    const handleAddOrEdit = () => {
        if (quantity <= 0) {
            alert('Please enter a valid quantity');
            return;
        }

        onAdd({
            name: ingredient.name,
            quantity: parseFloat(quantity),
            unit: unit
        });
    };

    // Use ingredient-specific units or fallback to default units
    const availableUnits = ingredient.availableUnits && ingredient.availableUnits.length > 0
        ? ingredient.availableUnits
        : DEFAULT_UNITS;

    const isSelected = !!selectedIngredient;

    return (
        <div className={`ingredient-item ${isSelected ? 'selected' : ''}`}>
            <span className="ingredient-name">
                {ingredient.name}
                {isSelected && <span className="selected-indicator"> ✓</span>}
            </span>
            <input
                type="number"
                min="0"
                step="0.1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="quantity-input"
            />
            <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="unit-select"
            >
                {availableUnits.map(unitOption => (
                    <option key={unitOption} value={unitOption}>{unitOption}</option>
                ))}
            </select>
            <button
                onClick={handleAddOrEdit}
                disabled={loading}
                className={isSelected ? 'edit-btn' : 'add-btn'}
            >
                {isSelected ? 'Update' : 'Add'}
            </button>
        </div>
    );
};

export default RecipeGenerator;