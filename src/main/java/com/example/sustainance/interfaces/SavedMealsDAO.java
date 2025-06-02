package com.example.sustainance.interfaces;

import com.example.sustainance.models.ingredients.addMealRequest;
import com.example.sustainance.models.ingredients.getMealsRequest;
import com.example.sustainance.models.ingredients.getMealsResponse;

public interface SavedMealsDAO {
    void addNewMeal(addMealRequest request);
    getMealsResponse getMeals(getMealsRequest request);
}
