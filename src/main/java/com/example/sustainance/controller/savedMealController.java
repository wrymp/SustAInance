package com.example.sustainance.controller;

import com.example.sustainance.interfaces.SavedMealsDAO;
import com.example.sustainance.interfaces.TokensDAO;
import com.example.sustainance.interfaces.UserDAO;
import com.example.sustainance.models.ingredients.addMealRequest;
import com.example.sustainance.models.ingredients.getMealsRequest;
import com.example.sustainance.models.ingredients.getMealsResponse;
import com.example.sustainance.models.userAuth.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.SQLException;
import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping("/api/savedMeal")
@CrossOrigin(origins = "*")
@Slf4j
public class savedMealController {
    private final SavedMealsDAO savedMealsDAO;

    public savedMealController(SavedMealsDAO savedMealsDAO) {
        this.savedMealsDAO = savedMealsDAO;
    }

    @PostMapping("/saveMeal")
    public ResponseEntity<?> saveMeal(@RequestBody addMealRequest request) {
        this.savedMealsDAO.addNewMeal(request);
        return ResponseEntity.ok(Map.of("message", "Meal saved successfully."));
    }

    @PostMapping("/getMeals")
    public ResponseEntity<?> saveMeal(@RequestBody getMealsRequest request) {
        getMealsResponse response = this.savedMealsDAO.getMeals(request);
        return ResponseEntity.ok(Map.of("allMeals", response));
    }
}
