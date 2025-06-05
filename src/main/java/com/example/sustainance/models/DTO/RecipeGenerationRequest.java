package com.example.sustainance.models.DTO;

import com.example.sustainance.models.Preference.RecipePreferences;
import lombok.Data;

@Data
public class RecipeGenerationRequest {
    private RecipePreferences preferences;
}
