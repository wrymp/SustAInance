import React from 'react';
import { useNavigate } from 'react-router-dom';
import './SavedRecipesPage.css';

const FloatingActionButton = () => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate('/recipe-generator');
    };

    return (
        <button
            className="saved-recipes-page__fab"
            onClick={handleClick}
            title="Create new recipe"
        >
            <span className="saved-recipes-page__fab-icon">✨</span>
            <span className="saved-recipes-page__fab-text">New Recipe</span>
        </button>
    );
};

export default FloatingActionButton;