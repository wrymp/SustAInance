import React, { useState } from 'react';
import './RecipeDetailView.css';

const StarRating = ({ rating, size = 'medium' }) => {
    const starSize = size === 'small' ? '16px' : size === 'large' ? '32px' : '24px';

    return (
        <div className={`star-rating star-rating--${size}`} style={{ fontSize: starSize }}>
            {[1, 2, 3, 4, 5].map((star) => (
                <span
                    key={star}
                    className={`star-rating__star ${
                        star <= rating ? 'star-rating__star--filled' : 'star-rating__star--empty'
                    }`}
                    style={{ cursor: 'default' }}
                >
                    ⭐
                </span>
            ))}
        </div>
    );
};

const ShareModal = ({ recipe, onClose, averageRating, parsedContent, recipeUrl }) => {
    const [shareStatus, setShareStatus] = useState('');
    const [showPreview, setShowPreview] = useState(false);

    const formatRecipeForSharing = () => {
        const lines = [];
        lines.push(`🍽️ ${recipe.recipeName}`);
        lines.push('');

        if (recipe.recipeDesc) {
            lines.push(recipe.recipeDesc);
            lines.push('');
        }

        if (averageRating > 0) {
            lines.push(`⭐ Rating: ${averageRating.toFixed(1)}/5.0`);
            lines.push('');
        }

        const metadata = [];
        if (recipe.prepTime || parsedContent.metadata.cookingTime) {
            metadata.push(`⏰ Prep Time: ${recipe.prepTime || parsedContent.metadata.cookingTime}`);
        }
        if (parsedContent.metadata.serves) {
            metadata.push(`🍽️ Serves: ${parsedContent.metadata.serves}`);
        }
        if (recipe.difficulty || parsedContent.metadata.difficulty) {
            metadata.push(`📊 Difficulty: ${recipe.difficulty || parsedContent.metadata.difficulty}`);
        }

        if (metadata.length > 0) {
            lines.push(...metadata);
            lines.push('');
        }

        if (parsedContent.instructions.length > 0) {
            lines.push('👨‍🍳 INSTRUCTIONS:');
            parsedContent.instructions.forEach((instruction, index) => {
                const cleanInstruction = instruction
                    .replace(/^\d+\.\s*/, '')
                    .replace(/\*\*(.*?)\*\*/g, '$1')
                    .trim();
                lines.push(`${index + 1}. ${cleanInstruction}`);
            });
        } else if (recipe.recipeText) {
            lines.push('📝 RECIPE:');
            lines.push(recipe.recipeText);
        }

        if (recipe.tags) {
            lines.push('');
            let tagsArray;
            if (Array.isArray(recipe.tags)) {
                tagsArray = recipe.tags;
            } else if (typeof recipe.tags === 'string') {
                tagsArray = recipe.tags.split(',').map(tag => tag.trim());
            } else {
                tagsArray = [];
            }

            if (tagsArray.length > 0) {
                lines.push(`🏷️ Tags: ${tagsArray.map(tag => `#${tag}`).join(' ')}`);
            }
        }

        lines.push('');
        lines.push(`🔗 View recipe: ${recipeUrl}`);
        return lines.join('\n');
    };

    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `${recipe.recipeName} - Recipe`,
                    text: recipe.recipeDesc || 'Check out this delicious recipe!',
                    url: recipeUrl
                });
                setShareStatus('Shared successfully! 🎉');
                setTimeout(() => {
                    setShareStatus('');
                    onClose();
                }, 2000);
            } catch (error) {
                if (error.name !== 'AbortError') {
                    setShareStatus('Share cancelled');
                }
            }
        }
    };

    const handleCopyRecipe = async () => {
        try {
            const formattedText = formatRecipeForSharing();
            await navigator.clipboard.writeText(formattedText);
            setShareStatus('Recipe copied to clipboard! 📋');
            setTimeout(() => setShareStatus(''), 3000);
        } catch (error) {
            setShareStatus('Failed to copy recipe');
        }
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(recipeUrl);
            setShareStatus('Recipe link copied to clipboard! 🔗');
            setTimeout(() => setShareStatus(''), 3000);
        } catch (error) {
            setShareStatus('Failed to copy link');
        }
    };

    return (
        <div className="share-modal-overlay" onClick={onClose}>
            <div className="share-modal" onClick={(e) => e.stopPropagation()}>
                <div className="share-modal__header">
                    <h2>📤 Share Recipe</h2>
                    <button className="share-modal__close" onClick={onClose}>×</button>
                </div>

                <div className="share-modal__content">
                    <div className="share-modal__recipe-info">
                        <h3>{recipe.recipeName}</h3>
                        <p>{recipe.recipeDesc}</p>
                        {averageRating > 0 && (
                            <div className="share-modal__rating">
                                <StarRating rating={Math.round(averageRating)} readOnly size="small" />
                                <span>{averageRating.toFixed(1)}/5.0</span>
                            </div>
                        )}
                        <div className="share-modal__recipe-url">
                            <strong>Recipe Link:</strong> <code>{recipeUrl}</code>
                        </div>
                    </div>

                    <div className="share-modal__actions">
                        {navigator.share && (
                            <button
                                className="share-modal__action-btn share-modal__action-btn--primary"
                                onClick={handleNativeShare}
                            >
                                📱 Share Recipe Link
                            </button>
                        )}

                        <button
                            className="share-modal__action-btn"
                            onClick={handleCopyRecipe}
                        >
                            📋 Copy Full Recipe
                        </button>

                        <button
                            className="share-modal__action-btn"
                            onClick={handleCopyLink}
                        >
                            🔗 Copy Recipe Link
                        </button>
                    </div>

                    <div className="share-modal__preview-section">
                        <button
                            className="share-modal__preview-toggle"
                            onClick={() => setShowPreview(!showPreview)}
                        >
                            {showPreview ? '👁️ Hide Preview' : '👀 Preview What Will Be Shared'}
                        </button>

                        {showPreview && (
                            <div className="share-modal__preview">
                                <h4>📝 Recipe Preview:</h4>
                                <div className="share-modal__preview-content">
                                    <pre>{formatRecipeForSharing()}</pre>
                                </div>
                            </div>
                        )}
                    </div>

                    {shareStatus && (
                        <div className={`share-modal__status ${shareStatus.includes('successfully') || shareStatus.includes('copied') ? 'success' : 'error'}`}>
                            {shareStatus}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const RecipeDetailView = ({
                              recipe,
                              onBack,
                              onDelete,
                              recipeUrl,
                              isOwner = true,
                              averageRating = 0,
                              fromMealPlan = false,
                              mealInfo = null
                          }) => {
    const [showFullContent, setShowFullContent] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);

    const finalRecipeUrl = recipeUrl || window.location.href;

    const parseRecipeContent = (content) => {
        if (!content) return { instructions: [], metadata: {} };

        const result = { instructions: [], metadata: {} };

        const instructionsMatch = content.match(/Instructions:\s*(.*?)(?=Cooking Time:|Chef's Tips:|$)/s);
        if (instructionsMatch) {
            const instructionsText = instructionsMatch[1];
            result.instructions = instructionsText
                .split(/(?=\d+\.\s)/)
                .filter(step => step.trim() && step.match(/^\d+\./))
                .map(step => step.trim());
        }

        const cookingTimeMatch = content.match(/Cooking Time:\s*([^\n]+)/);
        const servesMatch = content.match(/Serves:\s*([^\n]+)/);
        const difficultyMatch = content.match(/Difficulty:\s*([^\n]+)/);

        if (cookingTimeMatch) result.metadata.cookingTime = cookingTimeMatch[1].trim();
        if (servesMatch) result.metadata.serves = servesMatch[1].trim();
        if (difficultyMatch) result.metadata.difficulty = difficultyMatch[1].trim();

        return result;
    };

    const parsedContent = parseRecipeContent(recipe.recipeText);

    return (
        <div className="recipe-detail-view">
            <div className="recipe-detail-view__header">
                <div className="recipe-detail-view__header-left">
                    <button className="recipe-detail-view__back-btn" onClick={onBack}>
                        <span className="recipe-detail-view__back-icon">←</span>
                        <span>
                {fromMealPlan ? 'Back to Meal Plan' : 'Back to Recipes'}
            </span>
                    </button>

                    {fromMealPlan && mealInfo && (
                        <div className="recipe-detail-view__meal-context">
                <span className="meal-context-badge">
                    🍽️ {mealInfo.mealType} • Day {mealInfo.day}
                </span>
                        </div>
                    )}
                </div>

                <div className="recipe-detail-view__header-actions">
                    <button
                        className="recipe-detail-view__action-btn recipe-detail-view__share-btn"
                        onClick={() => setShowShareModal(true)}
                    >
                        📤 Share
                    </button>
                    {isOwner && onDelete && (
                        <button
                            className="recipe-detail-view__action-btn recipe-detail-view__delete-btn"
                            onClick={() => onDelete(recipe)}
                        >
                            🗑️ Delete
                        </button>
                    )}
                </div>
            </div>

            <div className="recipe-detail-view__container">
                <div className="recipe-detail-view__title-section">
                    <h1 className="recipe-detail-view__title">{recipe.recipeName}</h1>
                    <p className="recipe-detail-view__description">{recipe.recipeDesc}</p>
                </div>

                <div className="recipe-detail-view__recipe-card">
                    {(recipe.prepTime || recipe.difficulty || parsedContent.metadata.cookingTime || parsedContent.metadata.serves || parsedContent.metadata.difficulty) && (
                        <div className="recipe-detail-view__metadata">
                            <h3>📋 Recipe Details</h3>
                            <div className="recipe-detail-view__metadata-grid">
                                {(recipe.prepTime || parsedContent.metadata.cookingTime) && (
                                    <div className="recipe-detail-view__metadata-item">
                                        <span className="recipe-detail-view__metadata-icon">⏰</span>
                                        <span className="recipe-detail-view__metadata-label">Prep Time:</span>
                                        <span className="recipe-detail-view__metadata-value">
                                            {recipe.prepTime || parsedContent.metadata.cookingTime}
                                        </span>
                                    </div>
                                )}
                                {parsedContent.metadata.serves && (
                                    <div className="recipe-detail-view__metadata-item">
                                        <span className="recipe-detail-view__metadata-icon">🍽️</span>
                                        <span className="recipe-detail-view__metadata-label">Serves:</span>
                                        <span className="recipe-detail-view__metadata-value">{parsedContent.metadata.serves}</span>
                                    </div>
                                )}
                                {(recipe.difficulty || parsedContent.metadata.difficulty) && (
                                    <div className="recipe-detail-view__metadata-item">
                                        <span className="recipe-detail-view__metadata-icon">📊</span>
                                        <span className="recipe-detail-view__metadata-label">Difficulty:</span>
                                        <span className="recipe-detail-view__metadata-value">
                                            {recipe.difficulty || parsedContent.metadata.difficulty}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {parsedContent.instructions.length > 0 ? (
                        <div className="recipe-detail-view__instructions">
                            <h3>👨‍🍳 Instructions</h3>
                            <div className="recipe-detail-view__instructions-list">
                                {parsedContent.instructions.map((instruction, index) => {
                                    const cleanInstruction = instruction
                                        .replace(/^\d+\.\s*/, '')
                                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                        .trim();

                                    return (
                                        <div key={index} className="recipe-detail-view__instruction-step">
                                            <span className="recipe-detail-view__step-number">{index + 1}</span>
                                            <span
                                                className="recipe-detail-view__step-text"
                                                dangerouslySetInnerHTML={{ __html: cleanInstruction }}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="recipe-detail-view__raw-content">
                            <h3>📝 Recipe Content</h3>
                            <div className={`recipe-detail-view__content-text ${
                                showFullContent ? 'expanded' : ''
                            }`}>
                                <pre className="recipe-detail-view__recipe-text">
                                    {recipe.recipeText}
                                </pre>
                            </div>
                            {recipe.recipeText && recipe.recipeText.length > 500 && (
                                <button
                                    className="recipe-detail-view__expand-btn"
                                    onClick={() => setShowFullContent(!showFullContent)}
                                >
                                    {showFullContent ? '📖 Show Less' : '📖 Show Full Recipe'}
                                </button>
                            )}
                        </div>
                    )}

                    {recipe.tags && (
                        <div className="recipe-detail-view__tags">
                            <h4>🏷️ Tags:</h4>
                            <div className="recipe-detail-view__tags-list">
                                {(() => {
                                    let tagsArray;
                                    if (Array.isArray(recipe.tags)) {
                                        tagsArray = recipe.tags;
                                    } else if (typeof recipe.tags === 'string') {
                                        tagsArray = recipe.tags.split(',').map(tag => tag.trim());
                                    } else {
                                        tagsArray = [];
                                    }

                                    return tagsArray.map((tag, index) => (
                                        <span key={index} className="recipe-detail-view__tag">
                                            #{tag}
                                        </span>
                                    ));
                                })()}
                            </div>
                        </div>
                    )}
                </div>

                <div className="recipe-detail-view__actions">
                    <button
                        className="recipe-detail-view__print-btn"
                        onClick={() => window.print()}
                    >
                        🖨️ Print Recipe
                    </button>
                </div>
            </div>

            {showShareModal && (
                <ShareModal
                    recipe={recipe}
                    onClose={() => setShowShareModal(false)}
                    averageRating={averageRating}
                    parsedContent={parsedContent}
                    recipeUrl={finalRecipeUrl}
                />
            )}
        </div>
    );
};

export default RecipeDetailView;