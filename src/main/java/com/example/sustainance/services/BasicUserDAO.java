package com.example.sustainance.services;

import com.example.sustainance.interfaces.UserDAO;
import com.example.sustainance.models.userAuth.RegisterUserRequest;
import com.example.sustainance.models.userAuth.User;
import com.example.sustainance.models.userAuth.attemptLogInRequest;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

public class BasicUserDAO implements UserDAO {
    private List<User> Users;

    public BasicUserDAO() {
        this.Users = new ArrayList<>();
    }

    @Override
    public boolean alreadyRegistered(String email) {
        for (User currUser: this.Users){
            if(Objects.equals(currUser.getEmail(), email)){
                return true;
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
    public boolean checkCredentials(attemptLogInRequest request) {
        User loggingInUser = new User(request.getEmail(), request.getPassword());
        for (User currUser: this.Users){
            if(Objects.equals(currUser.getEmail(), loggingInUser.getEmail()) &&
                    Objects.equals(currUser.getPassword(), loggingInUser.getPassword())){
                return true;
            }
        }
        return false;
    }
}
