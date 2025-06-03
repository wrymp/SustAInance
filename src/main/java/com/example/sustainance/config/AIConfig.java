package com.example.sustainance.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "ai.github")
public class AIConfig {
    private String key;
    private String url;
    private String model;
}