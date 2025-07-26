package com.example.sustainance.repositories;

import com.example.sustainance.models.entities.MealPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MealPlanRepository extends JpaRepository<MealPlan, Long> {

    List<MealPlan> findByUserIdOrderByCreatedAtDesc(UUID userId);

    void deleteByUserIdAndId(UUID userId, long id);

    boolean existsByUserIdAndId(UUID userId, long id);

    Optional<MealPlan> findByUserIdAndId(UUID userId, long id);
}