import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
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
        // Check for pantry ingredients first (new flow)
        if (location.state?.selectedIngredients && location.state?.skipIngredientsStep) {
            console.log('🏺 Pre-selected ingredients from pantry:', location.state.selectedIngredients);
            setIngredients(location.state.selectedIngredients);
            setCurrentStep(2); // Skip to PreferencesStep
            return;
        }

        // Original logic for other sources
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

    // ✅ IMPROVED: Extract used ingredients with better fallback logic
    const extractUsedIngredients = (content) => {
        if (!content) return [];

        console.log('🔍 Extracting used ingredients from AI response...');
        console.log('📝 Full AI response:', content.substring(0, 500) + '...');

        // Look for the JSON section at the end: USED_INGREDIENTS_JSON:[...]
        const jsonMatch = content.match(/USED_INGREDIENTS_JSON:(\[.*?])/s);
        if (jsonMatch) {
            try {
                const usedIngredients = JSON.parse(jsonMatch[1]);
                console.log('✅ Successfully parsed used ingredients from JSON:', usedIngredients);
                return usedIngredients;
            } catch (error) {
                console.error('❌ Error parsing used ingredients JSON:', error);
            }
        } else {
            console.log('⚠️ No USED_INGREDIENTS_JSON found in response');
        }

        // FALLBACK 1: Try to parse from the "Ingredients:" section in the recipe
        const ingredientsMatch = content.match(/Ingredients:\s*(.*?)(?=Instructions:|Directions:|Method:|$)/si);
        if (ingredientsMatch) {
            const ingredientsText = ingredientsMatch[1];
            console.log('📋 Found ingredients section:', ingredientsText.substring(0, 200) + '...');

            const parsedIngredients = [];
            const lines = ingredientsText.split('\n');

            for (const line of lines) {
                const trimmedLine = line.trim();
                if (trimmedLine && (trimmedLine.startsWith('•') || trimmedLine.startsWith('-') || trimmedLine.startsWith('*'))) {
                    let ingredient = trimmedLine.substring(1).trim();

                    // Remove any markdown formatting
                    ingredient = ingredient.replace(/\*\*/g, '').replace(/\*/g, '');

                    // Try to extract quantity and unit from ingredient line
                    // Examples: "2 cups flour", "1 tablespoon olive oil", "500g chicken"
                    const quantityMatch = ingredient.match(/^(\d+(?:\.\d+)?(?:\/\d+)?)\s*([a-zA-Z]+)?\s+(.+)$/);

                    if (quantityMatch) {
                        const [, qty, unit, name] = quantityMatch;
                        parsedIngredients.push({
                            name: name.trim(),
                            quantity: qty,
                            unit: unit || ''
                        });
                    } else {
                        // If no quantity found, try to match ingredient names with original ingredients
                        const ingredientName = ingredient.toLowerCase();
                        const matchedOriginal = ingredients.find(orig =>
                            ingredientName.includes(orig.name.toLowerCase()) ||
                            orig.name.toLowerCase().includes(ingredientName)
                        );

                        if (matchedOriginal) {
                            parsedIngredients.push({
                                name: matchedOriginal.name,
                                quantity: matchedOriginal.quantity || '1',
                                unit: matchedOriginal.unit || ''
                            });
                        } else {
                            // Add with default quantity
                            parsedIngredients.push({
                                name: ingredient,
                                quantity: '1',
                                unit: ''
                            });
                        }
                    }
                }
            }

            if (parsedIngredients.length > 0) {
                console.log('✅ Fallback 1: Parsed ingredients from recipe content:', parsedIngredients);
                return parsedIngredients;
            }
        }

        // FALLBACK 2: Use intelligent matching with original ingredients
        console.log('⚠️ Using intelligent matching with original ingredients');
        const intelligentMatching = ingredients.map(originalIng => {
            // For pantry ingredients, use a reasonable portion of what's available
            if (originalIng.isFromPantry) {
                const availableQty = parseFloat(originalIng.quantity) || 1;
                // Use between 25% to 100% of available ingredient, depending on type
                let usageRatio = 0.5; // Default 50%

                // Adjust usage ratio based on ingredient type and unit
                if (originalIng.unit.toLowerCase().includes('piece') ||
                    originalIng.unit.toLowerCase().includes('item')) {
                    usageRatio = Math.min(1, Math.ceil(availableQty * 0.3)); // Use whole pieces
                } else if (originalIng.unit.toLowerCase().includes('cup') ||
                    originalIng.unit.toLowerCase().includes('gram') ||
                    originalIng.unit.toLowerCase().includes('ml')) {
                    usageRatio = 0.4; // Use 40% of measured ingredients
                }

                const usedQuantity = Math.max(0.1, availableQty * usageRatio);

                return {
                    name: originalIng.name,
                    quantity: usedQuantity.toString(),
                    unit: originalIng.unit
                };
            } else {
                // For manually added ingredients, use what was specified or a default
                return {
                    name: originalIng.name,
                    quantity: originalIng.quantity || '1',
                    unit: originalIng.unit || ''
                };
            }
        });

        console.log('🧠 Intelligent matching result:', intelligentMatching);
        return intelligentMatching;
    };

    // ✅ ENHANCED: Function to deduct actual used amounts from pantry
    const takePantryIngredients = async (originalIngredients, usedIngredients, user) => {
        if (!user?.uuid) {
            console.log('❌ No authenticated user for pantry deduction');
            return { success: false, error: 'User not authenticated' };
        }

        // Filter original ingredients that came from pantry
        const pantryIngredients = originalIngredients.filter(ing => ing.isFromPantry && ing.pantryId);

        if (pantryIngredients.length === 0) {
            console.log('ℹ️ No pantry ingredients to deduct');
            return { success: true, deducted: [], totalProcessed: 0 };
        }

        console.log(`🏺 Processing ${pantryIngredients.length} pantry ingredients for deduction`);
        console.log('📋 Pantry ingredients to process:', pantryIngredients.map(ing => ({
            name: ing.name,
            available: `${ing.quantity} ${ing.unit}`,
            pantryId: ing.pantryId
        })));
        console.log('📋 Used ingredients from recipe:', usedIngredients);

        const results = [];
        const errors = [];

        // Process each pantry ingredient
        for (const pantryIngredient of pantryIngredients) {
            try {
                console.log(`\n🔍 Processing pantry ingredient: ${pantryIngredient.name}`);

                // ✅ FIND THE ACTUAL AMOUNT USED IN THE RECIPE (flexible matching)
                const usedIngredient = usedIngredients.find(used => {
                    const usedName = used.name.toLowerCase().trim();
                    const pantryName = pantryIngredient.name.toLowerCase().trim();

                    return usedName === pantryName ||
                        usedName.includes(pantryName) ||
                        pantryName.includes(usedName);
                });

                if (!usedIngredient) {
                    console.log(`⚠️ Pantry ingredient "${pantryIngredient.name}" not found in used ingredients - using default portion`);

                    // Use a reasonable default portion (e.g., 30% of available)
                    const availableQty = parseFloat(pantryIngredient.quantity) || 1;
                    const defaultUsage = Math.max(0.1, availableQty * 0.3);

                    const requestBody = {
                        usersId: user.uuid,
                        ingredientName: pantryIngredient.name,
                        count: defaultUsage,
                        unit: pantryIngredient.unit
                    };

                    console.log(`🏺 Taking default portion from pantry: ${defaultUsage} ${pantryIngredient.unit} of ${pantryIngredient.name}`);

                    const response = await fetch('http://localhost:9097/api/pantry/take', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify(requestBody)
                    });

                    const responseText = await response.text();
                    console.log(`📡 API Response for ${pantryIngredient.name}:`, response.status, responseText);

                    if (response.ok) {
                        console.log(`✅ Successfully took ${defaultUsage} ${pantryIngredient.unit} of ${pantryIngredient.name}`);
                        results.push({
                            ingredient: pantryIngredient.name,
                            quantityProvided: pantryIngredient.quantity,
                            quantityUsed: defaultUsage,
                            unit: pantryIngredient.unit,
                            status: 'success',
                            message: 'Used default portion (ingredient not explicitly found in recipe)'
                        });
                    } else {
                        console.log(`❌ Failed to take ${pantryIngredient.name}:`, responseText);
                        errors.push({
                            ingredient: pantryIngredient.name,
                            error: responseText,
                            status: response.status
                        });
                    }
                    continue;
                }

                // ✅ USE THE ACTUAL USED QUANTITY FROM RECIPE
                const actualQuantityUsed = parseFloat(usedIngredient.quantity) || 0;
                const actualUnitUsed = usedIngredient.unit || pantryIngredient.unit;

                if (actualQuantityUsed <= 0) {
                    console.log(`⚠️ No valid quantity used for "${pantryIngredient.name}" - using minimal amount`);

                    const requestBody = {
                        usersId: user.uuid,
                        ingredientName: pantryIngredient.name,
                        count: 0.1, // Use minimal amount
                        unit: pantryIngredient.unit
                    };

                    const response = await fetch('http://localhost:9097/api/pantry/take', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify(requestBody)
                    });

                    const responseText = await response.text();

                    if (response.ok) {
                        results.push({
                            ingredient: pantryIngredient.name,
                            quantityProvided: pantryIngredient.quantity,
                            quantityUsed: 0.1,
                            unit: pantryIngredient.unit,
                            status: 'success',
                            message: 'Used minimal amount (no valid quantity found)'
                        });
                    } else {
                        errors.push({
                            ingredient: pantryIngredient.name,
                            error: responseText,
                            status: response.status
                        });
                    }
                    continue;
                }

                const requestBody = {
                    usersId: user.uuid,
                    ingredientName: pantryIngredient.name,
                    count: actualQuantityUsed,
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
                console.log(`📡 API Response for ${pantryIngredient.name}:`, response.status, responseText);

                if (response.ok) {
                    console.log(`✅ Successfully took ${actualQuantityUsed} ${actualUnitUsed} of ${pantryIngredient.name}`);
                    results.push({
                        ingredient: pantryIngredient.name,
                        quantityProvided: pantryIngredient.quantity,
                        quantityUsed: actualQuantityUsed,
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
                console.error(`❌ Network error taking ${pantryIngredient.name}:`, error);
                errors.push({
                    ingredient: pantryIngredient.name,
                    error: error.message,
                    status: 'network_error'
                });
            }
        }

        const finalResult = {
            success: errors.length === 0,
            deducted: results,
            errors: errors,
            totalProcessed: pantryIngredients.length
        };

        console.log('🏺 Final pantry deduction result:', finalResult);
        return finalResult;
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

    // ✅ ENHANCED: handleGenerateRecipe function with better debugging
    const handleGenerateRecipe = async () => {
        console.log('🚀 Starting recipe generation...');
        setIsGenerating(true);
        setCurrentStep(3);
        setPantryUsage(null);

        try {
            console.log('🎯 Generating recipe with ingredients:', ingredients);
            console.log('🎯 Generating recipe with preferences:', preferences);

            // 1. Generate the recipe first
            const response = await recipeAPI.generateRecipe(ingredients, preferences);
            const recipeContent = response.data;
            console.log('✅ Recipe generated successfully');

            // 2. ✅ Extract the actual ingredients used from the AI response
            const usedIngredients = extractUsedIngredients(recipeContent);
            console.log('🔍 Final used ingredients for pantry deduction:', usedIngredients);

            // 3. ✅ Process pantry deductions using ACTUAL used amounts
            console.log('🏺 Processing pantry deductions...');
            const pantryResult = await takePantryIngredients(ingredients, usedIngredients, currentUser);
            setPantryUsage(pantryResult);

            if (pantryResult.success && pantryResult.deducted.length > 0) {
                console.log(`🏺 Successfully processed pantry deductions:`, pantryResult.deducted);
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

            console.log('✅ Recipe generation and pantry processing completed successfully');

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

                {/* Pantry Badge */}
                {location.state?.fromPantry && (
                    <div className="recipe-generator__pantry-badge">
                        <span className="recipe-generator__pantry-icon">🏺</span>
                        Using Pantry Ingredients
                    </div>
                )}

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
                        fromPantry={location.state?.fromPantry || false}
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