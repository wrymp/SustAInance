package com.example.sustainance.UserAuthenticationTests.ControllerTest;

import com.example.sustainance.Controller.Auth.AuthController;
import com.example.sustainance.Models.JSONClasses.*;
import com.example.sustainance.Services.UserAuthenticationService;
import com.example.sustainance.Repository.Interfaces.UserDAO;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static com.example.sustainance.Constants.englishConstants.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserAuthenticationService authenticationService;


    @Test
    public void testRegisterSuccess() throws Exception {
        // Arrange
        RegisterUserRequest request = new RegisterUserRequest("test@test.com", "password123");
        RegisterUserResponse response = new RegisterUserResponse(true, USER_SUCCESSFULLY_REGISTERED_RESPONSE);

        when(authenticationService.registerUser(any(RegisterUserRequest.class)))
                .thenReturn(response);

        // Act & Assert
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(new ObjectMapper().writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result").value(true))
                .andExpect(jsonPath("$.reason").value(USER_SUCCESSFULLY_REGISTERED_RESPONSE));
    }

    @Test
    public void testLoginSuccess() throws Exception {
        // Arrange
        attemptLogInRequest request = new attemptLogInRequest("test@test.com", "password123");
        attemptLogInResponse response = new attemptLogInResponse(true, USER_SUCCESSFULLY_LOGGED_IN_RESPONSE);

        when(authenticationService.attemptLogIn(any(attemptLogInRequest.class)))
                .thenReturn(response);

        // Act & Assert
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(new ObjectMapper().writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result").value(true))
                .andExpect(jsonPath("$.reason").value(USER_SUCCESSFULLY_LOGGED_IN_RESPONSE));
    }

    @Test
    public void testLoginFailure() throws Exception {
        // Arrange
        attemptLogInRequest request = new attemptLogInRequest("test@test.com", "wrongpassword");
        attemptLogInResponse response = new attemptLogInResponse(false, WRONG_LOG_IN_CREDENTIALS_RESPONSE);

        when(authenticationService.attemptLogIn(any(attemptLogInRequest.class)))
                .thenReturn(response);

        // Act & Assert
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(new ObjectMapper().writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.result").value(false))
                .andExpect(jsonPath("$.reason").value(WRONG_LOG_IN_CREDENTIALS_RESPONSE));
    }

    @Test
    public void testLogoffSuccess() throws Exception {
        // Arrange
        attemptLogoffRequest request = new attemptLogoffRequest("test@test.com");
        attemptLogOffResponse response = new attemptLogOffResponse(true, USER_LOGGED_OFF);

        when(authenticationService.attemptLogOff(any(attemptLogoffRequest.class)))
                .thenReturn(response);

        // Act & Assert
        mockMvc.perform(post("/api/auth/logoff")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(new ObjectMapper().writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result").value(true))
                .andExpect(jsonPath("$.reason").value(USER_LOGGED_OFF));
    }

    @Test
    public void testRegisterFailure() throws Exception {
        // Arrange
        RegisterUserRequest request = new RegisterUserRequest("invalid", "short");
        RegisterUserResponse response = new RegisterUserResponse(false, ILLEGAL_CREDENTIALS_RESPONSE);

        when(authenticationService.registerUser(any(RegisterUserRequest.class)))
                .thenReturn(response);

        // Act & Assert
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(new ObjectMapper().writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.result").value(false))
                .andExpect(jsonPath("$.reason").value(ILLEGAL_CREDENTIALS_RESPONSE));
    }
}