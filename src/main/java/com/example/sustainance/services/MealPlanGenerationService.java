package com.example.sustainance.services;

import com.example.sustainance.models.DTO.*;
import com.example.sustainance.models.entities.FavoriteRecipe;
import com.example.sustainance.models.entities.MealPlan;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@Slf4j
@RequiredArgsConstructor
public class MealPlanGenerationService {

    private final AIService aiService;
    private final MealPlanService mealPlanService;
    private final RecipeService recipeService;
    private final ObjectMapper objectMapper;

    public MealPlanGenerationResponse generateBasicMealPlan(MealPlanGenerationRequest request, UUID userId) {
        log.info("🚀 Starting meal plan generation for {} days", request.getDuration());

        try {
            String aiResponse = aiService.generateMealPlanStructure(
                    request.getDuration(),
                    request.getMealsPerDay(),
                    request.getPreferences()
            );

            log.info("ai generated {}",aiResponse);

            MealPlanGenerationResponse response = objectMapper.readValue(
                    aiResponse,
                    MealPlanGenerationResponse.class
            );


            MealPlan savedMealPlan = saveMealPlan(request, response.getMeals(), userId);

            response.setMealPlanId(savedMealPlan.getId());

            log.info("✅ Generated {} meals successfully", response.getTotalMeals());
            return response;

        } catch (Exception e) {
            log.error("❌ Failed to generate meal plan: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate meal plan", e);
        }
    }


    private MealPlan saveMealPlan(MealPlanGenerationRequest request, List<GeneratedMealDTO> meals, UUID userId) {
        try {
            String mealsJson = objectMapper.writeValueAsString(meals);
            String preferencesJson = objectMapper.writeValueAsString(request.getPreferences());

            MealPlan mealPlan = new MealPlan(
                    userId,
                    request.getStartDate(),
                    request.getDuration(),
                    request.getMealsPerDay(),
                    preferencesJson,
                    mealsJson
            );

            MealPlan savedMealPlan = mealPlanService.createMealPlan(mealPlan);
            log.info("✅ Saved meal plan to database with ID: {}", savedMealPlan.getId());

            return savedMealPlan;
        } catch (Exception e) {
            log.error("Failed to save meal plan: {}", e.getMessage());
            throw new RuntimeException("Failed to save meal plan", e);
        }
    }

    public FavoriteRecipe generateAndSaveRecipeForMeal(long mealPlanId, int day, String mealType, UUID userId) {
        log.info("🚀 Generating recipe for meal plan {} - Day {} {}", mealPlanId, day, mealType);


        Optional<MealPlan> mealPlanOpt = mealPlanService.getMealPlanById(mealPlanId);
        if (mealPlanOpt.isEmpty()) {
            throw new RuntimeException("Meal plan not found");
        }

        MealPlan mealPlan = mealPlanOpt.get();


        if (!mealPlan.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to meal plan");
        }

        try {

            List<GeneratedMealDTO> meals = objectMapper.readValue(
                    mealPlan.getMealsData(),
                    objectMapper.getTypeFactory().constructCollectionType(List.class, GeneratedMealDTO.class)
            );


            GeneratedMealDTO targetMeal = meals.stream()
                    .filter(m -> m.getDay() == day && m.getMealType().equalsIgnoreCase(mealType))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Meal not found for day " + day + " " + mealType));


            if (targetMeal.getRecipeId() != null && !targetMeal.getRecipeId().isEmpty()) {
                log.info("Recipe already exists for this meal: {}", targetMeal.getRecipeId());
                return recipeService.getRecipeById(UUID.fromString(targetMeal.getRecipeId()));
            }


            List<String> preferences = objectMapper.readValue(
                    mealPlan.getPreferences(),
                    objectMapper.getTypeFactory().constructCollectionType(List.class, String.class)
            );


            String detailedRecipe = aiService.generateDetailedRecipeFromMeal(
                    targetMeal.getTitle(),
                    targetMeal.getContent(),
                    targetMeal.getMealType(),
                    preferences
            );


            RecipeMetadata metadata = parseRecipeMetadata(detailedRecipe);


            SaveRecipeRequest saveRequest = new SaveRecipeRequest();
            saveRequest.setUserId(userId);
            saveRequest.setRecipeName(targetMeal.getTitle());
            saveRequest.setRecipeDesc(targetMeal.getContent());
            saveRequest.setRecipeText(detailedRecipe);
            saveRequest.setTags(String.format("meal-plan,day-%d,%s,%s",
                    day, mealType.toLowerCase(), String.join(",", preferences)));
            saveRequest.setPrepTime(metadata.getPrepTime());
            saveRequest.setDifficulty(metadata.getDifficulty());


            FavoriteRecipe savedRecipe = recipeService.saveRecipe(saveRequest);


            targetMeal.setRecipeId(savedRecipe.getId().toString());


            String updatedMealsJson = objectMapper.writeValueAsString(meals);
            mealPlan.setMealsData(updatedMealsJson);
            mealPlanService.updateMealPlan(mealPlanId, mealPlan);

            log.info("✅ Successfully generated and saved recipe: {}", savedRecipe.getId());

            return savedRecipe;

        } catch (Exception e) {
            log.error("Failed to generate recipe for meal: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate recipe: " + e.getMessage());
        }
    }


    private RecipeMetadata parseRecipeMetadata(String recipeText) {
        RecipeMetadata metadata = new RecipeMetadata();


        Pattern prepTimePattern = Pattern.compile("Prep Time:\\s*([\\d]+\\s*(?:minutes?|mins?|hours?))", Pattern.CASE_INSENSITIVE);
        Matcher prepTimeMatcher = prepTimePattern.matcher(recipeText);
        if (prepTimeMatcher.find()) {
            metadata.setPrepTime(prepTimeMatcher.group(1));
        } else {
            metadata.setPrepTime("30 minutes");
        }


        Pattern difficultyPattern = Pattern.compile("Difficulty:\\s*(Easy|Medium|Hard)", Pattern.CASE_INSENSITIVE);
        Matcher difficultyMatcher = difficultyPattern.matcher(recipeText);
        if (difficultyMatcher.find()) {
            metadata.setDifficulty(difficultyMatcher.group(1));
        } else {
            metadata.setDifficulty("Medium");
        }

        return metadata;
    }


    @Setter
    @Getter
    private static class RecipeMetadata {

        private String prepTime = "30 minutes";
        private String difficulty = "Medium";

    }

    public MealPlanProgressDTO getMealPlanProgress(long mealPlanId, UUID userId) {
        MealPlan mealPlan = mealPlanService.getMealPlanById(mealPlanId)
                .orElseThrow(() -> new RuntimeException("Meal plan not found"));

        if (!mealPlan.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized access");
        }

        try {
            List<GeneratedMealDTO> meals = objectMapper.readValue(
                    mealPlan.getMealsData(),
                    objectMapper.getTypeFactory().constructCollectionType(List.class, GeneratedMealDTO.class)
            );

            int totalRecipes = meals.size();
            int completedRecipes = (int) meals.stream()
                    .filter(m -> m.getRecipeId() != null && !m.getRecipeId().isEmpty())
                    .count();

            MealPlanProgressDTO progress = new MealPlanProgressDTO();
            progress.setTotalRecipes(totalRecipes);
            progress.setCompletedRecipes(completedRecipes);
            progress.setFailedRecipes(0);
            progress.setProgressPercentage((double) completedRecipes / totalRecipes * 100);
            progress.setStatus(completedRecipes == totalRecipes ? "completed" : "generating");

            return progress;

        } catch (Exception e) {
            throw new RuntimeException("Failed to calculate progress: " + e.getMessage());
        }
    }
}