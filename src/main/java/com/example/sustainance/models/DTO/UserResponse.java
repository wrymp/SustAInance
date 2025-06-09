package com.example.sustainance.models.DTO;

import com.example.sustainance.models.entities.UserInfo;

import java.util.UUID;

public class UserResponse {
    private UUID uuid;
    private String username;
    private String email;

    public UserResponse() {}

    public UserResponse(UserInfo userInfo) {
        this.uuid = userInfo.getUuid();
        this.username = userInfo.getUsername();
        this.email = userInfo.getEmail();
    }

    public UUID getUuid() { return uuid; }
    public void setUuid(UUID uuid) { this.uuid = uuid; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}