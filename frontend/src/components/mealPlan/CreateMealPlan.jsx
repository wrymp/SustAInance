import React, { useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './CreateMealPlan.css';

const API_BASE_URL = 'http://localhost:9097/api';

const CreateMealPlan = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [planSettings, setPlanSettings] = useState({
        duration: 7,
        mealsPerDay: 3,
        preferences: [],
        startDate: new Date().toISOString().split('T')[0]
    });

    const [generatedMeals, setGeneratedMeals] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
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

    // Get current user
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
        if (currentStep < 3) {
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
            // Simulate meal generation with more realistic delay
            await new Promise(resolve => setTimeout(resolve, 3000));

            const sampleMeals = [
                { title: "Avocado Toast with Poached Egg", content: "Wholesome breakfast with creamy avocado on sourdough topped with a perfectly poached egg.", category: "breakfast" },
                { title: "Greek Yogurt Parfait", content: "Layered parfait with Greek yogurt, fresh berries, and granola.", category: "breakfast" },
                { title: "Overnight Oats", content: "Nutritious overnight oats with chia seeds, almond milk, and fresh fruit.", category: "breakfast" },
                { title: "Scrambled Eggs with Spinach", content: "Fluffy scrambled eggs with fresh spinach and herbs.", category: "breakfast" },

                { title: "Quinoa Buddha Bowl", content: "Nutritious bowl with quinoa, roasted vegetables, chickpeas, and tahini dressing.", category: "lunch" },
                { title: "Chicken Caesar Salad", content: "Classic Caesar salad with grilled chicken, romaine lettuce, and parmesan.", category: "lunch" },
                { title: "Turkey & Avocado Wrap", content: "Whole wheat wrap with turkey, avocado, lettuce, and tomatoes.", category: "lunch" },
                { title: "Lentil Soup", content: "Hearty lentil soup with vegetables and herbs.", category: "lunch" },
                { title: "Caprese Sandwich", content: "Fresh mozzarella, tomatoes, and basil on artisan bread.", category: "lunch" },

                { title: "Grilled Salmon with Asparagus", content: "Fresh Atlantic salmon grilled to perfection with seasoned asparagus spears.", category: "dinner" },
                { title: "Chicken Stir-Fry", content: "Tender chicken with colorful vegetables in a savory soy-ginger sauce over rice.", category: "dinner" },
                { title: "Vegetable Curry", content: "Aromatic curry with mixed vegetables, coconut milk, and fragrant spices.", category: "dinner" },
                { title: "Beef Tacos", content: "Seasoned ground beef in soft tortillas with fresh toppings and lime.", category: "dinner" },
                { title: "Mushroom Risotto", content: "Creamy arborio rice with wild mushrooms, white wine, and parmesan.", category: "dinner" },
                { title: "Thai Green Curry", content: "Authentic Thai curry with coconut milk, basil, and your choice of protein.", category: "dinner" },
                { title: "Lemon Herb Roasted Chicken", content: "Juicy roasted chicken with herbs, lemon, and roasted root vegetables.", category: "dinner" },
                { title: "Stuffed Bell Peppers", content: "Colorful bell peppers stuffed with rice, ground meat, and vegetables.", category: "dinner" },
                { title: "Fish and Chips", content: "Crispy battered fish with golden fries and mushy peas.", category: "dinner" },
                { title: "Beef Stew", content: "Hearty stew with tender beef, potatoes, carrots, and herbs.", category: "dinner" }
            ];

            const meals = [];
            const mealTypes = mealTypeLabels[planSettings.mealsPerDay];

            for (let day = 1; day <= planSettings.duration; day++) {
                for (let mealIndex = 0; mealIndex < planSettings.mealsPerDay; mealIndex++) {
                    const mealType = mealTypes[mealIndex];
                    const categoryFilter = mealType.toLowerCase();

                    // Filter meals by category if available
                    const filteredMeals = sampleMeals.filter(meal =>
                        meal.category === categoryFilter || meal.category === 'any'
                    );

                    const mealsToChooseFrom = filteredMeals.length > 0 ? filteredMeals : sampleMeals;
                    const randomMeal = mealsToChooseFrom[Math.floor(Math.random() * mealsToChooseFrom.length)];

                    meals.push({
                        day,
                        mealType,
                        title: randomMeal.title,
                        content: randomMeal.content
                    });
                }
            }

            setGeneratedMeals(meals);
            setCurrentStep(3);

        } catch (err) {
            setError('Failed to generate meal plan. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const saveMealPlan = async () => {
        if (!isAuthenticated) {
            setError('Please log in to save meal plans');
            return;
        }

        const userId = await getCurrentUser();
        if (!userId) {
            setError('Could not get user information');
            return;
        }

        setIsSaving(true);
        setError('');

        try {
            const mealPlanData = {
                userId: userId,
                startDate: planSettings.startDate,
                duration: planSettings.duration,
                mealsPerDay: planSettings.mealsPerDay,
                preferences: JSON.stringify(planSettings.preferences),
                mealsData: JSON.stringify(generatedMeals)
            };

            console.log('💾 Saving meal plan:', mealPlanData);

            const response = await fetch(`${API_BASE_URL}/meal-plans`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(mealPlanData)
            });

            if (response.ok) {
                setSuccess('Meal plan saved successfully!');
                setTimeout(() => {
                    navigate('/my-meal-plans');
                }, 1500);
            } else {
                const errorText = await response.text();
                setError(`Failed to save meal plan: ${errorText}`);
            }
        } catch (err) {
            setError(`Network error: ${err.message}`);
        } finally {
            setIsSaving(false);
        }
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
        setError('');
        setSuccess('');
    };

    const getDayName = (dayNumber) => {
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        return days[dayNumber - 1] || `Day ${dayNumber}`;
    };

    const renderStepIndicator = () => (
        <div className="step-indicator">
            <div className="step-line"></div>
            {[1, 2, 3].map(step => (
                <div key={step} className={`step-circle ${currentStep >= step ? 'active' : ''}`}>
                    <span className="step-number">{step}</span>
                    <span className="step-label">
                        {step === 1 && 'Settings'}
                        {step === 2 && 'Generate'}
                        {step === 3 && 'Review'}
                    </span>
                </div>
            ))}
        </div>
    );

    return (
        <div className="create-meal-plan">
            {/* Header */}
            <div className="page-header">
                <h1>🍽️ Create Your Meal Plan</h1>
                <p>Design a personalized meal plan that fits your lifestyle</p>
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
                        <p>Review your personalized meal plan and save it</p>
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
                        <button className="btn btn-secondary" onClick={generateMealPlan}>
                            🎲 Regenerate
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={saveMealPlan}
                            disabled={isSaving || !isAuthenticated}
                        >
                            {isSaving ? '💾 Saving...' : '💾 Save Meal Plan'}
                        </button>
                    </div>

                    {!isAuthenticated && (
                        <div className="auth-warning">
                            <p>🔒 Please log in to save your meal plan</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CreateMealPlan;