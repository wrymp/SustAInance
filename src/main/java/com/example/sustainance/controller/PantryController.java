package com.example.sustainance.controller;

import com.example.sustainance.config.authConfig.RequireAuthentication;
import com.example.sustainance.models.DTO.RemoveIngredientRequest;
import com.example.sustainance.models.DTO.UpdateIngredientRequest;
import com.example.sustainance.models.DTO.getFromPantryByIdRequest;
import com.example.sustainance.models.entities.PantryItem;
import com.example.sustainance.services.PantryService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequireAuthentication
@RequestMapping("/api/pantry")
public class PantryController {

    private final PantryService pantryService;


    public PantryController(PantryService pantryService) {
        this.pantryService = pantryService;
    }

    @PostMapping("/add")
    public ResponseEntity<PantryItem> addIngredient(@Valid @RequestBody UpdateIngredientRequest request, HttpServletRequest httpRequest) {
        try {
            UUID authenticatedUserId = (UUID) httpRequest.getAttribute("authenticatedUserId");
            if (!authenticatedUserId.equals(request.getUsersId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            PantryItem result = pantryService.addIngredient(request);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/remove")
    public ResponseEntity<String> removeIngredient(@Valid @RequestBody RemoveIngredientRequest request, HttpServletRequest httpRequest) {
        try {
            UUID authenticatedUserId = (UUID) httpRequest.getAttribute("authenticatedUserId");
            if (!authenticatedUserId.equals(request.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            pantryService.removeIngredient(request);
            return ResponseEntity.ok("Ingredient removed uhh... successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error processing request");
        }
    }

    @PostMapping("/take")
    public ResponseEntity<String> takeIngredient(@Valid @RequestBody UpdateIngredientRequest request, HttpServletRequest httpRequest) {
        try {
            UUID authenticatedUserId = (UUID) httpRequest.getAttribute("authenticatedUserId");
            if (!authenticatedUserId.equals(request.getUsersId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
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

    @GetMapping("/usersPantry")
    public ResponseEntity<List<PantryItem>> getUserPantry(@Valid @RequestBody getFromPantryByIdRequest request, HttpServletRequest httpRequest) {
        try {
            UUID authenticatedUserId = (UUID) httpRequest.getAttribute("authenticatedUserId");
            if (!authenticatedUserId.equals(request.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            List<PantryItem> pantryItems = pantryService.getUserPantry(request.getId());
            return ResponseEntity.ok(pantryItems);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/getItemWithId")
    public ResponseEntity<PantryItem> getPantryItemById(@Valid @RequestBody getFromPantryByIdRequest request, HttpServletRequest httpRequest) {
        try {
            UUID authenticatedUserId = (UUID) httpRequest.getAttribute("authenticatedUserId");
            if (!authenticatedUserId.equals(request.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            Optional<PantryItem> pantryItem = pantryService.getPantryItemById(request.getId());
            return pantryItem.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}