import React, { useState } from 'react';
import './RatingComponent.css';

const RatingComponent = ({ onSubmitRating, averageRating, userRating }) => {
    const [newRating, setNewRating] = useState(userRating || 0);
    const [hoveredRating, setHoveredRating] = useState(0);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (newRating === 0) {
            alert('Please select a rating!');
            return;
        }

        onSubmitRating(newRating);
    };

    const StarDisplay = ({ rating, size = 'medium' }) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <span
                    key={i}
                    className={`star ${i <= rating ? 'filled' : ''} ${size}`}
                >
                    ★
                </span>
            );
        }
        return <div className="star-display">{stars}</div>;
    };

    const InteractiveStars = () => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <span
                    key={i}
                    className={`star interactive ${i <= (hoveredRating || newRating) ? 'filled' : ''}`}
                    onClick={() => setNewRating(i)}
                    onMouseEnter={() => setHoveredRating(i)}
                    onMouseLeave={() => setHoveredRating(0)}
                >
                    ★
                </span>
            );
        }
        return <div className="star-display">{stars}</div>;
    };

    return (
        <div className="rating-component">
            <div className="rating-summary">
                <h3>Recipe Rating</h3>
                <div className="rating-overview">
                    <StarDisplay rating={Math.round(averageRating)} size="large" />
                    <span className="rating-text">
                        {averageRating.toFixed(1)} out of 5
                    </span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="rating-form">
                <h4>Rate this recipe:</h4>
                {userRating > 0 && (
                    <p className="current-rating">
                        Your current rating: <StarDisplay rating={userRating} size="small" />
                    </p>
                )}
                <div className="rating-input">
                    <InteractiveStars />
                </div>

                <button type="submit" className="rating-submit">
                    {userRating > 0 ? 'Update Rating' : 'Submit Rating'}
                </button>
            </form>
        </div>
    );
};

export default RatingComponent;