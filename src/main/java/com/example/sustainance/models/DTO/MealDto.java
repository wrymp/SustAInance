package com.example.sustainance.models.DTO;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MealDto {
    private int day;
    private String mealType;
    private String title;
    private String content;
    private String recipeId;
}
