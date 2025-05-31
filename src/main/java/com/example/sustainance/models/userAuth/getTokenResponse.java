package com.example.sustainance.models.userAuth;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class getTokenResponse {
    private String token;

    public getTokenResponse(String newToken) {
        this.token = newToken;
    }
}
