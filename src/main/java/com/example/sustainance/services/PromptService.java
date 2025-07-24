package com.example.sustainance.services;

import com.example.sustainance.config.AIProperties;
import com.example.sustainance.models.Preference.RecipePreferences;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PromptService {

    private final AIProperties aiProperties;

    public PromptService(AIProperties aiProperties) {
        this.aiProperties = aiProperties;
    }

    public String getRecipeSystemMessage() {
        return aiProperties.getPrompts().getRecipe().getSystemMessage();
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
            
            Format your response EXACTLY like this, make sure to
            match the unit name to what was given, don't add anything to the unit name
            or the ingredient name for that matter:
            
            === [Creative Recipe Name] ===
            
            USED_INGREDIENTS_START
            • [ingredient name]: [actual amount used] [unit]
            • [ingredient name]: [actual amount used] [unit]
            • [basic seasoning]: [actual amount used] [unit]
            USED_INGREDIENTS_END
            
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
            
            SHOPPING LIST:
            [Only if needed - list missing ingredients with quantities]
            === [INGREDIENT_NAME]: [Quantity, Unit]
            SHOPPING LIST END
            """,
                ingredients,
                !preferencesContext.isEmpty() ? preferencesContext.toString() : "No specific preferences provided"
        );
    }

    public String buildMealPlanStructurePrompt(int duration, int mealsPerDay, List<String> preferences) {
        List<String> mealTypes = getMealTypes(mealsPerDay);
        String preferencesStr = preferences != null && !preferences.isEmpty()
                ? String.join(", ", preferences)
                : "No specific preferences";

        String jsonExample = """
        {
            "meals": [
                {
                    "day": 1,
                    "mealType": "Breakfast",
                    "title": "Example Meal Name",
                    "content": "Brief description of the meal"
                },
                {
                    "day": 1,
                    "mealType": "Lunch",
                    "title": "Another Meal Name",
                    "content": "Brief description of this meal"
                }
            ],
            "totalMeals": 2,
            "status": "completed"
        }
        """;

        return String.format("""
        Generate a %d-day meal plan with %d meals per day.
        Meal types per day: %s
        Dietary preferences: %s
        
        You MUST return ONLY valid JSON that matches this exact structure:
        %s
        
        Requirements:
        - The "meals" array must contain exactly %d meal objects
        - Each meal must have: day (number 1-%d), mealType (%s), title (meal name), content (1-2 sentence description)
        - Set "totalMeals" to %d
        - Set "status" to "completed"
        - Ensure variety across days
        - Follow dietary preferences if specified
        - Return ONLY the JSON, no explanations or markdown
        """,
                duration,
                mealsPerDay,
                String.join(", ", mealTypes),
                preferencesStr,
                jsonExample,
                duration * mealsPerDay,
                duration,
                String.join("/", mealTypes),
                duration * mealsPerDay
        );
    }

    public String getMealPlanStructureSystemMessage() {
        return """
    You are a JSON API that generates meal plans.
    
    CRITICAL RULES:
    1. Return ONLY valid JSON - no explanations, no markdown
    2. Use ONLY standard ASCII double quotes (") - character code 34
    3. Do NOT use smart quotes ("" or '') - these break JSON parsing
    4. Keep meal descriptions under 15 words
    5. Ensure the response is complete - do not truncate
    
    Example of CORRECT quotes: "title": "Meal Name"
    Example of WRONG quotes: "title": "Meal Name"
    """;
    }

    private List<String> getMealTypes(int mealsPerDay) {
        return switch (mealsPerDay) {
            case 1 -> List.of("Lunch");
            case 2 -> List.of("Lunch", "Dinner");
            case 3 -> List.of("Breakfast", "Lunch", "Dinner");
            default -> List.of("Breakfast", "Lunch", "Dinner");
        };
    }
}