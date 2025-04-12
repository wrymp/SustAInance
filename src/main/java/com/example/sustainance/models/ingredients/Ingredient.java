package com.example.sustainance.models.ingredients;


import lombok.Getter;

@Getter
public class Ingredient {
    private final String name;
    private final String unit;
    private final double quantity;

    public Ingredient(String iName, String iUnit, double iQuantity) {
        this.name = iName;
        this.unit = iUnit;
        this.quantity = iQuantity;
    }

    @Override
    public String toString() {
        return this.quantity + " " + this.unit + "s of " + this.name;
    }
}
