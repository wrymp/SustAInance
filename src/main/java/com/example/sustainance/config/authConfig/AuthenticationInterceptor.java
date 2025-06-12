package com.example.sustainance.config.authConfig;

import com.example.sustainance.excpetions.AuthenticationRequiredException;
import com.example.sustainance.models.entities.UserInfo;
import com.example.sustainance.services.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import java.io.IOException;
import java.util.Optional;
import java.util.UUID;

/**
 * Interceptor that validates user sessions for protected endpoints.
 * Checks for @RequireAuthentication annotation and validates session accordingly.
 */
@Component
@Slf4j
public class AuthenticationInterceptor implements HandlerInterceptor {
    
    private final UserService userService;
    
    public AuthenticationInterceptor(UserService userService) {
        this.userService = userService;
    }
    
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws IOException {
        
        // Only check HandlerMethod (controller methods)
        if (!(handler instanceof HandlerMethod handlerMethod)) {
            return true;
        }
        
        // Check if authentication is required
        boolean requiresAuth = isAuthenticationRequired(handlerMethod);
        if (!requiresAuth) {
            return true; // No authentication needed
        }
        
        log.debug("🔒 Authentication required for endpoint: {} {}", request.getMethod(), request.getRequestURI());
        
        // Validate session
        try {
            UserInfo user = validateSession(request);
            
            // Store authenticated user in request attributes for use in controllers
            request.setAttribute("authenticatedUser", user);
            request.setAttribute("authenticatedUserId", user.getUuid());
            
            log.debug("✅ Session validated for user: {} ({})", user.getUsername(), user.getUuid());
            return true;
            
        } catch (AuthenticationRequiredException e) {
            log.debug("❌ Authentication failed for {}: {}", request.getRequestURI(), e.getMessage());
            
            // Return 401 Unauthorized
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.setContentType("application/json");
            response.getWriter().write("""
                {
                    "error": "Authentication required",
                    "message": "%s",
                    "timestamp": "%s"
                }
                """.formatted(e.getMessage(), java.time.Instant.now()));
            
            return false;
        }
    }
    
    /**
     * Check if the handler method or its class requires authentication
     */
    private boolean isAuthenticationRequired(HandlerMethod handlerMethod) {
        // Check method-level annotation first
        if (handlerMethod.hasMethodAnnotation(RequireAuthentication.class)) {
            return true;
        }
        
        // Check class-level annotation
        return handlerMethod.getBeanType().isAnnotationPresent(RequireAuthentication.class);
    }
    
    /**
     * Validate the current session and return the authenticated user
     */
    private UserInfo validateSession(HttpServletRequest request) throws AuthenticationRequiredException {
        
        // Get session (don't create if it doesn't exist)
        HttpSession session = request.getSession(false);
        if (session == null) {
            throw new AuthenticationRequiredException("No active session found");
        }
        
        // Check if user ID is stored in session
        String userUuidString = (String) session.getAttribute("user");
        if (userUuidString == null || userUuidString.trim().isEmpty()) {
            throw new AuthenticationRequiredException("Session does not contain user information");
        }
        
        // Parse user UUID
        UUID userUuid;
        try {
            userUuid = UUID.fromString(userUuidString);
        } catch (IllegalArgumentException e) {
            throw new AuthenticationRequiredException("Invalid user session data");
        }
        
        // Verify user exists in database
        Optional<UserInfo> userInfoOptional = userService.findByUuid(userUuid);
        if (userInfoOptional.isEmpty()) {
            // User was deleted but session still exists
            session.invalidate(); // Clean up invalid session
            throw new AuthenticationRequiredException("User account not found");
        }
        
        // Check if session is still valid (not expired)
        long currentTime = System.currentTimeMillis();
        long lastAccessTime = session.getLastAccessedTime();
        int maxInactiveInterval = session.getMaxInactiveInterval() * 1000; // Convert to milliseconds
        
        if (maxInactiveInterval > 0 && (currentTime - lastAccessTime) > maxInactiveInterval) {
            session.invalidate();
            throw new AuthenticationRequiredException("Session has expired");
        }
        
        return userInfoOptional.get();
    }
}