import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
    const [isHovered, setIsHovered] = useState(false);
    const navigate = useNavigate();

    const handleStartCooking = () => {
        navigate('/recipes'); // Navigate to recipe generator (step 1)
    };

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">
                        Turn Your Ingredients Into
                        <span className="highlight"> Amazing Recipes</span>
                    </h1>
                    <p className="hero-subtitle">
                        AI-powered recipe generation from whatever you have in your kitchen.
                        No more wondering "what can I cook with this?"
                    </p>

                    {/* ✨ Magic Kitchen Interactive Button (Replaces old input) */}
                    <div className="magic-kitchen-container">
                        <div
                            className={`cooking-scene ${isHovered ? 'cooking-active' : ''}`}
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                            onClick={handleStartCooking}
                        >
                            {/* Cooking Pot */}
                            <div className="cooking-pot-main">
                                <div className="pot-body">🍲</div>
                                <div className="steam-particles">
                                    <span className="steam-bubble">💨</span>
                                    <span className="steam-bubble">💨</span>
                                    <span className="steam-bubble">💨</span>
                                </div>
                            </div>

                            {/* Floating Ingredients */}
                            <div className="ingredient-orbit">
                                <div className="orbit-ingredient" style={{'--delay': '0s'}}>🥕</div>
                                <div className="orbit-ingredient" style={{'--delay': '0.5s'}}>🧄</div>
                                <div className="orbit-ingredient" style={{'--delay': '1s'}}>🍅</div>
                                <div className="orbit-ingredient" style={{'--delay': '1.5s'}}>🥬</div>
                                <div className="orbit-ingredient" style={{'--delay': '2s'}}>🧅</div>
                                <div className="orbit-ingredient" style={{'--delay': '2.5s'}}>🍗</div>
                            </div>

                            {/* Magic Sparkles */}
                            <div className="sparkles">
                                <span className="sparkle">✨</span>
                                <span className="sparkle">⭐</span>
                                <span className="sparkle">✨</span>
                                <span className="sparkle">⭐</span>
                                <span className="sparkle">✨</span>
                            </div>

                            {/* Main CTA Button */}
                            <div className="magic-button">
                                <div className="button-content">
                                    <span className="button-icon">👨‍🍳</span>
                                    <span className="button-text">Start Cooking Magic</span>
                                    <span className="button-arrow">→</span>
                                </div>
                                <div className="button-glow"></div>
                            </div>
                        </div>

                        <p className="magic-hint">
                            ✨ Click to begin your culinary adventure!
                        </p>
                    </div>
                </div>

                <div className="hero-visual">
                    <div className="floating-ingredients">
                        <span className="ingredient-bubble">🍅</span>
                        <span className="ingredient-bubble">🥕</span>
                        <span className="ingredient-bubble">🧄</span>
                        <span className="ingredient-bubble">🥬</span>
                        <span className="ingredient-bubble">🍗</span>
                        <span className="ingredient-bubble">🧅</span>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="how-it-works">
                <div className="container">
                    <h2 className="section-title">How It Works</h2>
                    <div className="steps-grid">
                        <div className="step">
                            <div className="step-icon">🥘</div>
                            <h3>1. Add Your Ingredients</h3>
                            <p>Tell us what you have in your kitchen - fresh ingredients, pantry staples, anything!</p>
                        </div>
                        <div className="step">
                            <div className="step-icon">🤖</div>
                            <h3>2. AI Creates Magic</h3>
                            <p>Our AI chef analyzes your ingredients and creates a personalized, delicious recipe just for you.</p>
                        </div>
                        <div className="step">
                            <div className="step-icon">👨‍🍳</div>
                            <h3>3. Cook & Enjoy</h3>
                            <p>Follow the step-by-step instructions and enjoy your custom-made meal!</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Sample Recipes Section */}
            <section className="sample-recipes">
                <div className="container">
                    <h2 className="section-title">Recipe Examples</h2>
                    <p className="section-subtitle">See what our AI can create from simple ingredients</p>

                    <div className="recipes-grid">
                        <div className="recipe-card">
                            <div className="recipe-image">🍝</div>
                            <h3>Creamy Tomato Pasta</h3>
                            <p className="ingredients-used">From: Pasta, Tomatoes, Cream, Garlic</p>
                            <span className="cook-time">⏱️ 20 mins</span>
                        </div>

                        <div className="recipe-card">
                            <div className="recipe-image">🥗</div>
                            <h3>Mediterranean Chicken Salad</h3>
                            <p className="ingredients-used">From: Chicken, Lettuce, Olives, Feta</p>
                            <span className="cook-time">⏱️ 15 mins</span>
                        </div>

                        <div className="recipe-card">
                            <div className="recipe-image">🍲</div>
                            <h3>Hearty Vegetable Stir-fry</h3>
                            <p className="ingredients-used">From: Mixed Vegetables, Soy Sauce, Rice</p>
                            <span className="cook-time">⏱️ 12 mins</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="container">
                    <h2 className="section-title">More Than Just Recipes</h2>
                    <div className="features-grid">
                        <div className="feature-card" onClick={() => navigate('/pantry')}>
                            <div className="feature-icon">🏪</div>
                            <h3>Smart Pantry</h3>
                            <p>Keep track of your ingredients and get suggestions on what to cook next.</p>
                            <span className="feature-cta">Manage Pantry →</span>
                        </div>

                        <div className="feature-card" onClick={() => navigate('/meal-planning')}>
                            <div className="feature-icon">📅</div>
                            <h3>Meal Planning</h3>
                            <p>Plan your weekly meals based on your preferences and available ingredients.</p>
                            <span className="feature-cta">Plan Meals →</span>
                        </div>

                        <div className="feature-card" onClick={() => navigate('/recipes')}>
                            <div className="feature-icon">📖</div>
                            <h3>Recipe Collection</h3>
                            <p>Save and organize all your generated recipes in one place.</p>
                            <span className="feature-cta">View Recipes →</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="container">
                    <h2>Ready to Transform Your Cooking?</h2>
                    <p>Join thousands of home cooks who never run out of meal ideas</p>
                    <button
                        className="cta-button"
                        onClick={() => navigate('/recipes')}
                    >
                        Start Cooking Smarter 🚀
                    </button>
                </div>
            </section>
        </div>
    );
};

export default HomePage;