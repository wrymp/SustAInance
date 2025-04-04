package com.example.sustainance.UserAuthenticationTests.ServiceTests;

import com.example.sustainance.Errors.UserAlreadyExistsException;
import com.example.sustainance.Errors.UserAlreadyLoggedInException;
import com.example.sustainance.Errors.WrongCredentialsException;
import com.example.sustainance.Models.JSONClasses.RegisterUserRequest;
import com.example.sustainance.Models.JSONClasses.attemptLogInRequest;
import com.example.sustainance.Repository.InMemory.BasicUserDAO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static com.example.sustainance.Constants.englishConstants.*;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

public class DAOTests {

    private BasicUserDAO userDAO;

    @BeforeEach
    public void setup(){
        this.userDAO = new BasicUserDAO();
        this.userDAO.registerUser(new RegisterUserRequest("Place@gmail.com", "Holder"));
        this.userDAO.registerUser(new RegisterUserRequest("TrueEmail@gmail.com", "TruePassword"));
    }

    @Test
    public void testAlreadyRegisteredNEG() {
        UserAlreadyExistsException exception = assertThrows(UserAlreadyExistsException.class, () -> this.userDAO.alreadyRegistered("Place@gmail.com"));
        assertEquals(USER_ALREADY_REGISTERED_RESPONSE, exception.getMessage());
    }

    @Test
    public void testAlreadyRegisteredPOS() throws UserAlreadyExistsException {
        boolean expected = false;
        boolean actual = this.userDAO.alreadyRegistered("NewEmail@gmail.com");
        assertEquals(expected, actual);
    }

    @Test
    public void testUserExistsNEG(){
        boolean expected = false;
        boolean actual = this.userDAO.userExists("FakeEmail@gmail.com");
        assertEquals(expected, actual);
    }

    @Test
    public void testUserExistsPOS(){
        boolean expected = true;
        boolean actual = this.userDAO.userExists("TrueEmail@gmail.com");
        assertEquals(expected, actual);
    }

    @Test
    public void testCheckCredentialsPOS1() throws UserAlreadyLoggedInException, WrongCredentialsException {
        boolean expected = true;
        boolean actual = this.userDAO.checkCredentials(new attemptLogInRequest("TrueEmail@gmail.com", "TruePassword"));
        assertEquals(expected, actual);
    }

    @Test
    public void testCheckCredentialsReLoginPOS() throws UserAlreadyLoggedInException, WrongCredentialsException {
        boolean expected = true;
        this.userDAO.checkCredentials(new attemptLogInRequest("TrueEmail@gmail.com", "TruePassword"));
        this.userDAO.setUserAsInactive("TrueEmail@gmail.com");
        boolean actual = this.userDAO.checkCredentials(new attemptLogInRequest("TrueEmail@gmail.com", "TruePassword"));
        assertEquals(expected, actual);
    }

    @Test
    public void testCheckCredentialsWrongCreds(){
        WrongCredentialsException exception = assertThrows(WrongCredentialsException.class, () -> this.userDAO.checkCredentials(new attemptLogInRequest("FakeEmail@gmail.com", "FakePassword")));
        assertEquals(WRONG_LOG_IN_CREDENTIALS_RESPONSE, exception.getMessage());
    }

    @Test
    public void testCheckCredentialsReLoginNEG() throws UserAlreadyLoggedInException, WrongCredentialsException {
        this.userDAO.checkCredentials(new attemptLogInRequest("TrueEmail@gmail.com", "TruePassword"));
        UserAlreadyLoggedInException exception = assertThrows(UserAlreadyLoggedInException.class, () -> this.userDAO.checkCredentials(new attemptLogInRequest("TrueEmail@gmail.com", "TruePassword")));
        assertEquals(USER_ALREADY_LOGGED_IN_RESPONSE, exception.getMessage());
    }
}
