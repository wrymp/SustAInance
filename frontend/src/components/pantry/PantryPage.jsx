import React, {useState, useEffect, useContext, useCallback} from 'react';
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

    // Delete pantry item - Enhanced debugging and error handling
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
            console.log('Request body JSON:', JSON.stringify(requestBody));

            const response = await fetch('http://localhost:9097/api/pantry/remove', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(requestBody)
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', [...response.headers.entries()]);

            // Get response as text first
            const responseText = await response.text();
            console.log('Raw response text:', responseText);
            console.log('Response text length:', responseText.length);

            if (response.ok) {
                console.log('✅ DELETE SUCCESS');
                console.log('Success response:', responseText);

                // Remove item from state
                setPantryItems(prevItems => {
                    const newItems = prevItems.filter(item => item.id !== itemId);
                    console.log('Items before filter:', prevItems.length);
                    console.log('Items after filter:', newItems.length);
                    return newItems;
                });

                setError('');
            } else {
                console.log('❌ DELETE FAILED');
                console.log('Error status:', response.status);
                console.log('Error response text:', responseText);

                // Better error parsing
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
                        errorMessage = responseText.substring(0, 200); // Show first 200 chars
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
        return <div className="loading">Authenticating...</div>;
    }

    if (!isAuthenticated) {
        return <div className="loading">Redirecting to login...</div>;
    }

    return (
        <div className="pantry-container">
            <div className="pantry-header">
                <button
                    onClick={() => navigate('/home')}
                    className="back-button"
                >
                    ← Back to Home
                </button>
                <h1 className="pantry-title">My Pantry</h1>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="add-button"
                >
                    {showAddForm ? 'Cancel' : '+ Add Item'}
                </button>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                    <button
                        onClick={() => setError('')}
                        style={{ marginLeft: '10px', background: 'transparent', border: 'none', cursor: 'pointer' }}
                    >
                        ✕
                    </button>
                </div>
            )}

            {showAddForm && currentUser && (
                <div className="add-form">
                    <h3 className="form-title">Add New Ingredient</h3>
                    <form onSubmit={handleAddItem} className="ingredient-form">
                        <div className="form-group">
                            <label className="form-label">Ingredient Name:</label>
                            <input
                                type="text"
                                value={newItem.ingredientName}
                                onChange={(e) => setNewItem({...newItem, ingredientName: e.target.value})}
                                className="form-input"
                                required
                                placeholder="e.g., Tomatoes, Rice, Chicken"
                            />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Count:</label>
                                <input
                                    type="text"
                                    value={newItem.count}
                                    onChange={(e) => setNewItem({...newItem, count: e.target.value})}
                                    className="form-input"
                                    required
                                    placeholder="e.g., 2, 1.5, 500"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Unit:</label>
                                <select
                                    value={newItem.unit}
                                    onChange={(e) => setNewItem({...newItem, unit: e.target.value})}
                                    className="form-select"
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
                            className="submit-button"
                        >
                            {addingItem ? 'Adding...' : 'Add to Pantry'}
                        </button>
                    </form>
                </div>
            )}

            <div className="pantry-grid">
                {loading ? (
                    <div className="loading-text">
                        Loading your pantry...
                        <br/>
                        <small>User: {currentUser?.username || 'Loading user...'}</small>
                    </div>
                ) : pantryItems.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📦</div>
                        <h3>Your pantry is empty!</h3>
                        <p>Start by adding some ingredients to track your inventory.</p>
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="add-button"
                            style={{ marginTop: '1rem' }}
                        >
                            Add Your First Item
                        </button>
                    </div>
                ) : (
                    pantryItems.map((item) => (
                        <div key={item.id} className="pantry-item">
                            <div className="item-header">
                                <h3 className="item-name">{item.ingredientName}</h3>
                                <button
                                    onClick={() => handleDeleteItem(item.id)}
                                    disabled={deletingItems.has(item.id)}
                                    className="delete-button"
                                    title="Delete this item"
                                >
                                    {deletingItems.has(item.id) ? '⏳' : '✕'}
                                </button>
                            </div>
                            <div className="item-details">
                                <span className="item-count">{item.count}</span>
                                <span className="item-unit">{item.unit}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default PantryPage;