package com.example.sustainance.services;

import com.example.sustainance.models.DTO.LoginRequest;
import com.example.sustainance.models.DTO.RegisterRequest;
import com.example.sustainance.models.DTO.UserResponse;
import com.example.sustainance.models.entities.UserInfo;
import com.example.sustainance.models.repositories.UserInfoRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
public class UserService {

    private final UserInfoRepository userInfoRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserInfoRepository userInfoRepository, PasswordEncoder passwordEncoder) {
        this.userInfoRepository = userInfoRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserResponse registerUser(RegisterRequest request) {
        // Check if username already exists
        if (userInfoRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        // Check if email already exists
        if (userInfoRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        // Create new user
        UserInfo userInfo = new UserInfo();
        userInfo.setUsername(request.getUsername());
        userInfo.setEmail(request.getEmail());
        userInfo.setPassword(passwordEncoder.encode(request.getPassword()));

        UserInfo savedUserInfo = userInfoRepository.save(userInfo);
        return new UserResponse(savedUserInfo);
    }

    public UserInfo authenticateUser(LoginRequest request) {
        Optional<UserInfo> userInfoOptional = userInfoRepository.findByUsernameOrEmail(
                request.getUsernameOrEmail(),
                request.getUsernameOrEmail()
        );

        if (userInfoOptional.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        UserInfo userInfo = userInfoOptional.get();

        if (!passwordEncoder.matches(request.getPassword(), userInfo.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        return userInfo;
    }

    public Optional<UserInfo> findByUsername(String username) {
        return userInfoRepository.findByUsername(username);
    }

    public Optional<UserInfo> findByUuid(UUID uuid) {
        return userInfoRepository.findById(uuid);
    }
}