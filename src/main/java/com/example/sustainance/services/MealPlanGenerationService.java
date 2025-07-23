package com.example.sustainance.services;

import com.example.sustainance.models.DTO.GeneratedMealDTO;
import com.example.sustainance.models.DTO.MealPlanGenerationRequest;
import com.example.sustainance.models.DTO.MealPlanGenerationResponse;
import com.example.sustainance.models.entities.MealPlan;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class MealPlanGenerationService {

    private final AIService aiService;
    private final MealPlanService mealPlanService;
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

            saveMealPlan(request, response.getMeals(), userId);

            log.info("✅ Generated {} meals successfully", response.getTotalMeals());
            return response;

        } catch (Exception e) {
            log.error("❌ Failed to generate meal plan: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate meal plan", e);
        }
    }


    private void saveMealPlan(MealPlanGenerationRequest request, List<GeneratedMealDTO> meals, UUID userId) {
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

            mealPlanService.createMealPlan(mealPlan);
            log.info("✅ Saved meal plan to database");

        } catch (Exception e) {
            log.error("Failed to save meal plan: {}", e.getMessage());
        }
    }
}