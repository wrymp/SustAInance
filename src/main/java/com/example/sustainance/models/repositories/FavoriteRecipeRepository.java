package com.example.sustainance.models.repositories;

import com.example.sustainance.models.entities.FavoriteRecipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FavoriteRecipeRepository extends JpaRepository<FavoriteRecipe, UUID> {

    List<FavoriteRecipe> findByUserId(UUID userId);

    List<FavoriteRecipe> findByUserIdOrderByCreatedAtDesc(UUID userId);

    List<FavoriteRecipe> findByUserIdOrderByRatingDesc(UUID userId);

    @Query("SELECT f FROM FavoriteRecipe f WHERE f.userId = :userId AND f.recipeName ILIKE %:name%")
    List<FavoriteRecipe> findByUserIdAndRecipeNameContainingIgnoreCase(@Param("userId") UUID userId, @Param("name") String name);

    @Query("SELECT f FROM FavoriteRecipe f WHERE f.userId = :userId AND f.tags ILIKE %:tag%")
    List<FavoriteRecipe> findByUserIdAndTagsContainingIgnoreCase(@Param("userId") UUID userId, @Param("tag") String tag);

    @Query("SELECT f FROM FavoriteRecipe f WHERE f.userId = :userId AND f.rating >= :minRating")
    List<FavoriteRecipe> findByUserIdAndRatingGreaterThanEqual(@Param("userId") UUID userId, @Param("minRating") Float minRating);

    @Query("SELECT f FROM FavoriteRecipe f WHERE f.userId = :userId AND " +
            "(COALESCE(:name, '') = '' OR f.recipeName ILIKE %:name%) AND " +
            "(COALESCE(:tag, '') = '' OR f.tags ILIKE %:tag%) AND " +
            "(:minRating IS NULL OR f.rating >= :minRating)")
    List<FavoriteRecipe> findByUserIdWithFilters(@Param("userId") UUID userId,
                                                 @Param("name") String name,
                                                 @Param("tag") String tag,
                                                 @Param("minRating") Float minRating);
}
