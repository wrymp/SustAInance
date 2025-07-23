package com.example.sustainance.models.repositories;

import com.example.sustainance.models.entities.MealPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MealPlanRepository extends JpaRepository<MealPlan, Long> {

    List<MealPlan> findByUserIdOrderByCreatedAtDesc(UUID userId);

    void deleteByUserIdAndId(UUID userId, UUID id);

    boolean existsByUserIdAndId(UUID userId, UUID id);
}