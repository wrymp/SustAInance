import React, { useContext } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import './ProtectedRouteStyles.css';

const ProtectedRoute = () => {
    const { isAuthenticated, isLoading } = useContext(AuthContext);

    if (isLoading) {
        return (
            <div className="protected-route">
                <div className="protected-container">
                    <div className="protected-loading">
                        <div className="protected-loading__spinner"></div>
                        <p className="protected-loading__text">Checking authentication...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="protected-route">
                <div className="protected-container">
                    {/* Security Lock Animation */}
                    <div className="protected-lock">
                        <div className="protected-lock__icon">🔒</div>
                    </div>

                    {/* Main Content */}
                    <h1 className="protected-title">Access Required</h1>
                    <p className="protected-subtitle">
                        This page is protected and requires authentication to continue
                    </p>

                    <div className="protected-message">
                        <p>
                            <strong>🛡️ Why do we need this?</strong><br/>
                            We protect your personal recipes, pantry data, and cooking preferences 
                            to ensure they remain secure and private.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="protected-actions">
                        <Link to="/login" replace className="protected-btn protected-btn--login">
                            <span>🔑 Sign In</span>
                        </Link>
                        
                        <Link to="/register" className="protected-btn protected-btn--register">
                            <span>🚀 Create Account</span>
                        </Link>
                    </div>

                    {/* Security Features */}
                    <div className="protected-features">
                        <h4>What you get with an account:</h4>
                        <ul>
                            <li>Save your favorite recipes</li>
                            <li>Track your pantry ingredients</li>
                            <li>Get personalized recommendations</li>
                            <li>Access meal planning tools</li>
                            <li>Sync across all devices</li>
                        </ul>
                    </div>
                </div>
            </div>
        );
    }

    return <Outlet />;
};

export default ProtectedRoute;