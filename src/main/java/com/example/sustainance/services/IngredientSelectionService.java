package com.example.sustainance.services;


import com.example.sustainance.models.ingredients.Ingredient;
import lombok.Getter;
import lombok.Setter;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Getter
@Setter
@Service
public class IngredientSelectionService {
    private final List<Ingredient> ingredients;

    public IngredientSelectionService() {
        this.ingredients = new ArrayList<>();
    }

    public void addIngredient(Ingredient newIngredient){
        this.ingredients.add(newIngredient);
    }

    public void remove(Ingredient removeIngredient){
        for (int i = 0; i < this.ingredients.size(); i++) {
            Ingredient ingredient = this.ingredients.get(i);
            if(Objects.equals(ingredient.getName(), removeIngredient.getName())){
                this.ingredients.remove(i);
            }
        }
    }

    @Override
    public String toString() {
        StringBuilder result = new StringBuilder();
        for (int i = 0; i < this.ingredients.size(); i++) {
            Ingredient ingredient = this.ingredients.get(i);
            result.append(ingredient.toString());
            if (i < this.ingredients.size() - 1){
                result.append(", ");
            }
        }
        result.append(".");
        return result.toString();
    }
}
