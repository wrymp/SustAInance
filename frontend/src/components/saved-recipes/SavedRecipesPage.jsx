import React, { useState, useEffect } from 'react';
import SearchHeader from './SearchHeader';
import CategoryFilter from './CategoryFilter';
import RecipeGrid from './RecipeGrid';
import EmptyState from './EmptyState';
import FloatingActionButton from './FloatingActionButton';
import LoadingState from './LoadingState';
import RecipeDetailView from '../recipeDetail/RecipeDetailView';
import './SavedRecipesPage.css';

const SavedRecipesPage = () => {
    const [allRecipes, setAllRecipes] = useState([]);
    const [filteredRecipes, setFilteredRecipes] = useState([]);
    const [originalRecipes, setOriginalRecipes] = useState([]);
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [favorites, setFavorites] = useState(new Set());
    const [categories, setCategories] = useState([
        { id: 'all', name: 'All Recipes', icon: '🍽️', count: 0 }
    ]);

    const API_BASE_URL = 'http://localhost:9097/api';

    const RECIPE_THEMES = [
        { color: "#FF6B6B", gradient: "linear-gradient(135deg, #FF6B6B 0%, #FFE66D 100%)" },
        { color: "#4ECDC4", gradient: "linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)" },
        { color: "#A8E6CF", gradient: "linear-gradient(135deg, #A8E6CF 0%, #DDBDF1 100%)" },
        { color: "#FF8A80", gradient: "linear-gradient(135deg, #FF8A80 0%, #FFD54F 100%)" },
        { color: "#81C784", gradient: "linear-gradient(135deg, #81C784 0%, #AED581 100%)" },
        { color: "#64B5F6", gradient: "linear-gradient(135deg, #64B5F6 0%, #90CAF9 100%)" },
        { color: "#FFB74D", gradient: "linear-gradient(135deg, #FFB74D 0%, #FFCC02 100%)" },
        { color: "#F06292", gradient: "linear-gradient(135deg, #F06292 0%, #FF80AB 100%)" }
    ];

    // Get current user from session
    const getCurrentUser = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/me`, {
                method: 'GET',
                credentials: 'include',
            });
            if (response.ok) {
                const user = await response.json();
                return user.uuid;
            }
        } catch (error) {
            console.error('Error getting current user:', error);
        }
        return null;
    };

    function normalizeTags(tags) {
        console.log("typeof tags:", typeof tags);
        console.log("tags:", tags);

        if (typeof tags === 'string') {
            return tags
                .split(',')
                .map(tag => tag.trim().toLowerCase())
                .filter(tag => tag.length > 0);
        }

        if (Array.isArray(tags)) {
            return tags
                .map(tag => tag.trim().toLowerCase())
                .filter(tag => tag.length > 0);
        }

        // If it's an object, log its structure
        if (typeof tags === 'object' && tags !== null) {
            console.warn("Received object for tags, expected string or array:", tags);
            return [];
        }

        // Default fallback
        return [];
    }


    // 🔥 Get icon for tag based on content
    const getIconForTag = (tag) => {
        const tagLower = tag.toLowerCase();

        // Italian/Pasta
        if (['italian', 'pasta', 'pizza', 'lasagna', 'spaghetti'].includes(tagLower)) return '🍝';

        // Seafood
        if (['seafood', 'fish', 'salmon', 'tuna', 'shrimp', 'crab', 'lobster'].includes(tagLower)) return '🐟';

        // Desserts
        if (['dessert', 'cake', 'sweet', 'chocolate', 'cookie', 'pie', 'ice cream'].includes(tagLower)) return '🧁';

        // Asian
        if (['chinese', 'asian', 'japanese', 'korean', 'thai', 'sushi', 'ramen'].includes(tagLower)) return '🥢';

        // Healthy
        if (['healthy', 'salad', 'vegetarian', 'vegan', 'diet', 'low-carb', 'keto'].includes(tagLower)) return '🥗';

        // Mexican
        if (['mexican', 'spanish', 'latin', 'taco', 'burrito', 'quesadilla'].includes(tagLower)) return '🌮';

        // Indian
        if (['indian', 'curry', 'spicy', 'masala', 'tikka'].includes(tagLower)) return '🍛';

        // Meat
        if (['beef', 'steak', 'pork', 'lamb', 'meat', 'barbecue', 'bbq'].includes(tagLower)) return '🥩';

        // Chicken
        if (['chicken', 'poultry', 'wings', 'breast'].includes(tagLower)) return '🍗';

        // Breakfast
        if (['breakfast', 'brunch', 'pancake', 'waffle', 'egg', 'omelet'].includes(tagLower)) return '🍳';

        // Soup
        if (['soup', 'broth', 'stew', 'chowder'].includes(tagLower)) return '🍲';

        // Bread/Baking
        if (['bread', 'baking', 'muffin', 'scone', 'roll'].includes(tagLower)) return '🍞';

        // Drinks
        if (['drink', 'beverage', 'smoothie', 'juice', 'cocktail'].includes(tagLower)) return '🥤';

        // Quick/Easy
        if (['quick', 'easy', 'fast', '15-minute', '30-minute'].includes(tagLower)) return '⚡';

        // Comfort food
        if (['comfort', 'homemade', 'comfort-food', 'cozy'].includes(tagLower)) return '🏠';

        // Holiday/Special
        if (['holiday', 'christmas', 'thanksgiving', 'easter', 'birthday', 'party'].includes(tagLower)) return '🎉';

        // Default
        return '🏷️';
    };

    // Extract basic ingredients from recipe text
    const extractIngredients = (recipeText) => {
        if (!recipeText) return [];

        const ingredientPatterns = [
            /(\d+(?:\.\d+)?\s*(?:cup|cups|tbsp|tsp|lb|lbs|oz|g|kg|ml|l)\s+[^,\n]+)/gi,
            /(\d+\s+[^,\n]+(?:onion|garlic|chicken|beef|flour|sugar|salt|pepper)[^,\n]*)/gi,
            /([^,\n]*(?:oil|butter|milk|cream|cheese|egg)[^,\n]*)/gi
        ];

        const ingredients = new Set();

        ingredientPatterns.forEach(pattern => {
            const matches = recipeText.match(pattern);
            if (matches) {
                matches.forEach(match => {
                    const cleaned = match.trim().toLowerCase();
                    if (cleaned.length > 3 && cleaned.length < 50) {
                        ingredients.add(cleaned);
                    }
                });
            }
        });

        if (ingredients.size === 0) {
            return ['various ingredients'];
        }

        return Array.from(ingredients).slice(0, 5);
    };

    // Transform API recipe to UI format
    const transformRecipeForUI = (apiRecipe, index = 0) => {
        const theme = RECIPE_THEMES[index % RECIPE_THEMES.length];

        return {
            id: apiRecipe.id,
            title: apiRecipe.recipeName,
            recipeName: apiRecipe.recipeName,
            description: apiRecipe.recipeDesc || 'Delicious recipe',
            recipeDesc: apiRecipe.recipeDesc || 'Delicious recipe',
            difficulty: apiRecipe.difficulty,
            time: apiRecipe.prepTime,
            prepTime: apiRecipe.prepTime,
            tags: normalizeTags(apiRecipe.tags), // 🔥 Normalize tags
            originalTags: apiRecipe.tags, // 🔥 Keep original for reference
            ingredients: extractIngredients(apiRecipe.recipeText),
            color: theme.color,
            gradient: theme.gradient,
            createdAt: apiRecipe.createdAt,
            lastCooked: null,
            recipeText: apiRecipe.recipeText
        };
    };

    // Create a recipe object compatible with RecipeDetailView
    const getRecipeForDetailView = (recipe) => {
        const originalRecipe = originalRecipes.find(r => r.id === recipe.id);
        return {
            id: recipe.id,
            recipeName: recipe.recipeName || recipe.title,
            recipeDesc: recipe.recipeDesc || recipe.description,
            recipeText: recipe.recipeText,
            tags: originalRecipe?.tags || recipe.originalTags,
            difficulty: recipe.difficulty,
            prepTime: recipe.prepTime || recipe.time,
            ...recipe
        };
    };

    // 🔥 Generate categories from actual recipe tags
    const generateCategoriesFromRecipes = (recipes) => {
        const tagCounts = {};

        // Collect all tags and count their occurrences
        recipes.forEach(recipe => {
            const tags = normalizeTags(recipe.originalTags || recipe.tags);
            tags.forEach(tag => {
                if (tag && tag.length > 0) {
                    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                }
            });
        });

        // Create categories array starting with "All"
        const categories = [
            { id: 'all', name: 'All Recipes', icon: '🍽️', count: recipes.length }
        ];

        // Sort tags by count (most popular first) and add to categories
        const sortedTags = Object.entries(tagCounts)
            .sort(([,a], [,b]) => b - a) // Sort by count descending
            .slice(0, 20); // Limit to top 20 tags to avoid clutter

        sortedTags.forEach(([tag, count]) => {
            categories.push({
                id: tag,
                name: tag.charAt(0).toUpperCase() + tag.slice(1), // Capitalize first letter
                icon: getIconForTag(tag),
                count: count
            });
        });

        return categories;
    };

    // 🔥 Updated LOCAL FILTERING LOGIC to work with actual tags
    const applyFilters = (recipes, searchTerm, selectedCategory, showFavoritesOnly, favorites) => {
        let filtered = [...recipes];

        // Apply search filter
        if (searchTerm.trim()) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(recipe => {
                const nameMatch = (recipe.recipeName || recipe.title || '').toLowerCase().includes(searchLower);
                const descMatch = (recipe.recipeDesc || recipe.description || '').toLowerCase().includes(searchLower);
                const tagsMatch = recipe.tags && recipe.tags.some(tag =>
                    tag.toLowerCase().includes(searchLower)
                );
                const ingredientsMatch = recipe.ingredients && recipe.ingredients.some(ing =>
                    ing.toLowerCase().includes(searchLower)
                );
                const difficultyMatch = (recipe.difficulty || '').toLowerCase().includes(searchLower);

                return nameMatch || descMatch || tagsMatch || ingredientsMatch || difficultyMatch;
            });
        }

        // Apply tag/category filter
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(recipe => {
                const tags = normalizeTags(recipe.originalTags || recipe.tags);
                return tags.includes(selectedCategory.toLowerCase());
            });
        }

        // Apply favorites filter
        if (showFavoritesOnly) {
            filtered = filtered.filter(recipe => favorites.has(recipe.id));
        }

        return filtered;
    };

    // Update filtered recipes when filters change
    const updateFilteredRecipes = () => {
        const filtered = applyFilters(allRecipes, searchTerm, selectedCategory, showFavoritesOnly, favorites);
        setFilteredRecipes(filtered);
    };

    // API Functions (Only keep essential ones)
    const getUserRecipes = async () => {
        const userId = await getCurrentUser();
        if (!userId) throw new Error('User not authenticated');

        const response = await fetch(`${API_BASE_URL}/recipeSaver/user/${userId}`, {
            method: 'GET',
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error('Failed to fetch recipes');
        }

        return await response.json();
    };

    const deleteRecipe = async (recipeId) => {
        const userId = await getCurrentUser();
        if (!userId) throw new Error('User not authenticated');

        const response = await fetch(`${API_BASE_URL}/recipeSaver/${recipeId}?userId=${userId}`, {
            method: 'DELETE',
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error('Failed to delete recipe');
        }

        return response.text();
    };

    const saveRecipe = async (recipeData) => {
        const userId = await getCurrentUser();
        if (!userId) throw new Error('User not authenticated');

        const response = await fetch(`${API_BASE_URL}/recipeSaver/save`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                ...recipeData,
                userId: userId
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to save recipe');
        }

        return await response.json();
    };

    // Load recipes from API (only called once)
    const loadRecipes = async () => {
        try {
            setLoading(true);
            setError(null);

            const apiRecipes = await getUserRecipes();
            console.log('Raw API recipes:', apiRecipes); // 🔥 Debug log

            const transformedRecipes = apiRecipes.map((recipe, index) =>
                transformRecipeForUI(recipe, index)
            );

            console.log('Transformed recipes:', transformedRecipes); // 🔥 Debug log

            setOriginalRecipes(apiRecipes);
            setAllRecipes(transformedRecipes);
            setFilteredRecipes(transformedRecipes);

            // 🔥 Generate categories from actual tags
            const generatedCategories = generateCategoriesFromRecipes(transformedRecipes);
            console.log('Generated categories:', generatedCategories); // 🔥 Debug log
            setCategories(generatedCategories);

            // Load favorites from localStorage
            const savedFavorites = localStorage.getItem('recipeFavorites');
            if (savedFavorites) {
                setFavorites(new Set(JSON.parse(savedFavorites)));
            }

        } catch (error) {
            console.error('Error loading recipes:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Initial load
    useEffect(() => {
        loadRecipes();
    }, []);

    // Apply filters whenever any filter state changes
    useEffect(() => {
        updateFilteredRecipes();
    }, [searchTerm, selectedCategory, showFavoritesOnly, favorites, allRecipes]);

    const toggleFavorite = (recipeId) => {
        setFavorites(prev => {
            const newFavorites = new Set(prev);
            if (newFavorites.has(recipeId)) {
                newFavorites.delete(recipeId);
            } else {
                newFavorites.add(recipeId);
            }

            localStorage.setItem('recipeFavorites', JSON.stringify([...newFavorites]));
            return newFavorites;
        });
    };

    const handleRecipeAction = async (action, recipe) => {
        try {
            switch (action) {
                case 'view':
                    const detailRecipe = getRecipeForDetailView(recipe);
                    setSelectedRecipe(detailRecipe);
                    break;
                case 'delete':
                    if (window.confirm(`Are you sure you want to delete "${recipe.recipeName || recipe.title}"?`)) {
                        await deleteRecipe(recipe.id);

                        if (selectedRecipe && selectedRecipe.id === recipe.id) {
                            setSelectedRecipe(null);
                        }

                        // Remove from local state and regenerate categories
                        const updatedRecipes = allRecipes.filter(r => r.id !== recipe.id);
                        setAllRecipes(updatedRecipes);
                        setOriginalRecipes(prev => prev.filter(r => r.id !== recipe.id));
                        setCategories(generateCategoriesFromRecipes(updatedRecipes));
                    }
                    break;
                case 'edit':
                    console.log('Edit recipe:', recipe);
                    break;
                case 'duplicate':
                    const originalRecipe = originalRecipes.find(r => r.id === recipe.id);
                    if (originalRecipe) {
                        const duplicateData = {
                            recipeName: `${originalRecipe.recipeName} (Copy)`,
                            recipeDesc: originalRecipe.recipeDesc,
                            recipeText: originalRecipe.recipeText,
                            tags: originalRecipe.tags,
                            prepTime: originalRecipe.prepTime,
                            difficulty: originalRecipe.difficulty
                        };
                        const savedRecipe = await saveRecipe(duplicateData);

                        const newRecipe = transformRecipeForUI(savedRecipe, allRecipes.length);
                        const updatedRecipes = [...allRecipes, newRecipe];
                        setAllRecipes(updatedRecipes);
                        setOriginalRecipes(prev => [...prev, savedRecipe]);
                        setCategories(generateCategoriesFromRecipes(updatedRecipes));
                    }
                    break;
                case 'share':
                    if (navigator.share) {
                        try {
                            await navigator.share({
                                title: recipe.recipeName || recipe.title,
                                text: recipe.recipeDesc || recipe.description,
                                url: window.location.href
                            });
                        } catch (shareError) {
                            console.log('Error sharing:', shareError);
                        }
                    } else {
                        const recipeText = `${recipe.recipeName || recipe.title}\n\n${recipe.recipeDesc || recipe.description}\n\n${recipe.recipeText}`;
                        navigator.clipboard.writeText(recipeText);
                        alert('Recipe copied to clipboard!');
                    }
                    break;
                default:
                    console.log(`${action} recipe:`, recipe);
            }
        } catch (error) {
            console.error(`Error ${action} recipe:`, error);
            setError(error.message);
        }
    };

    const handleBackToList = () => {
        setSelectedRecipe(null);
    };

    // Show RecipeDetailView if a recipe is selected
    if (selectedRecipe) {
        return (
            <RecipeDetailView
                recipe={selectedRecipe}
                onBack={handleBackToList}
                onEdit={(recipe) => handleRecipeAction('edit', recipe)}
                onDelete={(recipe) => handleRecipeAction('delete', recipe)}
            />
        );
    }

    if (loading && allRecipes.length === 0) {
        return (
            <div className="saved-recipes-page">
                <LoadingState />
            </div>
        );
    }

    if (error) {
        return (
            <div className="saved-recipes-page">
                <div className="saved-recipes-page__container">
                    <div className="error-state">
                        <h2>Error Loading Recipes</h2>
                        <p>{error}</p>
                        <button onClick={loadRecipes} className="retry-button">
                            Try Again
                        </button>
                    </div>
                </div>
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
                    totalRecipes={allRecipes.length}
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