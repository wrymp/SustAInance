package com.example.sustainance.models.ingredients;

import lombok.Getter;

@Getter
public class addMealRequest {
    private String email;
    private String meal;

    public addMealRequest(String newEmail, String newMeal) {
        this.meal = newMeal;
        this.email = newEmail;
    }
}
