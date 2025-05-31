package com.example.sustainance.models.userAuth;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class getTokenRequest {
    private String email;

    public getTokenRequest(String newEmail) {
        this.email = newEmail;
    }
}
