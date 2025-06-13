import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import IngredientsStep from './steps/IngredientsStep';
import PreferencesStep from './steps/PreferencesStep';
import ResultsStep from './steps/ResultsStep';
import './RecipeGenerator.css';
import { recipeAPI } from '../../services/api'

const RecipeGenerator = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Wizard state
    const [currentStep, setCurrentStep] = useState(1);
    const [isGenerating, setIsGenerating] = useState(false);

    // Recipe data
    const [ingredients, setIngredients] = useState([]);
    const [preferences, setPreferences] = useState({
        cuisine: '',
        dietaryRestrictions: [],
        cookingTime: '',
        difficulty: '',
        mealType: ''
    });
    const [generatedRecipe, setGeneratedRecipe] = useState(null);

    // Handle pre-filled ingredients from other pages
    useEffect(() => {
        const stateIngredients = location.state?.ingredients;
        if (stateIngredients) {
            if (typeof stateIngredients === 'string') {
                // From home page quick input - parse string
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
                // From pantry - already formatted
                setIngredients(stateIngredients);
            }

            // If we have pre-filled ingredients, show them in step 1
            setCurrentStep(1);
        }
    }, [location.state]);

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

    const handleGenerateRecipe = async () => {
        setIsGenerating(true);
        setCurrentStep(3);

        try {
            console.log('🎯 Generating recipe with:', { ingredients, preferences });

            // ✅ SIMPLE: Single API call with all data
            const response = await recipeAPI.generateRecipe(ingredients, preferences);
            const recipeContent = response.data;

            setGeneratedRecipe({
                id: Date.now(),
                content: recipeContent,
                ingredients: ingredients.map(ing =>
                    `${ing.name}${ing.quantity ? `: ${ing.quantity}${ing.unit ? ' ' + ing.unit : ''}` : ''}`
                ).join(', '),
                preferences: preferences,
                createdAt: new Date().toISOString()
            });

            console.log('✅ Recipe generated successfully');

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
            // Save to localStorage for now (later: save to backend)
            const savedRecipes = JSON.parse(localStorage.getItem('savedRecipes') || '[]');
            const recipeToSave = {
                ...generatedRecipe,
                saved: true,
                savedAt: new Date().toISOString()
            };

            savedRecipes.push(recipeToSave);
            localStorage.setItem('savedRecipes', JSON.stringify(savedRecipes));

            // Show success message or navigate to recipe collection
            alert('Recipe saved successfully! 🎉');
        }
    };

    const handleGenerateAnother = () => {
        setCurrentStep(1);
        setGeneratedRecipe(null);
        setIsGenerating(false);
        // Keep ingredients and preferences for easier iteration
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
                        onStartOver={handleGenerateAnother}
                        onSaveRecipe={async (recipe) => {
                            // Implement save functionality
                            console.log('Saving recipe:', recipe);
                            // You can integrate with your backend here
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default RecipeGenerator;