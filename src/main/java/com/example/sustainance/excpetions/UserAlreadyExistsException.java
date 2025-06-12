package com.example.sustainance.excpetions;

/**
 * Exception thrown when trying to register a user that already exists.
 */
public class UserAlreadyExistsException extends RuntimeException {

    public UserAlreadyExistsException(String message) {
        super(message);
    }

    public UserAlreadyExistsException(String field, String value) {
        super(field + " '" + value + "' already exists");
    }

    public UserAlreadyExistsException() {
        super("User already exists");
    }
}