import React, { useState, useEffect } from 'react';
import SearchHeader from './SearchHeader';
import CategoryFilter from './CategoryFilter';
import RecipeGrid from './RecipeGrid';
import EmptyState from './EmptyState';
import FloatingActionButton from './FloatingActionButton';
import LoadingState from './LoadingState';
import './SavedRecipesPage.css';

const SavedRecipesPage = () => {
    const [recipes, setRecipes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
    const [loading, setLoading] = useState(true);
    const [favorites, setFavorites] = useState(new Set([1, 3]));

    // Mock data
    const mockRecipes = [
        {
            id: 1,
            title: "Truffle Mushroom Risotto",
            description: "Creamy arborio rice with wild mushrooms and truffle oil",
            category: "italian",
            difficulty: "Medium",
            time: "45 min",
            rating: 4.9,
            tags: ["comfort", "gourmet", "vegetarian"],
            ingredients: ["arborio rice", "mushrooms", "truffle oil", "parmesan", "white wine"],
            color: "#FF6B6B",
            gradient: "linear-gradient(135deg, #FF6B6B 0%, #FFE66D 100%)",
            createdAt: "2024-01-15T10:30:00Z",
            lastCooked: "2024-01-10T18:00:00Z"
        },
        {
            id: 2,
            title: "Himalayan Pink Salt Salmon",
            description: "Perfectly grilled salmon with exotic spices and herbs",
            category: "seafood",
            difficulty: "Easy",
            time: "25 min",
            rating: 4.8,
            tags: ["healthy", "protein", "gourmet"],
            ingredients: ["salmon", "himalayan salt", "dill", "lemon", "olive oil"],
            color: "#4ECDC4",
            gradient: "linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)",
            createdAt: "2024-01-14T14:20:00Z",
            lastCooked: "2024-01-12T19:30:00Z"
        },
        {
            id: 3,
            title: "Lavender Honey Cheesecake",
            description: "Ethereal dessert with floral notes and silky texture",
            category: "desserts",
            difficulty: "Hard",
            time: "4 hours",
            rating: 5.0,
            tags: ["dessert", "special", "floral"],
            ingredients: ["cream cheese", "lavender", "honey", "graham crackers", "vanilla"],
            color: "#A8E6CF",
            gradient: "linear-gradient(135deg, #A8E6CF 0%, #DDBDF1 100%)",
            createdAt: "2024-01-13T09:15:00Z",
            lastCooked: null
        },
        {
            id: 4,
            title: "Spicy Korean Bibimbap",
            description: "Colorful mixed rice bowl with vegetables and gochujang",
            category: "asian",
            difficulty: "Medium",
            time: "35 min",
            rating: 4.7,
            tags: ["spicy", "healthy", "colorful"],
            ingredients: ["rice", "mixed vegetables", "gochujang", "sesame oil", "egg"],
            color: "#FF8A80",
            gradient: "linear-gradient(135deg, #FF8A80 0%, #FFD54F 100%)",
            createdAt: "2024-01-12T12:15:00Z",
            lastCooked: "2024-01-11T19:00:00Z"
        },
        {
            id: 5,
            title: "Mediterranean Quinoa Bowl",
            description: "Fresh and nutritious bowl with Mediterranean flavors",
            category: "healthy",
            difficulty: "Easy",
            time: "20 min",
            rating: 4.6,
            tags: ["healthy", "fresh", "mediterranean"],
            ingredients: ["quinoa", "cucumber", "tomatoes", "feta", "olive oil"],
            color: "#81C784",
            gradient: "linear-gradient(135deg, #81C784 0%, #AED581 100%)",
            createdAt: "2024-01-11T08:30:00Z",
            lastCooked: "2024-01-10T13:00:00Z"
        }
    ];

    const categories = [
        { id: 'all', name: 'All Recipes', icon: '🍽️', count: mockRecipes.length },
        { id: 'italian', name: 'Italian', icon: '🍝', count: 1 },
        { id: 'seafood', name: 'Seafood', icon: '🐟', count: 1 },
        { id: 'desserts', name: 'Desserts', icon: '🧁', count: 1 },
        { id: 'asian', name: 'Asian', icon: '🥢', count: 1 },
        { id: 'healthy', name: 'Healthy', icon: '🥗', count: 1 }
    ];

    useEffect(() => {
        setTimeout(() => {
            setRecipes(mockRecipes);
            setLoading(false);
        }, 1500);
    }, []);

    const filteredRecipes = recipes.filter(recipe => {
        const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            recipe.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            recipe.ingredients.some(ing => ing.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesCategory = selectedCategory === 'all' || recipe.category === selectedCategory;
        const matchesFavorites = !showFavoritesOnly || favorites.has(recipe.id);

        return matchesSearch && matchesCategory && matchesFavorites;
    });

    const toggleFavorite = (recipeId) => {
        setFavorites(prev => {
            const newFavorites = new Set(prev);
            if (newFavorites.has(recipeId)) {
                newFavorites.delete(recipeId);
            } else {
                newFavorites.add(recipeId);
            }
            return newFavorites;
        });
    };

    const handleRecipeAction = (action, recipe) => {
        console.log(`${action} recipe:`, recipe);
    };

    if (loading) {
        return (
            <div className="saved-recipes-page">
                <LoadingState />
            </div>
        );
    }

    return (
        <div className="saved-recipes-page">
            <div className="saved-recipes-page__container">
                {/* Magical Background */}
                <div className="saved-recipes-page__magical-background">
                    <div className="saved-recipes-page__floating-particles"></div>
                    <div className="saved-recipes-page__gradient-orbs">
                        <div className="saved-recipes-page__orb saved-recipes-page__orb-1"></div>
                        <div className="saved-recipes-page__orb saved-recipes-page__orb-2"></div>
                        <div className="saved-recipes-page__orb saved-recipes-page__orb-3"></div>
                    </div>
                </div>

                {/* Header */}
                <SearchHeader
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    showFavoritesOnly={showFavoritesOnly}
                    setShowFavoritesOnly={setShowFavoritesOnly}
                    totalRecipes={recipes.length}
                    totalFavorites={favorites.size}
                    totalCategories={categories.length - 1}
                />

                {/* Category Filter */}
                <CategoryFilter
                    categories={categories}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                />

                {/* Main Content */}
                <main className="saved-recipes-page__main-content">
                    {filteredRecipes.length === 0 ? (
                        <EmptyState
                            searchTerm={searchTerm}
                            selectedCategory={selectedCategory}
                            showFavoritesOnly={showFavoritesOnly}
                            categories={categories}
                        />
                    ) : (
                        <RecipeGrid
                            recipes={filteredRecipes}
                            favorites={favorites}
                            onToggleFavorite={toggleFavorite}
                            onRecipeAction={handleRecipeAction}
                        />
                    )}
                </main>

                {/* Floating Action Button */}
                <FloatingActionButton />
            </div>
        </div>
    );
};

export default SavedRecipesPage;