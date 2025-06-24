package com.example.sustainance.models.DTO;

import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Data
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

    private String prepTime;

    private String difficulty;

    private List<String> tags;

    public UpdateRecipeRequest() {}
}