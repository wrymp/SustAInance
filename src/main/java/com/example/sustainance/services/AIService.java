package com.example.sustainance.services;

import com.azure.ai.openai.OpenAIClient;
import com.azure.ai.openai.OpenAIClientBuilder;
import com.azure.ai.openai.models.*;
import com.azure.core.credential.AzureKeyCredential;
import com.example.sustainance.config.AIProperties;
import com.example.sustainance.models.Preference.RecipePreferences;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@Slf4j
public class AIService {
    private final OpenAIClient client;
    private final String model;
    private final PromptService promptService;
    private final AIProperties aiProperties;

    public AIService(AIProperties aiProperties, PromptService promptService) {

        this.client = new OpenAIClientBuilder()
                .credential(new AzureKeyCredential(aiProperties.getGithub().getKey()))
                .endpoint(aiProperties.getGithub().getUrl())
                .buildClient();
        this.model = aiProperties.getGithub().getModel();
        this.promptService = promptService;
        this.aiProperties = aiProperties;

        log.info("🤖 AI Service initialized:");
        log.info("   Endpoint: {}", aiProperties.getGithub().getUrl());
        log.info("   Model: {}", this.model);
        log.info("   Max Tokens: {}", aiProperties.getOpenai().getMaxTokens());
        log.info("   Temperature: {}", aiProperties.getOpenai().getTemperature());
    }

    @Cacheable(value = "recipes", key = "#ingredients + '_' + #preferences.hashCode()")
    public String generateRecipe(String ingredients, RecipePreferences preferences) {
        log.info("🔥 CACHE MISS - Calling OpenAI API for ingredients: {}", ingredients);
        log.info("🎯 Preferences: {}", preferences);
        log.info("⏱️ Starting API call at: {}", System.currentTimeMillis());

        try {
            String systemMessage = promptService.getRecipeSystemMessage();
            String userPrompt = promptService.buildRecipePrompt(ingredients, preferences);

            ChatCompletionsOptions options = new ChatCompletionsOptions(
                    Arrays.asList(
                            new ChatMessage(ChatRole.SYSTEM).setContent(systemMessage),
                            new ChatMessage(ChatRole.USER).setContent(userPrompt)
                    )
            );

            // Set AI parameters using all properties from AIProperties
            options.setModel(model);
            options.setMaxTokens(aiProperties.getOpenai().getMaxTokens());
            options.setTemperature(aiProperties.getOpenai().getTemperature());
            options.setTopP(aiProperties.getOpenai().getTopP());
            options.setFrequencyPenalty(aiProperties.getOpenai().getFrequencyPenalty());
            options.setPresencePenalty(aiProperties.getOpenai().getPresencePenalty());

            ChatCompletions completions = client.getChatCompletions(model, options);
            String rawRecipe = completions.getChoices().get(0).getMessage().getContent();

            log.info("✅ API call completed at: {}", System.currentTimeMillis());
            log.info("📝 Generated recipe length: {} characters", rawRecipe.length());
            return formatRecipe(rawRecipe);

        } catch (Exception e) {
            log.error("❌ Error generating recipe: {}", e.getMessage());
            throw new RuntimeException("Failed to generate recipe: " + e.getMessage());
        }
    }

    @Cacheable(value = "mealPlans", key = "#foodPreferences + '_' + #timeframe + '_' + #planPreference + '_' + #ingredients.hashCode()")
    public String generateMealPlan(String foodPreferences, String timeframe, String planPreference, String ingredients) {
        log.info("Generating meal plan for duration: {}", timeframe);

        try {
            String systemMessage = promptService.getMealPlanSystemMessage();
            String userPrompt = promptService.buildMealPlanPrompt(foodPreferences, planPreference, timeframe, ingredients);

            ChatCompletionsOptions options = new ChatCompletionsOptions(
                    Arrays.asList(
                            new ChatMessage(ChatRole.SYSTEM).setContent(systemMessage),
                            new ChatMessage(ChatRole.USER).setContent(userPrompt)
                    )
            );

            // Meal plans need more tokens
            options.setModel(model);
            options.setMaxTokens(Math.max(aiProperties.getOpenai().getMaxTokens(), 2000));
            options.setTemperature(aiProperties.getOpenai().getTemperature());
            options.setTopP(aiProperties.getOpenai().getTopP());
            options.setFrequencyPenalty(aiProperties.getOpenai().getFrequencyPenalty());
            options.setPresencePenalty(aiProperties.getOpenai().getPresencePenalty());

            ChatCompletions completions = client.getChatCompletions(model, options);
            String rawMealPlan = completions.getChoices().get(0).getMessage().getContent();

            log.info("Successfully generated meal plan");
            return formatRecipe(rawMealPlan);

        } catch (Exception e) {
            log.error("Error generating meal plan: {}", e.getMessage());
            throw new RuntimeException("Failed to generate meal plan: " + e.getMessage());
        }
    }

    private String formatRecipe(String rawRecipe) {
        if (rawRecipe == null || rawRecipe.isEmpty()) {
            return "No recipe generated. Please try again.";
        }

        // Extract and preserve the title before cleaning
        String title = "";
        String titleMatch = rawRecipe.replaceAll("(?s).*?===\\s*(.+?)\\s*===.*", "$1");
        if (!titleMatch.equals(rawRecipe)) {
            title = "=== " + titleMatch.trim() + " ===\n\n";
        }

        String cleanedRecipe = rawRecipe
                .replaceAll("(?m)^\\s*$[\n\r]{1,}", "\n")
                .replaceAll("===.*?===", "") // Remove the title from the content since we extracted it
                .trim();

        String[] sections = cleanedRecipe.split("(?====|Ingredients:|Instructions:|Cooking Time:|Note:)");
        StringBuilder formatted = new StringBuilder();

        // Add the title back at the beginning
        if (!title.isEmpty()) {
            formatted.append(title);
        }

        for (String section : sections) {
            section = section.trim();
            if (!section.isEmpty()) {
                if (section.startsWith("Instructions:")) {
                    String[] instructions = section.split("\n");
                    Set<String> uniqueInstructions = new LinkedHashSet<>();
                    for (String instruction : instructions) {
                        if (instruction.trim().matches("\\d+\\..*")) {
                            uniqueInstructions.add(instruction.trim());
                        }
                    }
                    formatted.append("Instructions:\n\n");
                    for (String instruction : uniqueInstructions) {
                        formatted.append(instruction).append("\n");
                    }
                } else {
                    formatted.append(section).append("\n\n");
                }
            }
        }

        return formatted.toString().trim();
    }
}