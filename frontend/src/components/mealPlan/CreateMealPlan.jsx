import React, { useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { mealPlanAPI } from '../../services/api';
import './CreateMealPlan.css';

const CreateMealPlan = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [planSettings, setPlanSettings] = useState({
        duration: 7,
        mealsPerDay: 3,
        preferences: [],
        startDate: new Date().toISOString().split('T')[0]
    });

    const [generatedMeals, setGeneratedMeals] = useState([]);
    const [mealPlanId, setMealPlanId] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isGeneratingRecipes, setIsGeneratingRecipes] = useState(false);
    const [recipeProgress, setRecipeProgress] = useState({
        total: 0,
        completed: 0,
        failed: 0,
        currentMeal: null
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const { isAuthenticated } = useContext(AuthContext);
    const navigate = useNavigate();

    const dietaryPreferences = [
        { value: 'vegetarian', label: '🥬 Vegetarian', color: '#4caf50' },
        { value: 'vegan', label: '🌱 Vegan', color: '#2e7d32' },
        { value: 'gluten-free', label: '🚫🌾 Gluten-Free', color: '#ff9800' },
        { value: 'dairy-free', label: '🚫🥛 Dairy-Free', color: '#03a9f4' },
        { value: 'keto', label: '🥑 Keto', color: '#795548' },
        { value: 'paleo', label: '🥩 Paleo', color: '#8bc34a' },
        { value: 'low-carb', label: '🥗 Low-Carb', color: '#4caf50' },
        { value: 'mediterranean', label: '🫒 Mediterranean', color: '#ff9800' },
        { value: 'nut-allergy', label: '🚫🥜 Nut Allergy', color: '#f44336' },
        { value: 'shellfish-allergy', label: '🚫🦐 Shellfish Allergy', color: '#e91e63' }
    ];

    const mealTypeLabels = {
        1: ['Dinner'],
        2: ['Lunch', 'Dinner'],
        3: ['Breakfast', 'Lunch', 'Dinner']
    };

    const mealTypeIcons = {
        'Breakfast': '🌅',
        'Lunch': '☀️',
        'Dinner': '🌙'
    };

    const updateSetting = (key, value) => {
        setPlanSettings(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const togglePreference = (preference) => {
        setPlanSettings(prev => ({
            ...prev,
            preferences: prev.preferences.includes(preference)
                ? prev.preferences.filter(p => p !== preference)
                : [...prev.preferences, preference]
        }));
    };

    const nextStep = () => {
        if (currentStep < 4) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const generateMealPlan = async () => {
        setIsGenerating(true);
        setError('');

        try {
            console.log('🎯 Generating meal plan with settings:', planSettings);

            const response = await mealPlanAPI.generateMealPlan({
                duration: planSettings.duration,
                mealsPerDay: planSettings.mealsPerDay,
                preferences: planSettings.preferences,
                startDate: planSettings.startDate
            });

            console.log('✅ Generated meal plan:', response.data);

            if (response.data && response.data.meals) {
                setGeneratedMeals(response.data.meals);
                setMealPlanId(response.data.mealPlanId);
                setCurrentStep(3);
            } else {
                throw new Error('Invalid response format from meal plan generation');
            }

        } catch (err) {
            console.error('❌ Error generating meal plan:', err);
            setError(err.response?.data?.message || 'Failed to generate meal plan. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const generateRecipes = async () => {
        if (!mealPlanId || !generatedMeals.length) {
            setError('No meal plan to generate recipes for');
            return;
        }

        setIsGeneratingRecipes(true);
        setError('');
        setCurrentStep(4);

        const total = generatedMeals.length;
        setRecipeProgress({ total, completed: 0, failed: 0, currentMeal: null });

        const mealsByDay = generatedMeals.reduce((acc, meal) => {
            if (!acc[meal.day]) acc[meal.day] = [];
            acc[meal.day].push(meal);
            return acc;
        }, {});

        for (let i = 0; i < generatedMeals.length; i++) {
            const meal = generatedMeals[i];
            const dayMeals = mealsByDay[meal.day];
            const isLastMealOfDay = dayMeals[dayMeals.length - 1] === meal;

            try {
                setRecipeProgress(prev => ({
                    ...prev,
                    currentMeal: `${meal.mealType} - Day ${meal.day}: ${meal.title}${
                        isLastMealOfDay ? ' (📧 Sending daily shopping list...)' : ''
                    }`
                }));

                console.log(`🍳 Generating recipe ${i + 1}/${total}: ${meal.title}`);

                await mealPlanAPI.generateRecipeForMeal(
                    mealPlanId,
                    meal.day,
                    meal.mealType
                );

                setRecipeProgress(prev => ({
                    ...prev,
                    completed: prev.completed + 1
                }));

                await new Promise(resolve => setTimeout(resolve, 500));

            } catch (err) {
                console.error(`❌ Failed to generate recipe for ${meal.title}:`, err);
                setRecipeProgress(prev => ({
                    ...prev,
                    failed: prev.failed + 1,
                    completed: prev.completed + 1
                }));
            }
        }

        setIsGeneratingRecipes(false);
        setRecipeProgress(prev => ({ ...prev, currentMeal: null }));

        const finalProgress = await mealPlanAPI.getMealPlanProgress(mealPlanId);
        if (finalProgress.data.status === 'completed') {
            const uniqueDays = [...new Set(generatedMeals.map(meal => meal.day))];
            setSuccess(`✅ All recipes generated! Daily shopping lists sent to your email for ${uniqueDays.length} day${uniqueDays.length > 1 ? 's' : ''}!`);
        } else if (recipeProgress.failed > 0) {
            setError(`⚠️ Generated ${recipeProgress.completed - recipeProgress.failed} recipes. ${recipeProgress.failed} failed.`);
        }
    };

    const canNavigateToMealPlans = () => {
        return recipeProgress.completed === recipeProgress.total && recipeProgress.total > 0;
    };

    const resetForm = () => {
        setCurrentStep(1);
        setPlanSettings({
            duration: 7,
            mealsPerDay: 3,
            preferences: [],
            startDate: new Date().toISOString().split('T')[0]
        });
        setGeneratedMeals([]);
        setMealPlanId(null);
        setRecipeProgress({
            total: 0,
            completed: 0,
            failed: 0,
            currentMeal: null
        });
        setError('');
        setSuccess('');
    };

    const getDayName = (dayNumber) => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const startDate = new Date(planSettings.startDate);
        const targetDate = new Date(startDate);
        targetDate.setDate(startDate.getDate() + (dayNumber - 1));
        const dayOfWeek = targetDate.getDay();
        return days[dayOfWeek];
    };

    const renderStepIndicator = () => (
        <div className="step-indicator">
            <div className="step-line"></div>
            {[1, 2, 3, 4].map(step => (
                <div key={step} className={`step-circle ${currentStep >= step ? 'active' : ''}`}>
                    <span className="step-number">{step}</span>
                    <span className="step-label">
                        {step === 1 && 'Settings'}
                        {step === 2 && 'Generate'}
                        {step === 3 && 'Review'}
                        {step === 4 && 'Recipes'}
                    </span>
                </div>
            ))}
        </div>
    );

    return (
        <div className="create-meal-plan">
            {/* Header */}
            <div className="page-header">
                <div className="header-left">
                    <button
                        className="btn btn-secondary home-btn"
                        onClick={() => navigate('/')}
                    >
                        🏠 Home
                    </button>
                </div>
                <div className="header-center">
                    <h1>🍽️ Create Your Meal Plan</h1>
                    <p>Design a personalized meal plan that fits your lifestyle</p>
                </div>
                <div className="header-right">
                    {/* Spacer for layout balance */}
                </div>
            </div>

            {/* Step Indicator */}
            {renderStepIndicator()}

            {/* Error/Success Messages */}
            {error && (
                <div className="message error-message">
                    <span className="message-icon">⚠️</span>
                    <span>{error}</span>
                    <button onClick={() => setError('')} className="close-btn">×</button>
                </div>
            )}

            {success && (
                <div className="message success-message">
                    <span className="message-icon">✅</span>
                    <span>{success}</span>
                </div>
            )}

            {/* Step 1: Settings */}
            {currentStep === 1 && (
                <div className="step-content">
                    <div className="step-header">
                        <h2>⚙️ Plan Settings</h2>
                        <p>Configure your meal plan preferences</p>
                    </div>

                    <div className="settings-grid">
                        {/* Duration */}
                        <div className="setting-card">
                            <h3>📅 Plan Duration</h3>
                            <p>How many days would you like to plan for?</p>
                            <div className="duration-options">
                                {[1, 2, 3, 4, 5, 6, 7, 14].map(days => (
                                    <button
                                        key={days}
                                        className={`option-btn ${planSettings.duration === days ? 'selected' : ''}`}
                                        onClick={() => updateSetting('duration', days)}
                                    >
                                        <span className="option-number">{days}</span>
                                        <span className="option-label">day{days > 1 ? 's' : ''}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Meals Per Day */}
                        <div className="setting-card">
                            <h3>🍽️ Meals Per Day</h3>
                            <p>How many meals would you like per day?</p>
                            <div className="meals-options">
                                {[1, 2, 3].map(meals => (
                                    <button
                                        key={meals}
                                        className={`option-btn meal-option ${planSettings.mealsPerDay === meals ? 'selected' : ''}`}
                                        onClick={() => updateSetting('mealsPerDay', meals)}
                                    >
                                        <span className="option-number">{meals}</span>
                                        <span className="option-label">meal{meals > 1 ? 's' : ''}</span>
                                        <span className="meal-icons">
                                            {mealTypeLabels[meals].map(type => mealTypeIcons[type]).join(' ')}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Start Date */}
                        <div className="setting-card">
                            <h3>📆 Start Date</h3>
                            <p>When would you like to start this meal plan?</p>
                            <input
                                type="date"
                                value={planSettings.startDate}
                                onChange={(e) => updateSetting('startDate', e.target.value)}
                                className="date-input"
                            />
                        </div>

                        {/* Dietary Preferences */}
                        <div className="setting-card preferences-card">
                            <h3>🥗 Dietary Preferences</h3>
                            <p>Select any dietary restrictions or preferences (optional)</p>
                            <div className="preferences-grid">
                                {dietaryPreferences.map(pref => (
                                    <button
                                        key={pref.value}
                                        className={`preference-btn ${planSettings.preferences.includes(pref.value) ? 'selected' : ''}`}
                                        onClick={() => togglePreference(pref.value)}
                                        style={{ '--pref-color': pref.color }}
                                    >
                                        {pref.label}
                                    </button>
                                ))}
                            </div>

                            {planSettings.preferences.length > 0 && (
                                <div className="selected-count">
                                    <span>{planSettings.preferences.length} preference{planSettings.preferences.length > 1 ? 's' : ''} selected</span>
                                    <button onClick={() => updateSetting('preferences', [])} className="clear-btn">
                                        Clear All
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="step-actions">
                        <button className="btn btn-primary" onClick={nextStep}>
                            Continue to Generation 🚀
                        </button>
                    </div>
                </div>
            )}

            {/* Step 2: Generate */}
            {currentStep === 2 && (
                <div className="step-content">
                    <div className="step-header">
                        <h2>🚀 Generate Your Meal Plan</h2>
                        <p>Review your settings and generate your personalized meal plan</p>
                    </div>

                    <div className="generation-summary">
                        <div className="summary-card">
                            <h3>📋 Plan Summary</h3>
                            <div className="summary-details">
                                <div className="summary-item">
                                    <span className="summary-label">Duration:</span>
                                    <span className="summary-value">{planSettings.duration} day{planSettings.duration > 1 ? 's' : ''}</span>
                                </div>
                                <div className="summary-item">
                                    <span className="summary-label">Meals per day:</span>
                                    <span className="summary-value">{planSettings.mealsPerDay} meal{planSettings.mealsPerDay > 1 ? 's' : ''}</span>
                                </div>
                                <div className="summary-item">
                                    <span className="summary-label">Start date:</span>
                                    <span className="summary-value">{new Date(planSettings.startDate).toLocaleDateString()}</span>
                                </div>
                                <div className="summary-item">
                                    <span className="summary-label">Total meals:</span>
                                    <span className="summary-value">{planSettings.duration * planSettings.mealsPerDay} meals</span>
                                </div>
                            </div>

                            {planSettings.preferences.length > 0 && (
                                <div className="summary-preferences">
                                    <span className="summary-label">Dietary preferences:</span>
                                    <div className="preference-tags">
                                        {planSettings.preferences.map(pref => {
                                            const prefObj = dietaryPreferences.find(p => p.value === pref);
                                            return (
                                                <span key={pref} className="preference-tag">
                                                    {prefObj?.label}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {isGenerating ? (
                        <div className="generation-loading">
                            <div className="loading-animation">
                                <div className="chef-icon">👨‍🍳</div>
                                <div className="cooking-pot">🍲</div>
                                <div className="steam">💨</div>
                            </div>
                            <h3>Generating Your Meal Plan...</h3>
                            <p>Creating {planSettings.duration * planSettings.mealsPerDay} personalized meals for you</p>
                            <div className="loading-bar">
                                <div className="loading-progress"></div>
                            </div>
                        </div>
                    ) : (
                        <div className="step-actions">
                            <button className="btn btn-secondary" onClick={prevStep}>
                                ← Back to Settings
                            </button>
                            <button className="btn btn-primary" onClick={generateMealPlan}>
                                🎯 Generate My Meal Plan
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Step 3: Review & Save */}
            {currentStep === 3 && (
                <div className="step-content">
                    <div className="step-header">
                        <h2>✨ Your Meal Plan is Ready!</h2>
                        <p>Review your personalized meal plan and generate detailed recipes</p>
                    </div>

                    <div className="meal-plan-preview">
                        <div className="preview-header">
                            <h3>📅 Week starting {new Date(planSettings.startDate).toLocaleDateString()}</h3>
                            <p>{planSettings.duration * planSettings.mealsPerDay} total meals</p>
                        </div>

                        <div className="days-grid">
                            {Array.from({ length: planSettings.duration }, (_, dayIndex) => (
                                <div key={dayIndex + 1} className="day-card">
                                    <div className="day-header">
                                        <h4>{getDayName(dayIndex + 1)}</h4>
                                        <span className="day-number">Day {dayIndex + 1}</span>
                                    </div>
                                    <div className="day-meals">
                                        {generatedMeals
                                            .filter(meal => meal.day === dayIndex + 1)
                                            .map((meal, mealIndex) => (
                                                <div key={mealIndex} className="meal-item">
                                                    <div className="meal-header">
                                                        <span className="meal-icon">
                                                            {mealTypeIcons[meal.mealType]}
                                                        </span>
                                                        <span className="meal-type">{meal.mealType}</span>
                                                    </div>
                                                    <div className="meal-content">
                                                        <h5>{meal.title}</h5>
                                                        <p>{meal.content}</p>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="step-actions">
                        <button className="btn btn-secondary" onClick={resetForm}>
                            🔄 Create New Plan
                        </button>
                        <button className="btn btn-secondary" onClick={generateMealPlan} disabled={isGenerating}>
                            🎲 Regenerate
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={generateRecipes}
                        >
                            ✨ Generate Detailed Recipes
                        </button>
                    </div>

                    {!isAuthenticated && (
                        <div className="auth-warning">
                            <p>🔒 Please log in to save your meal plan</p>
                        </div>
                    )}
                </div>
            )}

            {/* Step 4: Recipe Generation Progress */}
            {currentStep === 4 && (
                <div className="step-content">
                    <div className="step-header">
                        <h2>👨‍🍳 Generating Detailed Recipes</h2>
                        <p>Creating step-by-step recipes for each meal</p>
                    </div>

                    <div className="recipe-gen-progress">
                        <div className="recipe-gen-stats">
                            <div className="recipe-gen-stat-card">
                                <span className="recipe-gen-stat-icon">📝</span>
                                <span className="recipe-gen-stat-value">{recipeProgress.total}</span>
                                <span className="recipe-gen-stat-label">Total Recipes</span>
                            </div>
                            <div className="recipe-gen-stat-card">
                                <span className="recipe-gen-stat-icon">✅</span>
                                <span className="recipe-gen-stat-value">{recipeProgress.completed}</span>
                                <span className="recipe-gen-stat-label">Completed</span>
                            </div>
                            {recipeProgress.failed > 0 && (
                                <div className="recipe-gen-stat-card recipe-gen-error">
                                    <span className="recipe-gen-stat-icon">❌</span>
                                    <span className="recipe-gen-stat-value">{recipeProgress.failed}</span>
                                    <span className="recipe-gen-stat-label">Failed</span>
                                </div>
                            )}
                        </div>

                        <div className="recipe-gen-progress-container">
                            <div className="recipe-gen-progress-bar">
                                <div
                                    className="recipe-gen-progress-fill"
                                    style={{
                                        width: `${(recipeProgress.completed / recipeProgress.total) * 100}%`
                                    }}
                                />
                            </div>
                            <div className="recipe-gen-progress-text">
                                {Math.round((recipeProgress.completed / recipeProgress.total) * 100)}% Complete
                            </div>
                        </div>

                        {recipeProgress.currentMeal && (
                            <div className="recipe-gen-current-meal">
                                <div className="recipe-gen-spinner">🍳</div>
                                <p>Generating recipe for: <strong>{recipeProgress.currentMeal}</strong></p>
                            </div>
                        )}

                        {!isGeneratingRecipes && recipeProgress.completed === recipeProgress.total && (
                            <div className="recipe-gen-completion">
                                <div className="recipe-gen-completion-icon">🎉</div>
                                <h3>All Recipes Generated!</h3>
                                <p>Your complete meal plan with detailed recipes is ready.</p>
                            </div>
                        )}
                    </div>

                    <div className="step-actions">
                        <button
                            className="btn btn-secondary"
                            onClick={resetForm}
                            disabled={isGeneratingRecipes}
                        >
                            🔄 Create Another Plan
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate('/meal-plan')}
                            disabled={!canNavigateToMealPlans() || isGeneratingRecipes}
                        >
                            {canNavigateToMealPlans()
                                ? '📋 View My Meal Plans'
                                : `⏳ Generating Recipes... (${recipeProgress.completed}/${recipeProgress.total})`
                            }
                        </button>
                    </div>

                    {!canNavigateToMealPlans() && !isGeneratingRecipes && (
                        <div className="retry-section">
                            <p>Some recipes failed to generate. You can:</p>
                            <button
                                className="btn btn-secondary"
                                onClick={generateRecipes}
                            >
                                🔄 Retry Failed Recipes
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CreateMealPlan;