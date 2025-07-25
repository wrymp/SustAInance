package com.example.sustainance.models.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Setter
@Getter
@Table(name = "meal_plans")
public class MealPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private long id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "duration", nullable = false)
    private Integer duration;

    @Column(name = "meals_per_day", nullable = false)
    private Integer mealsPerDay;

    @Column(name = "preferences", columnDefinition = "TEXT")
    private String preferences;

    @Column(name = "meals_data", columnDefinition = "TEXT")
    private String mealsData;

    @Column(name = "created_at")
    private LocalDate createdAt;

    public MealPlan() {
        this.createdAt = LocalDate.now();
    }

    public MealPlan(UUID userId, LocalDate startDate, Integer duration, Integer mealsPerDay,
                    String preferences, String mealsData) {
        this.userId = userId;
        this.startDate = startDate;
        this.duration = duration;
        this.mealsPerDay = mealsPerDay;
        this.preferences = preferences;
        this.mealsData = mealsData;
        this.createdAt = LocalDate.now();
    }

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDate.from(LocalDateTime.now());
        }
    }
}

