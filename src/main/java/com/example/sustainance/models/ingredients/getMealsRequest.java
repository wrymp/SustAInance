package com.example.sustainance.models.ingredients;

import lombok.Getter;

@Getter
public class getMealsRequest {
    private String email;

    public getMealsRequest(String newEmail) {
        this.email = newEmail;
    }
}
