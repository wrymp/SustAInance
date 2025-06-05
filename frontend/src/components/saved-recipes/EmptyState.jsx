import React from 'react';
import "./SavedRecipesPage.css";

const EmptyState = ({ searchTerm, selectedCategory, showFavoritesOnly, categories }) => {
    const getCategoryName = () => {
        if (selectedCategory === 'all') return 'any category';
        return categories.find(c => c.id === selectedCategory)?.name || 'this category';
    };

    const getEmptyMessage = () => {
        if (showFavoritesOnly && searchTerm) {
            return `No favorite recipes match "${searchTerm}"`;
        } else if (showFavoritesOnly) {
            return "No favorite recipes yet";
        } else if (searchTerm) {
            return `No recipes match "${searchTerm}" in ${getCategoryName()}`;
        } else {
            return 'Start building your culinary collection';
        }
    };

    const getEmptyIcon = () => {
        if (showFavoritesOnly) {
            return '💔';
        }
        return '📖';
    };

    const getEmptyTitle = () => {
        if (showFavoritesOnly) {
            return "No favorites found";
        }
        return "No recipes found";
    };

    return (
        <div className="saved-recipes-page__empty-state">
            <div className="saved-recipes-page__empty-animation">
                <div className="saved-recipes-page__empty-book">{getEmptyIcon()}</div>
                <div className="saved-recipes-page__floating-elements">
                    <span className="saved-recipes-page__float-1">✨</span>
                    <span className="saved-recipes-page__float-2">🍳</span>
                    <span className="saved-recipes-page__float-3">💫</span>
                </div>
            </div>
            <h3 className="saved-recipes-page__empty-title">{getEmptyTitle()}</h3>
            <p className="saved-recipes-page__empty-subtitle">{getEmptyMessage()}</p>

            {showFavoritesOnly ? (
                <p className="saved-recipes-page__empty-hint">
                    💡 Click the heart icon on recipes to add them to your favorites!
                </p>
            ) : (
                <button className="saved-recipes-page__create-recipe-btn">
                    <span className="saved-recipes-page__btn-glow"></span>
                    <span className="saved-recipes-page__btn-text">✨ Create Recipe</span>
                </button>
            )}
        </div>
    );
};

export default EmptyState;