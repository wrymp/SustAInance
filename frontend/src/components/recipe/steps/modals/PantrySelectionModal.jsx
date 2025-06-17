import React, { useState } from 'react';
import './PantrySelectionModal.css';

const PantrySelectionModal = ({
                                  isOpen,
                                  onClose,
                                  pantryItems,
                                  onAddIngredients,
                                  existingIngredients
                              }) => {
    const [selectedItems, setSelectedItems] = useState(new Set());
    const [searchQuery, setSearchQuery] = useState('');

    if (!isOpen) return null;

    // Get existing ingredient names for filtering
    const existingNames = existingIngredients.map(ing => ing.name.toLowerCase());

    // Filter pantry items based on search and existing ingredients
    const filteredItems = pantryItems.filter(item => {
        const matchesSearch = item.ingredientName.toLowerCase().includes(searchQuery.toLowerCase());
        const notAlreadyAdded = !existingNames.includes(item.ingredientName.toLowerCase());
        return matchesSearch && notAlreadyAdded;
    });

    const handleItemToggle = (itemId) => {
        const newSelected = new Set(selectedItems);
        if (newSelected.has(itemId)) {
            newSelected.delete(itemId);
        } else {
            newSelected.add(itemId);
        }
        setSelectedItems(newSelected);
    };

    const handleSelectAll = () => {
        if (selectedItems.size === filteredItems.length) {
            setSelectedItems(new Set());
        } else {
            setSelectedItems(new Set(filteredItems.map(item => item.id)));
        }
    };

    const handleAddSelected = () => {
        const selectedPantryItems = pantryItems.filter(item => selectedItems.has(item.id));
        onAddIngredients(selectedPantryItems);
        setSelectedItems(new Set());
        setSearchQuery('');
    };

    const handleClose = () => {
        setSelectedItems(new Set());
        setSearchQuery('');
        onClose();
    };

    return (
        <div className="pantry-modal__overlay" onClick={handleClose}>
            <div className="pantry-modal__content" onClick={(e) => e.stopPropagation()}>
                <div className="pantry-modal__header">
                    <h3 className="pantry-modal__title">
                        <span className="pantry-modal__title-icon">🏺</span>
                        Select from Your Pantry
                    </h3>
                    <button
                        className="pantry-modal__close-btn"
                        onClick={handleClose}
                    >
                        ×
                    </button>
                </div>

                {pantryItems.length === 0 ? (
                    <div className="pantry-modal__empty">
                        <div className="pantry-modal__empty-icon">📦</div>
                        <h4>Your pantry is empty</h4>
                        <p>Add some ingredients to your pantry first to use this feature.</p>
                    </div>
                ) : (
                    <>
                        <div className="pantry-modal__search">
                            <input
                                type="text"
                                placeholder="Search ingredients..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pantry-modal__search-input"
                            />
                        </div>

                        {filteredItems.length === 0 ? (
                            <div className="pantry-modal__no-results">
                                <p>
                                    {searchQuery
                                        ? `No ingredients found matching "${searchQuery}"`
                                        : "All your pantry ingredients are already added!"
                                    }
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="pantry-modal__controls">
                                    <button
                                        className="pantry-modal__select-all-btn"
                                        onClick={handleSelectAll}
                                    >
                                        {selectedItems.size === filteredItems.length ? 'Deselect All' : 'Select All'}
                                    </button>
                                    <span className="pantry-modal__count">
                                        {selectedItems.size} of {filteredItems.length} selected
                                    </span>
                                </div>

                                <div className="pantry-modal__items">
                                    {filteredItems.map((item) => (
                                        <div
                                            key={item.id}
                                            className={`pantry-modal__item ${
                                                selectedItems.has(item.id) ? 'pantry-modal__item--selected' : ''
                                            }`}
                                            onClick={() => handleItemToggle(item.id)}
                                        >
                                            <div className="pantry-modal__item-checkbox">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedItems.has(item.id)}
                                                    onChange={() => handleItemToggle(item.id)}
                                                />
                                            </div>
                                            <div className="pantry-modal__item-info">
                                                <h4 className="pantry-modal__item-name">{item.ingredientName}</h4>
                                                <p className="pantry-modal__item-quantity">
                                                    {item.count} {item.unit}
                                                </p>
                                            </div>
                                            <div className="pantry-modal__item-icon">🥫</div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        <div className="pantry-modal__footer">
                            <button
                                className="pantry-modal__cancel-btn"
                                onClick={handleClose}
                            >
                                Cancel
                            </button>
                            <button
                                className="pantry-modal__add-btn"
                                onClick={handleAddSelected}
                                disabled={selectedItems.size === 0}
                            >
                                Add {selectedItems.size} Ingredient{selectedItems.size !== 1 ? 's' : ''}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default PantrySelectionModal;