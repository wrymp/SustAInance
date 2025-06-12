package com.example.sustainance.models.DTO;

import com.example.sustainance.models.entities.UserInfo;
import lombok.Data;

import java.util.UUID;

@Data
public class UserResponse {
    private UUID uuid;
    private String username;
    private String email;

    public UserResponse(UserInfo userInfo) {
        this.uuid = userInfo.getUuid();
        this.username = userInfo.getUsername();
        this.email = userInfo.getEmail();
    }
}