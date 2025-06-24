import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext'; // Adjust path as needed
import IngredientsStep from './steps/IngredientsStep';
import PreferencesStep from './steps/PreferencesStep';
import ResultsStep from './steps/ResultsStep';
import './RecipeGenerator.css';
import { recipeAPI } from '../../services/api';

const RecipeGenerator = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated } = useContext(AuthContext);

    const [currentStep, setCurrentStep] = useState(1);
    const [isGenerating, setIsGenerating] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    const [ingredients, setIngredients] = useState([]);
    const [preferences, setPreferences] = useState({
        cuisine: '',
        dietaryRestrictions: [],
        cookingTime: '',
        difficulty: '',
        mealType: ''
    });
    const [generatedRecipe, setGeneratedRecipe] = useState(null);
    const [pantryUsage, setPantryUsage] = useState(null);

    // Fetch current user
    useEffect(() => {
        const fetchCurrentUser = async () => {
            if (!isAuthenticated) return;

            try {
                const response = await fetch('http://localhost:9097/api/auth/me', {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include'
                });

                if (response.ok) {
                    const user = await response.json();
                    setCurrentUser(user);
                }
            } catch (error) {
                console.error('Error fetching user:', error);
            }
        };

        fetchCurrentUser();
    }, [isAuthenticated]);

    // Handle pre-filled ingredients from other pages
    useEffect(() => {
        const stateIngredients = location.state?.ingredients;
        if (stateIngredients) {
            if (typeof stateIngredients === 'string') {
                const parsedIngredients = stateIngredients
                    .split(',')
                    .map(item => ({
                        id: Date.now() + Math.random(),
                        name: item.trim(),
                        quantity: '',
                        unit: ''
                    }));
                setIngredients(parsedIngredients);
            } else if (Array.isArray(stateIngredients)) {
                setIngredients(stateIngredients);
            }
            setCurrentStep(1);
        }
    }, [location.state]);

    // ✅ NEW: Extract used ingredients from AI response (same logic as ResultsStep)
    const extractUsedIngredients = (content) => {
        if (!content) return [];

        console.log('🔍 Extracting used ingredients from AI response...');

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

        // FALLBACK: Try to parse from the "Ingredients:" section in the recipe
        const ingredientsMatch = content.match(/Ingredients:\s*(.*?)(?=Instructions:|$)/s);
        if (ingredientsMatch) {
            const ingredientsText = ingredientsMatch[1];
            const parsedIngredients = [];

            const lines = ingredientsText.split('\n');
            for (const line of lines) {
                const trimmedLine = line.trim();
                if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-')) {
                    const ingredient = trimmedLine.substring(1).trim();
                    const colonIndex = ingredient.indexOf(':');

                    if (colonIndex !== -1) {
                        const name = ingredient.substring(0, colonIndex).trim();
                        const quantityAndUnit = ingredient.substring(colonIndex + 1).trim();

                        const qtyMatch = quantityAndUnit.match(/^(\d+(?:\.\d+)?)\s*(.*)$/);
                        if (qtyMatch) {
                            parsedIngredients.push({
                                name: name,
                                quantity: qtyMatch[1],
                                unit: qtyMatch[2]
                            });
                        } else {
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

        // LAST FALLBACK: Return original provided ingredients
        console.log('⚠️ Using original provided ingredients as fallback');
        return ingredients.map(ing => ({
            name: ing.name,
            quantity: ing.quantity?.toString() || '',
            unit: ing.unit || ''
        }));
    };

    // ✅ UPDATED: Function to deduct ONLY actual used amounts from pantry
    const takePantryIngredients = async (originalIngredients, usedIngredients, user) => {
        if (!user?.uuid) {
            console.log('No authenticated user for pantry deduction');
            return { success: false, error: 'User not authenticated' };
        }

        // Filter original ingredients that came from pantry
        const pantryIngredients = originalIngredients.filter(ing => ing.isFromPantry && ing.pantryId);

        if (pantryIngredients.length === 0) {
            console.log('No pantry ingredients to deduct');
            return { success: true, deducted: [], totalProcessed: 0 };
        }

        console.log(`🏺 Processing ${pantryIngredients.length} pantry ingredients for deduction`);

        const results = [];
        const errors = [];

        // Process each pantry ingredient
        for (const pantryIngredient of pantryIngredients) {
            try {
                // ✅ FIND THE ACTUAL AMOUNT USED IN THE RECIPE
                const usedIngredient = usedIngredients.find(used =>
                    used.name.toLowerCase().trim() === pantryIngredient.name.toLowerCase().trim()
                );

                if (!usedIngredient) {
                    console.log(`⚠️ Pantry ingredient "${pantryIngredient.name}" not found in used ingredients - skipping`);
                    continue;
                }

                // ✅ USE THE ACTUAL USED QUANTITY, NOT THE ORIGINAL QUANTITY
                const actualQuantityUsed = parseFloat(usedIngredient.quantity) || 0;
                const actualUnitUsed = usedIngredient.unit || pantryIngredient.unit;

                if (actualQuantityUsed <= 0) {
                    console.log(`⚠️ No valid quantity used for "${pantryIngredient.name}" - skipping`);
                    continue;
                }

                const requestBody = {
                    usersId: user.uuid,
                    ingredientName: pantryIngredient.name,
                    count: actualQuantityUsed, // ✅ Use actual amount from recipe
                    unit: actualUnitUsed
                };

                console.log(`🏺 Taking from pantry: ${actualQuantityUsed} ${actualUnitUsed} of ${pantryIngredient.name} (originally provided: ${pantryIngredient.quantity} ${pantryIngredient.unit})`);

                const response = await fetch('http://localhost:9097/api/pantry/take', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(requestBody)
                });

                const responseText = await response.text();

                if (response.ok) {
                    console.log(`✅ Successfully took ${actualQuantityUsed} ${actualUnitUsed} of ${pantryIngredient.name}`);
                    results.push({
                        ingredient: pantryIngredient.name,
                        quantityProvided: pantryIngredient.quantity, // Original amount provided
                        quantityUsed: actualQuantityUsed, // Actual amount used
                        unit: actualUnitUsed,
                        status: 'success',
                        message: responseText
                    });
                } else {
                    console.log(`❌ Failed to take ${pantryIngredient.name}:`, responseText);
                    errors.push({
                        ingredient: pantryIngredient.name,
                        error: responseText,
                        status: response.status
                    });
                }
            } catch (error) {
                console.error(`Network error taking ${pantryIngredient.name}:`, error);
                errors.push({
                    ingredient: pantryIngredient.name,
                    error: error.message,
                    status: 'network_error'
                });
            }
        }

        return {
            success: errors.length === 0,
            deducted: results,
            errors: errors,
            totalProcessed: pantryIngredients.length
        };
    };

    const handleNextStep = () => {
        if (currentStep < 3) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    // ✅ UPDATED: handleGenerateRecipe function
    const handleGenerateRecipe = async () => {
        setIsGenerating(true);
        setCurrentStep(3);
        setPantryUsage(null);

        try {
            console.log('🎯 Generating recipe with:', { ingredients, preferences });

            // 1. Generate the recipe first
            const response = await recipeAPI.generateRecipe(ingredients, preferences);
            const recipeContent = response.data;

            // 2. ✅ Extract the actual ingredients used from the AI response
            const usedIngredients = extractUsedIngredients(recipeContent);
            console.log('🔍 Ingredients actually used in recipe:', usedIngredients);

            // 3. ✅ Process pantry deductions using ACTUAL used amounts
            console.log('✅ Recipe generated successfully, processing pantry deductions with actual used amounts...');

            const pantryResult = await takePantryIngredients(ingredients, usedIngredients, currentUser);
            setPantryUsage(pantryResult);

            if (pantryResult.success && pantryResult.deducted.length > 0) {
                console.log(`🏺 Successfully deducted actual used amounts from pantry:`, pantryResult.deducted);
            } else if (pantryResult.errors && pantryResult.errors.length > 0) {
                console.log(`⚠️ Some pantry deductions failed:`, pantryResult.errors);
            }

            // 4. Set the generated recipe with pantry usage info
            setGeneratedRecipe({
                id: Date.now(),
                content: recipeContent,
                ingredients: ingredients.map(ing =>
                    `${ing.name}${ing.quantity ? `: ${ing.quantity}${ing.unit ? ' ' + ing.unit : ''}` : ''}`
                ).join(', '),
                preferences: preferences,
                createdAt: new Date().toISOString(),
                pantryUsage: pantryResult
            });

            console.log('✅ Recipe generation and pantry processing completed');

        } catch (error) {
            console.error('❌ Error generating recipe:', error);

            setGeneratedRecipe({
                id: Date.now(),
                content: 'Sorry, there was an error generating your recipe. Please try again.',
                ingredients: ingredients.map(ing => ing.name).join(', '),
                preferences: preferences,
                createdAt: new Date().toISOString(),
                error: true
            });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSaveRecipe = () => {
        if (generatedRecipe) {
            const savedRecipes = JSON.parse(localStorage.getItem('savedRecipes') || '[]');
            const recipeToSave = {
                ...generatedRecipe,
                saved: true,
                savedAt: new Date().toISOString()
            };

            savedRecipes.push(recipeToSave);
            localStorage.setItem('savedRecipes', JSON.stringify(savedRecipes));

            alert('Recipe saved successfully! 🎉');
        }
    };

    const handleGenerateAnother = () => {
        setCurrentStep(1);
        setGeneratedRecipe(null);
        setIsGenerating(false);
        setPantryUsage(null);
    };

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [currentStep]);

    return (
        <div className="recipe-generator">
            {/* Header */}
            <div className="recipe-generator__header">
                <button
                    className="recipe-generator__back-button"
                    onClick={() => navigate('/home')}
                >
                    ← Back to Home
                </button>

                <div className="recipe-generator__progress-bar">
                    <div className="recipe-generator__progress-steps">
                        <div className={`recipe-generator__step ${
                            currentStep >= 1 ? 'recipe-generator__step--active' : ''
                        } ${currentStep > 1 ? 'recipe-generator__step--completed' : ''}`}>
                            <span className="recipe-generator__step-number">1</span>
                            <label className="recipe-generator__step-label">Ingredients</label>
                        </div>
                        <div className={`recipe-generator__step ${
                            currentStep >= 2 ? 'recipe-generator__step--active' : ''
                        } ${currentStep > 2 ? 'recipe-generator__step--completed' : ''}`}>
                            <span className="recipe-generator__step-number">2</span>
                            <label className="recipe-generator__step-label">Preferences</label>
                        </div>
                        <div className={`recipe-generator__step ${
                            currentStep >= 3 ? 'recipe-generator__step--active' : ''
                        }`}>
                            <span className="recipe-generator__step-number">3</span>
                            <label className="recipe-generator__step-label">Recipe</label>
                        </div>
                    </div>
                    <div className="recipe-generator__progress-line">
                        <div
                            className="recipe-generator__progress-fill"
                            style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Step Content */}
            <div className="recipe-generator__content">
                {currentStep === 1 && (
                    <IngredientsStep
                        ingredients={ingredients}
                        setIngredients={setIngredients}
                        onNext={handleNextStep}
                        hasPrefilledIngredients={location.state?.ingredients}
                    />
                )}

                {currentStep === 2 && (
                    <PreferencesStep
                        preferences={preferences}
                        setPreferences={setPreferences}
                        onNext={handleGenerateRecipe}
                        onPrev={handlePrevStep}
                        ingredients={ingredients}
                    />
                )}

                {currentStep === 3 && (
                    <ResultsStep
                        generatedRecipe={generatedRecipe}
                        isGenerating={isGenerating}
                        ingredients={ingredients}
                        preferences={preferences}
                        pantryUsage={pantryUsage}
                        onStartOver={handleGenerateAnother}
                        onSaveRecipe={async (recipe) => {
                            console.log('Saving recipe:', recipe);
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default RecipeGenerator;