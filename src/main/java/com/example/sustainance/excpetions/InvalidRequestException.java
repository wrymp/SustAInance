package com.example.sustainance.excpetions;

/**
 * Exception thrown when request data is invalid or missing.
 */
public class InvalidRequestException extends RuntimeException {

    public InvalidRequestException(String message) {
        super(message);
    }

    public InvalidRequestException(String message, Throwable cause) {
        super(message, cause);
    }

    public InvalidRequestException() {
        super("Invalid request data");
    }
}