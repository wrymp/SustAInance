package com.example.sustainance.models.ingredients;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Ingredient {
    private String name;
    private double quantity;
    private String unit;
    private String category;
    private List<String> availableUnits;
}