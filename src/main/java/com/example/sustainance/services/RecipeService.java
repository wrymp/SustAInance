package com.example.sustainance.services;

import com.example.sustainance.models.DTO.SaveRecipeRequest;
import com.example.sustainance.models.entities.FavoriteRecipe;
import com.example.sustainance.models.repositories.FavoriteRecipeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class RecipeService {

    private final FavoriteRecipeRepository favoriteRecipeRepository;

    public RecipeService(FavoriteRecipeRepository favoriteRecipeRepository) {
        this.favoriteRecipeRepository = favoriteRecipeRepository;
    }

    public FavoriteRecipe saveRecipe(SaveRecipeRequest request) {
        FavoriteRecipe recipe = new FavoriteRecipe(
                request.getUserId(),
                request.getRecipeName(),
                request.getRecipeDesc(),
                request.getRecipeText(),
                request.getTags(),
                request.getPrepTime(),
                request.getDifficulty()
        );
        return favoriteRecipeRepository.save(recipe);
    }

    public boolean deleteRecipe(UUID id, UUID userId) {
        Optional<FavoriteRecipe> recipe = favoriteRecipeRepository.findById(id);
        if (recipe.isPresent() && recipe.get().getUserId().equals(userId)) {
            favoriteRecipeRepository.delete(recipe.get());
            return true;
        }
        return false;
    }

    public List<FavoriteRecipe> getUserRecipes(UUID userId) {
        return favoriteRecipeRepository.findByUserId(userId);
    }
}