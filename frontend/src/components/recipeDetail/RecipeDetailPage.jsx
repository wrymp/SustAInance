import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RecipeDetailView from '../recipeDetail/RecipeDetailView';
import RatingComponent from '../rating/RatingComponent';

const RecipeDetailPage = () => {
    const { recipeId } = useParams();
    const navigate = useNavigate();
    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isOwner, setIsOwner] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [userRating, setUserRating] = useState(0);
    const [averageRating, setAverageRating] = useState(0);

    const API_BASE_URL = 'http://localhost:9097/api';

    const getCurrentUser = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/me`, {
                method: 'GET',
                credentials: 'include',
            });
            if (response.ok) {
                const user = await response.json();
                return user.uuid;
            }
        } catch (error) {
            console.error('Error getting current user:', error);
        }
        return null;
    };

    const fetchRecipe = async () => {
        if (!recipeId) {
            setError('Recipe ID not provided');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const userId = await getCurrentUser();
            setCurrentUserId(userId);

            if (!userId) {
                setError('User not authenticated');
                return;
            }

            // Use your existing endpoint
            const response = await fetch(`${API_BASE_URL}/recipeSaver/${recipeId}`, {
                method: 'GET',
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                setRecipe(data.recipe);
                setIsOwner(data.isOwner);

                // Fetch ratings using your existing endpoints
                await fetchRatings(userId);
            } else if (response.status === 404) {
                setError('Recipe not found');
            } else {
                setError('Failed to load recipe');
            }
        } catch (err) {
            console.error('Error fetching recipe:', err);
            setError('Failed to load recipe. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const fetchRatings = async (userId) => {
        try {
            // Get average rating
            const avgResponse = await fetch(`${API_BASE_URL}/ratings/average/${recipeId}`, {
                method: 'GET',
                credentials: 'include',
            });

            if (avgResponse.ok) {
                const avgRating = await avgResponse.json();
                setAverageRating(avgRating || 0);
            }

            // Get user's current rating
            const userResponse = await fetch(`${API_BASE_URL}/ratings/user?recipeId=${recipeId}&userId=${userId}`, {
                method: 'GET',
                credentials: 'include',
            });

            if (userResponse.ok) {
                const rating = await userResponse.json();
                setUserRating(rating || 0);
            }
        } catch (err) {
            console.error('Error fetching ratings:', err);
        }
    };

    useEffect(() => {
        fetchRecipe();
    }, [recipeId]);

    const handleBack = () => {
        navigate('/saved-recipes');
    };

    const handleDelete = async (recipeToDelete) => {
        if (!isOwner) {
            alert('You can only delete your own recipes.');
            return;
        }

        if (!window.confirm(`Are you sure you want to delete "${recipeToDelete.recipeName}"?`)) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/recipeSaver/${recipeToDelete.id}?userId=${currentUserId}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (response.ok) {
                navigate('/saved-recipes');
            } else {
                alert('Failed to delete recipe. Please try again.');
            }
        } catch (error) {
            console.error('Error deleting recipe:', error);
            alert('Failed to delete recipe. Please try again.');
        }
    };

    const handleRating = async (rating) => {
        try {
            const response = await fetch(`${API_BASE_URL}/ratings/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    recipeId: recipeId,
                    userId: currentUserId,
                    rating: rating
                }),
            });

            if (response.ok) {
                alert('Rating saved! 🌟');
                setUserRating(rating);
                // Refresh average rating
                await fetchRatings(currentUserId);
            } else {
                alert('Failed to save rating. Please try again.');
            }
        } catch (error) {
            console.error('Error saving rating:', error);
            alert('Failed to save rating. Please try again.');
        }
    };

    const handleSaveToCollection = async () => {
        if (!currentUserId) {
            alert('Please log in to save recipes');
            return;
        }

        try {
            const recipeData = {
                recipeName: `${recipe.recipeName} (Shared)`,
                recipeDesc: recipe.recipeDesc,
                recipeText: recipe.recipeText,
                tags: recipe.tags,
                prepTime: recipe.prepTime,
                difficulty: recipe.difficulty,
                userId: currentUserId
            };

            const response = await fetch(`${API_BASE_URL}/recipeSaver/save`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(recipeData),
            });

            if (response.ok) {
                alert('Recipe saved to your collection! 🎉');
            } else {
                alert('Failed to save recipe to your collection');
            }
        } catch (error) {
            console.error('Error saving recipe:', error);
            alert('Failed to save recipe to your collection');
        }
    };

    if (loading) {
        return (
            <div className="recipe-detail-page">
                <div className="recipe-detail-page__loading">
                    <div className="loading-spinner"></div>
                    <p>Loading recipe...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="recipe-detail-page">
                <div className="recipe-detail-page__error">
                    <h2>😕 {error}</h2>
                    <button
                        className="recipe-detail-page__back-btn"
                        onClick={handleBack}
                    >
                        ← Back to Recipes
                    </button>
                </div>
            </div>
        );
    }

    if (!recipe) {
        return (
            <div className="recipe-detail-page">
                <div className="recipe-detail-page__error">
                    <h2>😕 Recipe not found</h2>
                    <button
                        className="recipe-detail-page__back-btn"
                        onClick={handleBack}
                    >
                        ← Back to Recipes
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <RecipeDetailView
                recipe={recipe}
                onBack={handleBack}
                onDelete={isOwner ? handleDelete : null}
                recipeUrl={`${window.location.origin}/recipe/${recipeId}`}
                isOwner={isOwner}
                currentUserId={currentUserId}
                onSaveToCollection={!isOwner ? handleSaveToCollection : null}
                averageRating={averageRating}
            />

            <RatingComponent
                onSubmitRating={handleRating}
                averageRating={averageRating}
                userRating={userRating}
            />
        </div>
    );
};

export default RecipeDetailPage;