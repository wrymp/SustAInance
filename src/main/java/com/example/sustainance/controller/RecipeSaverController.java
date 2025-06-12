package com.example.sustainance.controller;

import com.example.sustainance.models.DTO.SaveRecipeRequest;
import com.example.sustainance.models.DTO.UpdateRecipeRequest;
import com.example.sustainance.models.entities.FavoriteRecipe;
import com.example.sustainance.services.RecipeSaverService;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Controller
@RequestMapping("/api/recipeSaver")
public class RecipeSaverController {

    private final RecipeSaverService recipeSaverService;

    public RecipeSaverController(RecipeSaverService recipeSaverService) {
        this.recipeSaverService = recipeSaverService;
    }

    @PostMapping("/save")
    public ResponseEntity<FavoriteRecipe> saveRecipe(@Valid @RequestBody SaveRecipeRequest request) {
        try {
            FavoriteRecipe result = recipeSaverService.saveRecipe(request);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/update")
    public ResponseEntity<FavoriteRecipe> updateRecipe(@Valid @RequestBody UpdateRecipeRequest request) {
        try {
            Optional<FavoriteRecipe> result = recipeSaverService.updateRecipe(request);
            return result.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteRecipe(@PathVariable UUID id, @RequestParam UUID userId) {
        try {
            boolean deleted = recipeSaverService.deleteRecipe(id, userId);
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
            List<FavoriteRecipe> recipes = recipeSaverService.getUserRecipes(userId);
            return ResponseEntity.ok(recipes);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/user/{userId}/by-rating")
    public ResponseEntity<List<FavoriteRecipe>> getUserRecipesByRating(@PathVariable UUID userId) {
        try {
            List<FavoriteRecipe> recipes = recipeSaverService.getUserRecipesSortedByRating(userId);
            return ResponseEntity.ok(recipes);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<FavoriteRecipe> getRecipeById(@PathVariable UUID id) {
        try {
            Optional<FavoriteRecipe> recipe = recipeSaverService.getRecipeById(id);
            return recipe.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/user/{userId}/search")
    public ResponseEntity<List<FavoriteRecipe>> searchRecipes(
            @PathVariable UUID userId,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String tag,
            @RequestParam(required = false) Float minRating) {
        try {
            List<FavoriteRecipe> recipes = recipeSaverService.getRecipesWithFilters(userId, name, tag, minRating);
            return ResponseEntity.ok(recipes);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
}
