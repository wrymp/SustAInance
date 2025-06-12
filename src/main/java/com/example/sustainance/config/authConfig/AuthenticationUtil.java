package com.example.sustainance.config.authConfig;

import com.example.sustainance.models.entities.UserInfo;
import jakarta.servlet.http.HttpServletRequest;

import java.util.UUID;

/**
 * Utility class for accessing authenticated user information in controllers.
 */
public class AuthenticationUtil {
    
    /**
     * Get the currently authenticated user from the request.
     * This should only be called from endpoints that are protected with @RequireAuthentication.
     */
    public static UserInfo getCurrentUser(HttpServletRequest request) {
        UserInfo user = (UserInfo) request.getAttribute("authenticatedUser");
        if (user == null) {
            throw new IllegalStateException("No authenticated user found in request. Ensure endpoint is protected with @RequireAuthentication");
        }
        return user;
    }
    
    /**
     * Get the UUID of the currently authenticated user from the request.
     */
    public static UUID getCurrentUserId(HttpServletRequest request) {
        UUID userId = (UUID) request.getAttribute("authenticatedUserId");
        if (userId == null) {
            throw new IllegalStateException("No authenticated user ID found in request. Ensure endpoint is protected with @RequireAuthentication");
        }
        return userId;
    }
    
    /**
     * Check if the current request has an authenticated user.
     */
    public static boolean isAuthenticated(HttpServletRequest request) {
        return request.getAttribute("authenticatedUser") != null;
    }
}