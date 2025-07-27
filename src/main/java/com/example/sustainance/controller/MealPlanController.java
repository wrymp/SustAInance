package com.example.sustainance.controller;

import com.example.sustainance.config.authConfig.AuthenticationUtil;
import com.example.sustainance.config.authConfig.RequireAuthentication;
import com.example.sustainance.models.DTO.MealDto;
import com.example.sustainance.models.DTO.MealPlanGenerationRequest;
import com.example.sustainance.models.DTO.MealPlanGenerationResponse;
import com.example.sustainance.models.DTO.MealPlanProgressDTO;
import com.example.sustainance.models.entities.FavoriteRecipe;
import com.example.sustainance.models.entities.MealPlan;
import com.example.sustainance.models.entities.UserInfo;
import com.example.sustainance.services.EmailSenderService;
import com.example.sustainance.services.MealPlanGenerationService;
import com.example.sustainance.services.MealPlanService;
import com.example.sustainance.services.RecipeService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/meal-plans")
@RequireAuthentication
public class MealPlanController {

    @Autowired
    private MealPlanService mealPlanService;

    @Autowired
    private RecipeService recipeService;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private MealPlanGenerationService mealPlanGenerationService;

    @Autowired
    private EmailSenderService emailSenderService;

    @PostMapping
    public ResponseEntity<?> createMealPlan(@RequestBody MealPlan mealPlan) {
        try {
            MealPlan savedMealPlan = mealPlanService.createMealPlan(mealPlan);
            return ResponseEntity.ok(savedMealPlan);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to create meal plan: " + e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getMealPlansByUserId(@PathVariable UUID userId) {
        try {
            List<MealPlan> mealPlans = mealPlanService.getMealPlansByUserId(userId);
            return ResponseEntity.ok(mealPlans);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to fetch meal plans: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getMealPlanById(@PathVariable Long id) {
        try {
            return mealPlanService.getMealPlanById(id)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to fetch meal plan: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateMealPlan(@PathVariable Long id, @RequestBody MealPlan updatedMealPlan) {
        try {
            MealPlan updated = mealPlanService.updateMealPlan(id, updatedMealPlan);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Meal plan not found: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to update meal plan: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMealPlan(@PathVariable Long id) {
        try {
            mealPlanService.deleteMealPlan(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Meal plan not found: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to delete meal plan: " + e.getMessage());
        }
    }

    @DeleteMapping("/user/{userId}/{id}")
    public ResponseEntity<?> deleteMealPlanByUserAndId(@PathVariable UUID userId, @PathVariable long id) {
        try {
            Optional<MealPlan> mealPlanOpt = mealPlanService.getMealPlansByUserIdAndId(userId, id);
            if (mealPlanOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Meal plan not found");
            }

            MealPlan mealPlan = mealPlanOpt.get();

            if (mealPlan.getMealsData() != null && !mealPlan.getMealsData().trim().isEmpty()) {
                deleteAssociatedRecipes(mealPlan.getMealsData(), userId);
            }

            mealPlanService.deleteMealPlanByUserAndId(userId, id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to delete meal plan: " + e.getMessage());
        }
    }

    @PostMapping("/generate")
    public ResponseEntity<MealPlanGenerationResponse> generateMealPlan(
            @RequestBody MealPlanGenerationRequest mealRequest,
            HttpServletRequest request) {
        try {
            UserInfo currentUser = AuthenticationUtil.getCurrentUser(request);
            MealPlanGenerationResponse response = mealPlanGenerationService.generateBasicMealPlan(
                    mealRequest, currentUser.getUuid());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/{mealPlanId}/meals/{day}/{mealType}/generate-recipe")
    public ResponseEntity<Map<String, Object>> generateRecipeForMeal(
            @PathVariable long mealPlanId,
            @PathVariable int day,
            @PathVariable String mealType,
            HttpServletRequest request) {

        try {
            UserInfo currentUser = AuthenticationUtil.getCurrentUser(request);

            FavoriteRecipe savedRecipe = mealPlanGenerationService.generateAndSaveRecipeForMeal(
                    mealPlanId, day, mealType, currentUser.getUuid()
            );

            try {
                checkAndSendDailyShoppingList(mealPlanId, day, currentUser);
            } catch (Exception emailError) {

            }

            Map<String, Object> response = new HashMap<>();
            response.put("recipeId", savedRecipe.getId());
            response.put("status", "completed");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            error.put("status", "failed");
            return ResponseEntity.status(500).body(error);
        }
    }

    @GetMapping("/{mealPlanId}/progress")
    public ResponseEntity<MealPlanProgressDTO> getMealPlanProgress(
            @PathVariable long mealPlanId,
            HttpServletRequest request) {

        try {
            UserInfo currentUser = AuthenticationUtil.getCurrentUser(request);
            MealPlanProgressDTO progress = mealPlanGenerationService.getMealPlanProgress(
                    mealPlanId, currentUser.getUuid());
            return ResponseEntity.ok(progress);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    private void deleteAssociatedRecipes(String mealsDataJson, UUID userId) {
        try {
            MealDto[] meals = objectMapper.readValue(mealsDataJson, MealDto[].class);

            for (MealDto meal : meals) {
                if (meal.getRecipeId() != null && !meal.getRecipeId().trim().isEmpty()) {
                    try {
                        UUID recipeId = UUID.fromString(meal.getRecipeId());
                        recipeService.deleteRecipe(recipeId, userId);
                    } catch (IllegalArgumentException e) {

                    }
                }
            }
        } catch (Exception e) {

        }
    }

    private void checkAndSendDailyShoppingList(long mealPlanId, int day, UserInfo user) {
        try {
            Optional<MealPlan> mealPlanOpt = mealPlanService.getMealPlanById(mealPlanId);
            if (mealPlanOpt.isEmpty()) {
                return;
            }

            MealPlan mealPlan = mealPlanOpt.get();
            List<MealDto> dayMeals = getMealsForDay(mealPlan, day);
            List<FavoriteRecipe> dayRecipes = getGeneratedRecipesForDay(mealPlanId, day, user.getUuid());

            if (dayRecipes.size() == dayMeals.size() && !dayRecipes.isEmpty()) {
                sendDailyShoppingListEmail(mealPlan, day, dayRecipes, user);
            }

        } catch (Exception e) {
            throw e;
        }
    }

    private List<MealDto> getMealsForDay(MealPlan mealPlan, int day) {
        try {
            if (mealPlan.getMealsData() == null || mealPlan.getMealsData().trim().isEmpty()) {
                return new ArrayList<>();
            }

            MealDto[] allMeals = objectMapper.readValue(mealPlan.getMealsData(), MealDto[].class);
            return Arrays.stream(allMeals)
                    .filter(meal -> meal.getDay() == day)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    private List<FavoriteRecipe> getGeneratedRecipesForDay(long mealPlanId, int day, UUID userId) {
        try {
            Optional<MealPlan> mealPlanOpt = mealPlanService.getMealPlanById(mealPlanId);
            if (mealPlanOpt.isEmpty()) {
                return new ArrayList<>();
            }

            MealPlan mealPlan = mealPlanOpt.get();
            List<MealDto> dayMeals = getMealsForDay(mealPlan, day);
            List<FavoriteRecipe> dayRecipes = new ArrayList<>();

            for (MealDto meal : dayMeals) {
                if (meal.getRecipeId() != null && !meal.getRecipeId().trim().isEmpty()) {
                    try {
                        UUID recipeId = UUID.fromString(meal.getRecipeId());
                        FavoriteRecipe recipe = recipeService.getRecipeById(recipeId);
                        dayRecipes.add(recipe);
                    } catch (IllegalArgumentException e) {

                    }
                }
            }

            return dayRecipes;
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    private void sendDailyShoppingListEmail(MealPlan mealPlan, int day, List<FavoriteRecipe> dayRecipes, UserInfo user) {
        try {
            if (dayRecipes.isEmpty()) {
                return;
            }

            String emailContent = createDailyShoppingListEmailContent(mealPlan, day, dayRecipes);
            String dayName = getDayName(mealPlan.getStartDate(), day);
            String subject = "🛒 Shopping List for " + dayName + " (Day " + day + ")";

            emailSenderService.sendEmail(user.getEmail(), emailContent);

        } catch (Exception e) {
            throw e;
        }
    }

    private String createDailyShoppingListEmailContent(MealPlan mealPlan, int day, List<FavoriteRecipe> dayRecipes) {
        StringBuilder emailContent = new StringBuilder();

        String dayName = getDayName(mealPlan.getStartDate(), day);
        String formattedDate = getFormattedDate(mealPlan.getStartDate(), day);

        emailContent.append("🛒 Shopping List for ").append(dayName).append(" (Day ").append(day).append(")\n\n");
        emailContent.append("📅 Date: ").append(formattedDate).append("\n\n");

        List<String> mealOrder = Arrays.asList("Breakfast", "Lunch", "Dinner");
        dayRecipes.sort((r1, r2) -> {
            String mealType1 = extractMealTypeFromRecipeName(r1.getRecipeName());
            String mealType2 = extractMealTypeFromRecipeName(r2.getRecipeName());
            return Integer.compare(mealOrder.indexOf(mealType1), mealOrder.indexOf(mealType2));
        });

        for (int i = 0; i < dayRecipes.size(); i++) {
            FavoriteRecipe recipe = dayRecipes.get(i);
            String mealType = extractMealTypeFromRecipeName(recipe.getRecipeName());
            String mealIcon = getMealIcon(mealType);

            emailContent.append(mealIcon).append(" ").append(recipe.getRecipeName()).append("\n");
            emailContent.append("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

            String ingredients = extractIngredients(recipe.getRecipeText());
            if (ingredients != null && !ingredients.trim().isEmpty()) {
                emailContent.append(ingredients);
            } else {
                emailContent.append("• No ingredients list available for this recipe\n");
            }

            if (i < dayRecipes.size() - 1) {
                emailContent.append("\n\n");
            }
        }

        emailContent.append("\n\n💡 Pro Tips:\n");
        emailContent.append("• Check your pantry first to avoid buying duplicates\n");
        emailContent.append("• Group similar ingredients together for easier shopping\n");
        emailContent.append("• Consider buying in bulk for frequently used items\n\n");

        emailContent.append("Happy cooking! 👨‍🍳\n\n");
        emailContent.append("Best regards,\n");
        emailContent.append("Your Sustainance Team 🌱");

        return emailContent.toString();
    }

    private String extractMealTypeFromRecipeName(String recipeName) {
        if (recipeName.toLowerCase().contains("breakfast")) return "Breakfast";
        if (recipeName.toLowerCase().contains("lunch")) return "Lunch";
        if (recipeName.toLowerCase().contains("dinner")) return "Dinner";
        return "Unknown";
    }

    private String getMealIcon(String mealType) {
        switch (mealType.toLowerCase()) {
            case "breakfast": return "🌅";
            case "lunch": return "☀️";
            case "dinner": return "🌙";
            default: return "🍽️";
        }
    }

    private String getDayName(LocalDate startDate, int dayNumber) {
        if (startDate == null) {
            return "Day " + dayNumber;
        }

        LocalDate targetDate = startDate.plusDays(dayNumber - 1);
        String dayName = targetDate.getDayOfWeek().toString();
        return dayName.charAt(0) + dayName.substring(1).toLowerCase();
    }

    private String getFormattedDate(LocalDate startDate, int dayNumber) {
        if (startDate == null) {
            return "Unknown Date";
        }

        LocalDate targetDate = startDate.plusDays(dayNumber - 1);
        return targetDate.format(DateTimeFormatter.ofPattern("MMMM dd, yyyy"));
    }

    private String extractIngredients(String recipeContent) {
        if (recipeContent == null || recipeContent.isEmpty()) {
            return null;
        }

        int startIndex = recipeContent.indexOf("USED_INGREDIENTS_START");
        int endIndex = recipeContent.indexOf("USED_INGREDIENTS_END");

        if (startIndex == -1 || endIndex == -1 || startIndex >= endIndex) {
            return null;
        }

        String ingredientsSection = recipeContent.substring(
                startIndex + "USED_INGREDIENTS_START".length(),
                endIndex
        ).trim();

        return ingredientsSection;
    }
}