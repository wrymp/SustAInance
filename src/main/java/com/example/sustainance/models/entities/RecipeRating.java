package com.example.sustainance.models.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "recipe_ratings")
public class RecipeRating {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "recipe_id")
    private UUID recipeId;

    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "rating", nullable = false)
    private Integer rating;

    // Constructors
    public RecipeRating() {}

    public RecipeRating(UUID recipeId, UUID userId, Integer rating) {
        this.recipeId = recipeId;
        this.userId = userId;
        this.rating = rating;
    }
}
