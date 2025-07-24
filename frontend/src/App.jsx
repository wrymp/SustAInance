import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import auth components
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicRoute from './components/auth/PublicRoute';

// Import pages
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';
import HomePage from './components/home/HomePage';
// Import your other existing components as needed

import './App.css';
import RecipeGenerator from "./components/recipe/RecipeGenerator";
import SavedRecipesPage from "./components/saved-recipes/SavedRecipesPage";
import PantryPage from "./components/pantry/PantryPage";
import MealPlanMaker from "./components/mealPlan/MealPlanMaker";
import CreateMealPlan from './components/mealPlan/CreateMealPlan';
import RecipeDetailPage from './components/recipeDetail/RecipeDetailPage';

const AuthenticatedRedirect = () => {
  const { isAuthenticated, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? <Navigate to="/home" replace /> : <LoginPage />;
};

function App() {
  return (
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<AuthenticatedRedirect />} />

              <Route element={<PublicRoute />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
              </Route>

              <Route element={<ProtectedRoute />}>
                <Route path="/home" element={<HomePage />} />
                <Route path="/recipe-generator" element={<RecipeGenerator/>} />
                <Route path="/saved-recipes" element={<SavedRecipesPage/>} />
                <Route path="/recipe/:recipeId" element={<RecipeDetailPage />} />
                <Route path="/pantry" element={<PantryPage/>} />
                <Route path="/meal-plan" element={<MealPlanMaker/>} />
                <Route path="/create-meal-plan" element={<CreateMealPlan />} />
              </Route>

              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
  );
}

export default App;