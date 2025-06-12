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

// Component to handle authenticated user redirects
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
            {/* Root path - redirect to home if authenticated, otherwise show login */}
            <Route path="/" element={<AuthenticatedRedirect />} />

            {/* Public routes - accessible when not logged in */}
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            {/* Protected routes - require authentication */}
            <Route element={<ProtectedRoute />}>
              <Route path="/home" element={<HomePage />} />
              <Route path="/recipe-generator" element={<RecipeGenerator/>} />
              <Route path="/saved-recipes" element={<SavedRecipesPage/>} />
              <Route path="/pantry" element={<PantryPage/>} />
              {/* Add your other protected routes here */}
            </Route>

            {/* Redirect all other routes to home (which will redirect to login if not authenticated) */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;