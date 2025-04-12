package com.example.sustainance.controller;


import com.example.sustainance.models.ingredients.Ingredient;
import com.example.sustainance.services.IngredientSelectionService;
import com.example.sustainance.services.AIService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.sustainance.constants.baseIngredients;

import java.util.List;

@RestController
@RequestMapping("/api/recipe")
@CrossOrigin(origins = "*")
@Slf4j
public class RecipeController {
    private final IngredientSelectionService ingredientService;
    private final AIService AIService;

    public RecipeController(IngredientSelectionService ingredientService,
                            AIService AIService) {
        this.ingredientService = ingredientService;
        this.AIService = AIService;
    }

    @PostMapping("/add")
    public ResponseEntity<List<Ingredient>> addIngredient(@RequestBody Ingredient ingredient) {
        ingredientService.addIngredient(ingredient);
        return ResponseEntity.ok(ingredientService.getIngredients());
    }

    @DeleteMapping("/remove")
    public ResponseEntity<List<Ingredient>> removeIngredient(@RequestBody Ingredient ingredient) {
        ingredientService.remove(ingredient);
        return ResponseEntity.ok(ingredientService.getIngredients());
    }

    @GetMapping("/list")
    public ResponseEntity<List<Ingredient>> getIngredients() {
        return ResponseEntity.ok(baseIngredients.BASE_INGREDIENTS);
    }

    @PostMapping("/generate")
    public ResponseEntity<String> generateRecipe() {
        log.info("Received generate recipe request");
        String ingredients = ingredientService.toString();
        log.info("Ingredients to use: {}", ingredients);
        try {
            String recipe = AIService.generateRecipe(ingredients);
            log.info("Recipe generated successfully");
            return ResponseEntity.ok(recipe);
        } catch (Exception e) {
            log.error("Error generating recipe", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error generating recipe: " + e.getMessage());
        }
    }

    @GetMapping("/test-api")
    public ResponseEntity<String> testApi() {
        try {
            String testRecipe = AIService.generateRecipe("4 eggs, 2 cups of flour, 1 cup of sugar");
            return ResponseEntity.ok("API Test Successful: " + testRecipe);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("API Test Failed: " + e.getMessage());
        }
    }


}