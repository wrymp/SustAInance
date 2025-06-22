import React, { useState } from 'react';
import './RecipeDetailView.css';

const RecipeDetailView = ({
                              recipe,
                              onBack,
                              onDelete,
                              onShare
                          }) => {
    const [showFullContent, setShowFullContent] = useState(false);

    // Parse recipe content if it's formatted text
    const parseRecipeContent = (content) => {
        if (!content) return { instructions: [], metadata: {} };

        const result = {
            instructions: [],
            metadata: {}
        };

        // Extract Instructions section
        const instructionsMatch = content.match(/Instructions:\s*(.*?)(?=Cooking Time:|Chef's Tips:|$)/s);
        if (instructionsMatch) {
            const instructionsText = instructionsMatch[1];
            result.instructions = instructionsText
                .split(/(?=\d+\.\s)/)
                .filter(step => step.trim() && step.match(/^\d+\./))
                .map(step => step.trim());
        }

        // Extract metadata
        const cookingTimeMatch = content.match(/Cooking Time:\s*([^\n]+)/);
        const servesMatch = content.match(/Serves:\s*([^\n]+)/);
        const difficultyMatch = content.match(/Difficulty:\s*([^\n]+)/);

        if (cookingTimeMatch) result.metadata.cookingTime = cookingTimeMatch[1].trim();
        if (servesMatch) result.metadata.serves = servesMatch[1].trim();
        if (difficultyMatch) result.metadata.difficulty = difficultyMatch[1].trim();

        return result;
    };

    const parsedContent = parseRecipeContent(recipe.recipeText);

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: recipe.recipeName,
                    text: recipe.recipeDesc,
                    url: window.location.href
                });
            } catch (error) {
                console.log('Error sharing:', error);
            }
        } else {
            navigator.clipboard.writeText(`${recipe.recipeName}\n\n${recipe.recipeText}`);
            alert('Recipe copied to clipboard!');
        }
    };

    return (
        <div className="recipe-detail-view">
            {/* Header with Back Button */}
            <div className="recipe-detail-view__header">
                <button className="recipe-detail-view__back-btn" onClick={onBack}>
                    <span className="recipe-detail-view__back-icon">←</span>
                    <span>Back to Recipes</span>
                </button>

                <div className="recipe-detail-view__header-actions">
                    <button
                        className="recipe-detail-view__action-btn recipe-detail-view__share-btn"
                        onClick={handleShare}
                    >
                        📤 Share
                    </button>
                    <button
                        className="recipe-detail-view__action-btn recipe-detail-view__delete-btn"
                        onClick={() => onDelete && onDelete(recipe)}
                    >
                        🗑️ Delete
                    </button>
                </div>
            </div>

            {/* Recipe Content */}
            <div className="recipe-detail-view__container">
                {/* Title Section */}
                <div className="recipe-detail-view__title-section">
                    <h1 className="recipe-detail-view__title">{recipe.recipeName}</h1>
                    <p className="recipe-detail-view__description">{recipe.recipeDesc}</p>
                </div>

                {/* Recipe Card */}
                <div className="recipe-detail-view__recipe-card">
                    {/* Metadata Section */}
                    {(recipe.prepTime || recipe.difficulty || parsedContent.metadata.cookingTime || parsedContent.metadata.serves || parsedContent.metadata.difficulty) && (
                        <div className="recipe-detail-view__metadata">
                            <h3>📋 Recipe Details</h3>
                            <div className="recipe-detail-view__metadata-grid">
                                {/* Use prepTime from recipe object first, then parsed content */}
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
                                {/* Use difficulty from recipe object first, then parsed content */}
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

                    {/* Instructions Section */}
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
                        // Fallback: Show raw content if no structured instructions found
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

                    {/* Tags Section */}
                    {recipe.tags && (
                        <div className="recipe-detail-view__tags">
                            <h4>🏷️ Tags:</h4>
                            <div className="recipe-detail-view__tags-list">
                                {(() => {
                                    // Handle both string and array cases
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

                {/* Action Buttons */}
                <div className="recipe-detail-view__actions">
                    <button
                        className="recipe-detail-view__print-btn"
                        onClick={() => window.print()}
                    >
                        🖨️ Print Recipe
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RecipeDetailView;