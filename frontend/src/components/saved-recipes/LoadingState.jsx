import React from 'react';
import "./SavedRecipesPage.css";

const LoadingState = () => {
    return (
        <div className="saved-recipes-page__loading-container">
            <div className="saved-recipes-page__loading-animation">
                <div className="saved-recipes-page__cookbook-loading">
                    <div className="saved-recipes-page__book-cover"></div>
                    <div className="saved-recipes-page__book-pages"></div>
                    <div className="saved-recipes-page__loading-text">Opening your recipe collection...</div>
                </div>
            </div>
        </div>
    );
};

export default LoadingState;