import React, {useEffect, useState} from 'react';
import './ResultsStep.css';

const ResultsStep = ({
                         generatedRecipe,
                         isGenerating,
                         ingredients,
                         preferences,
                         onStartOver,
                         onSaveRecipe
                     }) => {
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [showFullRecipe, setShowFullRecipe] = useState(false);
    const [animationStep, setAnimationStep] = useState(0);

    // API Base URL
    const API_BASE_URL = 'http://localhost:9097/api';

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        if (generatedRecipe && !isGenerating) {
            window.scrollTo(0, 0);
        }
    }, [generatedRecipe, isGenerating]);

    // Animation sequence for loading
    useEffect(() => {
        if (isGenerating) {
            const steps = [
                "🔍 Analyzing your ingredients...",
                "🧠 Understanding your preferences...",
                "👨‍🍳 Consulting our AI chef...",
                "📝 Crafting your perfect recipe...",
                "✨ Adding final touches..."
            ];

            let currentStep = 0;
            const interval = setInterval(() => {
                setAnimationStep(currentStep);
                currentStep = (currentStep + 1) % steps.length;
            }, 1500);

            return () => clearInterval(interval);
        }
    }, [isGenerating]);

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

    // Extract prep time from AI response or preferences
    const extractPrepTime = (content, preferences) => {
        if (!content) return preferences.cookingTime ? `${preferences.cookingTime} min` : '30 min';

        // Look for prep time in the content
        const prepTimeMatch = content.match(/(?:Prep Time|Cooking Time|Total Time):\s*([^\n]+)/i);
        if (prepTimeMatch) {
            return prepTimeMatch[1].trim();
        }

        // Fallback to preferences
        return preferences.cookingTime ? `${preferences.cookingTime} min` : '30 min';
    };

    // Extract difficulty from AI response or preferences
    const extractDifficulty = (content, preferences) => {
        if (!content) return preferences.difficulty || 'Medium';

        // Look for difficulty in the content
        const difficultyMatch = content.match(/Difficulty:\s*([^\n]+)/i);
        if (difficultyMatch) {
            return difficultyMatch[1].trim();
        }

        // Fallback to preferences
        return preferences.difficulty || 'Medium';
    };

    // Save recipe to backend API
    const saveRecipeToAPI = async (recipeData) => {
        console.log('👤 Getting current user...');
        const userId = await getCurrentUser();

        if (!userId) {
            console.error('❌ No user ID found');
            throw new Error('User not authenticated');
        }

        console.log('✅ User ID:', userId);

        const payload = {
            ...recipeData,
            userId: userId
        };

        console.log('📤 Sending payload to API:', payload);
        console.log('🔗 API URL:', `${API_BASE_URL}/recipeSaver/save`);

        const response = await fetch(`${API_BASE_URL}/recipeSaver/save`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(payload),
        });

        console.log('📥 API Response status:', response.status);
        console.log('📥 API Response headers:', response.headers);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ API Error response:', errorText);
            throw new Error(`Failed to save recipe: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        console.log('✅ API Success response:', result);
        return result;
    };

    // ✨ Extract used ingredients from AI response
    const extractUsedIngredients = (content) => {
        if (!content) return [];

        console.log('🔍 Extracting used ingredients from content...');

        // Look for the JSON section at the end: USED_INGREDIENTS_JSON:[...]
        const jsonMatch = content.match(/USED_INGREDIENTS_JSON:(\[.*?])/s);
        if (jsonMatch) {
            try {
                const usedIngredients = JSON.parse(jsonMatch[1]);
                console.log('✅ Successfully parsed used ingredients:', usedIngredients);
                return usedIngredients;
            } catch (error) {
                console.error('❌ Error parsing used ingredients JSON:', error);
            }
        } else {
            console.log('⚠️ No USED_INGREDIENTS_JSON found in response');
        }

        // ✨ FALLBACK: Try to parse from the "Ingredients:" section in the recipe
        const ingredientsMatch = content.match(/Ingredients:\s*(.*?)(?=Instructions:|$)/s);
        if (ingredientsMatch) {
            const ingredientsText = ingredientsMatch[1];
            const parsedIngredients = [];

            const lines = ingredientsText.split('\n');
            for (const line of lines) {
                const trimmedLine = line.trim();
                if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-')) {
                    // Parse line like "• Rice: 2 cups" or "• Black pepper: 1 tsp"
                    const ingredient = trimmedLine.substring(1).trim();
                    const colonIndex = ingredient.indexOf(':');

                    if (colonIndex !== -1) {
                        const name = ingredient.substring(0, colonIndex).trim();
                        const quantityAndUnit = ingredient.substring(colonIndex + 1).trim();

                        // Split quantity and unit (e.g., "2 cups" -> quantity="2", unit="cups")
                        const qtyMatch = quantityAndUnit.match(/^(\d+(?:\.\d+)?)\s*(.*)$/);
                        if (qtyMatch) {
                            parsedIngredients.push({
                                name: name,
                                quantity: qtyMatch[1],
                                unit: qtyMatch[2]
                            });
                        } else {
                            // If no quantity match, just add the name
                            parsedIngredients.push({
                                name: name,
                                quantity: '',
                                unit: quantityAndUnit
                            });
                        }
                    }
                }
            }

            if (parsedIngredients.length > 0) {
                console.log('✅ Fallback: Parsed ingredients from recipe content:', parsedIngredients);
                return parsedIngredients;
            }
        }

        // ✨ LAST FALLBACK: Return original provided ingredients
        console.log('⚠️ Using original provided ingredients as fallback');
        return ingredients.map(ing => ({
            name: ing.name,
            quantity: ing.quantity?.toString() || '',
            unit: ing.unit || ''
        }));
    };

    // ✨ Clean the recipe content by removing the JSON section
    const cleanRecipeContent = (content) => {
        if (!content) return '';

        // Remove the USED_INGREDIENTS_JSON section
        return content.replace(/\n\nUSED_INGREDIENTS_JSON:\[.*?]/s, '').trim();
    };

    // Extract recipe title from content
    const extractRecipeTitle = (content) => {
        if (!content) return { title: 'Generated Recipe', contentWithoutTitle: content };

        const cleanContent = cleanRecipeContent(content);

        // Look for pattern: === [Recipe Name] ===
        const titleMatch = cleanContent.match(/^===\s*(.+?)\s*===$/m);
        if (titleMatch) {
            const title = titleMatch[1].trim();
            // Remove the title line from content
            const contentWithoutTitle = cleanContent.replace(/^===\s*.+?\s*===\s*\n?/m, '').trim();
            return { title, contentWithoutTitle };
        }

        return { title: 'Generated Recipe', contentWithoutTitle: cleanContent };
    };

    // Generate tags from preferences and ingredients
    const generateTagsFromPreferences = () => {
        const tags = [];

        if (preferences.cuisine) {
            tags.push(preferences.cuisine.toLowerCase());
        }

        if (preferences.mealType) {
            tags.push(preferences.mealType.toLowerCase());
        }

        if (preferences.difficulty) {
            tags.push(preferences.difficulty.toLowerCase());
        }

        if (preferences.dietaryRestrictions && preferences.dietaryRestrictions.length > 0) {
            preferences.dietaryRestrictions.forEach(diet => {
                tags.push(diet.toLowerCase());
            });
        }

        // Add some ingredient-based tags
        const usedIngredients = extractUsedIngredients(generatedRecipe?.content);
        usedIngredients.slice(0, 3).forEach(ingredient => {
            tags.push(ingredient.name.toLowerCase());
        });

        // Add some general tags
        tags.push('ai-generated');
        if (preferences.cookingTime && preferences.cookingTime <= 30) {
            tags.push('quick');
        }

        return [...new Set(tags)]; // Remove duplicates
    };

    const handleSaveRecipe = async () => {
        console.log('🔄 Starting recipe save process...');
        setIsSaving(true);

        try {
            // Extract recipe data first
            const { title, contentWithoutTitle } = extractRecipeTitle(generatedRecipe.content);
            const tagsArray = generateTagsFromPreferences();

            // Create recipe description from preferences
            let description = 'AI-generated recipe';
            if (preferences.cuisine && preferences.mealType) {
                description = `${preferences.cuisine} ${preferences.mealType.toLowerCase()}`;
            } else if (preferences.cuisine) {
                description = `${preferences.cuisine} cuisine`;
            } else if (preferences.mealType) {
                description = `Perfect for ${preferences.mealType.toLowerCase()}`;
            }

            if (preferences.dietaryRestrictions && preferences.dietaryRestrictions.length > 0) {
                description += ` (${preferences.dietaryRestrictions.join(', ')})`;
            }

            const recipeData = {
                recipeName: title,
                recipeDesc: description,
                recipeText: contentWithoutTitle || cleanRecipeContent(generatedRecipe.content),
                tags: tagsArray.join(', '),
                prepTime: extractPrepTime(generatedRecipe.content, preferences), // 🔥 Add prepTime
                difficulty: extractDifficulty(generatedRecipe.content, preferences) // 🔥 Add difficulty
            };

            console.log('📝 Recipe data to save:', recipeData);

            // Always try API first
            try {
                console.log('🌐 Attempting API save...');
                const result = await saveRecipeToAPI(recipeData);
                console.log('✅ API save successful:', result);

                setIsSaved(true);
                setTimeout(() => setIsSaved(false), 3000);
                return; // Exit early on success

            } catch (apiError) {
                console.error('❌ API save failed:', apiError);

                // Only try prop callback as fallback if API fails
                if (onSaveRecipe) {
                    console.log('🔄 Falling back to prop callback...');
                    await onSaveRecipe(generatedRecipe);
                    setIsSaved(true);
                    setTimeout(() => setIsSaved(false), 3000);
                } else {
                    throw apiError; // Re-throw if no fallback
                }
            }

        } catch (error) {
            console.error('💥 Error saving recipe:', error);
            alert(`Failed to save recipe: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Check out this amazing recipe!',
                    text: `I just generated this recipe with ${ingredients.length} ingredients!`,
                    url: window.location.href
                });
            } catch (error) {
                console.log('Error sharing:', error);
            }
        } else {
            const cleanContent = cleanRecipeContent(generatedRecipe.content);
            const recipeText = `${cleanContent}\n\nGenerated with: ${ingredients.map(ing => ing.name).join(', ')}`;
            navigator.clipboard.writeText(recipeText);
            alert('Recipe copied to clipboard!');
        }
    };

    const formatRecipeContent = (content) => {
        if (!content) return '';

        const cleanContent = cleanRecipeContent(content);

        // ✨ Parse the AI response
        const parseRecipeContent = (text) => {
            const result = {
                instructions: [],
                cookingTime: '',
                serves: '',
                difficulty: ''
            };

            // Extract Instructions section
            const instructionsMatch = text.match(/Instructions:\s*(.*?)(?=Cooking Time:|Chef's Tips:|$)/s);
            if (instructionsMatch) {
                const instructionsText = instructionsMatch[1];

                // Split by numbered steps
                result.instructions = instructionsText
                    .split(/(?=\d+\.\s\*\*)/)
                    .filter(step => step.trim() && step.match(/^\d+\./))
                    .map(step => step.trim());
            }

            // Extract metadata
            const cookingTimeMatch = text.match(/Cooking Time:\s*([^\n]+)/);
            const servesMatch = text.match(/Serves:\s*([^\n]+)/);
            const difficultyMatch = text.match(/Difficulty:\s*([^\n]+)/);

            if (cookingTimeMatch) result.cookingTime = cookingTimeMatch[1].trim();
            if (servesMatch) result.serves = servesMatch[1].trim();
            if (difficultyMatch) result.difficulty = difficultyMatch[1].trim();

            return result;
        };

        const recipe = parseRecipeContent(cleanContent);

        return (
            <div className="results-step__parsed-recipe">
                {/* Instructions Section */}
                {recipe.instructions.length > 0 && (
                    <div className="results-step__recipe-section results-step__instructions-section">
                        <h3>👨‍🍳 Instructions</h3>
                        <div className="results-step__instructions-list">
                            {recipe.instructions.map((instruction, index) => {
                                // Clean up the instruction text
                                const cleanInstruction = instruction
                                    .replace(/^\d+\.\s*/, '') // Remove number
                                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Convert **text** to bold
                                    .trim();

                                return (
                                    <div key={index} className="results-step__instruction-step">
                                        <span className="results-step__step-number">{index + 1}</span>
                                        <span
                                            className="results-step__step-text"
                                            dangerouslySetInnerHTML={{ __html: cleanInstruction }}
                                        ></span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Recipe Details Section */}
                {(recipe.cookingTime || recipe.serves || recipe.difficulty) && (
                    <div className="results-step__recipe-section results-step__metadata-section">
                        <h3>📋 Recipe Details</h3>
                        <div className="results-step__recipe-metadata">
                            {recipe.cookingTime && (
                                <div className="results-step__metadata-item">
                                    <span className="results-step__metadata-label">⏰ Prep Time:</span>
                                    <span className="results-step__metadata-value">{recipe.cookingTime}</span>
                                </div>
                            )}
                            {recipe.serves && (
                                <div className="results-step__metadata-item">
                                    <span className="results-step__metadata-label">🍽️ Serves:</span>
                                    <span className="results-step__metadata-value">{recipe.serves}</span>
                                </div>
                            )}
                            {recipe.difficulty && (
                                <div className="results-step__metadata-item">
                                    <span className="results-step__metadata-label">📊 Difficulty:</span>
                                    <span className="results-step__metadata-value">{recipe.difficulty}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const loadingMessages = [
        "🔍 Analyzing your ingredients...",
        "🧠 Understanding your preferences...",
        "👨‍🍳 Consulting our AI chef...",
        "📝 Crafting your perfect recipe...",
        "✨ Adding final touches..."
    ];

    if (isGenerating) {
        return (
            <div className="step-container">
                <div className="results-step__loading-container">
                    <div className="results-step__cooking-animation">
                        <div className="results-step__chef-hat">👨‍🍳</div>
                        <div className="results-step__cooking-pot">🍲</div>
                        <div className="results-step__steam">
                            <span>💨</span>
                            <span>💨</span>
                            <span>💨</span>
                        </div>
                    </div>

                    <h2 className="results-step__loading-title">Creating Your Perfect Recipe!</h2>

                    <div className="results-step__loading-steps">
                        {loadingMessages.map((message, index) => (
                            <div
                                key={index}
                                className={`results-step__loading-step ${
                                    index === animationStep
                                        ? 'results-step__loading-step--active'
                                        : index < animationStep
                                            ? 'results-step__loading-step--completed'
                                            : ''
                                }`}
                            >
                                <div className="results-step__step-indicator">
                                    {index < animationStep ? '✅' : index === animationStep ? '⏳' : '⭕'}
                                </div>
                                <span>{message}</span>
                            </div>
                        ))}
                    </div>

                    <div className="results-step__progress-bar">
                        <div className="results-step__progress-fill"></div>
                    </div>

                    <p className="results-step__loading-subtitle">
                        Using your {ingredients.length} ingredients to create something amazing...
                    </p>
                </div>
            </div>
        );
    }

    if (!generatedRecipe) {
        return (
            <div className="step-container">
                <div className="results-step__error-container">
                    <div className="results-step__error-icon">😕</div>
                    <h2>Oops! Something went wrong</h2>
                    <p>We couldn't generate your recipe. Please try again.</p>
                    <button className="btn btn-primary" onClick={onStartOver}>
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // ✨ Extract both title and used ingredients
    const { title } = extractRecipeTitle(generatedRecipe.content);
    const usedIngredients = extractUsedIngredients(generatedRecipe.content);

    return (
        <div className="step-container results-step__container">
            {/* Success Header */}
            <div className="results-step__success-header">
                <div className="results-step__success-icon">🎉</div>
                <h2 className="results-step__success-title">Your Recipe is Ready!</h2>
                <p className="results-step__success-subtitle">
                    Created from your {ingredients.length} ingredients with love ❤️
                </p>
            </div>
            <h1 className="results-step__recipe-title">{title}</h1>

            {/* Recipe Card */}
            <div className="results-step__recipe-card">
                <div className="results-step__recipe-header">
                    <div className="results-step__recipe-meta">
                        <div className="results-step__meta-item">
                            <span className="results-step__meta-icon">🥘</span>
                            <span>{usedIngredients.length} Ingredients Used</span>
                        </div>
                        {preferences.cookingTime && (
                            <div className="results-step__meta-item">
                                <span className="results-step__meta-icon">⏰</span>
                                <span>{preferences.cookingTime} min</span>
                            </div>
                        )}
                        {preferences.difficulty && (
                            <div className="results-step__meta-item">
                                <span className="results-step__meta-icon">📊</span>
                                <span className="results-step__capitalize">{preferences.difficulty}</span>
                            </div>
                        )}
                        {preferences.cuisine && (
                            <div className="results-step__meta-item">
                                <span className="results-step__meta-icon">🌍</span>
                                <span className="results-step__capitalize">{preferences.cuisine}</span>
                            </div>
                        )}
                    </div>

                    <div className="results-step__recipe-actions">
                        <button
                            className={`results-step__action-btn results-step__save-btn ${
                                isSaved ? 'results-step__save-btn--saved' : ''
                            }`}
                            onClick={handleSaveRecipe}
                            disabled={isSaving || isSaved}
                        >
                            {isSaving ? (
                                <>
                                    <span className="results-step__btn-spinner"></span>
                                    Saving...
                                </>
                            ) : isSaved ? (
                                <>
                                    ✅ Saved!
                                </>
                            ) : (
                                <>
                                    💾 Save Recipe
                                </>
                            )}
                        </button>

                        <button className="results-step__action-btn results-step__share-btn" onClick={handleShare}>
                            📤 Share
                        </button>
                    </div>
                </div>

                {/* Recipe Content */}
                <div className="results-step__recipe-content">
                    {generatedRecipe.error ? (
                        <div className="results-step__error-message">
                            <p>⚠️ {generatedRecipe.content}</p>
                        </div>
                    ) : (
                        <div className={`results-step__recipe-text ${
                            showFullRecipe ? 'results-step__recipe-text--expanded' : ''
                        }`}>
                            {formatRecipeContent(generatedRecipe.content)}
                        </div>
                    )}

                    {!generatedRecipe.error && cleanRecipeContent(generatedRecipe.content).length > 500 && (
                        <button
                            className="results-step__expand-btn"
                            onClick={() => setShowFullRecipe(!showFullRecipe)}
                        >
                            {showFullRecipe ? '📖 Show Less' : '📖 Show Full Recipe'}
                        </button>
                    )}
                </div>

                {/* ✨ UPDATED: Ingredients Actually Used - NO LEFTOVERS */}
                <div className="results-step__ingredients-used">
                    <h4>🛒 Ingredients Actually Used:</h4>
                    <div className="results-step__used-ingredients-list">
                        {usedIngredients.map((ingredient, index) => (
                            <span key={index} className="results-step__used-ingredient">
                                {ingredient.name}
                                {ingredient.quantity && ingredient.quantity !== '' && (
                                    ` (${ingredient.quantity}${ingredient.unit ? ' ' + ingredient.unit : ''})`
                                )}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Preferences Applied */}
                {(preferences.cuisine || preferences.dietaryRestrictions.length > 0 || preferences.mealType) && (
                    <div className="results-step__preferences-applied">
                        <h4>✨ Your Preferences:</h4>
                        <div className="results-step__applied-preferences">
                            {preferences.cuisine && (
                                <span className="results-step__preference-tag results-step__cuisine-tag">
                                    🌍 {preferences.cuisine}
                                </span>
                            )}
                            {preferences.mealType && (
                                <span className="results-step__preference-tag results-step__meal-tag">
                                    🍽️ {preferences.mealType}
                                </span>
                            )}
                            {preferences.dietaryRestrictions.map((diet, index) => (
                                <span key={index} className="results-step__preference-tag results-step__dietary-tag">
                                    🥗 {diet}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="results-step__result-actions">
                <button className="btn btn-secondary" onClick={onStartOver}>
                    🔄 Create Another Recipe
                </button>

                <button className="btn btn-success" onClick={() => window.print()}>
                    🖨️ Print Recipe
                </button>
            </div>

            {/* Tips Section */}
            <div className="results-step__tips-section">
                <h4>💡 Pro Tips:</h4>
                <div className="results-step__tips-grid">
                    <div className="results-step__tip-item">
                        <span className="results-step__tip-icon">📱</span>
                        <span>Save this recipe to access it anytime</span>
                    </div>
                    <div className="results-step__tip-item">
                        <span className="results-step__tip-icon">👥</span>
                        <span>Share with friends and family</span>
                    </div>
                    <div className="results-step__tip-item">
                        <span className="results-step__tip-icon">📝</span>
                        <span>Add your own notes and modifications</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResultsStep;