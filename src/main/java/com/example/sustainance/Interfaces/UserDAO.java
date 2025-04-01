package com.example.sustainance.Interfaces;

import com.example.sustainance.Models.RegisterUserRequest;
import com.example.sustainance.Models.attemptLogInRequest;

public interface UserDAO {

    boolean alreadyRegistered(String email);
    void registerUser(RegisterUserRequest request);
    boolean userExists(String email);
    boolean checkCredentials(attemptLogInRequest request);
}
