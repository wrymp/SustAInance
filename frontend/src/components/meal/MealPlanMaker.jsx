import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import './MealPlanMaker.css';

const MealPlanMaker = () => {
    const [planSettings, setPlanSettings] = useState({
        duration: 7,
        mealsPerDay: 3,
        preferences: [],
        startDate: new Date().toISOString().split('T')[0]
    });

    const [generatedMeals, setGeneratedMeals] = useState([]);
    const [existingMealPlans, setExistingMealPlans] = useState([]);
    const [currentStep, setCurrentStep] = useState('settings'); // 'settings' or 'results'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const { isAuthenticated, user } = useContext(AuthContext);

    const dietaryPreferences = [
        { value: 'vegetarian', label: '🥬 Vegetarian', color: '#4caf50' },
        { value: 'vegan', label: '🌱 Vegan', color: '#2e7d32' },
        { value: 'gluten-free', label: '🚫🌾 Gluten-Free', color: '#ff9800' },
        { value: 'dairy-free', label: '🚫🥛 Dairy-Free', color: '#03a9f4' },
        { value: 'keto', label: '🥑 Keto', color: '#795548' },
        { value: 'paleo', label: '🥩 Paleo', color: '#8bc34a' },
        { value: 'low-carb', label: '🥗 Low-Carb', color: '#4caf50' },
        { value: 'nut-allergy', label: '🚫🥜 Nut Allergy', color: '#f44336' },
        { value: 'shellfish-allergy', label: '🚫🦐 Shellfish Allergy', color: '#e91e63' },
        { value: 'egg-allergy', label: '🚫🥚 Egg Allergy', color: '#ff5722' }
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

    // Fetch existing meal plans
    useEffect(() => {
        if (isAuthenticated && user?.id) {
            fetchExistingMealPlans();
        }
    }, [isAuthenticated, user]);

    const fetchExistingMealPlans = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/meal-plans/user/${user.id}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });

            if (response.ok) {
                const plans = await response.json();
                setExistingMealPlans(plans);
            }
        } catch (err) {
            console.error('Error fetching meal plans:', err);
        }
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

    const generateMealPlan = async () => {
        setIsGenerating(true);
        setError('');

        try {
            // Simulate meal generation
            await new Promise(resolve => setTimeout(resolve, 2000));

            const sampleMeals = [
                { title: "Avocado Toast with Poached Egg", content: "Wholesome breakfast with creamy avocado on sourdough topped with a perfectly poached egg." },
                { title: "Quinoa Buddha Bowl", content: "Nutritious bowl with quinoa, roasted vegetables, chickpeas, and tahini dressing." },
                { title: "Grilled Salmon with Asparagus", content: "Fresh Atlantic salmon grilled to perfection with seasoned asparagus spears." },
                { title: "Chicken Stir-Fry", content: "Tender chicken with colorful vegetables in a savory soy-ginger sauce over rice." },
                { title: "Vegetable Curry", content: "Aromatic curry with mixed vegetables, coconut milk, and fragrant spices." },
                { title: "Greek Salad with Grilled Chicken", content: "Fresh Mediterranean salad with crispy chicken, olives, feta, and herbs." },
                { title: "Beef Tacos", content: "Seasoned ground beef in soft tortillas with fresh toppings and lime." },
                { title: "Mushroom Risotto", content: "Creamy arborio rice with wild mushrooms, white wine, and parmesan." },
                { title: "Pancakes with Berries", content: "Fluffy pancakes served with fresh berries and maple syrup." },
                { title: "Thai Green Curry", content: "Authentic Thai curry with coconut milk, basil, and your choice of protein." },
                { title: "Caprese Sandwich", content: "Fresh mozzarella, tomatoes, and basil on crusty bread with balsamic glaze." },
                { title: "Lemon Herb Roasted Chicken", content: "Juicy roasted chicken with herbs, lemon, and roasted root vegetables." },
                { title: "Vegetable Pasta Primavera", content: "Light pasta with seasonal vegetables in a garlic olive oil sauce." },
                { title: "Smoothie Bowl", content: "Thick smoothie bowl topped with granola, fresh fruit, and nuts." },
                { title: "Fish and Chips", content: "Crispy battered fish with golden fries and mushy peas." },
                { title: "Stuffed Bell Peppers", content: "Colorful bell peppers stuffed with rice, ground meat, and vegetables." },
                { title: "Caesar Salad", content: "Classic romaine lettuce with parmesan, croutons, and Caesar dressing." },
                { title: "Chicken Noodle Soup", content: "Comforting soup with tender chicken, vegetables, and egg noodles." },
                { title: "Margherita Pizza", content: "Classic pizza with tomato sauce, fresh mozzarella, and basil." },
                { title: "Beef Stew", content: "Hearty stew with tender beef, potatoes, carrots, and herbs." }
            ];

            const meals = [];
            const mealTypes = mealTypeLabels[planSettings.mealsPerDay];

            for (let day = 1; day <= planSettings.duration; day++) {
                for (let mealIndex = 0; mealIndex < planSettings.mealsPerDay; mealIndex++) {
                    const randomMeal = sampleMeals[Math.floor(Math.random() * sampleMeals.length)];
                    meals.push({
                        day,
                        mealType: mealTypes[mealIndex],
                        title: randomMeal.title,
                        content: randomMeal.content
                    });
                }
            }

            setGeneratedMeals(meals);
            setCurrentStep('results');

        } catch (err) {
            setError('Failed to generate meal plan. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const saveMealPlan = async () => {
        if (!isAuthenticated || !user?.id) {
            setError('Please log in to save meal plans');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const mealPlanData = {
                userId: user.id,
                startDate: planSettings.startDate,
                duration: planSettings.duration,
                mealsPerDay: planSettings.mealsPerDay,
                preferences: JSON.stringify(planSettings.preferences),
                mealsData: JSON.stringify(generatedMeals)
            };

            const response = await fetch('http://localhost:8080/api/meal-plans', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(mealPlanData)
            });

            if (response.ok) {
                setSuccess('Meal plan saved successfully!');
                fetchExistingMealPlans();
                setTimeout(() => setSuccess(''), 3000);
            } else {
                const errorText = await response.text();
                setError(`Failed to save meal plan: ${errorText}`);
            }
        } catch (err) {
            setError(`Network error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const loadExistingPlan = (plan) => {
        try {
            const mealsData = JSON.parse(plan.mealsData);
            const preferences = JSON.parse(plan.preferences);

            setPlanSettings({
                duration: plan.duration,
                mealsPerDay: plan.mealsPerDay,
                preferences: preferences,
                startDate: plan.startDate
            });

            setGeneratedMeals(mealsData);
            setCurrentStep('results');
        } catch (err) {
            setError('Failed to load meal plan');
        }
    };

    const startOver = () => {
        setCurrentStep('settings');
        setGeneratedMeals([]);
        setError('');
        setSuccess('');
    };

    const getDayName = (dayNumber) => {
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        return days[dayNumber - 1];
    };

    return (
        <div className="meal-plan-container">
            {/* Header */}
            <div className="meal-plan-header">
                <h1 className="meal-plan-title">
                    {currentStep === 'settings' ? 'Create Your Meal Plan' : 'Your Personalized Meal Plan'}
                </h1>
                <p className="meal-plan-subtitle">
                    {currentStep === 'settings'
                        ? 'Customize your meal plan duration, meals per day, and dietary preferences'
                        : `${planSettings.duration} day${planSettings.duration > 1 ? 's' : ''} • ${planSettings.mealsPerDay} meal${planSettings.mealsPerDay > 1 ? 's' : ''} per day`
                    }
                </p>
            </div>

            {/* Messages */}
            {error && (
                <div className="meal-plan-error">
                    <span className="error-icon">⚠️</span>
                    <span>{error}</span>
                    <button onClick={() => setError('')}>×</button>
                </div>
            )}

            {success && (
                <div className="meal-plan-success">
                    <span className="success-icon">✅</span>
                    <span>{success}</span>
                    <button onClick={() => setSuccess('')}>×</button>
                </div>
            )}

            {!isAuthenticated && (
                <div className="meal-plan-auth-warning">
                    <span className="auth-icon">🔒</span>
                    <p>Please log in to save your meal plans</p>
                </div>
            )}

            {/* Existing Plans */}
            {existingMealPlans.length > 0 && currentStep === 'settings' && (
                <div className="existing-plans-section">
                    <h3>Your Previous Meal Plans</h3>
                    <div className="existing-plans-grid">
                        {existingMealPlans.slice(0, 3).map(plan => (
                            <div key={plan.id} className="existing-plan-card">
                                <div className="plan-info">
                                    <h4>{plan.duration} day{plan.duration > 1 ? 's' : ''}</h4>
                                    <p>{plan.mealsPerDay} meal{plan.mealsPerDay > 1 ? 's' : ''} per day</p>
                                    <p>Created: {new Date(plan.createdAt).toLocaleDateString()}</p>
                                </div>
                                <button
                                    className="load-plan-btn"
                                    onClick={() => loadExistingPlan(plan)}
                                >
                                    Load Plan
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Settings Step */}
            {currentStep === 'settings' && (
                <div className="meal-plan-settings">
                    {/* Duration Selection */}
                    <div className="setting-section">
                        <h3 className="setting-title">📅 Plan Duration</h3>
                        <p className="setting-description">How many days would you like to plan for?</p>

                        <div className="duration-selector">
                            {[1, 2, 3, 4, 5, 6, 7].map(days => (
                                <button
                                    key={days}
                                    className={`duration-btn ${planSettings.duration === days ? 'selected' : ''}`}
                                    onClick={() => updateSetting('duration', days)}
                                >
                                    <span className="duration-number">{days}</span>
                                    <span className="duration-label">day{days > 1 ? 's' : ''}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Meals Per Day */}
                    <div className="setting-section">
                        <h3 className="setting-title">🍽️ Meals Per Day</h3>
                        <p className="setting-description">How many meals would you like per day?</p>

                        <div className="meals-selector">
                            {[1, 2, 3].map(meals => (
                                <button
                                    key={meals}
                                    className={`meals-btn ${planSettings.mealsPerDay === meals ? 'selected' : ''}`}
                                    onClick={() => updateSetting('mealsPerDay', meals)}
                                >
                                    <span className="meals-number">{meals}</span>
                                    <span className="meals-label">meal{meals > 1 ? 's' : ''}</span>
                                    <span className="meals-types">
                                        {mealTypeLabels[meals].map(type => mealTypeIcons[type]).join(' ')}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Start Date */}
                    <div className="setting-section">
                        <h3 className="setting-title">📆 Start Date</h3>
                        <p className="setting-description">When would you like to start this meal plan?</p>

                        <input
                            type="date"
                            value={planSettings.startDate}
                            onChange={(e) => updateSetting('startDate', e.target.value)}
                            className="date-input"
                        />
                    </div>

                    {/* Preferences */}
                    <div className="setting-section">
                        <h3 className="setting-title">
                            🥗 Dietary Preferences & Allergies
                            <span className="optional-badge">Optional</span>
                        </h3>
                        <p className="setting-description">Select any dietary restrictions or allergies</p>

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
                            <div className="selected-preferences">
                                <p>Selected: {planSettings.preferences.length} preference{planSettings.preferences.length > 1 ? 's' : ''}</p>
                                <button
                                    className="clear-preferences-btn"
                                    onClick={() => updateSetting('preferences', [])}
                                >
                                    ✕ Clear All
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Generate Button */}
                    <div className="generate-section">
                        <button
                            className="generate-btn"
                            onClick={generateMealPlan}
                            disabled={isGenerating}
                        >
                            <span className="btn-icon">
                                {isGenerating ? '⏳' : '🚀'}
                            </span>
                            {isGenerating ? 'Generating Your Meal Plan...' : 'Generate My Meal Plan!'}
                        </button>

                        <div className="plan-summary">
                            <p>
                                You'll get <strong>{planSettings.duration * planSettings.mealsPerDay} meals</strong>
                                {planSettings.preferences.length > 0 && (
                                    <span> with {planSettings.preferences.length} dietary consideration{planSettings.preferences.length > 1 ? 's' : ''}</span>
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Results Step */}
            {currentStep === 'results' && (
                <div className="meal-plan-results">
                    <div className="results-header">
                        <div className="plan-info">
                            <h3>Week starting {new Date(planSettings.startDate).toLocaleDateString()}</h3>
                            <p>{planSettings.duration * planSettings.mealsPerDay} total meals</p>
                        </div>

                        {planSettings.preferences.length > 0 && (
                            <div className="plan-preferences">
                                <h4>Dietary Considerations:</h4>
                                <div className="preferences-tags">
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

                    <div className="meals-grid">
                        {Array.from({ length: planSettings.duration }, (_, dayIndex) => (
                            <div key={dayIndex + 1} className="day-section">
                                <h3 className="day-title">
                                    <span className="day-number">{dayIndex + 1}</span>
                                    <span className="day-name">{getDayName(dayIndex + 1)}</span>
                                </h3>

                                <div className="day-meals">
                                    {generatedMeals
                                        .filter(meal => meal.day === dayIndex + 1)
                                        .map((meal, mealIndex) => (
                                            <div key={mealIndex} className="meal-card">
                                                <div className="meal-header">
                                                    <span className="meal-icon">
                                                        {mealTypeIcons[meal.mealType]}
                                                    </span>
                                                    <span className="meal-type">{meal.mealType}</span>
                                                </div>
                                                <div className="meal-content">
                                                    <h4 className="meal-title">{meal.title}</h4>
                                                    <p className="meal-description">{meal.content}</p>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="results-actions">
                        <button
                            className="save-btn"
                            onClick={saveMealPlan}
                            disabled={loading || !isAuthenticated}
                        >
                            <span className="btn-icon">
                                {loading ? '⏳' : '💾'}
                            </span>
                            {loading ? 'Saving...' : 'Save Meal Plan'}
                        </button>

                        <button
                            className="regenerate-btn"
                            onClick={generateMealPlan}
                            disabled={isGenerating}
                        >
                            <span className="btn-icon">🔄</span>
                            Generate New Plan
                        </button>

                        <button
                            className="back-btn"
                            onClick={startOver}
                        >
                            <span className="btn-icon">⚙️</span>
                            Change Settings
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MealPlanMaker;