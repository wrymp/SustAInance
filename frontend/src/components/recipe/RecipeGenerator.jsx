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

    // ✅ MUCH IMPROVED: Extract used ingredients with multiple fallback strategies
    const extractUsedIngredients = (content) => {
        if (!content) return [];

        console.log('🔍 DEBUGGING: Extracting used ingredients from AI response...');
        console.log('📝 First 800 chars of AI response:', content.substring(0, 800));

        // Strategy 1: Look for JSON section at the end
        const jsonMatch = content.match(/USED_INGREDIENTS_JSON:(\[.*?])/s);
        if (jsonMatch) {
            try {
                const usedIngredients = JSON.parse(jsonMatch[1]);
                console.log('✅ SUCCESS: Found used ingredients in JSON format:', usedIngredients);
                return usedIngredients;
            } catch (error) {
                console.error('❌ Error parsing JSON ingredients:', error);
            }
        } else {
            console.log('⚠️ No USED_INGREDIENTS_JSON found in response');
        }

        // Strategy 2: Parse ingredients section with better regex
        const ingredientsSectionMatch = content.match(/(?:Ingredients|INGREDIENTS):\s*(.*?)(?:\n\s*(?:Instructions|Directions|Method|Steps|INSTRUCTIONS|DIRECTIONS|METHOD|STEPS):|$)/si);

        if (ingredientsSectionMatch) {
            const ingredientsText = ingredientsSectionMatch[1];
            console.log('📋 Found ingredients section:', ingredientsText);

            const parsedIngredients = [];
            const lines = ingredientsText.split('\n');

            for (const line of lines) {
                const trimmedLine = line.trim();
                if (trimmedLine && (trimmedLine.match(/^[\*\-\•\d]/))) {
                    let ingredient = trimmedLine.replace(/^[\*\-\•\s]*/, '').trim();

                    // Remove markdown formatting
                    ingredient = ingredient.replace(/\*\*/g, '').replace(/\*/g, '');

                    // Enhanced quantity extraction patterns
                    const patterns = [
                        // "2 cups flour" or "1.5 cups flour"
                        /^(\d+(?:\.\d+)?(?:\/\d+)?)\s+(cups?|cup|tbsp|tablespoons?|tsp|teaspoons?|oz|ounces?|lbs?|pounds?|g|grams?|kg|ml|l|liters?)\s+(.+)$/i,
                        // "2 large eggs" or "3 medium onions"
                        /^(\d+(?:\.\d+)?)\s+(large|medium|small)?\s*(.+)$/i,
                        // "1/2 of a large onion"
                        /^(\d+\/\d+)\s+(?:of\s+a\s+)?(.+)$/i,
                    ];

                    let matched = false;
                    for (const pattern of patterns) {
                        const match = ingredient.match(pattern);
                        if (match) {
                            const qty = match[1];
                            let unit = match[2] || '';
                            let name = match[3] || match[2];

                            // Clean up the name
                            name = name.replace(/^(large|medium|small)\s+/i, '').trim();

                            parsedIngredients.push({
                                name: name,
                                quantity: qty,
                                unit: unit
                            });
                            matched = true;
                            break;
                        }
                    }

                    if (!matched && ingredient.length > 2) {
                        // Fallback: just use the ingredient name with default quantity
                        parsedIngredients.push({
                            name: ingredient,
                            quantity: '1',
                            unit: 'portion'
                        });
                    }
                }
            }

            if (parsedIngredients.length > 0) {
                console.log('✅ SUCCESS: Parsed ingredients from recipe content:', parsedIngredients);
                return parsedIngredients;
            }
        }

        // Strategy 3: Intelligent matching with original ingredients (ENHANCED)
        console.log('🧠 Using intelligent matching with original ingredients');
        console.log('🏺 Original ingredients available:', ingredients.map(ing => `${ing.name} (${ing.quantity} ${ing.unit})`));

        const intelligentMatching = ingredients
            .filter(ing => ing.isFromPantry) // Only process pantry ingredients
            .map(originalIng => {
                const availableQty = parseFloat(originalIng.quantity) || 1;

                // Determine usage based on ingredient type and typical cooking portions
                let usageRatio = 0.3; // Default 30%
                let usedQuantity;

                const name = originalIng.name.toLowerCase();
                const unit = originalIng.unit.toLowerCase();

                // Adjust usage based on ingredient type
                if (unit.includes('piece') || unit.includes('item') || unit.includes('whole')) {
                    // For whole items, use 1 unless we have very few
                    usedQuantity = Math.min(1, Math.ceil(availableQty * 0.5));
                } else if (name.includes('spice') || name.includes('herb') || name.includes('salt') || name.includes('pepper')) {
                    // Spices and herbs - use very little
                    usedQuantity = Math.max(0.1, availableQty * 0.1);
                } else if (name.includes('oil') || name.includes('butter') || name.includes('vinegar')) {
                    // Cooking oils and fats - moderate usage
                    usedQuantity = Math.max(0.25, availableQty * 0.2);
                } else if (name.includes('flour') || name.includes('sugar') || name.includes('rice')) {
                    // Staples - moderate usage
                    usedQuantity = Math.max(0.5, availableQty * 0.4);
                } else if (name.includes('meat') || name.includes('chicken') || name.includes('beef') || name.includes('fish')) {
                    // Proteins - substantial portion
                    usedQuantity = Math.max(0.3, availableQty * 0.6);
                } else if (name.includes('vegetable') || name.includes('onion') || name.includes('carrot') || name.includes('potato')) {
                    // Vegetables - moderate to substantial
                    usedQuantity = Math.max(0.2, availableQty * 0.4);
                } else {
                    // Default case
                    usedQuantity = Math.max(0.1, availableQty * usageRatio);
                }

                // Round to reasonable precision
                usedQuantity = Math.round(usedQuantity * 100) / 100;

                console.log(`🥘 Will use ${usedQuantity} ${originalIng.unit} of ${originalIng.name} (available: ${availableQty} ${originalIng.unit})`);

                return {
                    name: originalIng.name,
                    quantity: usedQuantity.toString(),
                    unit: originalIng.unit
                };
            });

        console.log('🧠 Final intelligent matching result:', intelligentMatching);
        return intelligentMatching;
    };

    // ✅ FIXED: Convert count to string for backend DTO
    const takePantryIngredients = async (originalIngredients, usedIngredients, user) => {
        if (!user?.uuid) {
            console.log('❌ No authenticated user for pantry deduction');
            return { success: false, error: 'User not authenticated' };
        }

        const pantryIngredients = originalIngredients.filter(ing => ing.isFromPantry && ing.pantryId);

        if (pantryIngredients.length === 0) {
            console.log('ℹ️ No pantry ingredients to deduct');
            return { success: true, deducted: [], totalProcessed: 0 };
        }

        console.log(`\n🏺 ======= PANTRY DEDUCTION PROCESS =======`);
        console.log(`🏺 Processing ${pantryIngredients.length} pantry ingredients for deduction`);

        const results = [];
        const errors = [];

        for (const pantryIngredient of pantryIngredients) {
            try {
                console.log(`\n🔍 ===== Processing: ${pantryIngredient.name} =====`);

                // Find matching used ingredient
                const usedIngredient = usedIngredients.find(used => {
                    const usedName = used.name.toLowerCase().trim();
                    const pantryName = pantryIngredient.name.toLowerCase().trim();

                    const exactMatch = usedName === pantryName;
                    const containsMatch = usedName.includes(pantryName) || pantryName.includes(usedName);
                    const wordMatch = usedName.split(' ').some(word =>
                        pantryName.split(' ').some(pantryWord =>
                            word === pantryWord && word.length > 2
                        )
                    );

                    return exactMatch || containsMatch || wordMatch;
                });

                let quantityToUse;
                let unitToUse = pantryIngredient.unit;

                if (usedIngredient) {
                    quantityToUse = parseFloat(usedIngredient.quantity) || 0;
                    unitToUse = usedIngredient.unit || pantryIngredient.unit;
                    console.log(`✅ Found matching used ingredient: ${quantityToUse} ${unitToUse}`);
                } else {
                    const availableQty = parseFloat(pantryIngredient.quantity) || 1;
                    quantityToUse = Math.max(0.1, availableQty * 0.3);
                    console.log(`⚠️ No matching used ingredient, using default: ${quantityToUse} ${unitToUse}`);
                }

                if (quantityToUse <= 0) {
                    quantityToUse = 0.1;
                }

                // ✅ FIXED: Convert count to string and ensure all fields are strings
                const requestBody = {
                    usersId: user.uuid,                    // UUID (stays as is)
                    ingredientName: pantryIngredient.name, // String ✓
                    count: quantityToUse.toString(),       // ✅ Convert number to string!
                    unit: unitToUse                        // String ✓
                };

                console.log(`🌐 Making API call with CORRECTED format:`, {
                    usersId: `${requestBody.usersId} (${typeof requestBody.usersId})`,
                    ingredientName: `"${requestBody.ingredientName}" (${typeof requestBody.ingredientName})`,
                    count: `"${requestBody.count}" (${typeof requestBody.count})`, // Should now be string
                    unit: `"${requestBody.unit}" (${typeof requestBody.unit})`
                });

                const response = await fetch('http://localhost:9097/api/pantry/take', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include',
                    body: JSON.stringify(requestBody)
                });

                console.log(`📡 Response Status: ${response.status}`);

                const responseText = await response.text();
                console.log(`📥 Response: "${responseText}"`);

                if (response.ok) {
                    console.log(`✅ SUCCESS: Took ${quantityToUse} ${unitToUse} of ${pantryIngredient.name}`);
                    results.push({
                        ingredient: pantryIngredient.name,
                        quantityProvided: pantryIngredient.quantity,
                        quantityUsed: quantityToUse,
                        unit: unitToUse,
                        status: 'success',
                        message: responseText,
                        matched: !!usedIngredient
                    });
                } else {
                    console.log(`❌ FAILED: ${response.status} - ${responseText}`);
                    errors.push({
                        ingredient: pantryIngredient.name,
                        error: responseText || `HTTP ${response.status}`,
                        status: response.status,
                        requestData: requestBody,
                        responseText: responseText
                    });
                }

            } catch (error) {
                console.error(`❌ ERROR processing ${pantryIngredient.name}:`, error);
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
            totalProcessed: pantryIngredients.length,
            successCount: results.length,
            errorCount: errors.length
        };

        console.log(`\n🏺 ======= FINAL PANTRY DEDUCTION RESULT =======`);
        console.log(`✅ Successful deductions: ${results.length}`);
        console.log(`❌ Failed deductions: ${errors.length}`);

        if (errors.length > 0) {
            console.log(`❌ Detailed errors:`, errors.map(e => ({
                ingredient: e.ingredient,
                error: e.error,
                status: e.status
            })));
        }

        console.log(`🏺 ===============================================\n`);

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

    // ✅ FIXED: handleGenerateRecipe function with proper pantry deduction
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
            console.log('📝 Recipe content length:', recipeContent?.length);

            // 2. ✅ Extract the actual ingredients used from the AI response
            console.log('🔍 Extracting used ingredients from AI response...');
            const usedIngredients = extractUsedIngredients(recipeContent);
            console.log('🔍 Final used ingredients for pantry deduction:', usedIngredients);

            // 3. ✅ ENSURE PANTRY DEDUCTIONS HAPPEN - Check if we have pantry ingredients
            const hasPantryIngredients = ingredients.some(ing => ing.isFromPantry);
            console.log('🏺 Has pantry ingredients?', hasPantryIngredients);
            console.log('🏺 Current user for pantry deduction:', currentUser?.uuid);

            let pantryResult = { success: true, deducted: [], errors: [], totalProcessed: 0 };

            if (hasPantryIngredients && currentUser?.uuid) {
                console.log('🏺 ===== STARTING PANTRY DEDUCTION PROCESS =====');
                pantryResult = await takePantryIngredients(ingredients, usedIngredients, currentUser);
                console.log('🏺 ===== PANTRY DEDUCTION COMPLETED =====');
            } else {
                console.log('⚠️ Skipping pantry deduction:', {
                    hasPantryIngredients,
                    hasUser: !!currentUser?.uuid,
                    userUuid: currentUser?.uuid
                });
            }

            setPantryUsage(pantryResult);

            // 4. Set the generated recipe with pantry usage info
            setGeneratedRecipe({
                id: Date.now(),
                content: recipeContent,
                ingredients: ingredients.map(ing =>
                    `${ing.name}${ing.quantity ? `: ${ing.quantity}${ing.unit ? ' ' + ing.unit : ''}` : ''}`
                ).join(', '),
                preferences: preferences,
                createdAt: new Date().toISOString(),
                pantryUsage: pantryResult,
                usedIngredients: usedIngredients // ✅ Store for debugging
            });

            // 5. Log final results
            if (pantryResult.success && pantryResult.deducted.length > 0) {
                console.log(`🏺 ✅ Successfully processed ${pantryResult.deducted.length} pantry deductions`);
                pantryResult.deducted.forEach(item => {
                    console.log(`  - ${item.ingredient}: used ${item.quantityUsed} ${item.unit} (had ${item.quantityProvided} ${item.unit})`);
                });
            } else if (pantryResult.errors && pantryResult.errors.length > 0) {
                console.log(`🏺 ⚠️ Some pantry deductions failed:`, pantryResult.errors);
            } else if (hasPantryIngredients) {
                console.log('🏺 ⚠️ No pantry deductions were processed despite having pantry ingredients');
            }

            console.log('✅ Recipe generation and pantry processing completed successfully');

        } catch (error) {
            console.error('❌ Error generating recipe:', error);

            setGeneratedRecipe({
                id: Date.now(),
                content: 'Sorry, there was an error generating your recipe. Please try again.',
                ingredients: ingredients.map(ing => ing.name).join(', '),
                preferences: preferences,
                createdAt: new Date().toISOString(),
                error: true,
                errorMessage: error.message
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