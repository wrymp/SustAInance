import axios from 'axios';

const API_BASE_URL = 'http://localhost:9097';

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

export const recipeAPI = {
    getIngredients: () => api.get('/api/recipe/list'),
    addIngredient: (ingredient) => api.post('/api/recipe/add', ingredient),
    removeIngredient: (name) => api.delete('/api/recipe/remove', { data: { name } }),
    generateRecipe: () => api.post('/api/recipe/generate'),
};