package com.example.sustainance.Services;

import com.example.sustainance.Errors.*;
import com.example.sustainance.Models.JSONClasses.*;
import com.example.sustainance.Repository.Interfaces.UserDAO;
import com.example.sustainance.Repository.InMemory.BasicUserDAO;
import com.example.sustainance.Repository.SQLImpl.JpaUserDAO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import static com.example.sustainance.Constants.englishConstants.*;

@Service
public class UserAuthenticationService {

    @Autowired
    private UserDAO userDAO = new JpaUserDAO();

    public RegisterUserResponse registerUser(RegisterUserRequest request){
        try {
            this.checkIfNormalCredentials(request.getEmail(), request.getPassword());
            this.userDAO.alreadyRegistered(request.getEmail());
            this.userDAO.registerUser(request);
        } catch (IllegalCredentialsException | UserAlreadyExistsException e) {
            System.out.println(e.getMessage());
            return new RegisterUserResponse(false, e.getMessage());
        }
        return new RegisterUserResponse(true, USER_SUCCESSFULLY_REGISTERED_RESPONSE);
    }

    private void checkIfUserExists(attemptLogInRequest request) throws UserDoesntExistException {
        if(!this.userDAO.userExists(request.getEmail())){
            throw new UserDoesntExistException(USER_DOESNT_EXIST_RESPONSE);
        }
    }

    private boolean checkEmailValidity(String email){
        return !(email == null || email.isEmpty() || !email.contains("@"));
    }

    private boolean checkPasswordValidity(String password){
        return !(password == null || password.isEmpty());
    }

    private boolean checkPasswordAcceptability(String password){
        return password.length() >= 8;
    }

    private void checkIfNormalCredentials(String email, String password) throws IllegalCredentialsException {
        if(!(this.checkEmailValidity(email) &&
                this.checkPasswordValidity(password) &&
                this.checkPasswordAcceptability(password))){
            throw new IllegalCredentialsException(ILLEGAL_CREDENTIALS_RESPONSE);
        }
    }

    public attemptLogInResponse attemptLogIn(attemptLogInRequest request){
        try{
            this.checkIfNormalCredentials(request.getEmail(), request.getPassword());
            this.checkIfUserExists(request);
            this.userDAO.checkCredentials(request);
        } catch (IllegalCredentialsException |
                 UserDoesntExistException |
                 UserAlreadyLoggedInException |
                 WrongCredentialsException e) {
            return new attemptLogInResponse(false, e.getMessage());
        }

        return new attemptLogInResponse(true, USER_SUCCESSFULLY_LOGGED_IN_RESPONSE);
    }

    public attemptLogOffResponse attemptLogOff(attemptLogoffRequest request){
        attemptLogOffResponse response = new attemptLogOffResponse(true, USER_LOGGED_OFF);
        this.userDAO.setUserAsInactive(request.getEmail());
        return response;
    }

}
