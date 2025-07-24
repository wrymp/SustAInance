package com.example.sustainance.controller;

import com.example.sustainance.models.DTO.SaveRecipeRequest;
import com.example.sustainance.models.entities.FavoriteRecipe;
import com.example.sustainance.services.RecipeService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.sustainance.config.authConfig.RequireAuthentication;

import jakarta.validation.Valid;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/recipeSaver")
@CrossOrigin(origins = "*")
@RequireAuthentication
public class RecipeSaverController {

    private final RecipeService recipeService;

    public RecipeSaverController(RecipeService recipeService) {
        this.recipeService = recipeService;
    }

    @PostMapping("/save")
    public ResponseEntity<FavoriteRecipe> saveRecipe(@Valid @RequestBody SaveRecipeRequest request,  HttpServletRequest httpRequest) {
        try {
            UUID authenticatedUserId = (UUID) httpRequest.getAttribute("authenticatedUserId");
            if (!authenticatedUserId.equals(request.getUserId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            FavoriteRecipe result = recipeService.saveRecipe(request);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteRecipe(@PathVariable UUID id, @RequestParam UUID userId, HttpServletRequest httpRequest) {
        try {
//            UUID authenticatedUserId = (UUID) httpRequest.getAttribute("authenticatedUserId");
//            if (!authenticatedUserId.equals(userId)) {
//                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
//            }

            boolean deleted = recipeService.deleteRecipe(id, userId);
            if (deleted) {
                return ResponseEntity.ok("Recipe deleted successfully");
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error deleting recipe");
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<FavoriteRecipe>> getUserRecipes(@PathVariable UUID userId) {
        try {
            List<FavoriteRecipe> recipes = recipeService.getUserRecipes(userId);
            return ResponseEntity.ok(recipes);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{recipeId}")
    public ResponseEntity<?> getRecipeById(@PathVariable UUID recipeId, HttpServletRequest httpRequest) {
        try {
            UUID authenticatedUserId = (UUID) httpRequest.getAttribute("authenticatedUserId");

            FavoriteRecipe recipe = recipeService.getRecipeById(recipeId);

            if (recipe == null) {
                return ResponseEntity.notFound().build();
            }

            Map<String, Object> response = new HashMap<>();
            response.put("recipe", recipe);
            response.put("isOwner", recipe.getUserId().equals(authenticatedUserId));
            response.put("viewerUserId", authenticatedUserId);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching recipe: " + e.getMessage());
        }
    }
}
