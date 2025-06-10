import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

const LoginPage = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                navigate('/recipe-generator');
            } else {
                setError('Invalid username or password');
            }
        } catch (error) {
            console.error('Login error:', error);
            setError('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-form-wrapper">
                    <div className="auth-header">
                        <h1 className="auth-title">
                            Welcome Back to
                            <span className="highlight"> Recipe Magic</span>
                        </h1>
                        <p className="auth-subtitle">
                            Sign in to continue your culinary journey
                        </p>
                    </div>

                    <form className="auth-form" onSubmit={handleSubmit}>
                        {error && <div className="auth-error">{error}</div>}

                        <div className="auth-field">
                            <label htmlFor="username">Username</label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                                placeholder="Enter your username"
                            />
                        </div>

                        <div className="auth-field">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                placeholder="Enter your password"
                            />
                        </div>

                        <button
                            type="submit"
                            className="auth-button"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span>Signing in... 🔄</span>
                            ) : (
                                <span>Sign In 👨‍🍳</span>
                            )}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>Don't have an account? <Link to="/register">Sign up here</Link></p>
                        <p><Link to="/">← Back to Home</Link></p>
                    </div>
                </div>

                <div className="auth-visual">
                    <div className="auth-ingredients">
                        <span className="auth-ingredient-bubble">🍅</span>
                        <span className="auth-ingredient-bubble">🥕</span>
                        <span className="auth-ingredient-bubble">🧄</span>
                        <span className="auth-ingredient-bubble">🥬</span>
                        <span className="auth-ingredient-bubble">🍗</span>
                        <span className="auth-ingredient-bubble">🧅</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;