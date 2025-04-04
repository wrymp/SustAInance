package com.example.sustainance.UserAuthenticationTests.ServiceTests;

import com.example.sustainance.Errors.UserAlreadyExistsException;
import com.example.sustainance.Errors.UserAlreadyLoggedInException;
import com.example.sustainance.Errors.WrongCredentialsException;
import com.example.sustainance.Models.JSONClasses.*;
import com.example.sustainance.Repository.Interfaces.UserDAO;
import com.example.sustainance.Services.UserAuthenticationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;

import static com.example.sustainance.Constants.englishConstants.*;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@SpringBootTest
@ActiveProfiles("test")
public class ServiceTests {

    @Autowired
    private UserAuthenticationService userAuthServ;

    @MockBean
    private UserDAO userDAO;

    @BeforeEach
    public void setup() throws Exception {
        // Setup mock behavior for initial user
        when(userDAO.alreadyRegistered("Place@gmail.com"))
                .thenReturn(false)
                .thenThrow(new UserAlreadyExistsException(USER_ALREADY_REGISTERED_RESPONSE));
    }

    @Test
    public void testRegisterUserNEG() {
        RegisterUserRequest request = new RegisterUserRequest("Place@gmail.com", "OtherPassword");

        // Act
        RegisterUserResponse actual = userAuthServ.registerUser(request);
        RegisterUserResponse actual2 = userAuthServ.registerUser(request);

        // Assert
        assertEquals(false, actual2.isResult());
        assertEquals(USER_ALREADY_REGISTERED_RESPONSE, actual2.getReason());
    }

    @Test
    public void testRegisterUserPOS() throws Exception {
        // Arrange
        RegisterUserRequest request = new RegisterUserRequest("TrueEmail@gmail.com", "TruePassword");
        when(userDAO.alreadyRegistered("TrueEmail@gmail.com")).thenReturn(false);

        // Act
        RegisterUserResponse actual = userAuthServ.registerUser(request);

        // Assert
        assertEquals(true, actual.isResult());
        assertEquals(USER_SUCCESSFULLY_REGISTERED_RESPONSE, actual.getReason());
    }

    @Test
    public void testLogInNEG1() {
        // Arrange
        when(userDAO.userExists("TrueEmail@gmail.com")).thenReturn(false);

        // Act
        attemptLogInResponse actual = userAuthServ.attemptLogIn(
                new attemptLogInRequest("TrueEmail@gmail.com", "TruePassword")
        );

        // Assert
        assertEquals(false, actual.isResult());
        assertEquals(USER_DOESNT_EXIST_RESPONSE, actual.getReason());
    }

    @Test
    public void testLogInNEG2() throws Exception {
        // Arrange
        when(userDAO.userExists("Place@gmail.com")).thenReturn(true);
        when(userDAO.checkCredentials(any()))
                .thenThrow(new UserAlreadyLoggedInException(USER_ALREADY_LOGGED_IN_RESPONSE));

        // Act
        attemptLogInResponse actual = userAuthServ.attemptLogIn(
                new attemptLogInRequest("Place@gmail.com", "HolderHolder")
        );

        // Assert
        assertEquals(false, actual.isResult());
        assertEquals(USER_ALREADY_LOGGED_IN_RESPONSE, actual.getReason());
    }

    @Test
    public void testLogInNEG3() throws Exception {
        // Arrange
        when(userDAO.userExists("Place@gmail.com")).thenReturn(true);
        when(userDAO.checkCredentials(any()))
                .thenThrow(new WrongCredentialsException(WRONG_LOG_IN_CREDENTIALS_RESPONSE));

        // Act
        attemptLogInResponse actual = userAuthServ.attemptLogIn(
                new attemptLogInRequest("Place@gmail.com", "FakePassword")
        );

        // Assert
        assertEquals(false, actual.isResult());
        assertEquals(WRONG_LOG_IN_CREDENTIALS_RESPONSE, actual.getReason());
    }

    @Test
    public void testLogInPOS() throws Exception {
        // Arrange
        when(userDAO.userExists("Place@gmail.com")).thenReturn(true);
        when(userDAO.checkCredentials(any())).thenReturn(true);

        // Act
        attemptLogInResponse actual = userAuthServ.attemptLogIn(
                new attemptLogInRequest("Place@gmail.com", "HolderHolder")
        );

        // Assert
        assertEquals(true, actual.isResult());
        assertEquals(USER_SUCCESSFULLY_LOGGED_IN_RESPONSE, actual.getReason());
    }

    @Test
    public void testActivitySwitching() throws Exception {
        // Arrange
        when(userDAO.userExists("Place@gmail.com")).thenReturn(true);
        when(userDAO.checkCredentials(any())).thenReturn(true);

        // Act
        userAuthServ.attemptLogIn(new attemptLogInRequest("Place@gmail.com", "HolderHolder"));
        userAuthServ.attemptLogOff(new attemptLogoffRequest("Place@gmail.com"));
        attemptLogInResponse actual = userAuthServ.attemptLogIn(
                new attemptLogInRequest("Place@gmail.com", "HolderHolder")
        );

        // Assert
        assertEquals(true, actual.isResult());
        assertEquals(USER_SUCCESSFULLY_LOGGED_IN_RESPONSE, actual.getReason());
    }

    @Test
    public void testBadCredentialsMailNull() {
        // Act
        RegisterUserResponse actual = userAuthServ.registerUser(
                new RegisterUserRequest(null, "Satisfactory")
        );

        // Assert
        assertEquals(false, actual.isResult());
        assertEquals(ILLEGAL_CREDENTIALS_RESPONSE, actual.getReason());
    }

    @Test
    public void testBadCredentialsMailNoAmpersant() {
        // Act
        RegisterUserResponse actual = userAuthServ.registerUser(
                new RegisterUserRequest("lalagmail.com", "Satisfactory")
        );

        // Assert
        assertEquals(false, actual.isResult());
        assertEquals(ILLEGAL_CREDENTIALS_RESPONSE, actual.getReason());
    }

    @Test
    public void testBadCredentialsMailEmpty() {
        // Act
        RegisterUserResponse actual = userAuthServ.registerUser(
                new RegisterUserRequest("", "Satisfactory")
        );

        // Assert
        assertEquals(false, actual.isResult());
        assertEquals(ILLEGAL_CREDENTIALS_RESPONSE, actual.getReason());
    }

    @Test
    public void testBadCredentialsPassNull() {
        // Act
        RegisterUserResponse actual = userAuthServ.registerUser(
                new RegisterUserRequest("normal@gmail.com", null)
        );

        // Assert
        assertEquals(false, actual.isResult());
        assertEquals(ILLEGAL_CREDENTIALS_RESPONSE, actual.getReason());
    }

    @Test
    public void testBadCredentialsInadequatePass() {
        // Act
        RegisterUserResponse actual = userAuthServ.registerUser(
                new RegisterUserRequest("normal@gmail.com", "short")
        );

        // Assert
        assertEquals(false, actual.isResult());
        assertEquals(ILLEGAL_CREDENTIALS_RESPONSE, actual.getReason());
    }

    @Test
    public void testBadCredentialsPassEmpty() {
        // Act
        RegisterUserResponse actual = userAuthServ.registerUser(
                new RegisterUserRequest("normal@gmail.com", "")
        );

        // Assert
        assertEquals(false, actual.isResult());
        assertEquals(ILLEGAL_CREDENTIALS_RESPONSE, actual.getReason());
    }
}