import React, { useState, useEffect } from 'react';
import { recipeAPI } from '../../../../services/api';
import './AddIngredientModal.css';

const AddIngredientModal = ({ isOpen, onClose, onAddIngredients, existingIngredients = [] }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [availableIngredients, setAvailableIngredients] = useState([]);
    const [filteredIngredients, setFilteredIngredients] = useState([]);
    const [selectedIngredients, setSelectedIngredients] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activeCategory, setActiveCategory] = useState('All');
    const [customIngredient, setCustomIngredient] = useState({
        name: '',
        category: 'Other',
        unit: 'grams'
    });
    const [loading, setLoading] = useState(false);
    const [showCustomForm, setShowCustomForm] = useState(false);

    // Fetch ingredients when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchIngredients();
        }
    }, [isOpen]);

    // Filter ingredients based on search and category
    useEffect(() => {
        let filtered = availableIngredients;

        // Filter by category
        if (activeCategory !== 'All') {
            filtered = filtered.filter(ing => ing.category === activeCategory);
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(ing =>
                ing.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Remove already existing ingredients
        filtered = filtered.filter(ing =>
            !existingIngredients.some(existing =>
                existing.name.toLowerCase() === ing.name.toLowerCase()
            )
        );

        setFilteredIngredients(filtered);
    }, [searchTerm, activeCategory, availableIngredients, existingIngredients]);

    const fetchIngredients = async () => {
        setLoading(true);
        try {
            // Using your recipeAPI.getIngredients()
            const response = await recipeAPI.getIngredients();
            const ingredients = response.data; // axios returns data in response.data

            setAvailableIngredients(ingredients);

            // Extract categories from your backend data
            const uniqueCategories = ['All', ...new Set(ingredients.map(ing => ing.category))];
            setCategories(uniqueCategories);

        } catch (error) {
            console.error('Error fetching ingredients:', error);
            // Fallback to empty array if API fails
            setAvailableIngredients([]);
            setCategories(['All']);
        } finally {
            setLoading(false);
        }
    };

    const toggleIngredientSelection = (ingredient) => {
        setSelectedIngredients(prev => {
            const isSelected = prev.some(selected => selected.name === ingredient.name);
            if (isSelected) {
                return prev.filter(selected => selected.name !== ingredient.name);
            } else {
                return [...prev, {
                    ...ingredient,
                    id: Date.now() + Math.random(),
                    quantity: '',
                    unit: ingredient.defaultUnit || ingredient.availableUnits?.[0] || 'grams'
                }];
            }
        });
    };

    const handleAddCustomIngredient = async () => {
        if (customIngredient.name.trim()) {
            try {
                // Create ingredient object matching your backend structure
                const newIngredientData = {
                    name: customIngredient.name.trim(),
                    quantity: 0, // Default quantity
                    unit: customIngredient.unit,
                    category: customIngredient.category
                };

                // Add to backend using your API
                await recipeAPI.addIngredient(newIngredientData);

                // Add to selected ingredients for immediate use
                const newIngredient = {
                    id: Date.now() + Math.random(),
                    name: customIngredient.name.trim(),
                    category: customIngredient.category,
                    quantity: '',
                    unit: customIngredient.unit,
                    isCustom: true,
                    availableUnits: ['grams', 'pieces', 'cups', 'ml', 'tablespoons', 'teaspoons']
                };

                setSelectedIngredients(prev => [...prev, newIngredient]);

                // Reset form
                setCustomIngredient({ name: '', category: 'Other', unit: 'grams' });
                setShowCustomForm(false);

                // Refresh ingredients list to include the new custom ingredient
                fetchIngredients();

            } catch (error) {
                console.error('Error adding custom ingredient:', error);
                // Still add locally even if backend fails
                const newIngredient = {
                    id: Date.now() + Math.random(),
                    name: customIngredient.name.trim(),
                    category: customIngredient.category,
                    quantity: '',
                    unit: customIngredient.unit,
                    isCustom: true,
                    availableUnits: ['grams', 'pieces', 'cups', 'ml', 'tablespoons', 'teaspoons']
                };

                setSelectedIngredients(prev => [...prev, newIngredient]);
                setCustomIngredient({ name: '', category: 'Other', unit: 'grams' });
                setShowCustomForm(false);
            }
        }
    };

    const handleAddSelected = () => {
        if (selectedIngredients.length > 0) {
            onAddIngredients(selectedIngredients);
            setSelectedIngredients([]);
            setSearchTerm('');
            setActiveCategory('All');
            onClose();
        }
    };

    const handleClose = () => {
        setSelectedIngredients([]);
        setSearchTerm('');
        setActiveCategory('All');
        setShowCustomForm(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal__overlay" onClick={handleClose}>
            <div className="modal__content" onClick={(e) => e.stopPropagation()}>
                <div className="modal__header">
                    <h2>🔍 Add Ingredients</h2>
                    <button className="modal__close-btn" onClick={handleClose}>×</button>
                </div>

                <div className="modal__body">
                    {/* Search Bar */}
                    <div className="search">
                        <input
                            type="text"
                            placeholder="Search ingredients..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search__input"
                        />
                    </div>

                    {/* Category Tabs */}
                    {categories.length > 1 && (
                        <div className="category">
                            {categories.map(category => (
                                <button
                                    key={category}
                                    className={`category__tab ${activeCategory === category ? 'category__tab--active' : ''}`}
                                    onClick={() => setActiveCategory(category)}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Selected Ingredients Preview */}
                    {selectedIngredients.length > 0 && (
                        <div className="selected">
                            <h4>Selected ({selectedIngredients.length})</h4>
                            <div className="selected__chips">
                                {selectedIngredients.map(ingredient => (
                                    <div key={ingredient.id} className="selected__chip">
                                        <span>{ingredient.name}</span>
                                        {ingredient.isCustom && <span className="selected__custom-indicator">✨</span>}
                                        <button
                                            onClick={() => setSelectedIngredients(prev =>
                                                prev.filter(item => item.id !== ingredient.id)
                                            )}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Available Ingredients Grid */}
                    <div className="ingredients">
                        {loading ? (
                            <div className="loading">
                                <div className="loading__spinner"></div>
                                <p>Loading ingredients...</p>
                            </div>
                        ) : (
                            <div className="ingredients__grid">
                                {filteredIngredients.map(ingredient => {
                                    const isSelected = selectedIngredients.some(
                                        selected => selected.name === ingredient.name
                                    );
                                    return (
                                        <div
                                            key={ingredient.name}
                                            className={`ingredients__item ${isSelected ? 'ingredients__item--selected' : ''}`}
                                            onClick={() => toggleIngredientSelection(ingredient)}
                                        >
                                            <div className="ingredients__info">
                                                <span className="ingredients__name">{ingredient.name}</span>
                                                <span className="ingredients__category">{ingredient.category}</span>
                                            </div>
                                            <div className="ingredients__checkbox">
                                                {isSelected && <span>✓</span>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {filteredIngredients.length === 0 && !loading && searchTerm && (
                            <div className="no-results">
                                <p>No ingredients found for "{searchTerm}"</p>
                                <button
                                    className="no-results__btn"
                                    onClick={() => {
                                        setCustomIngredient(prev => ({ ...prev, name: searchTerm }));
                                        setShowCustomForm(true);
                                    }}
                                >
                                    ➕ Add "{searchTerm}" as custom ingredient
                                </button>
                            </div>
                        )}

                        {filteredIngredients.length === 0 && !loading && !searchTerm && (
                            <div className="no-results">
                                <p>No ingredients available in this category</p>
                            </div>
                        )}
                    </div>

                    {/* Custom Ingredient Form */}
                    <div className="custom">
                        {!showCustomForm ? (
                            <button
                                className="custom__show-btn"
                                onClick={() => setShowCustomForm(true)}
                            >
                                ➕ Add Custom Ingredient
                            </button>
                        ) : (
                            <div className="custom__form">
                                <h4>Add Custom Ingredient</h4>
                                <div className="custom__inputs">
                                    <input
                                        type="text"
                                        placeholder="Ingredient name"
                                        value={customIngredient.name}
                                        onChange={(e) => setCustomIngredient(prev => ({
                                            ...prev,
                                            name: e.target.value
                                        }))}
                                        className="custom__name-input"
                                    />
                                    <select
                                        value={customIngredient.category}
                                        onChange={(e) => setCustomIngredient(prev => ({
                                            ...prev,
                                            category: e.target.value
                                        }))}
                                        className="custom__category-select"
                                    >
                                        <option value="Vegetables">Vegetables</option>
                                        <option value="Proteins">Proteins</option>
                                        <option value="Grains">Grains</option>
                                        <option value="Dairy">Dairy</option>
                                        <option value="Spices">Spices</option>
                                        <option value="Baking & Sweets">Baking & Sweets</option>
                                        <option value="Legumes & Nuts">Legumes & Nuts</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    <select
                                        value={customIngredient.unit}
                                        onChange={(e) => setCustomIngredient(prev => ({
                                            ...prev,
                                            unit: e.target.value
                                        }))}
                                        className="custom__unit-select"
                                    >
                                        <option value="grams">grams</option>
                                        <option value="pieces">pieces</option>
                                        <option value="cups">cups</option>
                                        <option value="ml">ml</option>
                                        <option value="tablespoons">tbsp</option>
                                        <option value="teaspoons">tsp</option>
                                    </select>
                                </div>
                                <div className="custom__actions">
                                    <button
                                        className="custom__cancel-btn"
                                        onClick={() => setShowCustomForm(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="custom__confirm-btn"
                                        onClick={handleAddCustomIngredient}
                                        disabled={!customIngredient.name.trim()}
                                    >
                                        Add Custom
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="modal__footer">
                    <button className="modal__cancel-btn" onClick={handleClose}>
                        Cancel
                    </button>
                    <button
                        className="modal__add-btn"
                        onClick={handleAddSelected}
                        disabled={selectedIngredients.length === 0}
                    >
                        Add Selected ({selectedIngredients.length})
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddIngredientModal;