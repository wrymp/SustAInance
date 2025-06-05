import React from 'react';
import "./SavedRecipesPage.css";

const RecipeCard = ({
                        recipe,
                        index,
                        isFavorite,
                        onToggleFavorite,
                        onRecipeAction
                    }) => {
    const getDifficultyColor = (difficulty) => {
        switch (difficulty.toLowerCase()) {
            case 'easy': return 'text-green-600';
            case 'medium': return 'text-yellow-600';
            case 'hard': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    return (
        <div
            className={`saved-recipes-page__recipe-card ${isFavorite ? 'is-favorite' : ''}`}
            style={{
                '--card-gradient': recipe.gradient,
                '--card-color': recipe.color,
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
                    {recipe.category === 'italian' && '🍝'}
                    {recipe.category === 'seafood' && '🐟'}
                    {recipe.category === 'desserts' && '🧁'}
                    {recipe.category === 'healthy' && '🥗'}
                    {recipe.category === 'asian' && '🥢'}
                    {!['italian', 'seafood', 'desserts', 'healthy', 'asian'].includes(recipe.category) && '🍽️'}
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
                <h3 className="saved-recipes-page__recipe-title">{recipe.title}</h3>
                <p className="saved-recipes-page__recipe-description">{recipe.description}</p>

                <div className="saved-recipes-page__recipe-meta">
                    <div className="saved-recipes-page__meta-item">
                        <span className="saved-recipes-page__meta-icon">⏱️</span>
                        <span className="saved-recipes-page__meta-text">{recipe.time}</span>
                    </div>
                    <div className={`saved-recipes-page__meta-item ${getDifficultyColor(recipe.difficulty)}`}>
                        <span className="saved-recipes-page__meta-icon">📊</span>
                        <span className="saved-recipes-page__meta-text">{recipe.difficulty}</span>
                    </div>
                    <div className="saved-recipes-page__meta-item rating">
                        <span className="saved-recipes-page__meta-icon">⭐</span>
                        <span className="saved-recipes-page__meta-text">{recipe.rating}</span>
                    </div>
                </div>

                <div className="saved-recipes-page__recipe-tags">
                    {recipe.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="saved-recipes-page__tag">#{tag}</span>
                    ))}
                </div>
            </div>

            <div className="saved-recipes-page__card-footer">
                <div className="saved-recipes-page__action-buttons">
                    <button
                        className="saved-recipes-page__action-btn saved-recipes-page__edit-btn"
                        data-tooltip="Edit Recipe"
                        onClick={() => onRecipeAction('edit', recipe)}
                    >
                        <span className="saved-recipes-page__btn-icon">✏️</span>
                    </button>
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