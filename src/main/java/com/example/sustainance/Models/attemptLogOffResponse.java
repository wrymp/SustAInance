package com.example.sustainance.Models;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class attemptLogOffResponse {
    private boolean result;
    private String reason;
}
