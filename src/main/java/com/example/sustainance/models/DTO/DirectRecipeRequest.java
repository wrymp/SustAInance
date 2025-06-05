package com.example.sustainance.models.DTO;

import com.example.sustainance.models.Preference.RecipePreferences;
import lombok.Data;

@Data
public class DirectRecipeRequest {
    private String ingredients;
    private RecipePreferences preferences;
}
