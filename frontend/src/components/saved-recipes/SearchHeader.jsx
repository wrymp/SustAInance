import React from 'react';
import HomeButton from './HomeButton'; // Add this import
import "./SavedRecipesPage.css";

const SearchHeader = ({
                          searchTerm,
                          setSearchTerm,
                          showFavoritesOnly,
                          setShowFavoritesOnly,
                          totalRecipes,
                          totalFavorites,
                          totalCategories
                      }) => {
    return (
        <header className="saved-recipes-page__header">
            <div className="saved-recipes-page__header-content">
                <div className="saved-recipes-page__title-section">
                    {/* Add Home Button here */}
                    <HomeButton />

                    <div className="saved-recipes-page__cookbook-icon">
                        <span className="saved-recipes-page__icon-3d">📚</span>
                    </div>
                    <div className="saved-recipes-page__title-text">
                        <h1 className="saved-recipes-page__main-title">Recipe Collection</h1>
                        <p className="saved-recipes-page__subtitle">
                            {showFavoritesOnly ? 'Your favorite recipes ❤️' : 'Your culinary masterpieces await'}
                        </p>
                        <div className="saved-recipes-page__stats-bar">
                            <span className="saved-recipes-page__stat">
                                <span className="saved-recipes-page__stat-number">{totalRecipes}</span>
                                <span className="saved-recipes-page__stat-label">Recipes</span>
                            </span>
                            <span className="saved-recipes-page__stat">
                                <span className="saved-recipes-page__stat-number">{totalFavorites}</span>
                                <span className="saved-recipes-page__stat-label">Favorites</span>
                            </span>
                            <span className="saved-recipes-page__stat">
                                <span className="saved-recipes-page__stat-number">{totalCategories}</span>
                                <span className="saved-recipes-page__stat-label">Categories</span>
                            </span>
                        </div>
                    </div>
                </div>

                <div className="saved-recipes-page__controls-section">
                    <div className="saved-recipes-page__search-container">
                        <div className="saved-recipes-page__search-box">
                            <span className="saved-recipes-page__search-icon">🔍</span>
                            <input
                                type="text"
                                placeholder={showFavoritesOnly ? "Search your favorites..." : "Search recipes, ingredients, or flavors..."}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="saved-recipes-page__search-input"
                            />
                            <div className="saved-recipes-page__search-glow"></div>
                        </div>
                    </div>

                    <div className="saved-recipes-page__extra-controls">
                        <button
                            className={`saved-recipes-page__favorites-toggle ${showFavoritesOnly ? 'active' : ''}`}
                            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                            data-tooltip={showFavoritesOnly ? "Show All Recipes" : "Show Only Favorites"}
                        >
                            <span className="saved-recipes-page__favorites-icon">
                                {showFavoritesOnly ? '💖' : '🤍'}
                            </span>
                            <span className="saved-recipes-page__favorites-text">
                                {showFavoritesOnly ? 'Favorites' : 'All'}
                            </span>
                            <div className="saved-recipes-page__favorites-glow"></div>
                        </button>

                        <button className="saved-recipes-page__filter-btn" data-tooltip="Advanced Filters">
                            <span className="saved-recipes-page__btn-icon">⚙️</span>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default SearchHeader;