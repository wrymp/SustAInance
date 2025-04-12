package com.example.sustainance.models.userAuth;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterUserResponse {
    private boolean result;
    private String reason;

    public RegisterUserResponse(boolean newResult, String newReason) {
        this.result = newResult;
        this.reason = newReason;
    }
}
