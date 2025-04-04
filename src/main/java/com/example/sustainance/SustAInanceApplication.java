package com.example.sustainance;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EntityScan("com.example.sustainance.Models")
@EnableJpaRepositories("com.example.sustainance.Repository")
public class SustAInanceApplication {

    public static void main(String[] args) {
        SpringApplication.run(SustAInanceApplication.class, args);
    }

}
