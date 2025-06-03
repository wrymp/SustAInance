//package com.example.sustainance.controller;
//
//import com.example.sustainance.interfaces.UserDAO;
//import com.example.sustainance.interfaces.TokensDAO;
//import com.example.sustainance.models.userAuth.*;
//import lombok.Getter;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//import java.sql.SQLException;
//import java.util.Map;
//import java.util.Objects;
//
//@RestController
//@RequestMapping("/api/auth")
//@Slf4j
//public class AuthController {
//    private final UserDAO userDAO;
//    private final TokensDAO tokensDAO;
//
//    public AuthController(UserDAO userDAO, com.example.sustainance.interfaces.TokensDAO tokensDAO) throws SQLException {
//        this.userDAO = userDAO;
//        this.tokensDAO = tokensDAO;
//    }
//
//    @PostMapping("/registerUser")
//    public ResponseEntity<?> registerUser(@RequestBody RegisterUserRequest request) {
//        if (!this.userDAO.alreadyRegistered(request.getEmail())) {
//            this.userDAO.registerUser(request);
//            this.tokensDAO.addNewToken(new createTokenRequest(request.getEmail()));
//            String token = this.tokensDAO.getToken(new getTokenRequest(request.getEmail())).getToken();
//            return ResponseEntity.ok(Map.of("message", "User registered successfully.", "token", token));
//        } else {
//            return ResponseEntity.status(HttpStatus.CONFLICT).body("This email already has an associated account.");
//        }
//    }
//
//    @PostMapping("/attemptLogIn")
//    public ResponseEntity<?> attemptLogIn(@RequestBody attemptLogInRequest request) {
//        if (this.userDAO.userExists(request.getEmail())) {
//            if (this.userDAO.checkCredentials(request)) {
//
//                String token = this.tokensDAO.getToken(new getTokenRequest(request.getEmail())).getToken();
//                if(token.isEmpty()){
//                    this.tokensDAO.addNewToken(new createTokenRequest(request.getEmail()));
//                }
//                token = this.tokensDAO.getToken(new getTokenRequest(request.getEmail())).getToken();
//                return ResponseEntity.ok(Map.of("message", "User Logged In successfully.", "token", token));
//            } else {
//                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Wrong Password.");
//            }
//        } else {
//            return ResponseEntity.status(HttpStatus.CONFLICT).body("This email has no associated account.");
//        }
//    }
//
//    @PostMapping("/attemptTokenAuth")
//    public ResponseEntity<?> attemptTokenAuth(@RequestBody attemptTokenAuthRequest request) {
//        String email = this.tokensDAO.attemptTokenAuth(request).getEmail();
//        if (!Objects.equals(email, "")) {
//            return ResponseEntity.ok(Map.of("message", "User Logged In successfully.", "email", email));
//        } else {
//            return ResponseEntity.status(HttpStatus.CONFLICT).body("This Tokens Expired.");
//        }
//    }
//
//    @Value("${google.key}")
//    private String googleKey;
//
//    @GetMapping("/getGoogleKey")
//    public ResponseEntity<?> getGoogleKey() {
//        return ResponseEntity.ok(Map.of("key", googleKey));
//    }
//}
