package com.example.sustainance.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;

@Data
@Component
@ConfigurationProperties(prefix = "ai")
@Validated
public class AIProperties {

    @NotNull
    private Github github = new Github();

    @NotNull
    private Openai openai = new Openai();

    @NotNull
    private Prompts prompts = new Prompts();

    @Data
    @Validated
    public static class Github {
        @NotBlank(message = "GitHub AI key is required")
        private String key;

        @NotBlank(message = "GitHub AI URL is required")
        private String url;

        @NotBlank(message = "GitHub AI model is required")
        private String model;
    }

    @Data
    @Validated
    public static class Openai {
        @Positive(message = "Max tokens must be positive")
        private int maxTokens = 1500;

        @DecimalMin(value = "0.0", message = "Temperature must be between 0.0 and 2.0")
        @DecimalMax(value = "2.0", message = "Temperature must be between 0.0 and 2.0")
        private double temperature = 0.7;

        @Positive(message = "Timeout must be positive")
        private int timeout = 30000;

        private double topP = 0.9;
        private double frequencyPenalty = 0.1;
        private double presencePenalty = 0.1;
        private int retryAttempts = 3;
        private long retryDelayMs = 1000;
    }

    @Data
    @Validated
    public static class Prompts {
        @NotNull
        private Recipe recipe = new Recipe();

        @NotNull
        private MealPlan mealPlan = new MealPlan();

        @Data
        public static class Recipe {
            @NotBlank(message = "Recipe system message is required")
            private String systemMessage = """
                You are a professional chef and recipe creator. Create practical, 
                delicious recipes using only the ingredients provided by the user.
                
                Always follow these principles:
                - Use ONLY the ingredients provided
                - Add only basic seasonings (salt, pepper, common herbs)
                - Provide clear, step-by-step instructions
                - Include realistic cooking times and temperatures
                - Consider user preferences for cuisine and dietary restrictions
                """;
        }

        @Data
        public static class MealPlan {
            @NotBlank(message = "Meal plan system message is required")
            private String systemMessage = """
                You are a nutritionist and meal planning expert. Create balanced, 
                practical meal plans based on user preferences and available ingredients.
                
                Always include:
                - Balanced nutrition across meals
                - Variety in ingredients and cooking methods
                - Realistic prep and cooking times
                - Efficient use of ingredients to minimize waste
                """;
        }
    }
}