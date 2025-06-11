package com.example.sustainance.models.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "pantry_items",
        uniqueConstraints = @UniqueConstraint(columnNames = {"users_id", "ingredient_name"}))
public class PantryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "users_id", nullable = false)
    private UUID usersId;

    @Column(name = "ingredient_name", nullable = false)
    private String ingredientName;

    @Column(name = "count", nullable = false)
    private String count;

    @Column(name = "unit", nullable = false)
    private String unit;

    public PantryItem() {}

    public PantryItem(UUID usersId, String ingredientName, String count, String unit) {
        this.usersId = usersId;
        this.ingredientName = ingredientName;
        this.count = count;
        this.unit = unit;
    }
}
