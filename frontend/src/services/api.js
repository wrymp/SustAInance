import axios from 'axios';

export const API_BASE_URL = 'http://localhost:9097';

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

let authContextRef = null;

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

export const mealPlanAPI = {
    generateMealPlan: (planSettings) => api.post('/api/meal-plans/generate', planSettings),

    createMealPlan: (mealPlan) => api.post('/api/meal-plans', mealPlan),
    getUserMealPlans: (userId) => api.get(`/api/meal-plans/user/${userId}`),
    getMealPlanById: (id) => api.get(`/api/meal-plans/${id}`),
    updateMealPlan: (id, mealPlan) => api.put(`/api/meal-plans/${id}`, mealPlan),
    deleteMealPlan: (id) => api.delete(`/api/meal-plans/${id}`),
    deleteMealPlanByUser: (userId, id) => api.delete(`/api/meal-plans/user/${userId}/${id}`),

    generateRecipeForMeal: (mealPlanId, day, mealType) => {
        return api.post(`/api/meal-plans/${mealPlanId}/meals/${day}/${mealType}/generate-recipe`);
    },

    getMealPlanProgress: (mealPlanId) => {
        return api.get(`/api/meal-plans/${mealPlanId}/progress`);
    }
};


export default api;