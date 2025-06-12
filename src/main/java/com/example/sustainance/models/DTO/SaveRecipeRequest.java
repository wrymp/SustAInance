package com.example.sustainance.models.DTO;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Setter
@Getter
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

    private String tags; // Comma-separated tags

    @DecimalMin(value = "0.0", message = "Rating must be between 0.0 and 5.0")
    @DecimalMax(value = "5.0", message = "Rating must be between 0.0 and 5.0")
    private Float rating;

    // Constructors
    public SaveRecipeRequest() {}

    public SaveRecipeRequest(UUID userId, String recipeName, String recipeDesc,
                             String recipeText, String tags, Float rating) {
        this.userId = userId;
        this.recipeName = recipeName;
        this.recipeDesc = recipeDesc;
        this.recipeText = recipeText;
        this.tags = tags;
        this.rating = rating;
    }
}
