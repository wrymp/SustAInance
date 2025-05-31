package com.example.sustainance.models.userAuth;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class createTokenRequest {
    private String email;

    public createTokenRequest(String newEmail) {
        this.email = newEmail;
    }
}
