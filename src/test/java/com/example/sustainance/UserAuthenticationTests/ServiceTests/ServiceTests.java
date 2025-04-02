package com.example.sustainance.UserAuthenticationTests.ServiceTests;

import com.example.sustainance.Services.UserAuthenticationService;
import com.example.sustainance.Models.*;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static com.example.sustainance.Constants.englishConstants.*;

public class ServiceTests {

    private UserAuthenticationService userAuthServ;

    @BeforeEach
    public void setup(){
        this.userAuthServ = new UserAuthenticationService();
        this.userAuthServ.registerUser(new RegisterUserRequest("Place@gmail.com", "HolderHolder"));

    }

    @Test
    public void testRegisterUserNEG(){
        RegisterUserResponse expected = new RegisterUserResponse(false, USER_ALREADY_REGISTERED_RESPONSE);
        RegisterUserResponse actual = this.userAuthServ.registerUser(new RegisterUserRequest("Place@gmail.com", "OtherPassword"));
        Assertions.assertEquals(expected.isResult(), actual.isResult());
        Assertions.assertEquals(expected.getReason(), actual.getReason());
    }

    @Test
    public void testRegisterUserPOS(){
        RegisterUserResponse expected = new RegisterUserResponse(true, USER_SUCCESSFULLY_REGISTERED_RESPONSE);
        RegisterUserResponse actual = this.userAuthServ.registerUser(new RegisterUserRequest("TrueEmail@gmail.com", "TruePassword"));
        Assertions.assertEquals(expected.isResult(), actual.isResult());
        Assertions.assertEquals(expected.getReason(), actual.getReason());
    }

    @Test
    public void testLogInNEG1(){
        attemptLogInResponse expected = new attemptLogInResponse(false, USER_DOESNT_EXIST_RESPONSE);
        attemptLogInResponse actual = this.userAuthServ.attemptLogIn(new attemptLogInRequest("TrueEmail@gmail.com", "TruePassword"));
        Assertions.assertEquals(expected.isResult(), actual.isResult());
        Assertions.assertEquals(expected.getReason(), actual.getReason());
    }

    @Test
    public void testLogInNEG2(){
        attemptLogInResponse expected = new attemptLogInResponse(false, USER_ALREADY_LOGGED_IN_RESPONSE);
        this.userAuthServ.attemptLogIn(new attemptLogInRequest("Place@gmail.com", "HolderHolder"));
        attemptLogInResponse actual = this.userAuthServ.attemptLogIn(new attemptLogInRequest("Place@gmail.com", "HolderHolder"));
        Assertions.assertEquals(expected.isResult(), actual.isResult());
        Assertions.assertEquals(expected.getReason(), actual.getReason());
    }

    @Test
    public void testLogInNEG3(){
        attemptLogInResponse expected = new attemptLogInResponse(false, WRONG_LOG_IN_CREDENTIALS_RESPONSE);
        attemptLogInResponse actual = this.userAuthServ.attemptLogIn(new attemptLogInRequest("Place@gmail.com", "FakePassword"));
        Assertions.assertEquals(expected.isResult(), actual.isResult());
        Assertions.assertEquals(expected.getReason(), actual.getReason());
    }

    @Test
    public void testLogInPOS(){
        attemptLogInResponse expected = new attemptLogInResponse(true, USER_SUCCESSFULLY_LOGGED_IN_RESPONSE);
        attemptLogInResponse actual = this.userAuthServ.attemptLogIn(new attemptLogInRequest("Place@gmail.com", "HolderHolder"));
        Assertions.assertEquals(expected.isResult(), actual.isResult());
        Assertions.assertEquals(expected.getReason(), actual.getReason());
    }

    @Test
    public void testActivitySwitching(){
        attemptLogInResponse expected = new attemptLogInResponse(true, USER_SUCCESSFULLY_LOGGED_IN_RESPONSE);
        this.userAuthServ.attemptLogIn(new attemptLogInRequest("Place@gmail.com", "HolderHolder"));
        this.userAuthServ.attemptLogOff(new attemptLogoffRequest("Place@gmail.com"));
        attemptLogInResponse actual = this.userAuthServ.attemptLogIn(new attemptLogInRequest("Place@gmail.com", "HolderHolder"));
        Assertions.assertEquals(expected.isResult(), actual.isResult());
        Assertions.assertEquals(expected.getReason(), actual.getReason());
    }

    @Test
    public void testBadCredentialsMailNull(){
        RegisterUserResponse expected = new RegisterUserResponse(false, ILLEGAL_CREDENTIALS_RESPONSE);
        RegisterUserResponse actual = this.userAuthServ.registerUser(new RegisterUserRequest(null, "Satisfactory"));
        Assertions.assertEquals(expected.isResult(), actual.isResult());
        Assertions.assertEquals(expected.getReason(), actual.getReason());
    }

    @Test
    public void testBadCredentialsMailNoAmpersant(){
        RegisterUserResponse expected = new RegisterUserResponse(false, ILLEGAL_CREDENTIALS_RESPONSE);
        RegisterUserResponse actual = this.userAuthServ.registerUser(new RegisterUserRequest("lalagmail.com", "Satisfactory"));
        Assertions.assertEquals(expected.isResult(), actual.isResult());
        Assertions.assertEquals(expected.getReason(), actual.getReason());
    }

    @Test
    public void testBadCredentialsMailEmpty(){
        RegisterUserResponse expected = new RegisterUserResponse(false, ILLEGAL_CREDENTIALS_RESPONSE);
        RegisterUserResponse actual = this.userAuthServ.registerUser(new RegisterUserRequest("", "Satisfactory"));
        Assertions.assertEquals(expected.isResult(), actual.isResult());
        Assertions.assertEquals(expected.getReason(), actual.getReason());
    }

    @Test
    public void testBadCredentialsPassNull(){
        RegisterUserResponse expected = new RegisterUserResponse(false, ILLEGAL_CREDENTIALS_RESPONSE);
        RegisterUserResponse actual = this.userAuthServ.registerUser(new RegisterUserRequest("normal@gmail.com", null));
        Assertions.assertEquals(expected.isResult(), actual.isResult());
        Assertions.assertEquals(expected.getReason(), actual.getReason());
    }

    @Test
    public void testBadCredentialsInadequatePass(){
        RegisterUserResponse expected = new RegisterUserResponse(false, ILLEGAL_CREDENTIALS_RESPONSE);
        RegisterUserResponse actual = this.userAuthServ.registerUser(new RegisterUserRequest("normal@gmail.com", "short"));
        Assertions.assertEquals(expected.isResult(), actual.isResult());
        Assertions.assertEquals(expected.getReason(), actual.getReason());
    }

    @Test
    public void testBadCredentialsPassEmpty(){
        RegisterUserResponse expected = new RegisterUserResponse(false, ILLEGAL_CREDENTIALS_RESPONSE);
        RegisterUserResponse actual = this.userAuthServ.registerUser(new RegisterUserRequest("normal@gmail.com", ""));
        Assertions.assertEquals(expected.isResult(), actual.isResult());
        Assertions.assertEquals(expected.getReason(), actual.getReason());
    }
}
