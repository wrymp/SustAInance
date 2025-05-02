package com.example.sustainance.controller;


import com.example.sustainance.models.ingredients.Ingredient;
import com.example.sustainance.models.ingredients.MealPlanRequest;
import com.example.sustainance.models.ingredients.Preference;
import com.example.sustainance.services.EmailSenderService;
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
    private final EmailSenderService emailSenderService;

    public RecipeController(IngredientSelectionService ingredientService,
                            AIService AIService, EmailSenderService emailSenderService) {
        this.ingredientService = ingredientService;
        this.AIService = AIService;
        this.emailSenderService = emailSenderService;
    }

    @PostMapping("/add")
    public ResponseEntity<List<Ingredient>> addIngredient(@RequestBody Ingredient ingredient) {
        ingredientService.addIngredient(ingredient);
        return ResponseEntity.ok(ingredientService.getIngredients());
    }

    @PostMapping("/addPreference")
    public ResponseEntity<List<Ingredient>> addPreference(@RequestBody Preference preference) {
        log.info("RECVED PREF: "+preference.getPreferenceString());
        ingredientService.addPreference(preference);
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

    @PostMapping("/generateMealPlan")
    public ResponseEntity<String> generateMealPlan(@RequestBody MealPlanRequest mealPlanRequest) {
        log.info("Received generate Meal Plan request");
        String ingredients = ingredientService.toString();
        log.info("Ingredients to use: {}", ingredients);
        try {
            String recipe = AIService.generateMealPlan(mealPlanRequest.getFoodPreferenceString(),
                    mealPlanRequest.getTimeframe(), mealPlanRequest.getPlanPreferenceString(), ingredients);
            log.info("Meal plan generated successfully");
            log.info(recipe);


            int index = recipe.indexOf("SHOPPING LIST:");
            String shopping_list = recipe.substring(index);
            recipe = recipe.substring(0, index);
            System.out.println(shopping_list);
            if(!mealPlanRequest.getRecipient().isEmpty()){
                this.emailSenderService.sendEmail(mealPlanRequest.getRecipient(), shopping_list);
            }


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