package com.example.sustainance.models.userAuth;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class attemptTokenAuthResponse {
    private String email;

    public attemptTokenAuthResponse(String newEmail) {
        this.email = newEmail;
    }
}
