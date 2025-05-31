package com.example.sustainance.models.userAuth;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class attemptTokenAuthRequest {
    private String token;

    public attemptTokenAuthRequest(String newToken) {
        this.token = newToken;
    }
}
