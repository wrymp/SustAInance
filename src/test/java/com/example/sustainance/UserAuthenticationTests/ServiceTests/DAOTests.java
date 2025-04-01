package com.example.sustainance.UserAuthenticationTests.ServiceTests;

import com.example.sustainance.Models.RegisterUserRequest;
import com.example.sustainance.Models.attemptLogInRequest;
import com.example.sustainance.Repository.InMemory.BasicUserDAO;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

public class DAOTests {

    private BasicUserDAO userDAO;

    @BeforeEach
    public void setup(){
        this.userDAO = new BasicUserDAO();
        this.userDAO.registerUser(new RegisterUserRequest("Place@gmail.com", "Holder"));
        this.userDAO.registerUser(new RegisterUserRequest("TrueEmail@gmail.com", "TruePassword"));
    }

    @Test
    public void testAlreadyRegisteredNEG(){
        boolean expected = false;
        boolean actual = this.userDAO.alreadyRegistered("FakeEmail@gmail.com");
        Assertions.assertEquals(expected, actual);
    }

    @Test
    public void testAlreadyRegisteredPOS(){
        boolean expected = true;
        boolean actual = this.userDAO.alreadyRegistered("TrueEmail@gmail.com");
        Assertions.assertEquals(expected, actual);
    }

    @Test
    public void testUserExistsNEG(){
        boolean expected = false;
        boolean actual = this.userDAO.userExists("FakeEmail@gmail.com");
        Assertions.assertEquals(expected, actual);
    }

    @Test
    public void testUserExistsPOS(){
        boolean expected = true;
        boolean actual = this.userDAO.userExists("TrueEmail@gmail.com");
        Assertions.assertEquals(expected, actual);
    }

    @Test
    public void testCheckCredentialsPOS(){
        boolean expected = true;
        boolean actual = this.userDAO.checkCredentials(new attemptLogInRequest("TrueEmail@gmail.com", "TruePassword"));
        Assertions.assertEquals(expected, actual);
    }

    @Test
    public void testCheckCredentialsNEG(){
        boolean expected = false;
        boolean actual = this.userDAO.checkCredentials(new attemptLogInRequest("FakeEmail@gmail.com", "FakePassword"));
        Assertions.assertEquals(expected, actual);
    }
}
