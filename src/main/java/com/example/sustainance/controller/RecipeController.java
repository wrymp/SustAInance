package com.example.sustainance.controller;


import com.example.sustainance.models.DTO.DirectRecipeRequest;
import com.example.sustainance.models.DTO.RecipeGenerationRequest;
import com.example.sustainance.models.Preference.RecipePreferences;
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
import java.util.Map;

@RestController
@RequestMapping("/api/recipe")
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
    public ResponseEntity<List<Ingredient>> removeIngredient(@RequestBody Map<String, String> request) {
        String ingredientName = request.get("name");
        Ingredient ingredientToRemove = new Ingredient();
        ingredientToRemove.setName(ingredientName);
        ingredientService.remove(ingredientToRemove);
        return ResponseEntity.ok(ingredientService.getIngredients());
    }

    @GetMapping("/list")
    public ResponseEntity<List<Ingredient>> getIngredients() {
        return ResponseEntity.ok(baseIngredients.BASE_INGREDIENTS);
    }

    // ✅ UPDATED: Keep backward compatibility but add preference support
    @PostMapping("/generate")
    public ResponseEntity<String> generateRecipe(@RequestBody(required = false) RecipeGenerationRequest request) {
        log.info("🍳 Received generate recipe request");

        try {
            String ingredients = ingredientService.toString();
            log.info("📝 Ingredients to use: {}", ingredients);

            // Handle both old and new request formats
            RecipePreferences preferences = new RecipePreferences();

            if (request != null && request.getPreferences() != null) {
                // ✅ NEW: Use preferences from frontend
                preferences = request.getPreferences();
                log.info("🎯 Using frontend preferences: {}", preferences);
            } else {
                // ✅ BACKWARD COMPATIBILITY: Use stored preferences from ingredientService
                log.info("🔄 Using stored preferences (backward compatibility)");
                // You can extract preferences from your existing Preference system here if needed
            }

            String recipe = AIService.generateRecipe(ingredients, preferences);
            log.info("✅ Recipe generated successfully");
            return ResponseEntity.ok(recipe);

        } catch (Exception e) {
            log.error("❌ Error generating recipe", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error generating recipe: " + e.getMessage());
        }
    }

    // ✅ NEW: Alternative endpoint for direct ingredient + preference input (for frontend)
    @PostMapping("/generateWithIngredients")
    public ResponseEntity<String> generateRecipeWithIngredients(@RequestBody DirectRecipeRequest request) {
        log.info("🍳 Received direct recipe generation request");

        try {
            if (request.getIngredients() == null || request.getIngredients().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Ingredients are required");
            }

            // Use preferences if provided, otherwise use defaults
            RecipePreferences preferences = request.getPreferences() != null ?
                    request.getPreferences() : new RecipePreferences();

            log.info("📝 Direct ingredients: {}", request.getIngredients());
            log.info("🎯 Preferences: {}", preferences);

            String recipe = AIService.generateRecipe(request.getIngredients(), preferences);

            log.info("✅ Recipe generated successfully");
            return ResponseEntity.ok(recipe);

        } catch (Exception e) {
            log.error("❌ Error in recipe generation: {}", e.getMessage());
            return ResponseEntity.internalServerError()
                    .body("Failed to generate recipe: " + e.getMessage());
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
            if (index >= 0) {
                String shopping_list = recipe.substring(index);
                recipe = recipe.substring(0, index);
                System.out.println(shopping_list);
                if (!mealPlanRequest.getRecipient().isEmpty()) {
                    this.emailSenderService.sendEmail(mealPlanRequest.getRecipient(), shopping_list);
                }
            }


            return ResponseEntity.ok(recipe);
        } catch (Exception e) {
            log.error("Error generating recipe", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error generating recipe: " + e.getMessage());
        }
    }


}