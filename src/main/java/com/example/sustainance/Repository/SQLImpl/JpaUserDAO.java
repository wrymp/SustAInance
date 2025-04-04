package com.example.sustainance.Repository.SQLImpl;

import com.example.sustainance.Errors.UserAlreadyExistsException;
import com.example.sustainance.Errors.UserAlreadyLoggedInException;
import com.example.sustainance.Errors.WrongCredentialsException;
import com.example.sustainance.Models.JSONClasses.RegisterUserRequest;
import com.example.sustainance.Models.JSONClasses.attemptLogInRequest;
import com.example.sustainance.Models.User;
import com.example.sustainance.Repository.Interfaces.UserDAO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Repository;

import static com.example.sustainance.Constants.englishConstants.*;

@Repository
public class JpaUserDAO implements UserDAO {

    @Autowired
    private UserJpaRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Override
    public boolean alreadyRegistered(String email) throws UserAlreadyExistsException {
        if (userRepository.existsByEmail(email)) {
            throw new UserAlreadyExistsException(USER_ALREADY_REGISTERED_RESPONSE);
        }
        return false;
    }

    @Override
    public void registerUser(RegisterUserRequest request) {
        String hashedPassword = passwordEncoder.encode(request.getPassword());
        User newUser = new User(request.getEmail(), hashedPassword);
        this.userRepository.save(newUser);
    }

    @Override
    public boolean userExists(String email) {
        return userRepository.existsByEmail(email);
    }

    @Override
    public boolean checkCredentials(attemptLogInRequest request)
            throws UserAlreadyLoggedInException, WrongCredentialsException {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new WrongCredentialsException(WRONG_LOG_IN_CREDENTIALS_RESPONSE));

        if (user.isActive()) {
            throw new UserAlreadyLoggedInException(USER_ALREADY_LOGGED_IN_RESPONSE);
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new WrongCredentialsException(WRONG_LOG_IN_CREDENTIALS_RESPONSE);
        }

        setUserAsActive(user.getEmail());
        return true;
    }

    @Override
    public void setUserAsInactive(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            user.setActive(false);
            userRepository.save(user);
        });
    }

    private void setUserAsActive(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            user.setActive(true);
            userRepository.save(user);
        });
    }

    private boolean checkIfUserIsActive(String email) {
        return userRepository.findByEmail(email)
                .map(User::isActive)
                .orElse(false);
    }
}