import React from 'react';
import { useNavigate } from 'react-router-dom';
import "./SavedRecipesPage.css";

const HomeButton = () => {
    const navigate = useNavigate();

    const handleGoHome = () => {
        navigate('/');
    };

    return (
        <button
            className="saved-recipes-page__home-btn"
            onClick={handleGoHome}
            data-tooltip="Back to Home"
        >
            <div className="saved-recipes-page__home-btn-content">
                <span className="saved-recipes-page__home-icon">🏠</span>
                <span className="saved-recipes-page__home-text">Home</span>
            </div>
            <div className="saved-recipes-page__home-btn-glow"></div>
            <div className="saved-recipes-page__home-btn-ripple"></div>
        </button>
    );
};

export default HomeButton;