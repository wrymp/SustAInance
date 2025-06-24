package com.example.sustainance.models.repositories;

import com.example.sustainance.models.entities.RecipeRating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface RecipeRatingRepository extends JpaRepository<RecipeRating, UUID> {

    Optional<RecipeRating> findByRecipeIdAndUserId(UUID recipeId, UUID userId);

    @Query("SELECT COALESCE(AVG(CAST(r.rating AS double)), 0.0) FROM RecipeRating r WHERE r.recipeId = :recipeId")
    Double getAverageRatingByRecipeId(@Param("recipeId") UUID recipeId);

    @Modifying
    @Transactional
    @Query("UPDATE RecipeRating r SET r.rating = :rating WHERE r.userId = :userId AND r.recipeId = :recipeId")
    int updateRatingByUserIdAndRecipeId(@Param("userId") UUID userId, @Param("recipeId") UUID recipeId, @Param("rating") Integer rating);

    @Modifying
    @Transactional
    int deleteByUserIdAndRecipeId(UUID userId, UUID recipeId);
}