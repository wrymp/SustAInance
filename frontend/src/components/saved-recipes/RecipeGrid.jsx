import React from 'react';
import RecipeCard from './RecipeCard';
import "./SavedRecipesPage.css";

const RecipeGrid = ({
                        recipes,
                        favorites,
                        onToggleFavorite,
                        onRecipeAction
                    }) => {
    return (
        <div className="saved-recipes-page__recipes-grid">
            {recipes.map((recipe, index) => (
                <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    index={index}
                    isFavorite={favorites.has(recipe.id)}
                    onToggleFavorite={onToggleFavorite}
                    onRecipeAction={onRecipeAction}
                />
            ))}
        </div>
    );
};

export default RecipeGrid;