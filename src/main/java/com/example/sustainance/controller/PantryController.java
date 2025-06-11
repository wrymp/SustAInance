package com.example.sustainance.controller;

import com.example.sustainance.models.DTO.AddIngredientRequest;
import com.example.sustainance.models.DTO.TakeIngredientRequest;
import com.example.sustainance.models.entities.PantryItem;
import com.example.sustainance.models.repositories.PantryItemRepository;
import com.example.sustainance.services.PantryService;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Controller
@RequestMapping("/api/pantry")
public class PantryController {

    private final PantryService pantryService;


    public PantryController(PantryService pantryService) {
        this.pantryService = pantryService;
    }

    @PostMapping("/add")
    public ResponseEntity<PantryItem> addIngredient(@Valid @RequestBody AddIngredientRequest request) {
        try {
            PantryItem result = pantryService.addIngredient(request);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/take")
    public ResponseEntity<String> takeIngredient(@Valid @RequestBody TakeIngredientRequest request) {
        try {
            PantryItem result = pantryService.takeIngredient(request);
            if (result == null) {
                return ResponseEntity.ok("Ingredient removed from pantry (count reached zero)");
            } else {
                return ResponseEntity.ok("Ingredient count updated successfully");
            }
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error processing request");
        }
    }

    @GetMapping("/user/{usersId}")
    public ResponseEntity<List<PantryItem>> getUserPantry(@PathVariable UUID usersId) {
        try {
            List<PantryItem> pantryItems = pantryService.getUserPantry(usersId);
            return ResponseEntity.ok(pantryItems);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<PantryItem> getPantryItemById(@PathVariable UUID id) {
        try {
            Optional<PantryItem> pantryItem = pantryService.getPantryItemById(id);
            return pantryItem.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}