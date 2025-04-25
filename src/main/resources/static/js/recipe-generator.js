class RecipeApp {
    constructor() {
        this.selectedIngredients = [];
        this.cachedIngredients = [];
        this.initializeApp();
    }

    async initializeApp() {
        // Load base ingredients when app starts
        // await this.readPreferences();
        await this.loadBaseIngredients();
        this.setupEventListeners();
    }

    // Load ingredients from backend
    async loadBaseIngredients() {
        try {
            const response = await fetch('/api/recipe/list');
            const ingredients = await response.json();
            this.cachedIngredients = ingredients
            this.displayBaseIngredients(ingredients);
        } catch (error) {
            console.error('Error loading ingredients:', error);
        }
    }

    // Set up event listeners for buttons
    setupEventListeners() {
        document.getElementById('searchBar')
            .addEventListener('input', () => this.searchForIngredient());
        document.getElementById('generateRecipe')
            .addEventListener('click', () => this.generateRecipe());
    }

    // search for Ingredients based on keyword
    searchForIngredient() {
        let ingredients = this.cachedIngredients;
        const searchBarValue = document.getElementById('searchBar').value.trim().toLowerCase();
        if (searchBarValue.length > 0) {
            ingredients = ingredients.filter(ing => ing.name.toLowerCase().includes(searchBarValue));
        }
        this.displayBaseIngredients(ingredients);
    }

    // Display base ingredients in the UI
    displayBaseIngredients(ingredients) {
        const container = document.getElementById('baseIngredients');

        container.innerHTML = ingredients.map(ing => `
            <div class="ingredient-item">
                <span>${ing.name}</span>
                <input type="number" min="0" value="${ing.quantity}">
                <span>${ing.unit}</span>
                <button onclick="app.addIngredient('${ing.name}', this)">Add</button>
            </div>
        `).join('');
    }

    // Add ingredient to selected list
    async addIngredient(name, button) {
        const ingredientDiv = button.closest('.ingredient-item');
        const quantity = ingredientDiv.querySelector('input').value;
        const unit = ingredientDiv.querySelectorAll('span')[1].textContent;

        if (quantity <= 0) {
            alert('Please enter a valid quantity');
            return;
        }

        const ingredient = {
            name: name,
            quantity: parseFloat(quantity),
            unit: unit
        };

        try {
            const response = await fetch('/api/recipe/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(ingredient)
            });

            const updatedIngredients = await response.json();
            this.updateSelectedIngredients(updatedIngredients);
        } catch (error) {
            console.error('Error adding ingredient:', error);
        }
    }

    // Update the selected ingredients display
    updateSelectedIngredients(ingredients) {
        const container = document.getElementById('selectedIngredients');
        container.innerHTML = ingredients.map(ing => `
            <div class="selected-ingredient">
                <span>${ing.quantity} ${ing.unit} of ${ing.name}</span>
                <button onclick="app.removeIngredient('${ing.name}')">Remove</button>
            </div>
        `).join('');
    }

    // Remove ingredient from selected list
    async removeIngredient(name) {
        try {
            const response = await fetch('/api/recipe/remove', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: name })
            });

            const updatedIngredients = await response.json();
            this.updateSelectedIngredients(updatedIngredients);
        } catch (error) {
            console.error('Error removing ingredient:', error);
        }
    }

    // Generate recipe using selected ingredients
    async generateRecipe() {
        try {
            console.log("Generate recipe button clicked");
            console.log("Making POST request to /api/recipe/generate");
            const response = await fetch('/api/recipe/generate', {
                method: 'POST'
            });
            console.log("Response received:", response);
            const recipe = await response.text();
            console.log("Generated recipe:", recipe);
            this.displayRecipe(recipe);
        } catch (error) {
            console.error('Error generating recipe:', error);
        }
    }

    // Display the generated recipe
    displayRecipe(recipe) {
        const container = document.getElementById('recipeResult');
        container.innerHTML = `
        <div class="recipe-content">
            <pre>${recipe}</pre>
        </div>
    `;
    }

    async addCustomIngredient(button) {
        const name = document.getElementById("customIngredientName").value;
        document.getElementById("customIngredientName").value = ''
        const quantity = document.getElementById("customIngredientAmt").value;
        document.getElementById("customIngredientAmt").value = ''
        const unit = document.getElementById("customIngredientUnit").value;
        document.getElementById("customIngredientUnit").value = ''

        if (quantity <= 0) {
            alert('Please enter a valid quantity');
            return;
        }

        const ingredient = {
            name: name,
            quantity: parseFloat(quantity),
            unit: unit
        };

        try {
            const response = await fetch('/api/recipe/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(ingredient)
            });

            const updatedIngredients = await response.json();
            this.updateSelectedIngredients(updatedIngredients);
        } catch (error) {
            console.error('Error adding ingredient:', error);
        }
    }

    getCookie(name) {
        const decodedCookies = decodeURIComponent(document.cookie);
        const cookieArr = decodedCookies.split(';');
        for (let i = 0; i < cookieArr.length; i++) {
            let c = cookieArr[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name + "=") === 0) {
                return c.substring(name.length + 1, c.length);
            }
        }
        return "";
    }

    async readPreferences() {
        const preferenceString = this.getCookie("preferenceString")
        if(preferenceString === ""){
            return
        }

        const preference = {
            preferenceStr: preferenceString
        };

        try {
            // API ENDPOINT STILL IN WORK I THINK?
            // const response = await fetch('/api/recipe/add', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json'
            //     },
            //     body: JSON.stringify(preference)
            // });
            //
            // await response.json();
        } catch (error) {
            console.error('Error adding ingredient:', error);
        }
    }
}

// Initialize the application
const app = new RecipeApp();