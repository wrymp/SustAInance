import React, { useState, useContext } from 'react';
import AddIngredientModal from "./modals/AddIngredientModal";
import PantrySelectionModal from "./modals/PantrySelectionModal";
import { AuthContext } from '../../../contexts/AuthContext';
import './IngredientsStep.css';

const IngredientsStep = ({
                             ingredients,
                             setIngredients,
                             onNext,
                             hasPrefilledIngredients
                         }) => {
    const [showModal, setShowModal] = useState(false);
    const [showPantryModal, setShowPantryModal] = useState(false);
    const [pantryItems, setPantryItems] = useState([]);
    const [loadingPantry, setLoadingPantry] = useState(false);
    const [pantryError, setPantryError] = useState('');

    const { isAuthenticated } = useContext(AuthContext);

    const removeIngredient = (id) => {
        setIngredients(ingredients.filter(ing => ing.id !== id));
    };

    const updateIngredient = (id, field, value) => {
        setIngredients(ingredients.map(ing =>
            ing.id === id ? { ...ing, [field]: value } : ing
        ));
    };

    const handleAddIngredients = (newIngredients) => {
        setIngredients(prev => [...prev, ...newIngredients]);
    };

    // Fetch pantry items
    const fetchPantryItems = async () => {
        if (!isAuthenticated) {
            setPantryError('Please log in to access your pantry');
            return;
        }

        setLoadingPantry(true);
        setPantryError('');

        try {
            const response = await fetch('http://localhost:9097/api/pantry/usersPantry', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            });

            if (response.ok) {
                const items = await response.json();
                setPantryItems(items);
                setShowPantryModal(true);
            } else {
                const errorText = await response.text();
                setPantryError(`Failed to fetch pantry: ${response.status} - ${errorText}`);
            }
        } catch (err) {
            console.error('Pantry fetch error:', err);
            setPantryError(`Network error: ${err.message}`);
        } finally {
            setLoadingPantry(false);
        }
    };

    // Convert pantry items to ingredient format and add to current ingredients
    const handleAddFromPantry = (selectedPantryItems) => {
        const newIngredients = selectedPantryItems.map(pantryItem => ({
            id: `pantry-${pantryItem.id}-${Date.now()}`, // Unique ID for ingredient
            name: pantryItem.ingredientName,
            quantity: pantryItem.count.toString(),
            unit: pantryItem.unit,
            isFromPantry: true,
            pantryId: pantryItem.id,
            availableUnits: [
                pantryItem.unit,
                'grams', 'cups', 'pieces', 'tablespoons', 'teaspoons', 'ml', 'kg', 'lbs', 'oz'
            ].filter((unit, index, arr) => arr.indexOf(unit) === index) // Remove duplicates
        }));

        // Filter out ingredients that are already added
        const existingNames = ingredients.map(ing => ing.name.toLowerCase());
        const filteredNewIngredients = newIngredients.filter(
            newIng => !existingNames.includes(newIng.name.toLowerCase())
        );

        if (filteredNewIngredients.length < newIngredients.length) {
            // Some ingredients were already present
            const skippedCount = newIngredients.length - filteredNewIngredients.length;
            console.log(`Skipped ${skippedCount} ingredients that were already added`);
        }

        setIngredients(prev => [...prev, ...filteredNewIngredients]);
        setShowPantryModal(false);
    };

    const canProceed = ingredients.length > 0;

    return (
        <div className="step-container">
            <h2 className="step-title">
                {hasPrefilledIngredients ? "Perfect! Let's review your ingredients" : "What ingredients do you have?"}
            </h2>
            <p className="step-subtitle">
                {hasPrefilledIngredients
                    ? "Feel free to add more ingredients or adjust quantities"
                    : "Add the ingredients you'd like to cook with today"
                }
            </p>

            {/* Error Display */}
            {pantryError && (
                <div className="ingredients-step__error">
                    <span className="ingredients-step__error-icon">⚠️</span>
                    <span className="ingredients-step__error-text">{pantryError}</span>
                    <button
                        onClick={() => setPantryError('')}
                        className="ingredients-step__error-close"
                    >
                        ×
                    </button>
                </div>
            )}

            {/* Current Ingredients */}
            {ingredients.length > 0 && (
                <div className="current-ingredients">
                    <h3 className="current-ingredients__title">Your Ingredients ({ingredients.length})</h3>
                    <div className="ingredients__grid">
                        {ingredients.map((ingredient) => (
                            <div key={ingredient.id} className="ingredients__card">
                                <div className="ingredients__card-main">
                                    <span className="ingredients__card-name">{ingredient.name}</span>
                                    <div className="ingredients__card-badges">
                                        {ingredient.isCustom && (
                                            <span className="ingredients__custom-badge">Custom</span>
                                        )}
                                        {ingredient.isFromPantry && (
                                            <span className="ingredients__pantry-badge">From Pantry</span>
                                        )}
                                    </div>
                                    <button
                                        className="ingredients__remove-btn"
                                        onClick={() => removeIngredient(ingredient.id)}
                                        title="Remove ingredient"
                                    >
                                        ×
                                    </button>
                                </div>

                                <div className="ingredients__card-details">
                                    <input
                                        type="text"
                                        placeholder="Quantity"
                                        value={ingredient.quantity}
                                        onChange={(e) => updateIngredient(ingredient.id, 'quantity', e.target.value)}
                                        className="ingredients__quantity-input"
                                    />
                                    <select
                                        value={ingredient.unit}
                                        onChange={(e) => updateIngredient(ingredient.id, 'unit', e.target.value)}
                                        className="ingredients__unit-select"
                                    >
                                        <option value="">Unit</option>
                                        {ingredient.availableUnits?.map(unit => (
                                            <option key={unit} value={unit}>{unit}</option>
                                        )) || (
                                            <>
                                                <option value="grams">grams</option>
                                                <option value="cups">cups</option>
                                                <option value="pieces">pieces</option>
                                                <option value="tablespoons">tbsp</option>
                                                <option value="teaspoons">tsp</option>
                                                <option value="ml">ml</option>
                                            </>
                                        )}
                                    </select>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Add Ingredients Section */}
            <div className="ingredients-step__add-section">
                <div className="ingredients-step__add-buttons">
                    <button
                        className="ingredients-step__add-btn ingredients-step__add-btn--primary"
                        onClick={() => setShowModal(true)}
                    >
                        <span className="ingredients-step__btn-icon">➕</span>
                        Add Ingredients
                    </button>

                    {/* Pantry Integration */}
                    <button
                        className="ingredients-step__pantry-btn"
                        onClick={fetchPantryItems}
                        disabled={loadingPantry || !isAuthenticated}
                        title={!isAuthenticated ? "Please log in to access your pantry" : "Load ingredients from your pantry"}
                    >
                        <span className="ingredients-step__btn-icon">
                            {loadingPantry ? '⏳' : '🏺'}
                        </span>
                        {loadingPantry ? 'Loading Pantry...' : 'Use My Pantry'}
                    </button>
                </div>

                {!isAuthenticated && (
                    <p className="ingredients-step__auth-hint">
                        💡 Log in to access ingredients from your pantry
                    </p>
                )}

                {ingredients.length === 0 && (
                    <p className="ingredients-step__empty-state">
                        Click "Add Ingredients" or "Use My Pantry" to get started with your recipe! 🍳
                    </p>
                )}
            </div>

            {/* Navigation */}
            <div className="step-buttons">
                <div></div>
                <button
                    className={`btn ${canProceed ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={onNext}
                    disabled={!canProceed}
                >
                    Continue to Preferences →
                </button>
            </div>

            {!canProceed && (
                <p className="help-text">
                    💡 Add at least one ingredient to continue
                </p>
            )}

            {/* Add Ingredient Modal */}
            <AddIngredientModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onAddIngredients={handleAddIngredients}
                existingIngredients={ingredients}
            />

            {/* Pantry Selection Modal */}
            <PantrySelectionModal
                isOpen={showPantryModal}
                onClose={() => setShowPantryModal(false)}
                pantryItems={pantryItems}
                onAddIngredients={handleAddFromPantry}
                existingIngredients={ingredients}
            />
        </div>
    );
};

export default IngredientsStep;