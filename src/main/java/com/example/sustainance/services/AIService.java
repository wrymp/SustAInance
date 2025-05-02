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
            log.info("Received response from AI API on recipe ");

            String recipe = completions.getChoices().get(0).getMessage().getContent();
            return formatRecipe(recipe);
        } catch (Exception e) {
            log.error("Error in recipe generation", e);
            throw e;
        }
    }

    public String generateMealPlan(String FoodPreferences, String timefranme, String PlanPreference, String ingredients) {
        if(FoodPreferences.isEmpty()){
            FoodPreferences = "No Preference for any kind of food";
        }
        if(ingredients.isEmpty()){
            FoodPreferences = "No list given, assume I have everything.";
        }
        if(PlanPreference.isEmpty()){
            PlanPreference = "No Preference for any kind of plan";
        }

        log.info("Generating Meal Plan for food preferences: {}, for a period of: {}",
                FoodPreferences+" "+PlanPreference, timefranme);
        try {
            ChatCompletionsOptions options = new ChatCompletionsOptions(
                    Arrays.asList(
                            new ChatMessage(ChatRole.SYSTEM)
                                    .setContent("You are a professional chef creating recipes."),
                            new ChatMessage(ChatRole.USER)
                                    .setContent(String.format("""
                            Create a Meal plan working with these preferences:\s
                            %s for the foods
                            %s for the plan
                           \s
                            The plan should last for %s.
                            IF THE TIME FRAME IS TOO LONG TO WRITE IT ALL AS A WEEKLY SCHEDULE AND ADD ANY EXCEPTIONS AS EXTRAS.
                           \s
                            list of INGREDIENTS you can use:
                            %s
                            IF THERE ARE NOT ENOUGH INGREDIENTS FOR THE WHOLE PLAN, GIVE A SHOPPING LIST FOR THOSE INGREDIENTS AT THE END LIKE SO:
                            === INGREDIENT_NAME : Quantity
                            AND START IT WITH THE KEYWORD "SHOPPING LIST:"
                           
                            Give the recipe for each day like so:
                           \s
                            ===  [Day Name]   ===
                            
                            for each recipe:
                            === [Recipe Name] ===
                           \s
                            Ingredients:
                            [List each ingredient like so
                            {ing name: quant, unit}
                            ]
                           \s
                            Instructions:
                            [Numbered steps]
                           \s
                            Cooking Time: [time this dish needs]
                           \s""", FoodPreferences, PlanPreference, timefranme, ingredients))
                    )
            );

            options.setModel(model);

            ChatCompletions completions = client.getChatCompletions(model, options);
            log.info("Received response from AI API on Meal Plan");

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