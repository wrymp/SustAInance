import axios from 'axios';

const API_BASE_URL = 'http://localhost:9097';

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

export const recipeAPI = {
    getIngredients: () => api.get('/api/recipe/list'),
    addIngredient: (ingredient) => api.post('/api/recipe/add', ingredient),
    generateRecipe: (ingredients, preferences = {}) => {
        const ingredientsString = ingredients.map(ing =>
            `${ing.name}${ing.quantity ? `: ${ing.quantity}${ing.unit ? ' ' + ing.unit : ''}` : ''}`
        ).join(', ');

        const requestBody = {
            ingredients: ingredientsString,
            preferences: {
                cuisine: preferences.cuisine || '',
                dietaryRestrictions: preferences.dietaryRestrictions || [],
                cookingTime: preferences.cookingTime || '',
                difficulty: preferences.difficulty || '',
                mealType: preferences.mealType || ''
            }
        };

        return api.post('/api/recipe/generateWithIngredients', requestBody);
    },
    attemptRegister: (registerRequest) => api.post("/api/auth/register", registerRequest),
    attemptLogIn: (loginRequest, httpRequest) => api.post("/api/auth/login", loginRequest, httpRequest),
    attemptLogout: (httpServletRequest) => api.post("/api/auth/logout", httpServletRequest),
    getCurrentUser: (httpServletRequest) => api.get("/api/auth/me", httpServletRequest),
}

export default api;