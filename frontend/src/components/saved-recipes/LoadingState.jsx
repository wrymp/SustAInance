import React from 'react';
import './SavedRecipesPage.css';

const LoadingState = () => {
    return (
        <div className="saved-recipes-page__loading-state">
            <div className="saved-recipes-page__loading-animation">
                <div className="saved-recipes-page__loading-chef">👨‍🍳</div>
                <div className="saved-recipes-page__loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
            <h3 className="saved-recipes-page__loading-title">Loading your recipes...</h3>
            <p className="saved-recipes-page__loading-subtitle">Getting everything ready for you</p>
        </div>
    );
};

export default LoadingState;