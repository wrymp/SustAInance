package com.example.sustainance.models.DTO;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class getFromPantryByIdRequest {
    @NotNull
    private UUID id;

    public getFromPantryByIdRequest() {}

    public getFromPantryByIdRequest(UUID id) {
        this.id = id;
    }
}
