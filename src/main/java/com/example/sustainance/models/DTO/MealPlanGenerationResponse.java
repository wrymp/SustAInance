package com.example.sustainance.models.DTO;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MealPlanGenerationResponse {
    private List<GeneratedMealDTO> meals;
    private int totalMeals;
    private String status;
}
