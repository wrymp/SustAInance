package com.example.sustainance.services;


import com.azure.ai.openai.OpenAIClient;
import com.azure.ai.openai.OpenAIClientBuilder;
import com.azure.ai.openai.models.*;
import com.azure.core.credential.AzureKeyCredential;
import com.example.sustainance.config.AIConfig;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
@Slf4j
public class AIService {
    private final OpenAIClient client;
    private final String model;

    public AIService(AIConfig config) {
        this.client = new OpenAIClientBuilder()
                .credential(new AzureKeyCredential(config.getKey()))
                .endpoint(config.getUrl())
                .buildClient();
        this.model = config.getModel();
        log.info("AI Service initialized with endpoint: {}", config.getUrl());
    }

    public String generateRecipe(String ingredients) {
        log.info("Generating recipe for ingredients: {}", ingredients);
        try {
            ChatCompletionsOptions options = new ChatCompletionsOptions(
                    Arrays.asList(
                            new ChatMessage(ChatRole.SYSTEM)
                                    .setContent("You are a professional chef creating recipes."),
                            new ChatMessage(ChatRole.USER)
                                    .setContent(String.format("""
                            Create a recipe using only these ingredients: %s
                            
                            Give the recipe a creative name and format like this:
                            
                            === [Recipe Name] ===
                            
                            Ingredients:
                            [List each ingredient]
                            
                            Instructions:
                            [Numbered steps]
                            
                            Cooking Time: [time this dish needs]
                            """, ingredients))
                    )
            );

            options.setModel(model);

            ChatCompletions completions = client.getChatCompletions(model, options);
            log.info("Received response from AI API");

            String recipe = completions.getChoices().get(0).getMessage().getContent();
            return formatRecipe(recipe);
        } catch (Exception e) {
            log.error("Error in recipe generation", e);
            throw e;
        }
    }

    private String formatRecipe(String rawRecipe) {
        if (rawRecipe == null || rawRecipe.isEmpty()) {
            throw new RuntimeException("No recipe generated");
        }

        // Clean up the response
        String cleanedRecipe = rawRecipe
                .replaceAll("(?m)^\\s*$[\n\r]{1,}", "\n")     // Remove extra blank lines
                .trim();

        // Split into sections
        String[] sections = cleanedRecipe.split("(?====|Ingredients:|Instructions:|Cooking Time:|Note:)");

        StringBuilder formatted = new StringBuilder();

        // Process each section
        for (String section : sections) {
            section = section.trim();
            if (!section.isEmpty()) {
                // Remove duplicate instructions
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