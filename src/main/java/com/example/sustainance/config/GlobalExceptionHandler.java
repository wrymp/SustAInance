package com.example.sustainance.config;

import com.example.sustainance.excpetions.*;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

/**
 * Global exception handler for all controllers.
 * Provides consistent error responses across the application.
 */
@ControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    /**
     * Handle validation/request errors (400 Bad Request)
     */
    @ExceptionHandler(InvalidRequestException.class)
    public ResponseEntity<Map<String, Object>> handleInvalidRequest(
            InvalidRequestException ex, WebRequest request) {
        
        log.warn("Bad Request: {}", ex.getMessage());
        
        return ResponseEntity.badRequest().body(createErrorResponse(
            "Invalid request",
            ex.getMessage(),
            HttpStatus.BAD_REQUEST
        ));
    }

    /**
     * Handle authentication required (401 Unauthorized)
     */
    @ExceptionHandler(AuthenticationRequiredException.class)
    public ResponseEntity<Map<String, Object>> handleAuthenticationRequired(
            AuthenticationRequiredException ex, WebRequest request) {
        
        log.warn("Authentication Required: {}", ex.getMessage());
        
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(createErrorResponse(
            "Authentication required",
            ex.getMessage(),
            HttpStatus.UNAUTHORIZED
        ));
    }

    /**
     * Handle invalid credentials (401 Unauthorized)
     */
    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<Map<String, Object>> handleInvalidCredentials(
            InvalidCredentialsException ex, WebRequest request) {
        
        log.warn("Invalid Credentials: {}", ex.getMessage());
        
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(createErrorResponse(
            "Invalid credentials",
            "The password you entered is incorrect",
            HttpStatus.UNAUTHORIZED
        ));
    }

    /**
     * Handle user not found (404 Not Found)
     */
    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleUserNotFound(
            UserNotFoundException ex, WebRequest request) {
        
        log.warn("User Not Found: {}", ex.getMessage());
        
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(createErrorResponse(
            "User not found",
            "The username you entered doesn't exist",
            HttpStatus.NOT_FOUND
        ));
    }

    /**
     * Handle user already exists (409 Conflict)
     */
    @ExceptionHandler(UserAlreadyExistsException.class)
    public ResponseEntity<Map<String, Object>> handleUserAlreadyExists(
            UserAlreadyExistsException ex, WebRequest request) {
        
        log.warn("User Already Exists: {}", ex.getMessage());
        
        return ResponseEntity.status(HttpStatus.CONFLICT).body(createErrorResponse(
            "User already exists",
            ex.getMessage(),
            HttpStatus.CONFLICT
        ));
    }

    /**
     * Handle unexpected server errors (500 Internal Server Error)
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(
            RuntimeException ex, WebRequest request) {
        
        log.error("Unexpected error: {}", ex.getMessage(), ex);
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(createErrorResponse(
            "Server error",
            "An unexpected error occurred. Please try again later.",
            HttpStatus.INTERNAL_SERVER_ERROR
        ));
    }

    /**
     * Create consistent error response structure
     */
    private Map<String, Object> createErrorResponse(String error, String message, HttpStatus status) {
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("error", error);
        errorResponse.put("message", message);
        errorResponse.put("status", status.value());
        errorResponse.put("timestamp", Instant.now().toString());
        return errorResponse;
    }
}