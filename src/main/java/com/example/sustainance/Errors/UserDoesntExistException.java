package com.example.sustainance.Errors;

public class UserDoesntExistException extends Exception{
    public UserDoesntExistException(String message) {
        super(message);
    }
}
