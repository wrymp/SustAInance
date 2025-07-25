package com.example.sustainance.models.DTO;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GeneratedMealDTO {
    private int day;
    private String mealType;
    private String title;
    private String content;
    private String recipeId;
}
