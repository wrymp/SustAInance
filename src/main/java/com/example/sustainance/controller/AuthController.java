package com.example.sustainance.controller;

import com.example.sustainance.models.DTO.LoginRequest;
import com.example.sustainance.models.DTO.RegisterRequest;
import com.example.sustainance.models.DTO.UserResponse;
import com.example.sustainance.models.entities.UserInfo;
import com.example.sustainance.services.UserService;
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
    public ResponseEntity<UserResponse> register(@RequestBody RegisterRequest request) {
        try {
            UserResponse user = userService.registerUser(request);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/login")
    public ResponseEntity<UserResponse> login(@RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        try {
            UserInfo userInfo = userService.authenticateUser(request);

            HttpSession session = httpRequest.getSession(true);
            session.setAttribute("user", userInfo.getUuid().toString());

            return ResponseEntity.ok(new UserResponse(userInfo));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
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
        if (userInfoOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return ResponseEntity.ok(new UserResponse(userInfoOptional.get()));
    }
}
