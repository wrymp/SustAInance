import React, { useState, useContext } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { recipeAPI } from '../../services/api';
import './Auth.css';

const LoginPage = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useContext(AuthContext);

    const urlParams = new URLSearchParams(location.search);
    const message = urlParams.get('message');

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
            const response = await recipeAPI.attemptLogIn(formData);

            login(response.data);
            navigate('/home');
        } catch (error) {
            if (error.response) {
                if (error.response.status === 400) {
                    setError('Please fill in all required fields.');
                } else if (error.response.status === 404) {

                    setError('Username not found. Please check your username or register for a new account.');
                } else if (error.response.status === 401) {
                    setError('Incorrect password. Please try again.');
                } else if (error.response.status === 500) {
                    setError('Server error. Please try again later.');
                } else {
                    setError('Login failed. Please try again.');
                }
            } else if (error.request) {
                setError('Network error. Please check your connection.');
            } else {
                setError('Something went wrong. Please try again.');
            }
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
                        {message && <div className="auth-success">{message}</div>}
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