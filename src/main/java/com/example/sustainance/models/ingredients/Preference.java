package com.example.sustainance.models.ingredients;


import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;

@Getter
public class Preference {
    private final String preferenceString;

    @JsonCreator
    public Preference(@JsonProperty("preferenceString") String iPreferenceString) {
        this.preferenceString = iPreferenceString;
    }

    @Override
    public String toString() {
        return "User has the following preferences: " + this.getPreferenceString();
    }
}
