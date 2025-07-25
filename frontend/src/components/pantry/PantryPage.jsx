import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import './PantryPage.css';

const PantryPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated, isLoading } = useContext(AuthContext);

    const [currentUser, setCurrentUser] = useState(null);
    const [pantryItems, setPantryItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [showUpdateForm, setShowUpdateForm] = useState(false);
    const [addingItem, setAddingItem] = useState(false);
    const [updatingItem, setUpdatingItem] = useState(false);
    const [deletingItems, setDeletingItems] = useState(new Set());
    const [selectedItems, setSelectedItems] = useState(new Set());
    const [searchQuery, setSearchQuery] = useState('');

    const [newItem, setNewItem] = useState({
        ingredientName: '',
        count: '',
        unit: ''
    });

    const [updateItem, setUpdateItem] = useState({
        id: '',
        ingredientName: '',
        count: '',
        unit: ''
    });

    const fetchCurrentUser = useCallback(async () => {
        try {
            const response = await fetch('http://localhost:9097/api/auth/me', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            });

            const responseText = await response.text();

            if (response.ok) {
                try {
                    const user = JSON.parse(responseText);
                    setCurrentUser(user);
                    return user;
                } catch (parseError) {
                    setError('Server returned invalid response format');
                    return null;
                }
            } else {
                setError(`Failed to fetch user information: ${response.status}`);
                return null;
            }
        } catch (err) {
            setError('Error fetching user information');
            return null;
        }
    }, []);

    const fetchPantryItems = useCallback(async () => {
        try {
            setLoading(true);
            setError('');

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
                setFilteredItems(items);
                setError('');
            } else {
                const errorText = await response.text();
                setError(`Failed to fetch pantry items: ${response.status} - ${errorText}`);
            }
        } catch (err) {
            setError(`Network error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredItems(pantryItems);
        } else {
            const filtered = pantryItems.filter(item =>
                item.ingredientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.unit.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredItems(filtered);
        }
    }, [searchQuery, pantryItems]);

    const toggleItemSelection = (itemId) => {
        setSelectedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(itemId)) {
                newSet.delete(itemId);
            } else {
                newSet.add(itemId);
            }
            return newSet;
        });
    };

    const selectAllItems = () => {
        const allFilteredIds = new Set(filteredItems.map(item => item.id));
        setSelectedItems(allFilteredIds);
    };

    const clearAllSelections = () => {
        setSelectedItems(new Set());
    };

    const generateRecipeWithSelected = () => {
        const selectedPantryItems = pantryItems.filter(item => selectedItems.has(item.id));

        if (selectedPantryItems.length === 0) {
            setError('Please select at least one ingredient to generate a recipe');
            return;
        }

        const ingredients = selectedPantryItems.map(pantryItem => ({
            id: `pantry-${pantryItem.id}-${Date.now()}`,
            name: pantryItem.ingredientName,
            quantity: pantryItem.count.toString(),
            unit: pantryItem.unit,
            isFromPantry: true,
            pantryId: pantryItem.id,
            availableUnits: [
                pantryItem.unit,
                'grams', 'cups', 'pieces', 'tablespoons', 'teaspoons', 'ml', 'kg', 'lbs', 'oz'
            ].filter((unit, index, arr) => arr.indexOf(unit) === index)
        }));

        navigate('/recipe-generator', {
            state: {
                selectedIngredients: ingredients,
                fromPantry: true,
                skipIngredientsStep: true
            }
        });
    };

    const handleDeleteItem = async (itemId) => {
        if (!currentUser?.uuid) {
            setError('User not authenticated');
            return;
        }

        try {
            setDeletingItems(prev => new Set([...prev, itemId]));

            const requestBody = {
                usersId: currentUser.uuid,
                id: itemId
            };

            const response = await fetch('http://localhost:9097/api/pantry/remove', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(requestBody)
            });

            const responseText = await response.text();

            if (response.ok) {
                setPantryItems(prevItems => {
                    const newItems = prevItems.filter(item => item.id !== itemId);
                    return newItems;
                });

                setSelectedItems(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(itemId);
                    return newSet;
                });

                setError('');
            } else {
                let errorMessage = 'Unknown error';

                if (responseText) {
                    try {
                        const errorJson = JSON.parse(responseText);

                        if (errorJson.message) {
                            errorMessage = errorJson.message;
                        } else if (errorJson.error) {
                            errorMessage = errorJson.error;
                        } else if (errorJson.errors && Array.isArray(errorJson.errors)) {
                            const fieldErrors = errorJson.errors.map(err => `${err.field}: ${err.defaultMessage}`).join(', ');
                            errorMessage = `Validation errors: ${fieldErrors}`;
                        } else {
                            errorMessage = JSON.stringify(errorJson);
                        }
                    } catch (parseError) {
                        errorMessage = responseText.substring(0, 200);
                    }
                }

                setError(`Delete failed (${response.status}): ${errorMessage}`);
            }
        } catch (err) {
            setError(`Network error: ${err.message}`);
        } finally {
            setDeletingItems(prev => {
                const newSet = new Set(prev);
                newSet.delete(itemId);
                return newSet;
            });
        }
    };

    const showUpdateFormForItem = (item) => {
        setUpdateItem({
            id: item.id,
            ingredientName: item.ingredientName,
            count: item.count,
            unit: item.unit
        });
        setShowUpdateForm(true);
        setShowAddForm(false);
    };

    const initializePage = useCallback(async () => {
        const user = await fetchCurrentUser();
        if (user && user.uuid) {
            await fetchPantryItems();
        } else {
            setLoading(false);
        }
    }, [fetchCurrentUser, fetchPantryItems]);

    const handleAddItem = async (e) => {
        e.preventDefault();
        if (!currentUser?.uuid) return;

        try {
            setAddingItem(true);
            const response = await fetch('http://localhost:9097/api/pantry/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    usersId: currentUser.uuid,
                    ingredientName: newItem.ingredientName,
                    count: newItem.count,
                    unit: newItem.unit
                })
            });

            if (response.ok) {
                const addedItem = await response.json();
                setPantryItems(prevItems => {
                    const existingIndex = prevItems.findIndex(item => item.id === addedItem.id);
                    if (existingIndex >= 0) {
                        const newItems = [...prevItems];
                        newItems[existingIndex] = addedItem;
                        return newItems;
                    } else {
                        return [...prevItems, addedItem];
                    }
                });
                setNewItem({ ingredientName: '', count: '', unit: '' });
                setShowAddForm(false);
                setError('');
            } else {
                const errorText = await response.text();
                setError(`Failed to add item: ${errorText}`);
            }
        } catch (err) {
            setError(`Error adding item: ${err.message}`);
        } finally {
            setAddingItem(false);
        }
    };

    const handleUpdateItem = async (e) => {
        e.preventDefault();
        if (!currentUser?.uuid) return;

        try {
            setUpdatingItem(true);
            const response = await fetch('http://localhost:9097/api/pantry/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    usersId: currentUser.uuid,
                    id: updateItem.id,
                    ingredientName: updateItem.ingredientName,
                    count: updateItem.count,
                    unit: updateItem.unit
                })
            });

            if (response.ok) {
                const updatedItem = await response.json();
                setPantryItems(prevItems =>
                    prevItems.map(item =>
                        item.id === updatedItem.id ? updatedItem : item
                    )
                );
                setUpdateItem({ id: '', ingredientName: '', count: '', unit: '' });
                setShowUpdateForm(false);
                setError('');
            } else {
                const errorText = await response.text();
                setError(`Failed to update item: ${errorText}`);
            }
        } catch (err) {
            setError(`Error updating item: ${err.message}`);
        } finally {
            setUpdatingItem(false);
        }
    };

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            initializePage();
        } else if (!isLoading && !isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, isLoading, initializePage, navigate]);

    if (isLoading) {
        return (
            <div className="pantry-loading">
                <div className="loading-spinner">🧑‍🍳</div>
                <p>Authenticating...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="pantry-loading">
                <div className="loading-spinner">🔄</div>
                <p>Redirecting to login...</p>
            </div>
        );
    }

    return (
        <div className="pantry">
            <header className="pantry__header">
                <button
                    onClick={() => navigate('/home')}
                    className="pantry__back-btn"
                >
                    <span className="pantry__back-icon">←</span>
                    Back to Home
                </button>

                <h1 className="pantry__title">
                    <span className="pantry__title-icon">🏺</span>
                    My Pantry
                </h1>

                <div className="pantry__header-actions">
                    <button
                        onClick={() => {
                            setShowAddForm(!showAddForm);
                            setShowUpdateForm(false);
                        }}
                        className={`pantry__add-btn ${showAddForm ? 'pantry__add-btn--active' : ''}`}
                    >
                        <span className="pantry__add-icon">{showAddForm ? '✕' : '+'}</span>
                        {showAddForm ? 'Cancel' : 'Add Item'}
                    </button>
                </div>
            </header>

            <div className="pantry__search">
                <div className="pantry__search-container">
                    <span className="pantry__search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Search ingredients..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pantry__search-input"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="pantry__search-clear"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

            {filteredItems.length > 0 && (
                <div className="pantry__selection-controls">
                    <div className="pantry__selection-info">
                        <span className="pantry__selection-count">
                            {selectedItems.size} of {filteredItems.length} selected
                        </span>
                    </div>
                    <div className="pantry__selection-actions">
                        <button
                            onClick={selectAllItems}
                            className="pantry__selection-btn"
                            disabled={selectedItems.size === filteredItems.length}
                        >
                            Select All
                        </button>
                        <button
                            onClick={clearAllSelections}
                            className="pantry__selection-btn"
                            disabled={selectedItems.size === 0}
                        >
                            Clear All
                        </button>
                        <button
                            onClick={generateRecipeWithSelected}
                            className="pantry__generate-btn"
                            disabled={selectedItems.size === 0}
                        >
                            <span className="pantry__generate-icon">🚀</span>
                            Make Recipe with These ({selectedItems.size})
                        </button>
                    </div>
                </div>
            )}

            {error && (
                <div className="pantry__error">
                    <div className="pantry__error-content">
                        <span className="pantry__error-icon">⚠️</span>
                        <span className="pantry__error-text">{error}</span>
                        <button
                            onClick={() => setError('')}
                            className="pantry__error-close"
                            aria-label="Close error"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}

            {showAddForm && currentUser && (
                <div className="pantry__add-form">
                    <div className="pantry__form-header">
                        <h3 className="pantry__form-title">
                            <span className="pantry__form-icon">✨</span>
                            Add New Ingredient
                        </h3>
                    </div>

                    <form onSubmit={handleAddItem} className="pantry__form">
                        <div className="pantry__form-group pantry__form-group--full">
                            <label className="pantry__form-label">Ingredient Name</label>
                            <input
                                type="text"
                                value={newItem.ingredientName}
                                onChange={(e) => setNewItem({...newItem, ingredientName: e.target.value})}
                                className="pantry__form-input"
                                required
                                placeholder="e.g., Tomatoes, Rice, Chicken"
                            />
                        </div>

                        <div className="pantry__form-row">
                            <div className="pantry__form-group">
                                <label className="pantry__form-label">Count</label>
                                <input
                                    type="text"
                                    value={newItem.count}
                                    onChange={(e) => setNewItem({...newItem, count: e.target.value})}
                                    className="pantry__form-input"
                                    required
                                    placeholder="e.g., 2, 1.5, 500"
                                />
                            </div>

                            <div className="pantry__form-group">
                                <label className="pantry__form-label">Unit</label>
                                <select
                                    value={newItem.unit}
                                    onChange={(e) => setNewItem({...newItem, unit: e.target.value})}
                                    className="pantry__form-select"
                                    required
                                >
                                    <option value="">Select unit</option>
                                    <option value="pieces">Pieces</option>
                                    <option value="kg">Kilograms</option>
                                    <option value="g">Grams</option>
                                    <option value="lbs">Pounds</option>
                                    <option value="oz">Ounces</option>
                                    <option value="liters">Liters</option>
                                    <option value="ml">Milliliters</option>
                                    <option value="cups">Cups</option>
                                    <option value="tbsp">Tablespoons</option>
                                    <option value="tsp">Teaspoons</option>
                                    <option value="cans">Cans</option>
                                    <option value="bottles">Bottles</option>
                                </select>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={addingItem}
                            className="pantry__form-submit"
                        >
                            <span className="pantry__form-submit-icon">
                                {addingItem ? '⏳' : '🥄'}
                            </span>
                            {addingItem ? 'Adding...' : 'Add to Pantry'}
                        </button>
                    </form>
                </div>
            )}

            {showUpdateForm && currentUser && (
                <div className="pantry__add-form">
                    <div className="pantry__form-header">
                        <h3 className="pantry__form-title">
                            <span className="pantry__form-icon">✏️</span>
                            Update Ingredient
                        </h3>
                    </div>

                    <form onSubmit={handleUpdateItem} className="pantry__form">
                        <div className="pantry__form-group pantry__form-group--full">
                            <label className="pantry__form-label">Ingredient Name</label>
                            <input
                                type="text"
                                value={updateItem.ingredientName}
                                onChange={(e) => setUpdateItem({...updateItem, ingredientName: e.target.value})}
                                className="pantry__form-input"
                                required
                                placeholder="e.g., Tomatoes, Rice, Chicken"
                            />
                        </div>

                        <div className="pantry__form-row">
                            <div className="pantry__form-group">
                                <label className="pantry__form-label">Count</label>
                                <input
                                    type="text"
                                    value={updateItem.count}
                                    onChange={(e) => setUpdateItem({...updateItem, count: e.target.value})}
                                    className="pantry__form-input"
                                    required
                                    placeholder="e.g., 2, 1.5, 500"
                                />
                            </div>

                            <div className="pantry__form-group">
                                <label className="pantry__form-label">Unit</label>
                                <select
                                    value={updateItem.unit}
                                    onChange={(e) => setUpdateItem({...updateItem, unit: e.target.value})}
                                    className="pantry__form-select"
                                    required
                                >
                                    <option value="">Select unit</option>
                                    <option value="pieces">Pieces</option>
                                    <option value="kg">Kilograms</option>
                                    <option value="g">Grams</option>
                                    <option value="lbs">Pounds</option>
                                    <option value="oz">Ounces</option>
                                    <option value="liters">Liters</option>
                                    <option value="ml">Milliliters</option>
                                    <option value="cups">Cups</option>
                                    <option value="tbsp">Tablespoons</option>
                                    <option value="tsp">Teaspoons</option>
                                    <option value="cans">Cans</option>
                                    <option value="bottles">Bottles</option>
                                </select>
                            </div>
                        </div>

                        <div className="pantry__form-actions">
                            <button
                                type="button"
                                onClick={() => setShowUpdateForm(false)}
                                className="pantry__form-cancel"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={updatingItem}
                                className="pantry__form-submit"
                            >
                                <span className="pantry__form-submit-icon">
                                    {updatingItem ? '⏳' : '✏️'}
                                </span>
                                {updatingItem ? 'Updating...' : 'Update Item'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <main className="pantry__main">
                {loading ? (
                    <div className="pantry__loading-state">
                        <div className="pantry__loading-spinner">🔄</div>
                        <h3>Loading your pantry...</h3>
                        <p>User: {currentUser?.username || 'Loading user...'}</p>
                    </div>
                ) : filteredItems.length === 0 ? (
                    searchQuery ? (
                        <div className="pantry__empty-state">
                            <div className="pantry__empty-icon">🔍</div>
                            <h3 className="pantry__empty-title">No items found</h3>
                            <p className="pantry__empty-text">
                                No ingredients match "{searchQuery}". Try a different search term.
                            </p>
                            <button
                                onClick={() => setSearchQuery('')}
                                className="pantry__empty-cta"
                            >
                                <span className="pantry__empty-cta-icon">✕</span>
                                Clear Search
                            </button>
                        </div>
                    ) : (
                        <div className="pantry__empty-state">
                            <div className="pantry__empty-icon">📦</div>
                            <h3 className="pantry__empty-title">Your pantry is empty!</h3>
                            <p className="pantry__empty-text">
                                Start by adding some ingredients to track your inventory.
                            </p>
                            <button
                                onClick={() => setShowAddForm(true)}
                                className="pantry__empty-cta"
                            >
                                <span className="pantry__empty-cta-icon">✨</span>
                                Add Your First Item
                            </button>
                        </div>
                    )
                ) : (
                    <div className="pantry__grid">
                        {filteredItems.map((item) => (
                            <div
                                key={item.id}
                                className={`pantry__item ${selectedItems.has(item.id) ? 'pantry__item--selected' : ''}`}
                            >
                                <div className="pantry__item-header">
                                    <div className="pantry__item-selection">
                                        <input
                                            type="checkbox"
                                            checked={selectedItems.has(item.id)}
                                            onChange={() => toggleItemSelection(item.id)}
                                            className="pantry__item-checkbox"
                                        />
                                    </div>
                                    <h3 className="pantry__item-name">{item.ingredientName}</h3>
                                    <div className="pantry__item-actions">
                                        <button
                                            onClick={() => showUpdateFormForItem(item)}
                                            className="pantry__item-edit"
                                            title="Edit this item"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            onClick={() => handleDeleteItem(item.id)}
                                            disabled={deletingItems.has(item.id)}
                                            className="pantry__item-delete"
                                            title="Delete this item"
                                        >
                                            {deletingItems.has(item.id) ? '⏳' : '✕'}
                                        </button>
                                    </div>
                                </div>

                                <div className="pantry__item-details">
                                    <div className="pantry__item-quantity">
                                        <span className="pantry__item-count">{item.count}</span>
                                        <span className="pantry__item-unit">{item.unit}</span>
                                    </div>
                                    <div className="pantry__item-badge">
                                        🥫
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default PantryPage;