package com.example.sustainance.models.userAuth;

import lombok.Getter;

@Getter
public class RegisterUserRequest {
    private String email;
    private String password;

    public RegisterUserRequest(String newEmail, String newPassword) {
        this.email = newEmail;
        this.password = newPassword;
    }
}
