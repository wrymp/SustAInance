package com.example.sustainance.Repository.Interfaces;

import com.example.sustainance.Errors.UserAlreadyExistsException;
import com.example.sustainance.Errors.UserAlreadyLoggedInException;
import com.example.sustainance.Errors.WrongCredentialsException;
import com.example.sustainance.Models.RegisterUserRequest;
import com.example.sustainance.Models.attemptLogInRequest;

public interface UserDAO {

    boolean alreadyRegistered(String email) throws UserAlreadyExistsException;
    void registerUser(RegisterUserRequest request);
    boolean userExists(String email);
    boolean checkCredentials(attemptLogInRequest request) throws UserAlreadyLoggedInException, WrongCredentialsException;
    void setUserAsInactive(String email);
    private void setUserAsActive(String email) {}
    private boolean checkIfUserIsActive(String email) { return false; }
}
