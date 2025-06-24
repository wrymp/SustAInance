package com.example.sustainance.services;

import com.example.sustainance.models.entities.RecipeRating;
import com.example.sustainance.models.repositories.RecipeRatingRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
public class RecipeRatingService {

    @Autowired
    private RecipeRatingRepository repository;

    public Integer getUserRating(UUID recipeId, UUID userId) {
        try {
            Optional<RecipeRating> rating = repository.findByRecipeIdAndUserId(recipeId, userId);
            return rating.map(RecipeRating::getRating).orElse(0);
        } catch (Exception e) {
            System.err.println("Error getting user rating: " + e.getMessage());
            return 0;
        }
    }

    @Transactional
    public void addOrUpdateRating(UUID recipeId, UUID userId, Integer rating) {
        try {
            Optional<RecipeRating> existingRating = repository.findByRecipeIdAndUserId(recipeId, userId);

            if (existingRating.isPresent()) {
                // Update existing rating
                RecipeRating ratingEntity = existingRating.get();
                ratingEntity.setRating(rating);
                repository.save(ratingEntity);
            } else {
                // Create new rating
                RecipeRating newRating = new RecipeRating(recipeId, userId, rating);
                repository.save(newRating);
            }
        } catch (Exception e) {
            System.err.println("Error adding/updating rating: " + e.getMessage());
            throw e;
        }
    }

    @Transactional
    public boolean deleteRating(UUID recipeId, UUID userId) {
        try {
            int deleted = repository.deleteByUserIdAndRecipeId(userId, recipeId);
            return deleted > 0;
        } catch (Exception e) {
            System.err.println("Error deleting rating: " + e.getMessage());
            return false;
        }
    }

    public Double getAverageRating(UUID recipeId) {
        try {
            Double avg = repository.getAverageRatingByRecipeId(recipeId);
            return avg != null ? avg : 0.0;
        } catch (Exception e) {
            System.err.println("Error getting average rating: " + e.getMessage());
            return 0.0;
        }
    }
}
