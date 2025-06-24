import React, { useState, useEffect } from 'react';
import './RecipeDetailView.css';

const StarRating = ({ rating, onRatingChange, readOnly = false, size = 'medium' }) => {
    const [hover, setHover] = useState(0);

    const handleClick = (value) => {
        if (!readOnly && onRatingChange) {
            onRatingChange(value);
        }
    };

    const starSize = size === 'small' ? '16px' : size === 'large' ? '32px' : '24px';

    return (
        <div className={`star-rating star-rating--${size}`} style={{ fontSize: starSize }}>
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    className={`star-rating__star ${
                        star <= (hover || rating) ? 'star-rating__star--filled' : 'star-rating__star--empty'
                    }`}
                    onClick={() => handleClick(star)}
                    onMouseEnter={() => !readOnly && setHover(star)}
                    onMouseLeave={() => !readOnly && setHover(0)}
                    disabled={readOnly}
                    style={{ cursor: readOnly ? 'default' : 'pointer' }}
                >
                    ⭐
                </button>
            ))}
        </div>
    );
};

const RecipeDetailView = ({
                              recipe,
                              onBack,
                              onDelete,
                              onShare
                          }) => {
    const [showFullContent, setShowFullContent] = useState(false);
    const [averageRating, setAverageRating] = useState(0);
    const [userRating, setUserRating] = useState(0);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [isLoadingRating, setIsLoadingRating] = useState(true);

    const API_BASE_URL = 'http://localhost:9097/api';

    // Get current user
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

    // Get average rating for recipe
    const getAverageRating = async (recipeId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/ratings/average/${recipeId}`, {
                method: 'GET',
                credentials: 'include',
            });
            if (response.ok) {
                return await response.json();
            }
            return 0;
        } catch (error) {
            console.error('Error getting average rating:', error);
            return 0;
        }
    };

    // Get user's specific rating for recipe
    const getUserRating = async (recipeId, userId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/ratings/user?recipeId=${recipeId}&userId=${userId}`, {
                method: 'GET',
                credentials: 'include',
            });
            if (response.ok) {
                const rating = await response.json();
                return rating || 0;
            }
            return 0;
        } catch (error) {
            console.error('Error getting user rating:', error);
            return 0;
        }
    };

    const addOrUpdateRating = async (recipeId, userId, rating) => {
        try {
            const response = await fetch(`${API_BASE_URL}/ratings/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    recipeId,
                    userId,
                    rating
                }),
            });
            return response.ok;
        } catch (error) {
            console.error('Error adding rating:', error);
            return false;
        }
    };

    // Delete user's rating
    const deleteRating = async (recipeId, userId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/ratings/delete?recipeId=${recipeId}&userId=${userId}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            return response.ok;
        } catch (error) {
            console.error('Error deleting rating:', error);
            return false;
        }
    };

    // Load ratings on component mount
    useEffect(() => {
        const loadRatings = async () => {
            setIsLoadingRating(true);
            try {
                const userId = await getCurrentUser();
                setCurrentUserId(userId);

                if (userId) {
                    // Get both average rating and user's specific rating
                    const [avgRating, myRating] = await Promise.all([
                        getAverageRating(recipe.id),
                        getUserRating(recipe.id, userId)
                    ]);

                    setAverageRating(avgRating || 0);
                    setUserRating(myRating || 0);
                } else {
                    // If no user, just get average rating
                    const avgRating = await getAverageRating(recipe.id);
                    setAverageRating(avgRating || 0);
                    setUserRating(0);
                }
            } catch (error) {
                console.error('Error loading ratings:', error);
            } finally {
                setIsLoadingRating(false);
            }
        };

        if (recipe?.id) {
            loadRatings();
        }
    }, [recipe?.id]);

    const handleUserRating = async (rating) => {
        if (!currentUserId) return;

        try {
            const success = await addOrUpdateRating(recipe.id, currentUserId, rating);
            if (success) {
                setUserRating(rating);
                // Refresh average rating after user rates
                const newAvgRating = await getAverageRating(recipe.id);
                setAverageRating(newAvgRating || 0);
            }
        } catch (error) {
            console.error('Error submitting rating:', error);
        }
    };

    const handleRemoveRating = async () => {
        if (!currentUserId || userRating === 0) return;

        try {
            const success = await deleteRating(recipe.id, currentUserId);
            if (success) {
                setUserRating(0);
                // Refresh average rating after removing user's rating
                const newAvgRating = await getAverageRating(recipe.id);
                setAverageRating(newAvgRating || 0);
            }
        } catch (error) {
            console.error('Error removing rating:', error);
        }
    };

    // Parse recipe content if it's formatted text
    const parseRecipeContent = (content) => {
        if (!content) return { instructions: [], metadata: {} };

        const result = {
            instructions: [],
            metadata: {}
        };

        // Extract Instructions section
        const instructionsMatch = content.match(/Instructions:\s*(.*?)(?=Cooking Time:|Chef's Tips:|$)/s);
        if (instructionsMatch) {
            const instructionsText = instructionsMatch[1];
            result.instructions = instructionsText
                .split(/(?=\d+\.\s)/)
                .filter(step => step.trim() && step.match(/^\d+\./))
                .map(step => step.trim());
        }

        // Extract metadata
        const cookingTimeMatch = content.match(/Cooking Time:\s*([^\n]+)/);
        const servesMatch = content.match(/Serves:\s*([^\n]+)/);
        const difficultyMatch = content.match(/Difficulty:\s*([^\n]+)/);

        if (cookingTimeMatch) result.metadata.cookingTime = cookingTimeMatch[1].trim();
        if (servesMatch) result.metadata.serves = servesMatch[1].trim();
        if (difficultyMatch) result.metadata.difficulty = difficultyMatch[1].trim();

        return result;
    };

    const parsedContent = parseRecipeContent(recipe.recipeText);

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: recipe.recipeName,
                    text: recipe.recipeDesc,
                    url: window.location.href
                });
            } catch (error) {
                console.log('Error sharing:', error);
            }
        } else {
            navigator.clipboard.writeText(`${recipe.recipeName}\n\n${recipe.recipeText}`);
            alert('Recipe copied to clipboard!');
        }
    };

    return (
        <div className="recipe-detail-view">
            {/* Header with Back Button */}
            <div className="recipe-detail-view__header">
                <button className="recipe-detail-view__back-btn" onClick={onBack}>
                    <span className="recipe-detail-view__back-icon">←</span>
                    <span>Back to Recipes</span>
                </button>

                <div className="recipe-detail-view__header-actions">
                    <button
                        className="recipe-detail-view__action-btn recipe-detail-view__share-btn"
                        onClick={handleShare}
                    >
                        📤 Share
                    </button>
                    <button
                        className="recipe-detail-view__action-btn recipe-detail-view__delete-btn"
                        onClick={() => onDelete && onDelete(recipe)}
                    >
                        🗑️ Delete
                    </button>
                </div>
            </div>

            {/* Recipe Content */}
            <div className="recipe-detail-view__container">
                {/* Title Section */}
                <div className="recipe-detail-view__title-section">
                    <h1 className="recipe-detail-view__title">{recipe.recipeName}</h1>
                    <p className="recipe-detail-view__description">{recipe.recipeDesc}</p>

                    {/* Rating Section */}
                    <div className="recipe-detail-view__rating-section">
                        <div className="recipe-detail-view__average-rating">
                            <h3>📊 Recipe Rating</h3>
                            {isLoadingRating ? (
                                <div className="recipe-detail-view__rating-loading">Loading ratings...</div>
                            ) : (
                                <div className="recipe-detail-view__rating-display">
                                    <StarRating rating={Math.round(averageRating)} readOnly size="large" />
                                    <span className="recipe-detail-view__rating-value">
                                        {averageRating.toFixed(1)} / 5.0
                                    </span>
                                </div>
                            )}
                        </div>

                        {currentUserId && (
                            <div className="recipe-detail-view__user-rating">
                                <h4>
                                    {userRating > 0 ? `Your rating: ${userRating}/5` : 'Rate this recipe:'}
                                </h4>
                                <div className="recipe-detail-view__user-rating-controls">
                                    <StarRating
                                        rating={userRating}
                                        onRatingChange={handleUserRating}
                                        size="medium"
                                    />
                                    {userRating > 0 && (
                                        <button
                                            className="recipe-detail-view__remove-rating-btn"
                                            onClick={handleRemoveRating}
                                        >
                                            Remove Rating
                                        </button>
                                    )}
                                </div>
                                {userRating > 0 && (
                                    <p className="recipe-detail-view__rating-help-text">
                                        Click on stars to update your rating
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Recipe Card */}
                <div className="recipe-detail-view__recipe-card">
                    {/* Metadata Section */}
                    {(recipe.prepTime || recipe.difficulty || parsedContent.metadata.cookingTime || parsedContent.metadata.serves || parsedContent.metadata.difficulty) && (
                        <div className="recipe-detail-view__metadata">
                            <h3>📋 Recipe Details</h3>
                            <div className="recipe-detail-view__metadata-grid">
                                {/* Use prepTime from recipe object first, then parsed content */}
                                {(recipe.prepTime || parsedContent.metadata.cookingTime) && (
                                    <div className="recipe-detail-view__metadata-item">
                                        <span className="recipe-detail-view__metadata-icon">⏰</span>
                                        <span className="recipe-detail-view__metadata-label">Prep Time:</span>
                                        <span className="recipe-detail-view__metadata-value">
                                            {recipe.prepTime || parsedContent.metadata.cookingTime}
                                        </span>
                                    </div>
                                )}
                                {parsedContent.metadata.serves && (
                                    <div className="recipe-detail-view__metadata-item">
                                        <span className="recipe-detail-view__metadata-icon">🍽️</span>
                                        <span className="recipe-detail-view__metadata-label">Serves:</span>
                                        <span className="recipe-detail-view__metadata-value">{parsedContent.metadata.serves}</span>
                                    </div>
                                )}
                                {/* Use difficulty from recipe object first, then parsed content */}
                                {(recipe.difficulty || parsedContent.metadata.difficulty) && (
                                    <div className="recipe-detail-view__metadata-item">
                                        <span className="recipe-detail-view__metadata-icon">📊</span>
                                        <span className="recipe-detail-view__metadata-label">Difficulty:</span>
                                        <span className="recipe-detail-view__metadata-value">
                                            {recipe.difficulty || parsedContent.metadata.difficulty}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Instructions Section */}
                    {parsedContent.instructions.length > 0 ? (
                        <div className="recipe-detail-view__instructions">
                            <h3>👨‍🍳 Instructions</h3>
                            <div className="recipe-detail-view__instructions-list">
                                {parsedContent.instructions.map((instruction, index) => {
                                    const cleanInstruction = instruction
                                        .replace(/^\d+\.\s*/, '')
                                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                        .trim();

                                    return (
                                        <div key={index} className="recipe-detail-view__instruction-step">
                                            <span className="recipe-detail-view__step-number">{index + 1}</span>
                                            <span
                                                className="recipe-detail-view__step-text"
                                                dangerouslySetInnerHTML={{ __html: cleanInstruction }}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        // Fallback: Show raw content if no structured instructions found
                        <div className="recipe-detail-view__raw-content">
                            <h3>📝 Recipe Content</h3>
                            <div className={`recipe-detail-view__content-text ${
                                showFullContent ? 'expanded' : ''
                            }`}>
                                <pre className="recipe-detail-view__recipe-text">
                                    {recipe.recipeText}
                                </pre>
                            </div>
                            {recipe.recipeText && recipe.recipeText.length > 500 && (
                                <button
                                    className="recipe-detail-view__expand-btn"
                                    onClick={() => setShowFullContent(!showFullContent)}
                                >
                                    {showFullContent ? '📖 Show Less' : '📖 Show Full Recipe'}
                                </button>
                            )}
                        </div>
                    )}

                    {/* Tags Section */}
                    {recipe.tags && (
                        <div className="recipe-detail-view__tags">
                            <h4>🏷️ Tags:</h4>
                            <div className="recipe-detail-view__tags-list">
                                {(() => {
                                    // Handle both string and array cases
                                    let tagsArray;
                                    if (Array.isArray(recipe.tags)) {
                                        tagsArray = recipe.tags;
                                    } else if (typeof recipe.tags === 'string') {
                                        tagsArray = recipe.tags.split(',').map(tag => tag.trim());
                                    } else {
                                        tagsArray = [];
                                    }

                                    return tagsArray.map((tag, index) => (
                                        <span key={index} className="recipe-detail-view__tag">
                                            #{tag}
                                        </span>
                                    ));
                                })()}
                            </div>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="recipe-detail-view__actions">
                    <button
                        className="recipe-detail-view__print-btn"
                        onClick={() => window.print()}
                    >
                        🖨️ Print Recipe
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RecipeDetailView;