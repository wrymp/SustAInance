package com.example.sustainance.models.ingredients;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;

@Getter
public class MealPlanRequest {
    private final String foodPreferenceString;
    private final String planPreferenceString;
    private final String timeframe;
    private final String recipient;

    @JsonCreator
    public MealPlanRequest(@JsonProperty("preferenceString") String iPreferenceString,
                           @JsonProperty("planPreferenceString") String iplanPreferenceString,
                           @JsonProperty("timeframe") String itimeframe,
                           @JsonProperty("recipient") String irecipient
                           ) {
        this.foodPreferenceString = iPreferenceString;
        this.planPreferenceString = iplanPreferenceString;
        this.timeframe = itimeframe;
        this.recipient = irecipient;
    }
}
