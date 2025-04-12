package com.example.sustainance.interfaces;

import com.example.sustainance.models.userAuth.RegisterUserRequest;
import com.example.sustainance.models.userAuth.attemptLogInRequest;

public interface UserDAO {

    boolean alreadyRegistered(String email);
    void registerUser(RegisterUserRequest request);
    boolean userExists(String email);
    boolean checkCredentials(attemptLogInRequest request);
}
