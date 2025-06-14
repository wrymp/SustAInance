package com.example.sustainance.models.repositories;

import com.example.sustainance.models.entities.PantryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PantryItemRepository extends JpaRepository<PantryItem, UUID> {

    Optional<PantryItem> findByUsersIdAndIngredientName(UUID usersId, String ingredientName);

    List<PantryItem> findByUsersId(UUID usersId);

    @Modifying
    @Query("DELETE FROM PantryItem p WHERE p.usersId = :usersId AND p.ingredientName = :ingredientName")
    void deleteByUsersIdAndIngredientName(@Param("usersId") UUID usersId,
                                          @Param("ingredientName") String ingredientName);
}