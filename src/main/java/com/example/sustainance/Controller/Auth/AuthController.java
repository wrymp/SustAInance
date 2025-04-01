package com.example.sustainance.Controller.Auth;

import com.example.sustainance.Models.RegisterUserResponse;
import com.example.sustainance.Models.attemptLogInRequest;
import com.example.sustainance.Models.attemptLogInResponse;
import com.example.sustainance.Services.UserAuthenticationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserAuthenticationService authenticationService;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody attemptLogInRequest request) {
        attemptLogInResponse response = authenticationService.attemptLogIn(request);
        if (!response.isResult()) {
            return ResponseEntity.badRequest().body(response.getReason());
        }
        return ResponseEntity.badRequest().body(response);
    }

}
