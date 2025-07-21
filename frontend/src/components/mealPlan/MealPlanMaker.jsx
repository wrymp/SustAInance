import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './MealPlanMaker.css';

const API_BASE_URL = 'http://localhost:9097/api';

const MyMealPlans = () => {
    const [mealPlans, setMealPlans] = useState([]);
    const [currentMealPlan, setCurrentMealPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentDate, setCurrentDate] = useState(new Date());

    const { isAuthenticated } = useContext(AuthContext);
    const navigate = useNavigate();

    const mealTypeIcons = {
        'Breakfast': '🌅',
        'Lunch': '☀️',
        'Dinner': '🌙'
    };

    // Get current user method (same as your recipe page)
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

    // Fetch meal plans for current user
    const fetchMealPlans = async () => {
        if (!isAuthenticated) {
            setError('Please log in to view your meal plans');
            setLoading(false);
            return;
        }

        try {
            console.log('🔍 Getting current user...');
            const userId = await getCurrentUser();

            if (!userId) {
                setError('Could not get user information');
                setLoading(false);
                return;
            }

            console.log('📋 Fetching meal plans for user:', userId);
            const response = await fetch(`${API_BASE_URL}/meal-plans/user/${userId}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });

            if (response.ok) {
                const plans = await response.json();
                console.log('✅ Fetched meal plans:', plans);
                setMealPlans(plans);

                // Set the most recent meal plan as current
                if (plans.length > 0) {
                    const mostRecent = plans.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
                    setCurrentMealPlan(mostRecent);
                }
            } else {
                console.error('❌ Failed to fetch meal plans:', response.status);
                setError('Failed to load meal plans');
            }
        } catch (err) {
            console.error('❌ Error fetching meal plans:', err);
            setError('Error loading meal plans');
        } finally {
            setLoading(false);
        }
    };

    // Parse meals data from JSON string
    const parseMealsData = (mealsDataString) => {
        try {
            return JSON.parse(mealsDataString);
        } catch (error) {
            console.error('Error parsing meals data:', error);
            return [];
        }
    };

    // Get current day number (1-7 based on start date)
    const getCurrentDayNumber = (startDate) => {
        const start = new Date(startDate);
        const today = new Date();
        const diffTime = today - start;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

        // Return day number within the meal plan duration
        if (diffDays < 1) return 1;
        if (currentMealPlan && diffDays > currentMealPlan.duration) return currentMealPlan.duration;
        return diffDays;
    };

    // Get day name
    const getDayName = (dayNumber) => {
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        return days[dayNumber - 1] || `Day ${dayNumber}`;
    };

    // Delete meal plan
    const deleteMealPlan = async (planId) => {
        if (!window.confirm('Are you sure you want to delete this meal plan?')) {
            return;
        }

        try {
            const userId = await getCurrentUser();
            const response = await fetch(`${API_BASE_URL}/meal-plans/user/${userId}/${planId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (response.ok) {
                console.log('✅ Meal plan deleted successfully');
                fetchMealPlans(); // Refresh the list
            } else {
                setError('Failed to delete meal plan');
            }
        } catch (err) {
            console.error('❌ Error deleting meal plan:', err);
            setError('Error deleting meal plan');
        }
    };

    useEffect(() => {
        fetchMealPlans();
    }, [isAuthenticated]);

    // Update current date every minute
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentDate(new Date());
        }, 60000);
        return () => clearInterval(timer);
    }, []);

    if (loading) {
        return (
            <div className="my-meal-plans">
                <div className="loading-container">
                    <div className="loading-spinner">🍽️</div>
                    <h2>Loading your meal plans...</h2>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="my-meal-plans">
                <div className="auth-required">
                    <h2>🔒 Authentication Required</h2>
                    <p>Please log in to view your meal plans</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="my-meal-plans">
                <div className="error-container">
                    <h2>⚠️ Error</h2>
                    <p>{error}</p>
                    <button className="btn btn-primary" onClick={fetchMealPlans}>
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (mealPlans.length === 0) {
        return (
            <div className="my-meal-plans">
                <div className="no-plans-container">
                    <div className="no-plans-icon">🍽️</div>
                    <h2>No Meal Plans Yet</h2>
                    <p>Create your first personalized meal plan to get started!</p>
                    <button
                        className="btn btn-primary create-first-btn"
                        onClick={() => navigate("/create-meal-plan")}
                    >
                        🚀 Create Your First Meal Plan
                    </button>
                </div>
            </div>
        );
    }

    const currentDayNumber = currentMealPlan ? getCurrentDayNumber(currentMealPlan.startDate) : 1;
    const currentMeals = currentMealPlan ? parseMealsData(currentMealPlan.mealsData) : [];
    const todaysMeals = currentMeals.filter(meal => meal.day === currentDayNumber);

    return (
        <div className="my-meal-plans">
            {/* Header */}
            <div className="page-header">
                <h1>🍽️ My Meal Plans</h1>
                <button
                    className="btn btn-primary create-new-btn"
                    onClick={() => navigate('/meal-planner')}
                >
                    ➕ Create New Meal Plan
                </button>
            </div>

            {/* Current Day Banner */}
            {currentMealPlan && (
                <div className="current-day-banner">
                    <div className="banner-content">
                        <div className="day-info">
                            <h2>Today's Meals</h2>
                            <p>
                                {getDayName(currentDayNumber)} • Day {currentDayNumber} of {currentMealPlan.duration}
                            </p>
                        </div>

                        <div className="todays-meals">
                            {todaysMeals.length > 0 ? (
                                todaysMeals.map((meal, index) => (
                                    <div key={index} className="banner-meal">
                                        <span className="meal-icon">{mealTypeIcons[meal.mealType]}</span>
                                        <div className="meal-info">
                                            <span className="meal-type">{meal.mealType}</span>
                                            <span className="meal-title">{meal.title}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="no-meals-today">
                                    <span>🎉 No meals planned for today!</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Meal Plan Selector */}
            {mealPlans.length > 1 && (
                <div className="meal-plan-selector">
                    <h3>Select Meal Plan:</h3>
                    <div className="plan-tabs">
                        {mealPlans.map(plan => (
                            <button
                                key={plan.id}
                                className={`plan-tab ${currentMealPlan?.id === plan.id ? 'active' : ''}`}
                                onClick={() => setCurrentMealPlan(plan)}
                            >
                                <div className="tab-info">
                                    <span className="tab-title">
                                        {plan.duration} day{plan.duration > 1 ? 's' : ''}
                                    </span>
                                    <span className="tab-date">
                                        {new Date(plan.startDate).toLocaleDateString()}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Current Meal Plan Display */}
            {currentMealPlan && (
                <div className="meal-plan-display">
                    {/* Plan Info */}
                    <div className="plan-info-card">
                        <div className="plan-details">
                            <h3>Current Meal Plan</h3>
                            <div className="plan-meta">
                                <span className="meta-item">
                                    📅 {currentMealPlan.duration} days
                                </span>
                                <span className="meta-item">
                                    🍽️ {currentMealPlan.mealsPerDay} meals/day
                                </span>
                                <span className="meta-item">
                                    📆 Started {new Date(currentMealPlan.startDate).toLocaleDateString()}
                                </span>
                            </div>

                            {/* Preferences */}
                            {currentMealPlan.preferences && currentMealPlan.preferences !== '[]' && (
                                <div className="plan-preferences">
                                    <span className="preferences-label">Preferences:</span>
                                    <div className="preferences-tags">
                                        {JSON.parse(currentMealPlan.preferences).map((pref, index) => (
                                            <span key={index} className="preference-tag">
                                                {pref}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="plan-actions">
                            <button
                                className="btn btn-danger btn-sm"
                                onClick={() => deleteMealPlan(currentMealPlan.id)}
                            >
                                🗑️ Delete
                            </button>
                        </div>
                    </div>

                    {/* Meals Grid */}
                    <div className="meals-grid">
                        {Array.from({ length: currentMealPlan.duration }, (_, dayIndex) => {
                            const dayNumber = dayIndex + 1;
                            const dayMeals = currentMeals.filter(meal => meal.day === dayNumber);
                            const isToday = dayNumber === currentDayNumber;

                            return (
                                <div
                                    key={dayNumber}
                                    className={`day-card ${isToday ? 'current-day' : ''}`}
                                >
                                    <div className="day-header">
                                        <h4 className="day-title">
                                            {isToday && <span className="today-badge">TODAY</span>}
                                            <span className="day-name">{getDayName(dayNumber)}</span>
                                            <span className="day-number">Day {dayNumber}</span>
                                        </h4>
                                    </div>

                                    <div className="day-meals">
                                        {dayMeals.map((meal, mealIndex) => (
                                            <div key={mealIndex} className="meal-card">
                                                <div className="meal-header">
                                                    <span className="meal-icon">
                                                        {mealTypeIcons[meal.mealType]}
                                                    </span>
                                                    <span className="meal-type">{meal.mealType}</span>
                                                </div>
                                                <div className="meal-content">
                                                    <h5 className="meal-title">{meal.title}</h5>
                                                    <p className="meal-description">{meal.content}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            <div className="quick-actions">
                <button
                    className="btn btn-secondary"
                    onClick={() => window.print()}
                >
                    🖨️ Print Meal Plan
                </button>

                <button
                    className="btn btn-primary"
                    onClick={() => navigate('/meal-planner')}
                >
                    🚀 Create New Plan
                </button>
            </div>
        </div>
    );
};

export default MyMealPlans;