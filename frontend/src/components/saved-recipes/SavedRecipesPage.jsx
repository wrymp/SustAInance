import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchHeader from './SearchHeader';
import CategoryFilter from './CategoryFilter';
import RecipeGrid from './RecipeGrid';
import EmptyState from './EmptyState';
import FloatingActionButton from './FloatingActionButton';
import LoadingState from './LoadingState';
import './SavedRecipesPage.css';

const SavedRecipesPage = () => {
    const navigate = useNavigate();
    const [allRecipes, setAllRecipes] = useState([]);
    const [filteredRecipes, setFilteredRecipes] = useState([]);
    const [originalRecipes, setOriginalRecipes] = useState([]);
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

        if (typeof tags === 'object' && tags !== null) {
            return [];
        }

        return [];
    }

    const getIconForTag = (tag) => {
        const tagLower = tag.toLowerCase();

        if (['italian', 'pasta', 'pizza', 'lasagna', 'spaghetti'].includes(tagLower)) return '🍝';
        if (['seafood', 'fish', 'salmon', 'tuna', 'shrimp', 'crab', 'lobster'].includes(tagLower)) return '🐟';
        if (['dessert', 'cake', 'sweet', 'chocolate', 'cookie', 'pie', 'ice cream'].includes(tagLower)) return '🧁';
        if (['chinese', 'asian', 'japanese', 'korean', 'thai', 'sushi', 'ramen'].includes(tagLower)) return '🥢';
        if (['healthy', 'salad', 'vegetarian', 'vegan', 'diet', 'low-carb', 'keto'].includes(tagLower)) return '🥗';
        if (['mexican', 'spanish', 'latin', 'taco', 'burrito', 'quesadilla'].includes(tagLower)) return '🌮';
        if (['indian', 'curry', 'spicy', 'masala', 'tikka'].includes(tagLower)) return '🍛';
        if (['beef', 'steak', 'pork', 'lamb', 'meat', 'barbecue', 'bbq'].includes(tagLower)) return '🥩';
        if (['chicken', 'poultry', 'wings', 'breast'].includes(tagLower)) return '🍗';
        if (['breakfast', 'brunch', 'pancake', 'waffle', 'egg', 'omelet'].includes(tagLower)) return '🍳';
        if (['soup', 'broth', 'stew', 'chowder'].includes(tagLower)) return '🍲';
        if (['bread', 'baking', 'muffin', 'scone', 'roll'].includes(tagLower)) return '🍞';
        if (['drink', 'beverage', 'smoothie', 'juice', 'cocktail'].includes(tagLower)) return '🥤';
        if (['quick', 'easy', 'fast', '15-minute', '30-minute'].includes(tagLower)) return '⚡';
        if (['comfort', 'homemade', 'comfort-food', 'cozy'].includes(tagLower)) return '🏠';
        if (['holiday', 'christmas', 'thanksgiving', 'easter', 'birthday', 'party'].includes(tagLower)) return '🎉';

        return '🏷️';
    };

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
            tags: normalizeTags(apiRecipe.tags),
            originalTags: apiRecipe.tags,
            ingredients: extractIngredients(apiRecipe.recipeText),
            color: theme.color,
            gradient: theme.gradient,
            createdAt: apiRecipe.createdAt,
            lastCooked: null,
            recipeText: apiRecipe.recipeText
        };
    };

    const generateCategoriesFromRecipes = (recipes) => {
        const tagCounts = {};

        recipes.forEach(recipe => {
            const tags = normalizeTags(recipe.originalTags || recipe.tags);
            tags.forEach(tag => {
                if (tag && tag.length > 0) {
                    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                }
            });
        });

        const categories = [
            { id: 'all', name: 'All Recipes', icon: '🍽️', count: recipes.length }
        ];

        const sortedTags = Object.entries(tagCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 20);

        sortedTags.forEach(([tag, count]) => {
            categories.push({
                id: tag,
                name: tag.charAt(0).toUpperCase() + tag.slice(1),
                icon: getIconForTag(tag),
                count: count
            });
        });

        return categories;
    };

    const applyFilters = (recipes, searchTerm, selectedCategory, showFavoritesOnly, favorites) => {
        let filtered = [...recipes];

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

        if (selectedCategory !== 'all') {
            filtered = filtered.filter(recipe => {
                const tags = normalizeTags(recipe.originalTags || recipe.tags);
                return tags.includes(selectedCategory.toLowerCase());
            });
        }

        if (showFavoritesOnly) {
            filtered = filtered.filter(recipe => favorites.has(recipe.id));
        }

        return filtered;
    };

    const updateFilteredRecipes = () => {
        const filtered = applyFilters(allRecipes, searchTerm, selectedCategory, showFavoritesOnly, favorites);
        setFilteredRecipes(filtered);
    };

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

    const loadRecipes = async () => {
        try {
            setLoading(true);
            setError(null);

            const apiRecipes = await getUserRecipes();
            const transformedRecipes = apiRecipes.map((recipe, index) =>
                transformRecipeForUI(recipe, index)
            );

            setOriginalRecipes(apiRecipes);
            setAllRecipes(transformedRecipes);
            setFilteredRecipes(transformedRecipes);

            const generatedCategories = generateCategoriesFromRecipes(transformedRecipes);
            setCategories(generatedCategories);

            const savedFavorites = localStorage.getItem('recipeFavorites');
            if (savedFavorites) {
                setFavorites(new Set(JSON.parse(savedFavorites)));
            }

        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRecipes();
    }, []);

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
                    // Navigate to the individual recipe page
                    navigate(`/recipe/${recipe.id}`);
                    break;
                case 'delete':
                    const recipeName = recipe.recipeName || recipe.title || 'this recipe';
                    const confirmed = window.confirm(
                        `🗑️ Delete Recipe?\n\nAre you sure you want to permanently delete "${recipeName}"?\n\nThis action cannot be undone and will remove the recipe from your saved collection.`
                    );

                    if (confirmed) {
                        await deleteRecipe(recipe.id);

                        const updatedRecipes = allRecipes.filter(r => r.id !== recipe.id);
                        setAllRecipes(updatedRecipes);
                        setOriginalRecipes(prev => prev.filter(r => r.id !== recipe.id));
                        setCategories(generateCategoriesFromRecipes(updatedRecipes));
                    }
                    break;
                case 'edit':
                    // Navigate to edit page or implement edit functionality
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
                    // Create the specific recipe URL
                    const recipeUrl = `${window.location.origin}/recipe/${recipe.id}`;

                    if (navigator.share) {
                        try {
                            await navigator.share({
                                title: `${recipe.recipeName || recipe.title} - Recipe`,
                                text: recipe.recipeDesc || recipe.description || 'Check out this delicious recipe!',
                                url: recipeUrl
                            });
                        } catch (shareError) {
                            if (shareError.name !== 'AbortError') {
                                console.error('Error sharing:', shareError);
                            }
                        }
                    } else {
                        // Fallback: copy recipe link to clipboard
                        try {
                            await navigator.clipboard.writeText(recipeUrl);
                            alert('Recipe link copied to clipboard!');
                        } catch (clipboardError) {
                            // Fallback: copy recipe text
                            const recipeText = `${recipe.recipeName || recipe.title}\n\n${recipe.recipeDesc || recipe.description}\n\n${recipe.recipeText}\n\nView recipe: ${recipeUrl}`;
                            navigator.clipboard.writeText(recipeText);
                            alert('Recipe details copied to clipboard!');
                        }
                    }
                    break;
                default:
                    break;
            }
        } catch (error) {
            console.error('Recipe action error:', error);
            setError(error.message);
        }
    };

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
                <div className="saved-recipes-page__magical-background">
                    <div className="saved-recipes-page__floating-particles"></div>
                    <div className="saved-recipes-page__gradient-orbs">
                        <div className="saved-recipes-page__orb saved-recipes-page__orb-1"></div>
                        <div className="saved-recipes-page__orb saved-recipes-page__orb-2"></div>
                        <div className="saved-recipes-page__orb saved-recipes-page__orb-3"></div>
                    </div>
                </div>

                <SearchHeader
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    showFavoritesOnly={showFavoritesOnly}
                    setShowFavoritesOnly={setShowFavoritesOnly}
                    totalRecipes={allRecipes.length}
                    totalFavorites={favorites.size}
                    totalCategories={categories.length - 1}
                />

                <CategoryFilter
                    categories={categories}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                />

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

                <FloatingActionButton />
            </div>
        </div>
    );
};

export default SavedRecipesPage;