package com.example.sustainance.controller;

import com.example.sustainance.config.authConfig.RequireAuthentication;
import com.example.sustainance.models.DTO.RateRecipeRequest;
import com.example.sustainance.services.RecipeRatingService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.UUID;

@RestController
@RequireAuthentication
@RequestMapping("/api/ratings")
public class RecipeRatingController {

    @Autowired
    private RecipeRatingService ratingService;

    @GetMapping("/user")
    public ResponseEntity<Integer> getUserRating(@RequestParam UUID recipeId, @RequestParam UUID userId, HttpServletRequest httpRequest) {
        try {
            UUID authenticatedUserId = (UUID) httpRequest.getAttribute("authenticatedUserId");
            if (!authenticatedUserId.equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            Integer rating = ratingService.getUserRating(recipeId, userId);
            return ResponseEntity.ok(rating);
        } catch (Exception e) {
            System.err.println("Error in getUserRating: " + e.getMessage());
            return ResponseEntity.ok(0);
        }
    }

    @PostMapping("/add")
    public ResponseEntity<String> addOrUpdateRating(@Valid @RequestBody RateRecipeRequest request, HttpServletRequest httpRequest) {
        try {
            UUID authenticatedUserId = (UUID) httpRequest.getAttribute("authenticatedUserId");
            if (!authenticatedUserId.equals(request.getUserId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            ratingService.addOrUpdateRating(request.getRecipeId(), request.getUserId(), request.getRating());
            return ResponseEntity.ok("Rating saved successfully");
        } catch (Exception e) {
            System.err.println("Error in addOrUpdateRating: " + e.getMessage());
            return ResponseEntity.status(500).body("Error saving rating: " + e.getMessage());
        }
    }

    @DeleteMapping("/delete")
    public ResponseEntity<String> deleteRating(@RequestParam UUID recipeId, @RequestParam UUID userId, HttpServletRequest httpRequest) {
        try {
            UUID authenticatedUserId = (UUID) httpRequest.getAttribute("authenticatedUserId");
            if (!authenticatedUserId.equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            boolean deleted = ratingService.deleteRating(recipeId, userId);
            if (deleted) {
                return ResponseEntity.ok("Rating deleted successfully");
            } else {
                return ResponseEntity.ok("No rating found to delete");
            }
        } catch (Exception e) {
            System.err.println("Error in deleteRating: " + e.getMessage());
            return ResponseEntity.status(500).body("Error deleting rating: " + e.getMessage());
        }
    }

    @GetMapping("/average/{recipeId}")
    public ResponseEntity<Double> getAverageRating(@PathVariable UUID recipeId) {
        try {
            Double average = ratingService.getAverageRating(recipeId);
            return ResponseEntity.ok(average);
        } catch (Exception e) {
            System.err.println("Error in getAverageRating: " + e.getMessage());
            return ResponseEntity.ok(0.0);
        }
    }
}