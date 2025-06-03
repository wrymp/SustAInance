package com.example.sustainance.services;

import com.example.sustainance.config.AIProperties;
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

    public String buildRecipePrompt(String ingredients) {
        return String.format("""
            Create a delicious, practical recipe using ONLY these ingredients: %s
            
            IMPORTANT RULES:
            - Use ONLY the ingredients provided - no substitutions or additions
            - If ingredients seem insufficient, create the best possible dish with what's available
            - Provide realistic cooking times and temperatures
            - Include helpful cooking tips
            - Make portions appropriate for the ingredient quantities given
            - Be creative but practical
            
            Format your response EXACTLY like this:
            
            === [Creative Recipe Name] ===
            
            Ingredients:
            • [ingredient]: [exact amount from input]
            • [ingredient]: [exact amount from input]
            
            Instructions:
            1. [Detailed step with temperature/time if needed]
            2. [Next step with specific techniques]
            3. [Continue with clear, actionable steps]
            
            Chef's Tips:
            • [Helpful cooking tip]
            • [Storage or serving suggestion]
            
            Cooking Time: [prep time] + [cook time] = [total time]
            Serves: [number of people]
            Difficulty: [Easy/Medium/Hard]
            """, ingredients);
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
