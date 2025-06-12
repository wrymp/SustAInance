package com.example.sustainance.models.DTO;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class UpdateRecipeRequest {

    @NotNull
    private UUID id;

    @Size(max = 255)
    private String recipeName;

    @Size(max = 1000)
    private String recipeDesc;

    private String recipeText;

    private String tags;

    @DecimalMin(value = "0.0", message = "Rating must be between 0.0 and 5.0")
    @DecimalMax(value = "5.0", message = "Rating must be between 0.0 and 5.0")
    private Float rating;

    // Constructors
    public UpdateRecipeRequest() {}
}