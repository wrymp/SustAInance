import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { mealPlanAPI, recipeAPI } from '../../services/api';
import './MealPlanMaker.css';

const MyMealPlans = () => {
    const [mealPlans, setMealPlans] = useState([]);
    const [currentMealPlan, setCurrentMealPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [, setCurrentDate] = useState(new Date());
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [planToDelete, setPlanToDelete] = useState(null);

    const { isAuthenticated } = useContext(AuthContext);
    const navigate = useNavigate();

    const mealTypeIcons = {
        'Breakfast': '🌅',
        'Lunch': '☀️',
        'Dinner': '🌙'
    };

    const getCurrentUser = async () => {
        try {
            const response = await recipeAPI.getCurrentUser();
            return response.data.uuid;
        } catch (error) {
            console.error('Error getting current user:', error);
            throw new Error('Failed to get user information');
        }
    };

    const fetchMealPlans = async () => {
        if (!isAuthenticated) {
            setError('Please log in to view your meal plans');
            setLoading(false);
            return;
        }

        try {
            console.log('🔍 Getting current user...');
            const userId = await getCurrentUser();

            console.log('📋 Fetching meal plans for user:', userId);
            const response = await mealPlanAPI.getUserMealPlans(userId);

            console.log('✅ Fetched meal plans:', response.data);
            setMealPlans(response.data);

            if (response.data.length > 0) {
                const mostRecent = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
                setCurrentMealPlan(mostRecent);
            }

        } catch (err) {
            console.error('❌ Error fetching meal plans:', err);
            setError(err.response?.data?.message || 'Error loading meal plans');
        } finally {
            setLoading(false);
        }
    };

    const parseMealsData = (mealsDataString) => {
        try {
            return JSON.parse(mealsDataString);
        } catch (error) {
            console.error('Error parsing meals data:', error);
            return [];
        }
    };

    const getCurrentDayNumber = (startDate) => {
        const start = new Date(startDate);
        const today = new Date();
        const diffTime = today - start;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

        if (diffDays < 1) return 1;
        if (currentMealPlan && diffDays > currentMealPlan.duration) return currentMealPlan.duration;
        return diffDays;
    };

    const getDayName = (dayNumber) => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        if (!currentMealPlan) return `Day ${dayNumber}`;
        const startDate = new Date(currentMealPlan.startDate);
        const targetDate = new Date(startDate);
        targetDate.setDate(startDate.getDate() + (dayNumber - 1));
        const dayOfWeek = targetDate.getDay();

        return days[dayOfWeek];
    };

    const handleDeleteClick = (planId) => {
        setPlanToDelete(planId);
        setShowDeleteModal(true);
    };

    const deleteMealPlan = async () => {
        if (!planToDelete) return;

        try {
            const userId = await getCurrentUser();

            console.log('🗑️ Deleting meal plan:', planToDelete);
            await mealPlanAPI.deleteMealPlanByUser(userId, planToDelete);

            console.log('✅ Meal plan deleted successfully');
            setShowDeleteModal(false);
            setPlanToDelete(null);
            fetchMealPlans();
        } catch (err) {
            console.error('❌ Error deleting meal plan:', err);
            setError(err.response?.data?.message || 'Error deleting meal plan');
            setShowDeleteModal(false);
            setPlanToDelete(null);
        }
    };

    useEffect(() => {
        fetchMealPlans();
    }, [isAuthenticated]);

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
                <div className="page-header">
                    <button
                        className="btn btn-secondary"
                        onClick={() => navigate('/')}
                        style={{ padding: '0.75rem 1.25rem', marginBottom: '1rem' }}
                    >
                        🏠 Home
                    </button>
                </div>

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
                    <h1>🍽️ My Meal Plans</h1>
                </div>
                <div className="header-right">
                    <button
                        className="btn btn-primary create-new-btn"
                        onClick={() => navigate('/create-meal-plan')}
                    >
                        ➕ Create New Meal Plan
                    </button>
                </div>
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
                                onClick={() => handleDeleteClick(currentMealPlan.id)}
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
                    onClick={() => navigate('/create-meal-plan')}
                >
                    🚀 Create New Plan
                </button>
            </div>
            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Delete Meal Plan</h3>
                        <p>Are you sure you want to delete this meal plan?</p>
                        <div className="modal-actions">
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowDeleteModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-danger"
                                onClick={deleteMealPlan}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyMealPlans;