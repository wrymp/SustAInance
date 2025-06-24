package com.example.sustainance.models.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

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
    private String tagsString;

    @Column(name = "prep_time")
    private String prepTime;

    @Column(name = "difficulty")
    private String difficulty;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public FavoriteRecipe() {
    }

    public FavoriteRecipe(UUID userId, String recipeName, String recipeDesc,
                          String recipeText, String tags, String prepTime, String difficulty) {
        this.userId = userId;
        this.recipeName = recipeName;
        this.recipeDesc = recipeDesc;
        this.recipeText = recipeText;
        this.tagsString = tags;
        this.createdAt = LocalDateTime.now();
        this.prepTime = prepTime;
        this.difficulty = difficulty;
    }

    public List<String> getTags() {
        if (tagsString == null || tagsString.trim().isEmpty()) {
            return new ArrayList<>();
        }
        return Arrays.stream(tagsString.split(","))
                .map(String::trim)
                .filter(tag -> !tag.isEmpty())
                .collect(Collectors.toList());
    }

    public boolean hasTag(String tag) {
        if (tag == null || tag.trim().isEmpty()) {
            return false;
        }
        return getTags().contains(tag.trim());
    }
}