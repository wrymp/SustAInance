package com.example.sustainance.controller;

import com.example.sustainance.config.authConfig.RequireAuthentication;
import com.example.sustainance.models.entities.MealPlan;
import com.example.sustainance.services.MealPlanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/meal-plans")
@RequireAuthentication
public class MealPlanController {

    @Autowired
    private MealPlanService mealPlanService;

    @PostMapping
    public ResponseEntity<?> createMealPlan(@RequestBody MealPlan mealPlan) {
        try {
            System.out.println("Creating meal plan for user: " + mealPlan.getUserId());
            System.out.println("Duration: " + mealPlan.getDuration());
            System.out.println("Meals per day: " + mealPlan.getMealsPerDay());
            System.out.println("Preferences: " + mealPlan.getPreferences());
            System.out.println("Meals data length: " + (mealPlan.getMealsData() != null ? mealPlan.getMealsData().length() : 0));

            MealPlan savedMealPlan = mealPlanService.createMealPlan(mealPlan);

            System.out.println("Meal plan saved successfully with ID: " + savedMealPlan.getId());

            return ResponseEntity.ok(savedMealPlan);
        } catch (Exception e) {
            System.err.println("Error creating meal plan: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to create meal plan: " + e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getMealPlansByUserId(@PathVariable UUID userId) {
        try {
            System.out.println("Fetching meal plans for user: " + userId);
            List<MealPlan> mealPlans = mealPlanService.getMealPlansByUserId(userId);
            System.out.println("Found " + mealPlans.size() + " meal plans");
            return ResponseEntity.ok(mealPlans);
        } catch (Exception e) {
            System.err.println("Error fetching meal plans: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to fetch meal plans: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getMealPlanById(@PathVariable Long id) {
        try {
            return mealPlanService.getMealPlanById(id)
                    .map(mealPlan -> ResponseEntity.ok(mealPlan))
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            System.err.println("Error fetching meal plan: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to fetch meal plan: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateMealPlan(@PathVariable Long id, @RequestBody MealPlan updatedMealPlan) {
        try {
            System.out.println("Updating meal plan with ID: " + id);
            MealPlan updated = mealPlanService.updateMealPlan(id, updatedMealPlan);
            System.out.println("Meal plan updated successfully");
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            System.err.println("Error updating meal plan: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Meal plan not found: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("Error updating meal plan: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to update meal plan: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMealPlan(@PathVariable Long id) {
        try {
            System.out.println("Deleting meal plan with ID: " + id);
            mealPlanService.deleteMealPlan(id);
            System.out.println("Meal plan deleted successfully");
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            System.err.println("Error deleting meal plan: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Meal plan not found: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("Error deleting meal plan: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to delete meal plan: " + e.getMessage());
        }
    }

    @DeleteMapping("/user/{userId}/{id}")
    public ResponseEntity<?> deleteMealPlanByUserAndId(@PathVariable UUID userId, @PathVariable UUID id) {
        try {
            System.out.println("Deleting meal plan " + id + " for user: " + userId);
            mealPlanService.deleteMealPlanByUserAndId(userId, id);
            System.out.println("Meal plan deleted successfully");
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            System.err.println("Error deleting meal plan: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Meal plan not found: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("Error deleting meal plan: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to delete meal plan: " + e.getMessage());
        }
    }
}