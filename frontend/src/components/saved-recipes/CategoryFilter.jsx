import React from 'react';
import './SavedRecipesPage.css';

const CategoryFilter = ({ categories, selectedCategory, setSelectedCategory }) => {
    const handleCategoryClick = (categoryId) => {
        setSelectedCategory(categoryId);
    };

    return (
        <div className="saved-recipes-page__category-filter">
            <div className="saved-recipes-page__category-scroll">
                {categories.map((category) => (
                    <button
                        key={category.id}
                        className={`saved-recipes-page__category-btn ${
                            selectedCategory === category.id ? 'active' : ''
                        }`}
                        onClick={() => handleCategoryClick(category.id)}
                    >
                        <span className="saved-recipes-page__category-icon">{category.icon}</span>
                        <span className="saved-recipes-page__category-name">{category.name}</span>
                        <span className="saved-recipes-page__category-count">{category.count}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default CategoryFilter;