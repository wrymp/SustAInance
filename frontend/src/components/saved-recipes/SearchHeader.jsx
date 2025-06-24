import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SavedRecipesPage.css';

const SearchHeader = ({
                          searchTerm,
                          setSearchTerm,
                          showFavoritesOnly,
                          setShowFavoritesOnly,
                          totalRecipes,
                          totalFavorites,
                          totalCategories
                      }) => {
    const [showStats, setShowStats] = useState(false);
    const navigate = useNavigate();

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleFavoritesToggle = () => {
        setShowFavoritesOnly(!showFavoritesOnly);
    };

    const clearSearch = () => {
        setSearchTerm('');
    };

    const handleBackToHome = () => {
        navigate('/');
    };

    return (
        <header className="saved-recipes-page__header">
            <div className="saved-recipes-page__header-content">
                {/* Back Button */}
                <div className="saved-recipes-page__header-top">
                    <button
                        className="saved-recipes-page__back-btn"
                        onClick={handleBackToHome}
                        title="Back to Home"
                    >
                        <span className="saved-recipes-page__back-icon">←</span>
                        <span className="saved-recipes-page__back-text">Back to Home</span>
                    </button>
                </div>

                {/* Title Section */}
                <div className="saved-recipes-page__title-section">
                    <h1 className="saved-recipes-page__title">
                        <span className="saved-recipes-page__title-icon">👨‍🍳</span>
                        My Recipe Collection
                    </h1>
                    <p className="saved-recipes-page__subtitle">
                        Discover and organize your favorite recipes
                    </p>
                </div>

                {/* Search and Controls */}
                <div className="saved-recipes-page__controls">
                    {/* Search Bar */}
                    <div className="saved-recipes-page__search-container">
                        <div className="saved-recipes-page__search-wrapper">
                            <span className="saved-recipes-page__search-icon">🔍</span>
                            <input
                                type="text"
                                className="saved-recipes-page__search-input"
                                placeholder="Search recipes, ingredients, or tags..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                            {searchTerm && (
                                <button
                                    className="saved-recipes-page__clear-search"
                                    onClick={clearSearch}
                                    title="Clear search"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="saved-recipes-page__header-actions">
                        {/* Favorites Toggle */}
                        <button
                            className={`saved-recipes-page__favorites-toggle ${
                                showFavoritesOnly ? 'active' : ''
                            }`}
                            onClick={handleFavoritesToggle}
                            title={showFavoritesOnly ? 'Show all recipes' : 'Show favorites only'}
                        >
                            <span className="saved-recipes-page__favorites-icon">
                                {showFavoritesOnly ? '💖' : '🤍'}
                            </span>
                            <span className="saved-recipes-page__favorites-text">
                                {showFavoritesOnly ? 'Favorites' : 'All'}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Stats Panel */}
                {showStats && (
                    <div className="saved-recipes-page__stats-panel">
                        <div className="saved-recipes-page__stats-grid">
                            <div className="saved-recipes-page__stat-item">
                                <span className="saved-recipes-page__stat-icon">📚</span>
                                <span className="saved-recipes-page__stat-value">{totalRecipes}</span>
                                <span className="saved-recipes-page__stat-label">Total Recipes</span>
                            </div>
                            <div className="saved-recipes-page__stat-item">
                                <span className="saved-recipes-page__stat-icon">💖</span>
                                <span className="saved-recipes-page__stat-value">{totalFavorites}</span>
                                <span className="saved-recipes-page__stat-label">Favorites</span>
                            </div>
                            <div className="saved-recipes-page__stat-item">
                                <span className="saved-recipes-page__stat-icon">🏷️</span>
                                <span className="saved-recipes-page__stat-value">{totalCategories}</span>
                                <span className="saved-recipes-page__stat-label">Categories</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Active Filters Display */}
                {(searchTerm || showFavoritesOnly) && (
                    <div className="saved-recipes-page__active-filters">
                        <span className="saved-recipes-page__filters-label">Active filters:</span>
                        {searchTerm && (
                            <span className="saved-recipes-page__filter-tag">
                                🔍 "{searchTerm}"
                                <button onClick={clearSearch} className="saved-recipes-page__filter-remove">✕</button>
                            </span>
                        )}
                        {showFavoritesOnly && (
                            <span className="saved-recipes-page__filter-tag">
                                💖 Favorites only
                                <button onClick={handleFavoritesToggle} className="saved-recipes-page__filter-remove">✕</button>
                            </span>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
};

export default SearchHeader;