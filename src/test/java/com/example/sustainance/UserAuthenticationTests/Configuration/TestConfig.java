package com.example.sustainance.UserAuthenticationTests.Configuration;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import com.fasterxml.jackson.databind.ObjectMapper;

@TestConfiguration
@EnableWebMvc
public class TestConfig {

    @Bean
    public ObjectMapper objectMapper() {
        return new ObjectMapper();
    }
}