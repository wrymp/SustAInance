import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import './PantryPage.css';

const PantryPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated, isLoading } = useContext(AuthContext);

    const [currentUser, setCurrentUser] = useState(null);
    const [pantryItems, setPantryItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [addingItem, setAddingItem] = useState(false);
    const [deletingItems, setDeletingItems] = useState(new Set());

    const [newItem, setNewItem] = useState({
        ingredientName: '',
        count: '',
        unit: ''
    });

    // Fetch current user from /api/auth/me
    const fetchCurrentUser = useCallback(async () => {
        console.log('Fetching current user...');

        try {
            const response = await fetch('http://localhost:9097/api/auth/me', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            });

            console.log('User fetch response status:', response.status);

            const responseText = await response.text();

            if (response.ok) {
                try {
                    const user = JSON.parse(responseText);
                    console.log('Current user:', user);
                    setCurrentUser(user);
                    return user;
                } catch (parseError) {
                    console.error('Failed to parse JSON:', parseError);
                    setError('Server returned invalid response format');
                    return null;
                }
            } else {
                console.log('Failed to fetch user, status:', response.status);
                setError(`Failed to fetch user information: ${response.status}`);
                return null;
            }
        } catch (err) {
            console.error('Error fetching user:', err);
            setError('Error fetching user information');
            return null;
        }
    }, []);

    // Fetch pantry items
    const fetchPantryItems = useCallback(async () => {
        console.log('Fetching pantry items...');

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

            console.log('Pantry response status:', response.status);

            if (response.ok) {
                const items = await response.json();
                console.log('Received pantry items:', items);
                setPantryItems(items);
                setError('');
            } else {
                const errorText = await response.text();
                console.log('Pantry error response:', errorText);
                setError(`Failed to fetch pantry items: ${response.status} - ${errorText}`);
            }
        } catch (err) {
            console.error('Pantry fetch error:', err);
            setError(`Network error: ${err.message}`);
        } finally {
            console.log('Setting loading to false');
            setLoading(false);
        }
    }, []);

    // Delete pantry item
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

            console.log('Request body:', requestBody);

            const response = await fetch('http://localhost:9097/api/pantry/remove', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(requestBody)
            });

            console.log('Response status:', response.status);

            const responseText = await response.text();
            console.log('Raw response text:', responseText);

            if (response.ok) {
                console.log('✅ DELETE SUCCESS');

                setPantryItems(prevItems => {
                    const newItems = prevItems.filter(item => item.id !== itemId);
                    console.log('Items before filter:', prevItems.length);
                    console.log('Items after filter:', newItems.length);
                    return newItems;
                });

                setError('');
            } else {
                console.log('❌ DELETE FAILED');

                let errorMessage = 'Unknown error';

                if (responseText) {
                    try {
                        const errorJson = JSON.parse(responseText);
                        console.log('Parsed error JSON:', errorJson);

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
                        console.log('Failed to parse error JSON:', parseError);
                        errorMessage = responseText.substring(0, 200);
                    }
                }

                console.log('Final error message:', errorMessage);
                setError(`Delete failed (${response.status}): ${errorMessage}`);
            }
        } catch (err) {
            console.error('Network/Request error:', err);
            setError(`Network error: ${err.message}`);
        } finally {
            setDeletingItems(prev => {
                const newSet = new Set(prev);
                newSet.delete(itemId);
                return newSet;
            });
        }
    };

    // Combined function to fetch user and then pantry
    const initializePage = useCallback(async () => {
        console.log('Initializing pantry page...');
        const user = await fetchCurrentUser();
        if (user && user.uuid) {
            await fetchPantryItems();
        } else {
            setLoading(false);
        }
    }, [fetchCurrentUser, fetchPantryItems]);

    // Add new pantry item
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
                setPantryItems([...pantryItems, addedItem]);
                setNewItem({ ingredientName: '', count: '', unit: '' });
                setShowAddForm(false);
                setError('');
            } else {
                const errorText = await response.text();
                setError(`Failed to add item: ${errorText}`);
            }
        } catch (err) {
            setError(`Error adding item: ${err.message}`);
            console.error('Error:', err);
        } finally {
            setAddingItem(false);
        }
    };

    // Main useEffect
    useEffect(() => {
        console.log('useEffect triggered', { isAuthenticated, isLoading });

        if (!isLoading && isAuthenticated) {
            console.log('User is authenticated, initializing page');
            initializePage();
        } else if (!isLoading && !isAuthenticated) {
            console.log('Not authenticated, redirecting to login');
            navigate('/login');
        }
    }, [isAuthenticated, isLoading, initializePage, navigate]);

    // Show loading for auth context
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
            {/* Header */}
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

                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className={`pantry__add-btn ${showAddForm ? 'pantry__add-btn--active' : ''}`}
                >
                    <span className="pantry__add-icon">{showAddForm ? '✕' : '+'}</span>
                    {showAddForm ? 'Cancel' : 'Add Item'}
                </button>
            </header>

            {/* Error Message */}
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

            {/* Add Form */}
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

            {/* Pantry Grid */}
            <main className="pantry__main">
                {loading ? (
                    <div className="pantry__loading-state">
                        <div className="pantry__loading-spinner">🔄</div>
                        <h3>Loading your pantry...</h3>
                        <p>User: {currentUser?.username || 'Loading user...'}</p>
                    </div>
                ) : pantryItems.length === 0 ? (
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
                ) : (
                    <div className="pantry__grid">
                        {pantryItems.map((item) => (
                            <div key={item.id} className="pantry__item">
                                <div className="pantry__item-header">
                                    <h3 className="pantry__item-name">{item.ingredientName}</h3>
                                    <button
                                        onClick={() => handleDeleteItem(item.id)}
                                        disabled={deletingItems.has(item.id)}
                                        className="pantry__item-delete"
                                        title="Delete this item"
                                    >
                                        {deletingItems.has(item.id) ? '⏳' : '✕'}
                                    </button>
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