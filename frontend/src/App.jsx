import React from 'react';
import RecipeGenerator from './components/recipe/RecipeGenerator';
import './App.css';
import HomePage from "./components/home/HomePage";
import PantryManager from "./components/pantry/PantryManager";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SavedRecipesPage from "./components/saved-recipes/SavedRecipesPage";
import LoginPage from "./components/auth/LoginPage";
import RegisterPage from "./components/auth/RegisterPage";

function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/recipes" element={<SavedRecipesPage />} />
                    <Route path="/recipe-generator" element={<RecipeGenerator />} />
                    <Route path="/pantry" element={<PantryManager />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    {/* Add other routes */}
                </Routes>
            </div>
        </Router>
    );
}

export default App;