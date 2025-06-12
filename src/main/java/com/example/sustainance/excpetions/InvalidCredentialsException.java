package com.example.sustainance.excpetions;

/**
 * Exception thrown when login credentials are invalid.
 */
public class InvalidCredentialsException extends RuntimeException {

    public InvalidCredentialsException(String username) {
        super("Invalid password for user '" + username + "'");
    }

    public InvalidCredentialsException(String message, Throwable cause) {
        super(message, cause);
    }

    public InvalidCredentialsException() {
        super("Invalid credentials provided");
    }
}

