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
        this.userAuthServ.registerUser(new RegisterUserRequest("Place@gmail.com", "Holder"));

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
        this.userAuthServ.attemptLogIn(new attemptLogInRequest("Place@gmail.com", "Holder"));
        attemptLogInResponse actual = this.userAuthServ.attemptLogIn(new attemptLogInRequest("Place@gmail.com", "Holder"));
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
        attemptLogInResponse actual = this.userAuthServ.attemptLogIn(new attemptLogInRequest("Place@gmail.com", "Holder"));
        Assertions.assertEquals(expected.isResult(), actual.isResult());
        Assertions.assertEquals(expected.getReason(), actual.getReason());
    }

    @Test
    public void testActivitySwitching(){
        attemptLogInResponse expected = new attemptLogInResponse(true, USER_SUCCESSFULLY_LOGGED_IN_RESPONSE);
        this.userAuthServ.attemptLogIn(new attemptLogInRequest("Place@gmail.com", "Holder"));
        this.userAuthServ.attemptLogOff(new attemptLogoffRequest("Place@gmail.com"));
        attemptLogInResponse actual = this.userAuthServ.attemptLogIn(new attemptLogInRequest("Place@gmail.com", "Holder"));
        Assertions.assertEquals(expected.isResult(), actual.isResult());
        Assertions.assertEquals(expected.getReason(), actual.getReason());
    }
}
