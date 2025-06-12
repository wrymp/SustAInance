package com.example.sustainance.models.entities;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "favorite_recipes")
public class FavoriteRecipe {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "recipe_name", nullable = false)
    private String recipeName;

    @Column(name = "recipe_desc", columnDefinition = "TEXT")
    private String recipeDesc;

    @Column(name = "recipe_text", columnDefinition = "TEXT", nullable = false)
    private String recipeText;

    @Column(name = "tags")
    private String tags; // Comma-separated string: "italian,pasta,quick"

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "rating")
    private Float rating; // Between 0.0 and 5.0

    // Constructors
    public FavoriteRecipe() {
        this.createdAt = LocalDateTime.now();
    }

    public FavoriteRecipe(UUID userId, String recipeName, String recipeDesc,
                          String recipeText, String tags, Float rating) {
        this.userId = userId;
        this.recipeName = recipeName;
        this.recipeDesc = recipeDesc;
        this.recipeText = recipeText;
        this.tags = tags;
        this.rating = rating;
        this.createdAt = LocalDateTime.now();
    }
}