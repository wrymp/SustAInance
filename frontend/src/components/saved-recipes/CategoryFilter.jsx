import React from 'react';
import "./SavedRecipesPage.css";

const CategoryFilter = ({ categories, selectedCategory, setSelectedCategory }) => {
    return (
        <div className="saved-recipes-page__category-filter">
            <div className="saved-recipes-page__category-container">
                {categories.map((category) => (
                    <button
                        key={category.id}
                        className={`saved-recipes-page__category-pill ${selectedCategory === category.id ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(category.id)}
                    >
                        <span className="saved-recipes-page__category-icon">{category.icon}</span>
                        <span className="saved-recipes-page__category-name">{category.name}</span>
                        <span className="saved-recipes-page__category-count">{category.count}</span>
                        <div className="saved-recipes-page__pill-glow"></div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default CategoryFilter;