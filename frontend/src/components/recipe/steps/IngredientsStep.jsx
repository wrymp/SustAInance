import React, { useState } from 'react';
import AddIngredientModal from "./modals/AddIngredientModal";
import './IngredientsStep.css';

const IngredientsStep = ({
                             ingredients,
                             setIngredients,
                             onNext,
                             hasPrefilledIngredients
                         }) => {
    const [showModal, setShowModal] = useState(false);

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

            {/* Current Ingredients */}
            {ingredients.length > 0 && (
                <div className="current-ingredients">
                    <h3>Your Ingredients ({ingredients.length})</h3>
                    <div className="ingredients-grid">
                        {ingredients.map((ingredient) => (
                            <div key={ingredient.id} className="ingredient-card">
                                <div className="ingredient-main">
                                    <span className="ingredient-name">{ingredient.name}</span>
                                    {ingredient.isCustom && <span className="custom-badge">Custom</span>}
                                    <button
                                        className="remove-btn"
                                        onClick={() => removeIngredient(ingredient.id)}
                                        title="Remove ingredient"
                                    >
                                        ×
                                    </button>
                                </div>

                                <div className="ingredient-details">
                                    <input
                                        type="text"
                                        placeholder="Quantity"
                                        value={ingredient.quantity}
                                        onChange={(e) => updateIngredient(ingredient.id, 'quantity', e.target.value)}
                                        className="quantity-input"
                                    />
                                    <select
                                        value={ingredient.unit}
                                        onChange={(e) => updateIngredient(ingredient.id, 'unit', e.target.value)}
                                        className="unit-select"
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

            {/* Add Ingredients Button */}
            <div className="add-ingredients-section">
                <button
                    className="add-ingredients-btn"
                    onClick={() => setShowModal(true)}
                >
                    ➕ Add Ingredients
                </button>

                {ingredients.length === 0 && (
                    <p className="empty-state">
                        Click "Add Ingredients" to get started with your recipe! 🍳
                    </p>
                )}
            </div>

            {/* Pantry Integration */}
            <div className="pantry-section">
                <button className="pantry-btn">
                    🏪 Use ingredients from my pantry
                </button>
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
        </div>
    );
};

export default IngredientsStep;