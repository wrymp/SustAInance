package com.example.sustainance.models.ingredients;

import lombok.Getter;

@Getter
public class getMealsResponse {
    private String[] meals;

    public getMealsResponse(String[] newMeals) {
        this.meals = newMeals;
    }
}
