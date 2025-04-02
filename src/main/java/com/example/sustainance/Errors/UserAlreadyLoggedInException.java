package com.example.sustainance.Errors;

public class UserAlreadyLoggedInException extends Exception{
    public UserAlreadyLoggedInException(String message) {
        super(message);
    }
}
