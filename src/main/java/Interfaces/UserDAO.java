package Interfaces;

import Models.RegisterUserRequest;
import Models.attemptLogInRequest;

public interface UserDAO {

    boolean alreadyRegistered(String email);
    void registerUser(RegisterUserRequest request);
    boolean userExists(String email);
    boolean checkCredentials(attemptLogInRequest request);
}
