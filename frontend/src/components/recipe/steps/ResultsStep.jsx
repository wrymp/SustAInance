import React, { useState, useEffect } from 'react';
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

    const handleSaveRecipe = async () => {
        setIsSaving(true);
        try {
            if (onSaveRecipe) {
                await onSaveRecipe(generatedRecipe);
            }
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 3000); // Reset after 3 seconds
        } catch (error) {
            console.error('Error saving recipe:', error);
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
            console.log('Raw AI response:', generatedRecipe.content);
            const recipeText = `${generatedRecipe.content}\n\nGenerated with: ${ingredients.map(ing => ing.name).join(', ')}`;
            navigator.clipboard.writeText(recipeText);
            alert('Recipe copied to clipboard!');
        }
    };

    const formatRecipeContent = (content) => {
        if (!content) return '';

        // ✨ Parse the AI response
        const parseRecipeContent = (text) => {
            const result = {
                instructions: [],
                cookingTime: '',
                serves: '',
                difficulty: ''
            };

            // Extract Instructions section
            const instructionsMatch = text.match(/Instructions:\s*(.*?)(?=Cooking Time:|$)/s);
            if (instructionsMatch) {
                const instructionsText = instructionsMatch[1];

                // Split by numbered steps
                const steps = instructionsText
                    .split(/(?=\d+\.\s\*\*)/)
                    .filter(step => step.trim() && step.match(/^\d+\./))
                    .map(step => step.trim());

                result.instructions = steps;
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

        const recipe = parseRecipeContent(content);

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
                                    <span className="results-step__metadata-label">⏰ Cooking Time:</span>
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

            {/* Recipe Card */}
            <div className="results-step__recipe-card">
                <div className="results-step__recipe-header">
                    <div className="results-step__recipe-meta">
                        <div className="results-step__meta-item">
                            <span className="results-step__meta-icon">🥘</span>
                            <span>{ingredients.length} Ingredients</span>
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

                    {!generatedRecipe.error && generatedRecipe.content.length > 500 && (
                        <button
                            className="results-step__expand-btn"
                            onClick={() => setShowFullRecipe(!showFullRecipe)}
                        >
                            {showFullRecipe ? '📖 Show Less' : '📖 Show Full Recipe'}
                        </button>
                    )}
                </div>

                {/* Ingredients Used */}
                <div className="results-step__ingredients-used">
                    <h4>🛒 Ingredients Used:</h4>
                    <div className="results-step__used-ingredients-list">
                        {ingredients.map((ingredient, index) => (
                            <span key={index} className="results-step__used-ingredient">
                                {ingredient.name}
                                {ingredient.quantity && ` (${ingredient.quantity}${ingredient.unit ? ' ' + ingredient.unit : ''})`}
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
                    <div className="results-step__tip-item">
                        <span className="results-step__tip-icon">⭐</span>
                        <span>Rate the recipe after cooking</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResultsStep;