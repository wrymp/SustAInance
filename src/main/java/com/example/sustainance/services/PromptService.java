package com.example.sustainance.services;

import com.example.sustainance.config.AIProperties;
import com.example.sustainance.models.Preference.RecipePreferences;
import org.springframework.stereotype.Service;

@Service
public class PromptService {

    private final AIProperties aiProperties;

    public PromptService(AIProperties aiProperties) {
        this.aiProperties = aiProperties;
    }

    public String getRecipeSystemMessage() {
        return aiProperties.getPrompts().getRecipe().getSystemMessage();
    }

    public String getMealPlanSystemMessage() {
        return aiProperties.getPrompts().getMealPlan().getSystemMessage();
    }

    public String buildRecipePrompt(String ingredients, RecipePreferences preferences) {
        // Build preferences context
        StringBuilder preferencesContext = new StringBuilder();

        if (preferences.getCuisine() != null && !preferences.getCuisine().isEmpty()) {
            preferencesContext.append("🌍 Cuisine Style: ").append(preferences.getCuisine()).append("\n");
        }

        if (preferences.getMealType() != null && !preferences.getMealType().isEmpty()) {
            preferencesContext.append("🍽️ Meal Type: ").append(preferences.getMealType()).append("\n");
        }

        if (preferences.getCookingTime() != null && !preferences.getCookingTime().isEmpty()) {
            preferencesContext.append("⏰ Target Cooking Time: ").append(preferences.getCookingTime()).append(" minutes\n");
        }

        if (preferences.getDifficulty() != null && !preferences.getDifficulty().isEmpty()) {
            preferencesContext.append("📊 Difficulty Level: ").append(preferences.getDifficulty()).append("\n");
        }

        if (preferences.getDietaryRestrictions() != null && !preferences.getDietaryRestrictions().isEmpty()) {
            preferencesContext.append("🥗 Dietary Requirements: ").append(String.join(", ", preferences.getDietaryRestrictions())).append("\n");
        }

        return String.format("""
            Create a delicious, practical recipe using the provided ingredients with these preferences:
            
            MAIN INGREDIENTS: %s
            
            USER PREFERENCES:
            %s
            
            🚨 CRITICAL INGREDIENT RULES:
            ✅ ALLOWED to add (common kitchen basics):
            - Salt, black pepper, sugar
            - Cooking oil/butter (if cooking requires it)
            - Water for cooking
            
            ❌ FORBIDDEN to add (major ingredients):
            - Flour, bread, pasta, rice (unless provided)
            - Cheese, dairy products (unless provided)
            - Meat, fish, eggs (unless provided)
            - Fresh vegetables/fruits (unless provided)
            - Nuts, seeds (unless provided)
            - Sauces, condiments (unless provided)
            - Baking ingredients (baking powder, vanilla, etc.)
            
            🎯 PREFERENCE INTEGRATION:
            - Follow the cuisine style if specified
            - Respect all dietary restrictions strictly
            - Adjust cooking method for the target time
            - Match the difficulty level requested
            - Design for the specified meal type
            
            Format your response EXACTLY like this:
            
            === [Creative Recipe Name] ===
            
            Ingredients:
            • [main ingredient]: [exact amount from input]
            • [main ingredient]: [exact amount from input]
            • [basic seasoning]: [small amount] (if needed)
            
            Instructions:
            1. **[Action]** [Detailed step with temperature/time if needed]
            2. **[Action]** [Next step with specific techniques]
            3. **[Action]** [Continue with clear, actionable steps]
            
            Chef's Tips:
            • [Helpful cooking tip related to cuisine/preferences]
            • [Storage or serving suggestion]
            
            Cooking Time: [prep time] + [cook time] = [total time]
            Serves: [number of people]
            Difficulty: [Easy/Medium/Hard]
            """,
                ingredients,
                !preferencesContext.isEmpty() ? preferencesContext.toString() : "No specific preferences provided"
        );
    }

    public String buildMealPlanPrompt(String foodPreferences, String planPreference, String timeframe, String ingredients) {
        return String.format("""
            Create a comprehensive meal plan with these specifications:
            
            PREFERENCES:
            • Food preferences: %s
            • Plan type: %s
            • Duration: %s
            
            AVAILABLE INGREDIENTS:
            %s
            
            REQUIREMENTS:
            - Create realistic, balanced meals for the specified timeframe
            - If timeframe is longer than 1 week, provide a weekly template with variations
            - Use available ingredients efficiently
            - Include prep times and cooking difficulty
            - If ingredients are insufficient, provide a shopping list at the end
            
            FORMAT EXACTLY LIKE THIS:
            
            === MEAL PLAN FOR [TIMEFRAME] ===
            
            === DAY 1 ===
            
            **Breakfast:**
            === [Recipe Name] ===
            Ingredients: [list with quantities]
            Instructions: [numbered steps]
            Prep Time: [time] | Cook Time: [time] | Difficulty: [level]
            
            **Lunch:**
            === [Recipe Name] ===
            [same format]
            
            **Dinner:**
            === [Recipe Name] ===
            [same format]
            
            [Continue for each day...]
            
            === WEEKLY PREP TIPS ===
            • [Batch cooking suggestions]
            • [Storage tips]
            • [Time-saving techniques]
            
            SHOPPING LIST:
            [Only if needed - list missing ingredients with quantities]
            === [INGREDIENT_NAME]: [Quantity, Unit]
            """,
                foodPreferences.isEmpty() ? "No specific preferences" : foodPreferences,
                planPreference.isEmpty() ? "Balanced nutrition" : planPreference,
                timeframe,
                ingredients.isEmpty() ? "No specific ingredients provided - assume basic pantry items available" : ingredients
        );
    }
}