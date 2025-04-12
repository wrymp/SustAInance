package com.example.sustainance.models.userAuth;

import lombok.Getter;

@Getter
public class attemptLogoffRequest {
    private String email;
    public attemptLogoffRequest(String newEmail, String newPassword) {
        this.email = newEmail;
    }
}
