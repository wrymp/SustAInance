package com.example.sustainance.services;

import com.example.sustainance.models.DTO.LoginRequest;
import com.example.sustainance.models.DTO.RegisterRequest;
import com.example.sustainance.models.DTO.UserResponse;
import com.example.sustainance.models.entities.UserInfo;
import com.example.sustainance.repositories.UserInfoRepository;
import com.example.sustainance.excpetions.UserNotFoundException;
import com.example.sustainance.excpetions.InvalidCredentialsException;
import com.example.sustainance.excpetions.UserAlreadyExistsException;
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
        if (userInfoRepository.existsByUsername(request.getUsername())) {
            throw new UserAlreadyExistsException("Username", request.getUsername());
        }

        if (userInfoRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("Email", request.getEmail());
        }

        UserInfo userInfo = new UserInfo();
        userInfo.setUsername(request.getUsername());
        userInfo.setEmail(request.getEmail());
        userInfo.setPassword(passwordEncoder.encode(request.getPassword()));

        UserInfo savedUserInfo = userInfoRepository.save(userInfo);
        return new UserResponse(savedUserInfo);
    }

    public UserInfo authenticateUser(LoginRequest request) {

        Optional<UserInfo> userInfoOptional = userInfoRepository.findByUsername(request.getUsername());

        if (userInfoOptional.isEmpty()) {
            throw new UserNotFoundException(request.getUsername());
        }

        UserInfo userInfo = userInfoOptional.get();

        if (!passwordEncoder.matches(request.getPassword(), userInfo.getPassword())) {
            throw new InvalidCredentialsException(request.getUsername());
        }

        return userInfo;
    }

    public Optional<UserInfo> findByUuid(UUID uuid) {
        return userInfoRepository.findById(uuid);
    }
}