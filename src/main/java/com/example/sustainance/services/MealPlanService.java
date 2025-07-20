package com.example.sustainance.services;

import com.example.sustainance.models.entities.MealPlan;
import com.example.sustainance.models.repositories.MealPlanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class MealPlanService {

    private MealPlanRepository mealPlanRepository;

    public MealPlanService(MealPlanRepository mealPlanRepository) {
        this.mealPlanRepository = mealPlanRepository;
    }

    public MealPlan createMealPlan(MealPlan mealPlan) {
        try {
            return mealPlanRepository.save(mealPlan);
        } catch (Exception e) {
            throw new RuntimeException("Failed to save meal plan: " + e.getMessage(), e);
        }
    }

    public List<MealPlan> getMealPlansByUserId(UUID userId) {
        return mealPlanRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Optional<MealPlan> getMealPlanById(Long id) {
        return mealPlanRepository.findById(id);
    }

    public MealPlan updateMealPlan(Long id, MealPlan updatedMealPlan) {
        Optional<MealPlan> existingMealPlan = mealPlanRepository.findById(id);

        if (existingMealPlan.isPresent()) {
            MealPlan mealPlan = existingMealPlan.get();
            mealPlan.setUserId(updatedMealPlan.getUserId());
            mealPlan.setStartDate(updatedMealPlan.getStartDate());
            mealPlan.setDuration(updatedMealPlan.getDuration());
            mealPlan.setMealsPerDay(updatedMealPlan.getMealsPerDay());
            mealPlan.setPreferences(updatedMealPlan.getPreferences());
            mealPlan.setMealsData(updatedMealPlan.getMealsData());

            return mealPlanRepository.save(mealPlan);
        } else {
            throw new RuntimeException("Meal plan not found with id: " + id);
        }
    }

    public void deleteMealPlan(Long id) {
        if (mealPlanRepository.existsById(id)) {
            mealPlanRepository.deleteById(id);
        } else {
            throw new RuntimeException("Meal plan not found with id: " + id);
        }
    }

    public void deleteMealPlanByUserAndId(UUID userId, Long id) {
        if (mealPlanRepository.existsByUserIdAndId(userId, id)) {
            mealPlanRepository.deleteByUserIdAndId(userId, id);
        } else {
            throw new RuntimeException("Meal plan not found for user: " + userId + " with id: " + id);
        }
    }
}