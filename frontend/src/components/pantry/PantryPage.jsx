import React from 'react';
import { useNavigate } from 'react-router-dom';

const PantryPage = () => {
    const navigate = useNavigate();

    return (
        <div style={{ 
            padding: '2rem', 
            textAlign: 'center', 
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
        }}>
            <div style={{
                maxWidth: '600px',
                margin: '0 auto',
                background: 'white',
                borderRadius: '15px',
                padding: '3rem',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
            }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏪</div>
                
                <h1 style={{ 
                    color: '#333', 
                    marginBottom: '1rem',
                    fontSize: '2.5rem' 
                }}>
                    Smart Pantry
                </h1>
                
                <p style={{ 
                    color: '#666', 
                    fontSize: '1.1rem',
                    marginBottom: '2rem',
                    lineHeight: '1.6'
                }}>
                    Your intelligent pantry management system is coming soon! 
                    Keep track of ingredients, expiration dates, and get smart 
                    suggestions for your next meal.
                </p>

                <div style={{
                    background: '#f8f9fa',
                    borderRadius: '10px',
                    padding: '1.5rem',
                    marginBottom: '2rem'
                }}>
                    <h3 style={{ color: '#555', marginBottom: '1rem' }}>Coming Features:</h3>
                    <ul style={{ 
                        listStyle: 'none', 
                        padding: 0,
                        color: '#666'
                    }}>
                        <li style={{ marginBottom: '0.5rem' }}>📦 Ingredient tracking</li>
                        <li style={{ marginBottom: '0.5rem' }}>📅 Expiration date alerts</li>
                        <li style={{ marginBottom: '0.5rem' }}>🛒 Smart shopping lists</li>
                        <li style={{ marginBottom: '0.5rem' }}>🍽️ Recipe suggestions based on available items</li>
                    </ul>
                </div>

                <button 
                    onClick={() => navigate('/home')}
                    style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: '25px',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'transform 0.2s ease'
                    }}
                    onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                    onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                >
                    ← Back to Home
                </button>
            </div>
        </div>
    );
};

export default PantryPage;