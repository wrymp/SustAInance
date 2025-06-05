import React, { useState } from 'react';
import './PreferencesStep.css';

const PreferencesStep = ({
                             preferences,
                             setPreferences,
                             onNext,
                             onPrev,
                             ingredients
                         }) => {
    const [errors, setErrors] = useState({});

    const cuisineTypes = [
        { value: 'italian', label: '🇮🇹 Italian', popular: true },
        { value: 'chinese', label: '🇨🇳 Chinese', popular: true },
        { value: 'mexican', label: '🇲🇽 Mexican', popular: true },
        { value: 'indian', label: '🇮🇳 Indian', popular: true },
        { value: 'japanese', label: '🇯🇵 Japanese', popular: true },
        { value: 'french', label: '🇫🇷 French', popular: true },
        { value: 'thai', label: '🇹🇭 Thai', popular: false },
        { value: 'greek', label: '🇬🇷 Greek', popular: false },
        { value: 'korean', label: '🇰🇷 Korean', popular: false },
        { value: 'american', label: '🇺🇸 American', popular: false },
        { value: 'mediterranean', label: '🌊 Mediterranean', popular: false },
        { value: 'middle-eastern', label: '🕌 Middle Eastern', popular: false }
    ];

    const dietaryRestrictions = [
        { value: 'vegetarian', label: '🥬 Vegetarian', icon: '🥬' },
        { value: 'vegan', label: '🌱 Vegan', icon: '🌱' },
        { value: 'gluten-free', label: '🌾 Gluten-Free', icon: '🚫🌾' },
        { value: 'dairy-free', label: '🥛 Dairy-Free', icon: '🚫🥛' },
        { value: 'keto', label: '🥑 Keto', icon: '🥑' },
        { value: 'paleo', label: '🥩 Paleo', icon: '🥩' },
        { value: 'low-carb', label: '🥗 Low-Carb', icon: '🥗' },
        { value: 'halal', label: '☪️ Halal', icon: '☪️' },
        { value: 'kosher', label: '✡️ Kosher', icon: '✡️' }
    ];

    const cookingTimes = [
        { value: '15', label: '⚡ Quick (15 min)', icon: '⚡' },
        { value: '30', label: '🕐 Medium (30 min)', icon: '🕐' },
        { value: '60', label: '🕑 Long (1 hour)', icon: '🕑' },
        { value: '120', label: '🍲 Slow Cook (2+ hours)', icon: '🍲' }
    ];

    const difficultyLevels = [
        { value: 'beginner', label: '👶 Beginner', description: 'Simple & easy' },
        { value: 'intermediate', label: '👨‍🍳 Intermediate', description: 'Some cooking skills' },
        { value: 'advanced', label: '👨‍🎓 Advanced', description: 'Experienced cook' }
    ];

    const mealTypes = [
        { value: 'breakfast', label: '🌅 Breakfast', icon: '🌅' },
        { value: 'lunch', label: '☀️ Lunch', icon: '☀️' },
        { value: 'dinner', label: '🌙 Dinner', icon: '🌙' },
        { value: 'snack', label: '🍿 Snack', icon: '🍿' },
        { value: 'dessert', label: '🍰 Dessert', icon: '🍰' },
        { value: 'appetizer', label: '🥗 Appetizer', icon: '🥗' }
    ];

    const updatePreference = (key, value) => {
        setPreferences(prev => ({
            ...prev,
            [key]: value
        }));

        // Clear error when user makes a selection
        if (errors[key]) {
            setErrors(prev => ({
                ...prev,
                [key]: null
            }));
        }
    };

    const toggleDietaryRestriction = (restriction) => {
        setPreferences(prev => ({
            ...prev,
            dietaryRestrictions: prev.dietaryRestrictions.includes(restriction)
                ? prev.dietaryRestrictions.filter(r => r !== restriction)
                : [...prev.dietaryRestrictions, restriction]
        }));
    };

    const handleNext = () => {
        // Optional validation - you can skip this if you want all preferences to be optional
        const newErrors = {};

        // Example: Make meal type required
        // if (!preferences.mealType) {
        //   newErrors.mealType = 'Please select a meal type';
        // }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        onNext();
    };

    const popularCuisines = cuisineTypes.filter(c => c.popular);
    const otherCuisines = cuisineTypes.filter(c => !c.popular);

    return (
        <div className="step-container">
            <h2 className="step-title">Let's customize your recipe!</h2>
            <p className="step-subtitle">
                Tell us your preferences to get the perfect recipe for your {ingredients.length} ingredients
            </p>

            <div className="preferences-form">
                {/* Cuisine Type */}
                <div className="preference-section">
                    <h3 className="preference-title">
                        🌍 Cuisine Type
                        <span className="optional-badge">Optional</span>
                    </h3>
                    <p className="preference-description">What flavors are you in the mood for?</p>

                    <div className="cuisine-selection">
                        <div className="popular-cuisines">
                            <h4>Popular Choices</h4>
                            <div className="cuisine-grid">
                                {popularCuisines.map(cuisine => (
                                    <button
                                        key={cuisine.value}
                                        className={`cuisine-btn ${preferences.cuisine === cuisine.value ? 'selected' : ''}`}
                                        onClick={() => updatePreference('cuisine', cuisine.value)}
                                    >
                                        {cuisine.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="other-cuisines">
                            <h4>More Options</h4>
                            <div className="cuisine-grid">
                                {otherCuisines.map(cuisine => (
                                    <button
                                        key={cuisine.value}
                                        className={`cuisine-btn ${preferences.cuisine === cuisine.value ? 'selected' : ''}`}
                                        onClick={() => updatePreference('cuisine', cuisine.value)}
                                    >
                                        {cuisine.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {preferences.cuisine && (
                            <button
                                className="clear-selection-btn"
                                onClick={() => updatePreference('cuisine', '')}
                            >
                                ✕ Clear Selection
                            </button>
                        )}
                    </div>
                </div>

                {/* Dietary Restrictions */}
                <div className="preference-section">
                    <h3 className="preference-title">
                        🥗 Dietary Preferences
                        <span className="optional-badge">Optional</span>
                    </h3>
                    <p className="preference-description">Select any dietary restrictions or preferences</p>

                    <div className="dietary-grid">
                        {dietaryRestrictions.map(diet => (
                            <button
                                key={diet.value}
                                className={`dietary-btn ${preferences.dietaryRestrictions.includes(diet.value) ? 'selected' : ''}`}
                                onClick={() => toggleDietaryRestriction(diet.value)}
                            >
                                <span className="dietary-icon">{diet.icon}</span>
                                <span className="dietary-label">{diet.label.replace(/🥬|🌱|🌾|🥛|🥑|🥩|🥗|☪️|✡️/g, '').trim()}</span>
                            </button>
                        ))}
                    </div>

                    {preferences.dietaryRestrictions.length > 0 && (
                        <div className="selected-dietary">
                            <p>Selected: {preferences.dietaryRestrictions.length} restriction(s)</p>
                            <button
                                className="clear-selection-btn"
                                onClick={() => updatePreference('dietaryRestrictions', [])}
                            >
                                ✕ Clear All
                            </button>
                        </div>
                    )}
                </div>

                {/* Cooking Time */}
                <div className="preference-section">
                    <h3 className="preference-title">
                        ⏰ Cooking Time
                        <span className="optional-badge">Optional</span>
                    </h3>
                    <p className="preference-description">How much time do you have?</p>

                    <div className="time-grid">
                        {cookingTimes.map(time => (
                            <button
                                key={time.value}
                                className={`time-btn ${preferences.cookingTime === time.value ? 'selected' : ''}`}
                                onClick={() => updatePreference('cookingTime', time.value)}
                            >
                                <span className="time-icon">{time.icon}</span>
                                <span className="time-label">{time.label.replace(/⚡|🕐|🕑|🍲/g, '').trim()}</span>
                            </button>
                        ))}
                    </div>

                    {preferences.cookingTime && (
                        <button
                            className="clear-selection-btn"
                            onClick={() => updatePreference('cookingTime', '')}
                        >
                            ✕ Clear Selection
                        </button>
                    )}
                </div>

                {/* Difficulty Level */}
                <div className="preference-section">
                    <h3 className="preference-title">
                        📊 Difficulty Level
                        <span className="optional-badge">Optional</span>
                    </h3>
                    <p className="preference-description">What's your cooking experience?</p>

                    <div className="difficulty-grid">
                        {difficultyLevels.map(level => (
                            <button
                                key={level.value}
                                className={`difficulty-btn ${preferences.difficulty === level.value ? 'selected' : ''}`}
                                onClick={() => updatePreference('difficulty', level.value)}
                            >
                                <span className="difficulty-label">{level.label}</span>
                                <span className="difficulty-description">{level.description}</span>
                            </button>
                        ))}
                    </div>

                    {preferences.difficulty && (
                        <button
                            className="clear-selection-btn"
                            onClick={() => updatePreference('difficulty', '')}
                        >
                            ✕ Clear Selection
                        </button>
                    )}
                </div>

                {/* Meal Type */}
                <div className="preference-section">
                    <h3 className="preference-title">
                        🍽️ Meal Type
                        <span className="optional-badge">Optional</span>
                    </h3>
                    <p className="preference-description">What kind of meal are you making?</p>

                    <div className="meal-grid">
                        {mealTypes.map(meal => (
                            <button
                                key={meal.value}
                                className={`meal-btn ${preferences.mealType === meal.value ? 'selected' : ''}`}
                                onClick={() => updatePreference('mealType', meal.value)}
                            >
                                <span className="meal-icon">{meal.icon}</span>
                                <span className="meal-label">{meal.label.replace(/🌅|☀️|🌙|🍿|🍰|🥗/g, '').trim()}</span>
                            </button>
                        ))}
                    </div>

                    {preferences.mealType && (
                        <button
                            className="clear-selection-btn"
                            onClick={() => updatePreference('mealType', '')}
                        >
                            ✕ Clear Selection
                        </button>
                    )}
                </div>

                {/* Summary */}
                <div className="preferences-summary">
                    <h4>📋 Your Preferences Summary</h4>
                    <div className="summary-content">
                        {preferences.cuisine && (
                            <div className="summary-item">
                                <strong>Cuisine:</strong> {cuisineTypes.find(c => c.value === preferences.cuisine)?.label}
                            </div>
                        )}
                        {preferences.dietaryRestrictions.length > 0 && (
                            <div className="summary-item">
                                <strong>Dietary:</strong> {preferences.dietaryRestrictions.join(', ')}
                            </div>
                        )}
                        {preferences.cookingTime && (
                            <div className="summary-item">
                                <strong>Time:</strong> {cookingTimes.find(t => t.value === preferences.cookingTime)?.label}
                            </div>
                        )}
                        {preferences.difficulty && (
                            <div className="summary-item">
                                <strong>Difficulty:</strong> {difficultyLevels.find(d => d.value === preferences.difficulty)?.label}
                            </div>
                        )}
                        {preferences.mealType && (
                            <div className="summary-item">
                                <strong>Meal:</strong> {mealTypes.find(m => m.value === preferences.mealType)?.label}
                            </div>
                        )}

                        {!preferences.cuisine && !preferences.dietaryRestrictions.length && !preferences.cookingTime && !preferences.difficulty && !preferences.mealType && (
                            <p className="no-preferences">No preferences selected - we'll create a surprise recipe! 🎲</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="step-buttons">
                <button className="btn btn-secondary" onClick={onPrev}>
                    ← Back to Ingredients
                </button>
                <button className="btn btn-primary" onClick={handleNext}>
                    Generate My Recipe! 🚀
                </button>
            </div>
        </div>
    );
};

export default PreferencesStep;