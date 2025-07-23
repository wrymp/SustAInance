package com.example.sustainance.models.DTO;

import lombok.Data;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDate;
import java.util.List;

@Data
public class MealPlanGenerationRequest {
    private int duration;
    private int mealsPerDay;
    private List<String> preferences;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;
}
