package com.example.sustainance.Models;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class attemptLogInRequest {
    private String email;
    private String password;
}
