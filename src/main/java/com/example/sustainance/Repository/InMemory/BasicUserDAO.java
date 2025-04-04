package com.example.sustainance.Repository.InMemory;

import com.example.sustainance.Errors.UserAlreadyExistsException;
import com.example.sustainance.Errors.UserAlreadyLoggedInException;
import com.example.sustainance.Errors.WrongCredentialsException;
import com.example.sustainance.Repository.Interfaces.UserDAO;
import com.example.sustainance.Models.JSONClasses.RegisterUserRequest;
import com.example.sustainance.Models.User;
import com.example.sustainance.Models.JSONClasses.attemptLogInRequest;

import java.util.*;

import static com.example.sustainance.Constants.englishConstants.*;

public class BasicUserDAO implements UserDAO {
    private List<User> Users;
    private Set<String> CurrentlyActives;

    public BasicUserDAO() {
        this.Users = new ArrayList<>();
        this.CurrentlyActives = new HashSet<>();
    }


    public void setUserAsInactive(String email) {
        this.CurrentlyActives.remove(email);
    }

    private void setUserAsActive(String email) {
        this.CurrentlyActives.add(email);
    }

    private boolean checkIfUserIsActive(String email) {
        return this.CurrentlyActives.contains(email);
    }

    @Override
    public boolean alreadyRegistered(String email) throws UserAlreadyExistsException {
        for (User currUser: this.Users){
            if(Objects.equals(currUser.getEmail(), email)){
                throw new UserAlreadyExistsException(USER_ALREADY_REGISTERED_RESPONSE);
            }
        }
        return false;
    }

    @Override
    public void registerUser(RegisterUserRequest request) {
        User newUser = new User(request.getEmail(), request.getPassword());
        this.Users.add(newUser);
    }

    @Override
    public boolean userExists(String email) {
        for (User currUser: this.Users){
            if(Objects.equals(currUser.getEmail(), email)){
                return true;
            }
        }
        return false;
    }

    @Override
    public boolean checkCredentials(attemptLogInRequest request) throws UserAlreadyLoggedInException, WrongCredentialsException {
        if(this.checkIfUserIsActive(request.getEmail())) {
            throw new UserAlreadyLoggedInException(USER_ALREADY_LOGGED_IN_RESPONSE);
        }

        User loggingInUser = new User(request.getEmail(), request.getPassword());
        for (User currUser: this.Users){
            if(Objects.equals(currUser.getEmail(), loggingInUser.getEmail()) &&
                    Objects.equals(currUser.getPassword(), loggingInUser.getPassword())){

                    this.setUserAsActive(currUser.getEmail());
                    return true;
            }
        }

        throw new WrongCredentialsException(WRONG_LOG_IN_CREDENTIALS_RESPONSE);
    }
}
