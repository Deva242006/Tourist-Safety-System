package com.example.TouristSafety.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
public class HealthController {
    @GetMapping("/")
    public String greet(){
        return "Hello World";
    }

    @GetMapping("/api/health")
    public Map<String, Object> health() {
        return Map.of(
            "status", "UP",
            "service", "tourist-safety-backend",
            "timestamp", Instant.now().toString()
        );
    }
}
