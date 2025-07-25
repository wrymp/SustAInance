package com.example.sustainance.repositories;

import com.example.sustainance.models.entities.FavoriteRecipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FavoriteRecipeRepository extends JpaRepository<FavoriteRecipe, UUID> {

    @Query("SELECT r FROM FavoriteRecipe r WHERE r.userId = :userId AND (r.tagsString IS NULL OR r.tagsString NOT LIKE '%meal-plan%')")
    List<FavoriteRecipe> findSavedRecipesByUserId(@Param("userId") UUID userId);
}
