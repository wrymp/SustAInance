package com.example.sustainance.repositories;

import com.example.sustainance.models.entities.PantryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PantryItemRepository extends JpaRepository<PantryItem, UUID> {

    Optional<PantryItem> findByUsersIdAndIngredientName(UUID usersId, String ingredientName);
    Optional<PantryItem> findByUsersIdAndId(UUID usersId, UUID id);
    void removePantryItemByUsersIdAndId(UUID usersId, UUID id);

    List<PantryItem> findByUsersId(UUID usersId);

}