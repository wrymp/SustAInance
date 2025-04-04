package com.example.sustainance.Controller.Auth;

import com.example.sustainance.Models.JSONClasses.*;
import com.example.sustainance.Services.UserAuthenticationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserAuthenticationService authenticationService;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody attemptLogInRequest request) {
        attemptLogInResponse response = authenticationService.attemptLogIn(request);
        if (!response.isResult()) {
            return ResponseEntity.badRequest().body(response);
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterUserRequest request) {
        RegisterUserResponse response = authenticationService.registerUser(request);
        if (!response.isResult()) {
            return ResponseEntity.badRequest().body(response);
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logoff")
    public ResponseEntity<?> logoffUser(@RequestBody attemptLogoffRequest request) {
        attemptLogOffResponse response = authenticationService.attemptLogOff(request);
        if (!response.isResult()) {
            return ResponseEntity.badRequest().body(response);
        }
        return ResponseEntity.ok(response);
    }
}
