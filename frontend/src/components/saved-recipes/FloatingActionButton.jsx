import React from 'react';
import {useNavigate} from "react-router-dom";
import "./SavedRecipesPage.css";

const FloatingActionButton = () => {
    const navigate = useNavigate();
    const handleAddRecipe = () => {
        navigate('/recipe-generator');
    };

    return (
        <div className="saved-recipes-page__fab-container">
            <button className="saved-recipes-page__fab" onClick={handleAddRecipe}>
                <span className="saved-recipes-page__fab-icon">➕</span>
                <span className="saved-recipes-page__fab-text">Add Recipe</span>
                <div className="saved-recipes-page__fab-ripple"></div>
            </button>
        </div>
    );
};

export default FloatingActionButton;