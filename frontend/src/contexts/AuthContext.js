import React, { createContext, useState, useEffect, useCallback } from 'react';
import { recipeAPI, setAuthContext } from '../services/api';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);

    const checkAuthStatus = useCallback(async () => {
        try {
            console.log('🔍 Checking authentication status...');
            const response = await recipeAPI.getCurrentUser();

            if (response.status === 200 && response.data) {
                setIsAuthenticated(true);
                setUser(response.data);
                console.log('✅ User authenticated:', response.data.username);
            } else {
                setIsAuthenticated(false);
                setUser(null);
                console.log('❌ Authentication check failed');
            }
        } catch (error) {
            console.log('❌ Authentication failed:', error.response?.status);
            setIsAuthenticated(false);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const login = useCallback((userData) => {
        setIsAuthenticated(true);
        setUser(userData);
        console.log('✅ User logged in:', userData.username);
    }, []);

    const logout = useCallback(async (showMessage = false) => {
        try {
            await recipeAPI.attemptLogout();
            console.log('✅ Logout successful');
        } catch (error) {
            console.log('⚠️ Logout request failed, but logging out locally');
        } finally {
            setIsAuthenticated(false);
            setUser(null);
            
            if (showMessage) {
                alert('Your session has expired. Please log in again.');
            }
        }
    }, []);

    // ✅ Create stable context value
    const contextValue = {
        isAuthenticated,
        user,
        login,
        logout,
        isLoading,
        checkAuthStatus
    };

    // ✅ Set auth context reference whenever the context value changes
    useEffect(() => {
        console.log('🔗 Setting auth context reference');
        setAuthContext(contextValue);
    }, [isAuthenticated, user, login, logout, isLoading, checkAuthStatus]);

    // ✅ Initial auth check
    useEffect(() => {
        checkAuthStatus();
    }, [checkAuthStatus]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export { AuthProvider, AuthContext };