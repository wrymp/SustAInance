package com.example.sustainance.services;

import com.example.sustainance.models.DTO.SaveRecipeRequest;
import com.example.sustainance.models.DTO.UpdateRecipeRequest;
import com.example.sustainance.models.entities.FavoriteRecipe;
import com.example.sustainance.models.repositories.FavoriteRecipeRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class RecipeSaverService {

    private final FavoriteRecipeRepository favoriteRecipeRepository;

    public RecipeSaverService(FavoriteRecipeRepository favoriteRecipeRepository) {
        this.favoriteRecipeRepository = favoriteRecipeRepository;
    }

    public FavoriteRecipe saveRecipe(SaveRecipeRequest request) {
        FavoriteRecipe recipe = new FavoriteRecipe(
                request.getUserId(),
                request.getRecipeName(),
                request.getRecipeDesc(),
                request.getRecipeText(),
                request.getTags(),
                request.getRating()
        );
        return favoriteRecipeRepository.save(recipe);
    }

    public Optional<FavoriteRecipe> updateRecipe(UpdateRecipeRequest request) {
        Optional<FavoriteRecipe> existingRecipe = favoriteRecipeRepository.findById(request.getId());

        if (existingRecipe.isPresent()) {
            FavoriteRecipe recipe = existingRecipe.get();

            if (request.getRecipeName() != null) {
                recipe.setRecipeName(request.getRecipeName());
            }
            if (request.getRecipeDesc() != null) {
                recipe.setRecipeDesc(request.getRecipeDesc());
            }
            if (request.getRecipeText() != null) {
                recipe.setRecipeText(request.getRecipeText());
            }
            if (request.getTags() != null) {
                recipe.setTags(request.getTags());
            }
            if (request.getRating() != null) {
                recipe.setRating(request.getRating());
            }

            return Optional.of(favoriteRecipeRepository.save(recipe));
        }
        return Optional.empty();
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
        return favoriteRecipeRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<FavoriteRecipe> getUserRecipesSortedByRating(UUID userId) {
        return favoriteRecipeRepository.findByUserIdOrderByRatingDesc(userId);
    }

    public Optional<FavoriteRecipe> getRecipeById(UUID id) {
        return favoriteRecipeRepository.findById(id);
    }

    public List<FavoriteRecipe> searchRecipesByName(UUID userId, String name) {
        return favoriteRecipeRepository.findByUserIdAndRecipeNameContainingIgnoreCase(userId, name);
    }

    public List<FavoriteRecipe> getRecipesByTag(UUID userId, String tag) {
        return favoriteRecipeRepository.findByUserIdAndTagsContainingIgnoreCase(userId, tag);
    }

    public List<FavoriteRecipe> getRecipesByMinRating(UUID userId, Float minRating) {
        return favoriteRecipeRepository.findByUserIdAndRatingGreaterThanEqual(userId, minRating);
    }

    public List<FavoriteRecipe> getRecipesWithFilters(UUID userId, String name, String tag, Float minRating) {
        return favoriteRecipeRepository.findByUserIdWithFilters(userId, name, tag, minRating);
    }
}