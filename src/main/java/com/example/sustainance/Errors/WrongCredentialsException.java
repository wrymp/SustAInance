package com.example.sustainance.Errors;

public class WrongCredentialsException extends Exception{
    public WrongCredentialsException(String message) {
        super(message);
    }
}
