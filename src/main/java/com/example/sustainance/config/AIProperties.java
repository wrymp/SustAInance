package com.example.sustainance.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "ai")
public class AIProperties {

    private Github github = new Github();
    private Openai openai = new Openai();
    private Prompts prompts = new Prompts();

    @Data
    public static class Github {
        private String key;
        private String url;
        private String model;
    }

    @Data
    public static class Openai {
        private int maxTokens = 1500;
        private double temperature = 0.7;
        private int timeout = 30000;
    }

    @Data
    public static class Prompts {
        private Recipe recipe = new Recipe();
        private MealPlan mealPlan = new MealPlan();

        @Data
        public static class Recipe {
            private String systemMessage;
        }

        @Data
        public static class MealPlan {
            private String systemMessage;
        }
    }
}