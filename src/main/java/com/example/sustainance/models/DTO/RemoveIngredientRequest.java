package com.example.sustainance.models.DTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class RemoveIngredientRequest {

    @NotNull
    private UUID usersId;
    @NotNull
    private UUID id;

    public RemoveIngredientRequest() {}

    public RemoveIngredientRequest(UUID usersId, UUID id) {
        this.usersId = usersId;
        this.id = id;
    }
}
