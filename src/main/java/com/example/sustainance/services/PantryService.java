package com.example.sustainance.services;

import com.example.sustainance.models.DTO.RemoveIngredientRequest;
import com.example.sustainance.models.DTO.UpdateIngredientRequest;
import com.example.sustainance.models.entities.PantryItem;
import com.example.sustainance.models.repositories.PantryItemRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class PantryService {

    private final PantryItemRepository pantryItemRepository;

    public PantryService(PantryItemRepository pantryItemRepository) {
        this.pantryItemRepository = pantryItemRepository;
    }

    public PantryItem addIngredient(UpdateIngredientRequest request) {
        Optional<PantryItem> existingItem = pantryItemRepository
                .findByUsersIdAndIngredientName(request.getUsersId(), request.getIngredientName());

        if (existingItem.isPresent()) {
            PantryItem item = existingItem.get();

            // Check if units match
            if (!item.getUnit().equals(request.getUnit())) {
                throw new RuntimeException("Unit mismatch: existing item has unit '" + item.getUnit() +
                        "' but you're trying to add with unit '" + request.getUnit() + "'");
            }

            String newCount = addCounts(item.getCount(), request.getCount());
            item.setCount(newCount);
            return pantryItemRepository.save(item);
        } else {
            PantryItem newItem = new PantryItem(
                    request.getUsersId(),
                    request.getIngredientName(),
                    request.getCount(),
                    request.getUnit()
            );
            return pantryItemRepository.save(newItem);
        }
    }

    // Add new method for updating existing items
    public PantryItem updateIngredient(UpdateIngredientRequest request) {
        Optional<PantryItem> existingItem = pantryItemRepository
                .findByUsersIdAndIngredientName(request.getUsersId(), request.getIngredientName());

        if (existingItem.isPresent()) {
            PantryItem item = existingItem.get();

            // If ingredient name is being changed, check for conflicts
            if (!item.getIngredientName().equals(request.getIngredientName())) {
                Optional<PantryItem> conflictItem = pantryItemRepository
                        .findByUsersIdAndIngredientName(request.getUsersId(), request.getIngredientName());
                if (conflictItem.isPresent() && !conflictItem.get().getId().equals(item.getId())) {
                    throw new RuntimeException("An ingredient with name '" + request.getIngredientName() + "' already exists");
                }
            }

            item.setIngredientName(request.getIngredientName());
            item.setCount(request.getCount());
            item.setUnit(request.getUnit());
            return pantryItemRepository.save(item);
        } else {
            throw new RuntimeException("Pantry item not found");
        }
    }

    public void removeIngredient(RemoveIngredientRequest request) {
        Optional<PantryItem> existingItem = pantryItemRepository
                .findByUsersIdAndId(request.getUsersId(), request.getId());

        if (existingItem.isPresent()) {
            pantryItemRepository.removePantryItemByUsersIdAndId(request.getUsersId(), request.getId());
        }
    }

    public PantryItem takeIngredient(UpdateIngredientRequest request) {
        Optional<PantryItem> existingItem = pantryItemRepository
                .findByUsersIdAndIngredientName(request.getUsersId(), request.getIngredientName());

        if (existingItem.isPresent()) {
            PantryItem item = existingItem.get();

            if(!item.getUnit().equals(request.getUnit())){
                throw new RuntimeException("Ingredient Unit mismatch " + item.getUnit() + " " + request.getUnit());
            }

            String newCount = subtractCounts(item.getCount(), request.getCount());

            if (isCountZeroOrNegative(newCount)) {
                pantryItemRepository.removePantryItemByUsersIdAndId(request.getUsersId(), item.getId());
                return null;
            } else {
                item.setCount(newCount);
                return pantryItemRepository.save(item);
            }
        } else {
            throw new RuntimeException("Ingredient not found in pantry for user: " + request.getUsersId());
        }
    }

    public List<PantryItem> getUserPantry(UUID usersId) {
        return pantryItemRepository.findByUsersId(usersId);
    }

    public Optional<PantryItem> getPantryItemById(UUID id) {
        return pantryItemRepository.findById(id);
    }

    private String addCounts(String count1, String count2) {
        try {
            double result = Double.parseDouble(count1) + Double.parseDouble(count2);
            return String.valueOf(result);
        } catch (NumberFormatException e) {
            return count1 + " + " + count2;
        }
    }

    private String subtractCounts(String count1, String count2) {
        try {
            double result = Double.parseDouble(count1) - Double.parseDouble(count2);
            return String.valueOf(result);
        } catch (NumberFormatException e) {
            throw new RuntimeException("Cannot subtract non-numeric counts");
        }
    }

    private boolean isCountZeroOrNegative(String count) {
        try {
            double value = Double.parseDouble(count);
            return value <= 0;
        } catch (NumberFormatException e) {
            return false;
        }
    }
}