package com.example.sustainance.Models.JSONClasses;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class RegisterUserRequest {
    private String email;
    private String password;
}

