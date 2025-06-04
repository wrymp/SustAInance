package com.example.sustainance.services;

import com.azure.ai.openai.OpenAIClient;
import com.azure.ai.openai.OpenAIClientBuilder;
import com.azure.ai.openai.models.*;
import com.azure.core.credential.AzureKeyCredential;
import com.example.sustainance.config.AIConfig;
import com.example.sustainance.config.AIProperties;
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

    public AIService(AIConfig config, PromptService promptService, AIProperties aiProperties) {
        this.client = new OpenAIClientBuilder()
                .credential(new AzureKeyCredential(config.getKey()))
                .endpoint(config.getUrl())
                .buildClient();
        this.model = config.getModel();
        this.promptService = promptService;
        this.aiProperties = aiProperties;
        log.info("AI Service initialized with endpoint: {}", config.getUrl());
    }

    @Cacheable(value = "recipes", key = "#ingredients")
    public String generateRecipe(String ingredients) {
        log.info("🔥 CACHE MISS - Calling OpenAI API for ingredients: {}", ingredients);
        log.info("⏱️ Starting API call at: {}", System.currentTimeMillis());

        try {
            String systemMessage = promptService.getRecipeSystemMessage();
            String userPrompt = promptService.buildRecipePrompt(ingredients);

            ChatCompletionsOptions options = new ChatCompletionsOptions(
                    Arrays.asList(
                            new ChatMessage(ChatRole.SYSTEM).setContent(systemMessage),
                            new ChatMessage(ChatRole.USER).setContent(userPrompt)
                    )
            );

            // Set AI parameters for better results
            options.setModel(model);
            options.setMaxTokens(aiProperties.getOpenai().getMaxTokens());
            options.setTemperature(aiProperties.getOpenai().getTemperature());
            options.setTopP(0.9);
            options.setFrequencyPenalty(0.1);
            options.setPresencePenalty(0.1);

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

    @Cacheable(value = "mealPlans", key = "#foodPreferences + '_' + #timeframe + '_' + #planPreference")
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
            options.setTopP(0.9);
            options.setFrequencyPenalty(0.2);
            options.setPresencePenalty(0.1);

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

        String cleanedRecipe = rawRecipe
                .replaceAll("(?m)^\\s*$[\n\r]{1,}", "\n")
                .replaceAll("===", "")
                .trim();

        String[] sections = cleanedRecipe.split("(?====|Ingredients:|Instructions:|Cooking Time:|Note:)");
        StringBuilder formatted = new StringBuilder();

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