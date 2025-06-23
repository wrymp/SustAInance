import React, { useState, useEffect } from 'react';
import "./SavedRecipesPage.css";

const StarRating = ({ rating, readOnly = true, size = 'small' }) => {
    const starSize = size === 'small' ? '14px' : size === 'large' ? '24px' : '18px';

    return (
        <div className={`star-rating star-rating--${size}`} style={{ fontSize: starSize }}>
            {[1, 2, 3, 4, 5].map((star) => (
                <span
                    key={star}
                    className={`star-rating__star ${
                        star <= rating ? 'star-rating__star--filled' : 'star-rating__star--empty'
                    }`}
                >
                    ⭐
                </span>
            ))}
        </div>
    );
};

const RecipeCard = ({
                        recipe,
                        index,
                        isFavorite,
                        onToggleFavorite,
                        onRecipeAction
                    }) => {
    const [averageRating, setAverageRating] = useState(0);
    const [isLoadingRating, setIsLoadingRating] = useState(true);

    const API_BASE_URL = 'http://localhost:9097/api';

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

    // Load rating when component mounts
    useEffect(() => {
        const loadRating = async () => {
            try {
                const rating = await getAverageRating(recipe.id);
                setAverageRating(rating || 0);
            } catch (error) {
                console.error('Error loading rating:', error);
                setAverageRating(0);
            } finally {
                setIsLoadingRating(false);
            }
        };

        if (recipe?.id) {
            loadRating();
        }
    }, [recipe?.id]);

    const getDifficultyColor = (difficulty) => {
        if (!difficulty) return 'text-gray-600';
        switch (difficulty.toLowerCase()) {
            case 'easy': return 'text-green-600';
            case 'medium': return 'text-yellow-600';
            case 'hard': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    // Extract category from tags if available
    const getRecipeCategory = () => {
        if (!recipe.tags) return 'general';

        // Handle both string and array cases
        let tagsString;
        if (Array.isArray(recipe.tags)) {
            tagsString = recipe.tags.join(' ').toLowerCase();
        } else if (typeof recipe.tags === 'string') {
            tagsString = recipe.tags.toLowerCase();
        } else {
            return 'general';
        }

        if (tagsString.includes('italian')) return 'italian';
        if (tagsString.includes('seafood') || tagsString.includes('fish')) return 'seafood';
        if (tagsString.includes('dessert') || tagsString.includes('sweet')) return 'desserts';
        if (tagsString.includes('healthy') || tagsString.includes('vegetarian')) return 'healthy';
        if (tagsString.includes('asian') || tagsString.includes('chinese') || tagsString.includes('japanese')) return 'asian';
        return 'general';
    };

    const category = getRecipeCategory();

    // Parse tags from string to array
    const getTagsArray = () => {
        if (!recipe.tags) return [];

        // Handle both string and array cases
        if (Array.isArray(recipe.tags)) {
            return recipe.tags.slice(0, 3);
        } else if (typeof recipe.tags === 'string') {
            return recipe.tags.split(',').map(tag => tag.trim()).slice(0, 3);
        }

        return [];
    };

    const tagsArray = getTagsArray();

    return (
        <div
            className={`saved-recipes-page__recipe-card ${isFavorite ? 'is-favorite' : ''}`}
            style={{
                '--card-gradient': recipe.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '--card-color': recipe.color || '#667eea',
                '--animation-delay': `${index * 0.1}s`
            }}
        >
            {/* Favorite Badge */}
            {isFavorite && (
                <div className="saved-recipes-page__favorite-badge">
                    <span className="saved-recipes-page__badge-icon">💖</span>
                    <span className="saved-recipes-page__badge-text">Favorite</span>
                </div>
            )}

            <div className="saved-recipes-page__card-background">
                <div className="saved-recipes-page__gradient-overlay"></div>
                <div className="saved-recipes-page__pattern-overlay"></div>
            </div>

            <div className="saved-recipes-page__card-header">
                <div className="saved-recipes-page__recipe-category">
                    {category === 'italian' && '🍝'}
                    {category === 'seafood' && '🐟'}
                    {category === 'desserts' && '🧁'}
                    {category === 'healthy' && '🥗'}
                    {category === 'asian' && '🥢'}
                    {category === 'general' && '🍽️'}
                </div>
                <button
                    className={`saved-recipes-page__favorite-btn ${isFavorite ? 'active' : ''}`}
                    onClick={() => onToggleFavorite(recipe.id)}
                >
                    <span className="saved-recipes-page__heart-icon">
                        {isFavorite ? '💖' : '🤍'}
                    </span>
                    <div className="saved-recipes-page__heart-particles">
                        <span className="saved-recipes-page__particle saved-recipes-page__particle-1">💖</span>
                        <span className="saved-recipes-page__particle saved-recipes-page__particle-2">✨</span>
                        <span className="saved-recipes-page__particle saved-recipes-page__particle-3">💫</span>
                        <span className="saved-recipes-page__particle saved-recipes-page__particle-4">💖</span>
                    </div>
                </button>
            </div>

            <div className="saved-recipes-page__card-content">
                <h3 className="saved-recipes-page__recipe-title">{recipe.recipeName || recipe.title}</h3>
                <p className="saved-recipes-page__recipe-description">{recipe.recipeDesc || recipe.description}</p>

                {/* Rating Display */}
                <div className="saved-recipes-page__recipe-rating">
                    {isLoadingRating ? (
                        <div className="saved-recipes-page__rating-loading">...</div>
                    ) : (
                        <div className="saved-recipes-page__rating-display">
                            <StarRating rating={Math.round(averageRating)} size="small" />
                            <span className="saved-recipes-page__rating-value">
                                {averageRating > 0 ? averageRating.toFixed(1) : 'No ratings'}
                            </span>
                        </div>
                    )}
                </div>

                <div className="saved-recipes-page__recipe-meta">
                    <div className="saved-recipes-page__meta-item">
                        <span className="saved-recipes-page__meta-icon">⏱️</span>
                        <span className="saved-recipes-page__meta-text">
                            {recipe.prepTime || recipe.time || 'N/A'}
                        </span>
                    </div>
                    <div className={`saved-recipes-page__meta-item ${getDifficultyColor(recipe.difficulty)}`}>
                        <span className="saved-recipes-page__meta-icon">📊</span>
                        <span className="saved-recipes-page__meta-text">
                            {recipe.difficulty || 'N/A'}
                        </span>
                    </div>
                </div>

                <div className="saved-recipes-page__recipe-tags">
                    {tagsArray.map((tag, tagIndex) => (
                        <span key={tagIndex} className="saved-recipes-page__tag">#{tag}</span>
                    ))}
                </div>
            </div>

            <div className="saved-recipes-page__card-footer">
                <div className="saved-recipes-page__action-buttons">
                    <button
                        className="saved-recipes-page__action-btn saved-recipes-page__remove-btn"
                        data-tooltip="Remove from Saved"
                        onClick={() => onRecipeAction('remove', recipe)}
                    >
                        <span className="saved-recipes-page__btn-icon">🗑️</span>
                    </button>
                    <button
                        className="saved-recipes-page__action-btn saved-recipes-page__share-btn"
                        data-tooltip="Share Recipe"
                        onClick={() => onRecipeAction('share', recipe)}
                    >
                        <span className="saved-recipes-page__btn-icon">📤</span>
                    </button>
                </div>

                <button
                    className="saved-recipes-page__view-recipe-btn"
                    onClick={() => onRecipeAction('view', recipe)}
                >
                    <span className="saved-recipes-page__btn-glow"></span>
                    <span className="saved-recipes-page__btn-text">👁️ View Recipe</span>
                </button>
            </div>

            <div className="saved-recipes-page__card-shimmer"></div>
        </div>
    );
};

export default RecipeCard;