package com.example.sustainance.models.DTO;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Data
public class RateRecipeRequest {
    @NotNull
    private UUID recipeId;

    @NotNull
    private UUID userId;

    @NotNull
    @Min(1)
    @Max(5)
    private Integer rating;

    // Constructors
    public RateRecipeRequest() {}

    public RateRecipeRequest(UUID recipeId, UUID userId, Integer rating) {
        this.recipeId = recipeId;
        this.userId = userId;
        this.rating = rating;
    }
}