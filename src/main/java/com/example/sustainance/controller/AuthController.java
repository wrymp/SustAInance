package com.example.sustainance.controller;

import com.example.sustainance.interfaces.UserDAO;
import com.example.sustainance.models.userAuth.RegisterUserRequest;
import com.example.sustainance.models.userAuth.attemptLogInRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.SQLException;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
@Slf4j
public class AuthController {

    private final UserDAO userDAO;

    public AuthController(UserDAO userDAO) throws SQLException {
        this.userDAO = userDAO;
    }

    @PostMapping("/registerUser")
    public ResponseEntity<?> registerUser(@RequestBody RegisterUserRequest request) {
        if (!this.userDAO.alreadyRegistered(request.getEmail())) {
            this.userDAO.registerUser(request);
            return ResponseEntity.ok(Map.of("message", "User registered successfully."));
        } else {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("This email already has an associated account.");
        }
    }

    @PostMapping("/attemptLogIn")
    public ResponseEntity<?> attemptLogIn(@RequestBody attemptLogInRequest request) {
        if (this.userDAO.userExists(request.getEmail())) {
            if (this.userDAO.checkCredentials(request)) {
                return ResponseEntity.ok(Map.of("message", "User Logged In successfully."));
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Wrong Password.");
            }
        } else {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("This email has no associated account.");
        }
    }

    @Value("${google.key}")
    private String googleKey;

    @GetMapping("/getGoogleKey")
    public ResponseEntity<?> getGoogleKey() {
        return ResponseEntity.ok(Map.of("key", googleKey));
    }
}
