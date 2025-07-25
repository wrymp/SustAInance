package com.example.sustainance.models.DTO;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MealPlanProgressDTO {
    private int totalRecipes;
    private int completedRecipes;
    private int failedRecipes;
    private String status;
    private double progressPercentage;
}
