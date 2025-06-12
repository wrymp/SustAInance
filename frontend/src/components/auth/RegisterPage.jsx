import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { recipeAPI } from '../../services/api';
import './Auth.css';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

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
            // Step 1: Register user
            const registerResponse = await recipeAPI.attemptRegister(formData);

            if (registerResponse.status === 200) {
                try {
                    // Step 2: Auto-login after successful registration
                    const loginResponse = await recipeAPI.attemptLogIn({
                        username: formData.username,
                        password: formData.password
                    });

                    if (loginResponse.status === 200) {
                        // Pass user data (not token) to login function
                        login(loginResponse.data);
                        navigate('/home');
                    } else {
                        navigate('/login?message=Registration successful! Please log in.');
                    }
                } catch (loginError) {
                    // Registration worked, but login failed - still a success
                    navigate('/login?message=Registration successful! Please log in.');
                }
            } else {
                setError('Registration failed. Username or email might already be taken.');
            }
        } catch (error) {

            // Better error handling
            if (error.response) {
                const errorData = error.response.data;
                if (error.response.status === 409) {
                    setError('Username or email already exists.');
                } else if (typeof errorData === 'object' && errorData.error) {
                    setError(errorData.error);
                } else if (typeof errorData === 'string') {
                    setError(errorData);
                } else {
                    setError(`Registration failed: ${error.response.status}`);
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
                            Join the
                            <span className="highlight"> Recipe Magic</span>
                        </h1>
                        <p className="auth-subtitle">
                            Create your account and start cooking smarter
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
                                placeholder="Choose a username"
                            />
                        </div>

                        <div className="auth-field">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="Enter your email"
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
                                placeholder="Create a password"
                            />
                        </div>

                        <button
                            type="submit"
                            className="auth-button"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span>Creating account... 🔄</span>
                            ) : (
                                <span>Create Account 🚀</span>
                            )}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>Already have an account? <Link to="/login">Sign in here</Link></p>
                    </div>
                </div>

                <div className="auth-visual">
                    <div className="auth-ingredients">
                        <span className="auth-ingredient-bubble">🍝</span>
                        <span className="auth-ingredient-bubble">🥗</span>
                        <span className="auth-ingredient-bubble">🍲</span>
                        <span className="auth-ingredient-bubble">🥘</span>
                        <span className="auth-ingredient-bubble">🍜</span>
                        <span className="auth-ingredient-bubble">🥙</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;