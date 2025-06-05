package com.example.sustainance.models.Preference;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;
import java.util.ArrayList;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecipePreferences {
    private String cuisine = "";
    private List<String> dietaryRestrictions = new ArrayList<>();
    private String cookingTime = "";
    private String difficulty = "";
    private String mealType = "";

    @Override
    public String toString() {
        return String.format("RecipePreferences{cuisine='%s', dietary=%s, time='%s', difficulty='%s', meal='%s'}",
                cuisine, dietaryRestrictions, cookingTime, difficulty, mealType);
    }
}
