import axios from 'axios';

export const API_BASE_URL = 'http://localhost:9097';

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

// ✅ Setup to handle session timeout automatically
let authContextRef = null;

// Export function to set auth context reference
export const setAuthContext = (authContext) => {
    authContextRef = authContext;
};

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && authContextRef) {
            console.log('🔒 Session expired - logging out user');

            authContextRef.logout();

            if (window.location.pathname !== '/login') {
                alert('Your session has expired. Please log in again.');
                window.location.href = '/login';
            }
        }
        
        return Promise.reject(error);
    }
);

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
    attemptLogIn: (loginRequest) => api.post("/api/auth/login", loginRequest),
    attemptLogout: () => api.post("/api/auth/logout"),
    getCurrentUser: () => api.get("/api/auth/me"),
}

export default api;