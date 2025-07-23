package com.example.sustainance.services;

import com.azure.ai.openai.OpenAIClient;
import com.azure.ai.openai.OpenAIClientBuilder;
import com.azure.ai.openai.models.*;
import com.azure.core.credential.AzureKeyCredential;
import com.example.sustainance.config.AIProperties;
import com.example.sustainance.models.DTO.GeneratedMealDTO;
import com.example.sustainance.models.DTO.MealPlanGenerationResponse;
import com.example.sustainance.models.Preference.RecipePreferences;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@Slf4j
public class AIService {
    private final OpenAIClient client;
    private final String model;
    private final PromptService promptService;
    private final AIProperties aiProperties;
    private final ObjectMapper objectMapper;

    public AIService(AIProperties aiProperties, PromptService promptService) {

        this.client = new OpenAIClientBuilder()
                .credential(new AzureKeyCredential(aiProperties.getGithub().getKey()))
                .endpoint(aiProperties.getGithub().getUrl())
                .buildClient();
        this.model = aiProperties.getGithub().getModel();
        this.promptService = promptService;
        this.aiProperties = aiProperties;
        this.objectMapper = new ObjectMapper();

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
            
            return formatRecipeWithUsedIngredients(rawRecipe);

        } catch (Exception e) {
            log.error("❌ Error generating recipe: {}", e.getMessage());
            throw new RuntimeException("Failed to generate recipe: " + e.getMessage());
        }
    }

    private String formatRecipeWithUsedIngredients(String rawRecipe) {
        if (rawRecipe == null || rawRecipe.isEmpty()) {
            return "No recipe generated. Please try again.";
        }

        String usedIngredientsJson = extractUsedIngredients(rawRecipe);
        
        String cleanedRecipe = rawRecipe.replaceAll("USED_INGREDIENTS_START.*?USED_INGREDIENTS_END\\s*", "");
        
        String formattedRecipe = formatRecipe(cleanedRecipe);
        
        if (!usedIngredientsJson.isEmpty()) {
            formattedRecipe += "\n\nUSED_INGREDIENTS_JSON:" + usedIngredientsJson;
        }
        
        return formattedRecipe;
    }

    private String extractUsedIngredients(String rawRecipe) {
        Pattern pattern = Pattern.compile("USED_INGREDIENTS_START\\s*(.*?)\\s*USED_INGREDIENTS_END", Pattern.DOTALL);
        Matcher matcher = pattern.matcher(rawRecipe);
        
        if (matcher.find()) {
            String usedIngredientsText = matcher.group(1).trim();
            
            List<Map<String, String>> usedIngredients = new ArrayList<>();
            
            String[] lines = usedIngredientsText.split("\n");
            for (String line : lines) {
                line = line.trim();
                if (line.startsWith("•") || line.startsWith("-")) {
                    String ingredient = line.substring(1).trim();
                    String[] parts = ingredient.split(":");
                    if (parts.length == 2) {
                        String name = parts[0].trim();
                        String quantityAndUnit = parts[1].trim();
                        
                        String[] qtyParts = quantityAndUnit.split(" ", 2);
                        String quantity = qtyParts.length > 0 ? qtyParts[0] : "";
                        String unit = qtyParts.length > 1 ? qtyParts[1] : "";
                        
                        Map<String, String> ingredientMap = new HashMap<>();
                        ingredientMap.put("name", name);
                        ingredientMap.put("quantity", quantity);
                        ingredientMap.put("unit", unit);
                        usedIngredients.add(ingredientMap);
                    }
                }
            }
            
            try {
                ObjectMapper mapper = new ObjectMapper();
                return mapper.writeValueAsString(usedIngredients);
            } catch (Exception e) {
                log.error("Error converting used ingredients to JSON: {}", e.getMessage());
                return "[]";
            }
        }
        
        return "[]";
    }

    private String formatRecipe(String rawRecipe) {
        if (rawRecipe == null || rawRecipe.isEmpty()) {
            return "No recipe generated. Please try again.";
        }

        String title = "";
        String titleMatch = rawRecipe.replaceAll("(?s).*?===\\s*(.+?)\\s*===.*", "$1");
        if (!titleMatch.equals(rawRecipe)) {
            title = "=== " + titleMatch.trim() + " ===\n\n";
        }

        String cleanedRecipe = rawRecipe
                .replaceAll("(?m)^\\s*$[\n\r]{1,}", "\n")
                .replaceAll("===.*?===", "")
                .trim();

        StringBuilder formatted = new StringBuilder();

        if (!title.isEmpty()) {
            formatted.append(title);
        }

        formatted.append(cleanedRecipe);

        return formatted.toString().trim();
    }

    @Cacheable(value = "mealPlanStructures", key = "#duration + '_' + #mealsPerDay + '_' + #preferences.hashCode()")
    public String generateMealPlanStructure(int duration, int mealsPerDay, List<String> preferences) {
        log.info("🍽️ Generating meal plan structure for {} days with {} meals per day", duration, mealsPerDay);

        if (duration > 7) {
            return generateMealPlanInBatches(duration, mealsPerDay, preferences);
        }

        return generateSingleBatchMealPlan(duration, mealsPerDay, preferences);
    }

    private String generateMealPlanInBatches(int duration, int mealsPerDay, List<String> preferences) {
        List<GeneratedMealDTO> allMeals = new ArrayList<>();
        int batchSize = 2;

        for (int startDay = 1; startDay <= duration; startDay += batchSize) {
            int endDay = Math.min(startDay + batchSize - 1, duration);
            int batchDays = endDay - startDay + 1;

            log.info("📦 Generating batch: days {} to {}", startDay, endDay);

            String batchResponse = generateSingleBatchMealPlan(batchDays, mealsPerDay, preferences);

            try {
                MealPlanGenerationResponse batchResult = objectMapper.readValue(
                        batchResponse,
                        MealPlanGenerationResponse.class
                );

                for (GeneratedMealDTO meal : batchResult.getMeals()) {
                    meal.setDay(meal.getDay() + startDay - 1);
                    allMeals.add(meal);
                }

            } catch (Exception e) {
                log.error("Failed to parse batch response", e);
                throw new RuntimeException("Failed to parse batch response", e);
            }
        }

        MealPlanGenerationResponse finalResponse = new MealPlanGenerationResponse();
        finalResponse.setMeals(allMeals);
        finalResponse.setTotalMeals(allMeals.size());
        finalResponse.setStatus("completed");

        try {
            return objectMapper.writeValueAsString(finalResponse);
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize final response", e);
        }
    }

    private String generateSingleBatchMealPlan(int duration, int mealsPerDay, List<String> preferences) {
        try {
            String systemMessage = promptService.getMealPlanStructureSystemMessage();
            String userPrompt = promptService.buildMealPlanStructurePrompt(duration, mealsPerDay, preferences);

            int totalMeals = duration * mealsPerDay;
            int estimatedTokensNeeded = Math.max(3000, totalMeals * 200);

            ChatCompletionsOptions options = new ChatCompletionsOptions(
                    Arrays.asList(
                            new ChatMessage(ChatRole.SYSTEM).setContent(systemMessage),
                            new ChatMessage(ChatRole.USER).setContent(userPrompt)
                    )
            );

            options.setModel(model);
            options.setMaxTokens(estimatedTokensNeeded);
            options.setTemperature(0.7);
            options.setTopP(0.9);
            options.setFrequencyPenalty(0.3);
            options.setPresencePenalty(0.3);

            ChatCompletions completions = client.getChatCompletions(model, options);
            String response = completions.getChoices().get(0).getMessage().getContent();

            log.info("✅ Successfully generated batch meal plan");
            log.info("Response: {}", response);

            return extractAndValidateJson(response);

        } catch (Exception e) {
            log.error("❌ Error generating batch meal plan: {}", e.getMessage());
            throw new RuntimeException("Failed to generate batch meal plan: " + e.getMessage());
        }
    }

    private String extractAndValidateJson(String response) {
        String cleaned = response.trim();


        if (cleaned.startsWith("```json")) {
            cleaned = cleaned.substring(7);
        }
        if (cleaned.startsWith("```")) {
            cleaned = cleaned.substring(3);
        }
        if (cleaned.endsWith("```")) {
            cleaned = cleaned.substring(0, cleaned.length() - 3);
        }

        cleaned = cleaned
                .replace("“", "\"")  // Left smart quote
                .replace("”", "\"")  // Right smart quote
                .replace("‘", "'")   // Left smart single quote
                .replace("’", "'");  // Right smart single quote

        cleaned = cleaned.trim();

        return cleaned;
    }
}