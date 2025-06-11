package com.example.sustainance.models.DTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class AddIngredientRequest {

    @NotNull
    private UUID usersId;

    @NotBlank
    private String ingredientName;

    @NotBlank
    private String count;

    @NotBlank
    private String unit;

    public AddIngredientRequest() {}

    public AddIngredientRequest(UUID usersId, String ingredientName, String count, String unit) {
        this.usersId = usersId;
        this.ingredientName = ingredientName;
        this.count = count;
        this.unit = unit;
    }
}