import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import LogoutButton from '../auth/logout_button';
import './HomePage.css';

const HomePage = () => {
    const [isHovered, setIsHovered] = useState(false);
    const { isAuthenticated, isLoading, user } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleStartCooking = () => {
        if (isLoading) {
            return;
        }

        if (isAuthenticated) {
            navigate('/recipe-generator');
        } else {
            navigate('/login');
        }
    };

    const handleFeatureClick = (path) => {
        if (isAuthenticated) {
            navigate(path);
        } else {
            navigate('/login');
        }
    };

    return (
        <div className="home">
            {isAuthenticated && (
                <header className="home-header">
                    <div className="home-header__content">
                        <div className="home-header__welcome">
                            <span>Welcome back{user?.username ? `, ${user.username}` : ''}! 👋</span>
                        </div>
                        <LogoutButton className="home-header__logout" />
                    </div>
                </header>
            )}

            <section className="hero">
                <div className="hero__content">
                    <h1 className="hero__title">
                        Turn Your Ingredients Into
                        <span className="highlight"> Amazing Recipes</span>
                    </h1>
                    <p className="hero__subtitle">
                        AI-powered recipe generation from whatever you have in your kitchen.
                        No more wondering "what can I cook with this?"
                    </p>

                    <div className="magic-kitchen">
                        <div
                            className={`magic-kitchen__scene ${isHovered ? 'magic-kitchen__scene--active' : ''}`}
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                            onClick={handleStartCooking}
                        >
                            <div className="magic-kitchen__pot">
                                <div className="magic-kitchen__pot-body">🍲</div>
                                <div className="magic-kitchen__steam">
                                    <span className="magic-kitchen__steam-bubble">💨</span>
                                    <span className="magic-kitchen__steam-bubble">💨</span>
                                    <span className="magic-kitchen__steam-bubble">💨</span>
                                </div>
                            </div>

                            <div className="magic-kitchen__orbit">
                                <div className="magic-kitchen__ingredient" style={{'--delay': '0s'}}>🥕</div>
                                <div className="magic-kitchen__ingredient" style={{'--delay': '0.5s'}}>🧄</div>
                                <div className="magic-kitchen__ingredient" style={{'--delay': '1s'}}>🍅</div>
                                <div className="magic-kitchen__ingredient" style={{'--delay': '1.5s'}}>🥬</div>
                                <div className="magic-kitchen__ingredient" style={{'--delay': '2s'}}>🧅</div>
                                <div className="magic-kitchen__ingredient" style={{'--delay': '2.5s'}}>🍗</div>
                            </div>

                            <div className="magic-kitchen__sparkles">
                                <span className="magic-kitchen__sparkle">✨</span>
                                <span className="magic-kitchen__sparkle">⭐</span>
                                <span className="magic-kitchen__sparkle">✨</span>
                                <span className="magic-kitchen__sparkle">⭐</span>
                                <span className="magic-kitchen__sparkle">✨</span>
                            </div>

                            <div className="magic-kitchen__button">
                                <div className="magic-kitchen__button-content">
                                    <span className="magic-kitchen__button-icon">👨‍🍳</span>
                                    <span className="magic-kitchen__button-text">
                                        {isLoading ? 'Loading...' :
                                            isAuthenticated ? 'Start Cooking Magic' : 'Sign In to Cook'}
                                    </span>
                                    <span className="magic-kitchen__button-arrow">→</span>
                                </div>
                                <div className="magic-kitchen__button-glow"></div>
                            </div>
                        </div>

                        <p className="magic-kitchen__hint">
                            ✨ {isAuthenticated ? 'Click to begin your culinary adventure!' : 'Sign in to start cooking!'}
                        </p>
                    </div>
                </div>

                <div className="hero__visual">
                    <div className="hero__ingredients">
                        <span className="hero__ingredient-bubble">🍅</span>
                        <span className="hero__ingredient-bubble">🥕</span>
                        <span className="hero__ingredient-bubble">🧄</span>
                        <span className="hero__ingredient-bubble">🥬</span>
                        <span className="hero__ingredient-bubble">🍗</span>
                        <span className="hero__ingredient-bubble">🧅</span>
                    </div>
                </div>
            </section>

            <section className="how-it-works">
                <div className="container">
                    <h2 className="section__title">How It Works</h2>
                    <div className="how-it-works__grid">
                        <div className="how-it-works__step">
                            <div className="how-it-works__step-icon">🥘</div>
                            <h3>1. Add Your Ingredients</h3>
                            <p>Tell us what you have in your kitchen - fresh ingredients, pantry staples, anything!</p>
                        </div>
                        <div className="how-it-works__step">
                            <div className="how-it-works__step-icon">🤖</div>
                            <h3>2. AI Creates Magic</h3>
                            <p>Our AI chef analyzes your ingredients and creates a personalized, delicious recipe just for you.</p>
                        </div>
                        <div className="how-it-works__step">
                            <div className="how-it-works__step-icon">👨‍🍳</div>
                            <h3>3. Cook & Enjoy</h3>
                            <p>Follow the step-by-step instructions and enjoy your custom-made meal!</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="sample-recipes">
                <div className="container">
                    <h2 className="section__title">Recipe Examples</h2>
                    <p className="section__subtitle">See what our AI can create from simple ingredients</p>

                    <div className="sample-recipes__grid">
                        <div className="sample-recipes__card">
                            <div className="sample-recipes__image">🍝</div>
                            <h3>Creamy Tomato Pasta</h3>
                            <p className="sample-recipes__ingredients">From: Pasta, Tomatoes, Cream, Garlic</p>
                            <span className="sample-recipes__time">⏱️ 20 mins</span>
                        </div>

                        <div className="sample-recipes__card">
                            <div className="sample-recipes__image">🥗</div>
                            <h3>Mediterranean Chicken Salad</h3>
                            <p className="sample-recipes__ingredients">From: Chicken, Lettuce, Olives, Feta</p>
                            <span className="sample-recipes__time">⏱️ 15 mins</span>
                        </div>

                        <div className="sample-recipes__card">
                            <div className="sample-recipes__image">🍲</div>
                            <h3>Hearty Vegetable Stir-fry</h3>
                            <p className="sample-recipes__ingredients">From: Mixed Vegetables, Soy Sauce, Rice</p>
                            <span className="sample-recipes__time">⏱️ 12 mins</span>
                        </div>
                    </div>
                </div>
            </section>

            <section className="features">
                <div className="container">
                    <h2 className="section__title">More Than Just Recipes</h2>
                    <div className="features__grid">
                        <div className="features__card" onClick={() => handleFeatureClick('/pantry')}>
                            <div className="features__icon">🏪</div>
                            <h3>Smart Pantry</h3>
                            <p>Keep track of your ingredients and get suggestions on what to cook next.</p>
                            <span className="features__cta">Manage Pantry →</span>
                        </div>

                        <div className="features__card" onClick={() => handleFeatureClick('/meal-plan')}>
                            <div className="features__icon">📅</div>
                            <h3>Meal Planning</h3>
                            <p>Plan your weekly meals based on your preferences and available ingredients.</p>
                            <span className="features__cta">Plan Meals →</span>
                        </div>

                        <div className="features__card" onClick={() => handleFeatureClick('/saved-recipes')}>
                            <div className="features__icon">❤️</div>
                            <h3>Saved Recipes</h3>
                            <p>Keep all your favorite recipes in one place for easy access anytime.</p>
                            <span className="features__cta">View Saved →</span>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;