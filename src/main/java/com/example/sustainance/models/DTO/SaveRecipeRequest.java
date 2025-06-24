package com.example.sustainance.models.DTO;

import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Setter
@Getter
@Data
public class SaveRecipeRequest {

    @NotNull
    private UUID userId;

    @NotBlank
    @Size(max = 255)
    private String recipeName;

    @Size(max = 1000)
    private String recipeDesc;

    @NotBlank
    private String recipeText;

    @NotBlank
    private String prepTime;

    @NotBlank
    private String difficulty;

    private String tags;

    public SaveRecipeRequest() {}

    public SaveRecipeRequest(UUID userId, String recipeName, String recipeDesc,
                             String recipeText, String tags, String prepTime) {
        this.userId = userId;
        this.recipeName = recipeName;
        this.recipeDesc = recipeDesc;
        this.recipeText = recipeText;
        this.tags = tags;
        this.prepTime = prepTime;
    }
}
