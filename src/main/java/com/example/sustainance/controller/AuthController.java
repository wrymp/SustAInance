package com.example.sustainance.controller;

import com.example.sustainance.models.DTO.LoginRequest;
import com.example.sustainance.models.DTO.RegisterRequest;
import com.example.sustainance.models.DTO.UserResponse;
import com.example.sustainance.models.entities.UserInfo;
import com.example.sustainance.services.UserService;
import com.example.sustainance.excpetions.InvalidRequestException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
            throw new InvalidRequestException("Username is required");
        }
        
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new InvalidRequestException("Email is required");
        }
        
        if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
            throw new InvalidRequestException("Password is required");
        }

        UserResponse user = userService.registerUser(request);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
            throw new InvalidRequestException("Username is required");
        }
        
        if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
            throw new InvalidRequestException("Password is required");
        }

        UserInfo userInfo = userService.authenticateUser(request);

        HttpSession session = httpRequest.getSession(true);
        session.setAttribute("user", userInfo.getUuid().toString());
        System.out.println("SUCCESS: Session created with ID: " + session.getId());

        return ResponseEntity.ok(new UserResponse(userInfo));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        return ResponseEntity.ok().build();
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("user") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String userUuidString = (String) session.getAttribute("user");
        UUID userUuid = UUID.fromString(userUuidString);

        Optional<UserInfo> userInfoOptional = userService.findByUuid(userUuid);
        return userInfoOptional.map(userInfo -> ResponseEntity.ok(new UserResponse(userInfo))).orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());

    }
}