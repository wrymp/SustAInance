package com.example.sustainance.models.DTO;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class TakeIngredientRequest {

    @NotNull
    private UUID usersId;

    @NotBlank
    private String ingredientName;

    @NotBlank
    private String count;

    public TakeIngredientRequest() {}

    public TakeIngredientRequest(UUID usersId, String ingredientName, String count) {
        this.usersId = usersId;
        this.ingredientName = ingredientName;
        this.count = count;
    }
}
