package com.example.sustainance.controller;

import com.example.sustainance.config.authConfig.AuthenticationUtil;
import com.example.sustainance.config.authConfig.RequireAuthentication;
import com.example.sustainance.models.DTO.DirectRecipeRequest;
import com.example.sustainance.models.DTO.RecipeGenerationRequest;
import com.example.sustainance.models.Preference.RecipePreferences;
import com.example.sustainance.models.entities.UserInfo;
import com.example.sustainance.models.ingredients.Ingredient;
import com.example.sustainance.models.ingredients.MealPlanRequest;
import com.example.sustainance.models.ingredients.Preference;
import com.example.sustainance.services.EmailSenderService;
import com.example.sustainance.services.IngredientSelectionService;
import com.example.sustainance.services.AIService;
import com.example.sustainance.constants.baseIngredients;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller for recipe-related operations.
 * All endpoints require authentication.
 */
@RestController
@RequestMapping("/api/recipe")
@RequireAuthentication
@Slf4j
public class RecipeController {
    
    private final IngredientSelectionService ingredientService;
    private final AIService aiService;
    private final EmailSenderService emailSenderService;

    public RecipeController(IngredientSelectionService ingredientService,
                            AIService aiService, 
                            EmailSenderService emailSenderService) {
        this.ingredientService = ingredientService;
        this.aiService = aiService;
        this.emailSenderService = emailSenderService;
    }

    @PostMapping("/add")
    public ResponseEntity<List<Ingredient>> addIngredient(
            @RequestBody Ingredient ingredient,
            HttpServletRequest request) {
        
        UserInfo currentUser = AuthenticationUtil.getCurrentUser(request);
        log.info("🥕 User {} adding ingredient: {}", currentUser.getUsername(), ingredient.getName());
        
        ingredientService.addIngredient(ingredient);
        return ResponseEntity.ok(ingredientService.getIngredients());
    }

    @PostMapping("/addPreference")
    public ResponseEntity<List<Ingredient>> addPreference(
            @RequestBody Preference preference,
            HttpServletRequest request) {
        
        UserInfo currentUser = AuthenticationUtil.getCurrentUser(request);
        log.info("⚙️ User {} adding preference: {}", currentUser.getUsername(), preference.getPreferenceString());
        
        ingredientService.addPreference(preference);
        return ResponseEntity.ok(ingredientService.getIngredients());
    }

    @DeleteMapping("/remove")
    public ResponseEntity<List<Ingredient>> removeIngredient(
            @RequestBody Map<String, String> request,
            HttpServletRequest httpRequest) {
        
        UserInfo currentUser = AuthenticationUtil.getCurrentUser(httpRequest);
        String ingredientName = request.get("name");
        
        log.info("🗑️ User {} removing ingredient: {}", currentUser.getUsername(), ingredientName);
        
        Ingredient ingredientToRemove = new Ingredient();
        ingredientToRemove.setName(ingredientName);
        ingredientService.remove(ingredientToRemove);
        
        return ResponseEntity.ok(ingredientService.getIngredients());
    }

    @GetMapping("/list")
    public ResponseEntity<List<Ingredient>> getIngredients(HttpServletRequest request) {
        UserInfo currentUser = AuthenticationUtil.getCurrentUser(request);
        log.debug("📋 User {} requested ingredient list", currentUser.getUsername());
        
        return ResponseEntity.ok(baseIngredients.BASE_INGREDIENTS);
    }

    @PostMapping("/generate")
    public ResponseEntity<String> generateRecipe(
            @RequestBody(required = false) RecipeGenerationRequest request,
            HttpServletRequest httpRequest) {
        
        UserInfo currentUser = AuthenticationUtil.getCurrentUser(httpRequest);
        log.info("🍳 User {} generating recipe", currentUser.getUsername());

        try {
            String ingredients = ingredientService.toString();
            log.info("📝 Ingredients for {}: {}", currentUser.getUsername(), ingredients);

            RecipePreferences preferences = new RecipePreferences();
            if (request != null && request.getPreferences() != null) {
                preferences = request.getPreferences();
                log.info("🎯 Using preferences for {}: {}", currentUser.getUsername(), preferences);
            }

            String recipe = aiService.generateRecipe(ingredients, preferences);
            log.info("✅ Recipe generated successfully for user: {}", currentUser.getUsername());
            
            return ResponseEntity.ok(recipe);

        } catch (Exception e) {
            log.error("❌ Error generating recipe for user {}: {}", currentUser.getUsername(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error generating recipe: " + e.getMessage());
        }
    }

    @PostMapping("/generateWithIngredients")
    public ResponseEntity<String> generateRecipeWithIngredients(
            @RequestBody DirectRecipeRequest request,
            HttpServletRequest httpRequest) {
        
        UserInfo currentUser = AuthenticationUtil.getCurrentUser(httpRequest);
        log.info("🍳 User {} generating recipe with direct ingredients", currentUser.getUsername());

        try {
            if (request.getIngredients() == null || request.getIngredients().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Ingredients are required");
            }

            RecipePreferences preferences = request.getPreferences() != null ?
                    request.getPreferences() : new RecipePreferences();

            log.info("📝 Direct ingredients for {}: {}", currentUser.getUsername(), request.getIngredients());

            String recipe = aiService.generateRecipe(request.getIngredients(), preferences);
            log.info("✅ Recipe generated successfully for user: {}", currentUser.getUsername());

            System.out.println("TRYNA SEND");
            int index_s = recipe.indexOf("SHOPPING LIST:");
            int index_e = recipe.indexOf("SHOPPING LIST END");
            System.out.println(index_s);
            System.out.println(index_e);
            System.out.println(recipe);
            if (index_s >= 0) {
                System.out.println("IN IF");
                String shoppingList = recipe.substring(index_s, index_e);
                recipe = recipe.substring(0, index_s);

                System.out.print("CHECK ");
                System.out.println(currentUser.getEmail());
                if (currentUser.getEmail() != null) {
                    log.info("📧 Sending shopping list to: {}", currentUser.getEmail());
                    System.out.println("LE-FUCKYOU-THREE");
                    emailSenderService.sendEmail(currentUser.getEmail(), shoppingList);
                }
            }

            return ResponseEntity.ok(recipe);

        } catch (Exception e) {
            log.error("❌ Error generating recipe for user {}: {}", currentUser.getUsername(), e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body("Failed to generate recipe: " + e.getMessage());
        }
    }

    @PostMapping("/generateMealPlan")
    public ResponseEntity<String> generateMealPlan(
            @RequestBody MealPlanRequest mealPlanRequest,
            HttpServletRequest httpRequest) {
        
        UserInfo currentUser = AuthenticationUtil.getCurrentUser(httpRequest);
        log.info("📅 User {} generating meal plan", currentUser.getUsername());
        
        String ingredients = ingredientService.toString();
        log.info("📝 Ingredients for meal plan ({}): {}", currentUser.getUsername(), ingredients);
        
//        try {
//            String recipe = aiService.generateMealPlan(
//                mealPlanRequest.getFoodPreferenceString(),
//                mealPlanRequest.getTimeframe(),
//                mealPlanRequest.getPlanPreferenceString(),
//                ingredients
//            );
//
//            log.info("📅 Meal plan generated successfully for user: {}", currentUser.getUsername());
//
//            // Handle shopping list email
//            int index = recipe.indexOf("SHOPPING LIST:");
//            if (index >= 0) {
//                String shoppingList = recipe.substring(index);
//                recipe = recipe.substring(0, index);
//
//                if (!mealPlanRequest.getRecipient().isEmpty()) {
//                    log.info("📧 Sending shopping list to: {}", mealPlanRequest.getRecipient());
//                    emailSenderService.sendEmail(mealPlanRequest.getRecipient(), shoppingList);
//                }
//            }
//
//            return ResponseEntity.ok(recipe);
//
//        } catch (Exception e) {
//            log.error("❌ Error generating meal plan for user {}: {}", currentUser.getUsername(), e.getMessage(), e);
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                    .body("Error generating meal plan: " + e.getMessage());
//        }
        return null;
    }
}