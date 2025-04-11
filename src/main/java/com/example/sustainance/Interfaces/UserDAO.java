package com.example.sustainance.Interfaces;

import com.example.sustainance.Models.UserAuth.RegisterUserRequest;
import com.example.sustainance.Models.UserAuth.attemptLogInRequest;

public interface UserDAO {

    boolean alreadyRegistered(String email);
    void registerUser(RegisterUserRequest request);
    boolean userExists(String email);
    boolean checkCredentials(attemptLogInRequest request);
}
