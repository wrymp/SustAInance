package com.example.sustainance.models.repositories;

import com.example.sustainance.models.entities.FavoriteRecipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FavoriteRecipeRepository extends JpaRepository<FavoriteRecipe, UUID> {

    List<FavoriteRecipe> findByUserId(UUID userId);
}
