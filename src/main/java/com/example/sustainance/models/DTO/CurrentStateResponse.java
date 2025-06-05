package com.example.sustainance.models.DTO;

import com.example.sustainance.models.ingredients.Ingredient;
import lombok.Data;

import java.util.List;

@Data
public  class CurrentStateResponse {
    private List<Ingredient> ingredients;
    private String ingredientsString;

    public CurrentStateResponse(List<Ingredient> ingredients, String ingredientsString) {
        this.ingredients = ingredients;
        this.ingredientsString = ingredientsString;
    }
}
