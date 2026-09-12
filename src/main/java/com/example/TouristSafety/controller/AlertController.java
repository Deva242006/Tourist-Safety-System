package com.example.TouristSafety.controller;

import com.example.TouristSafety.entity.Alert;
import com.example.TouristSafety.repository.AlertRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
public class AlertController {

    private final AlertRepository alertRepository;

    public AlertController(AlertRepository alertRepository) {
        this.alertRepository = alertRepository;
    }

    @GetMapping
    public List<Alert> listRecent(
            @org.springframework.web.bind.annotation.RequestParam(required = false) String status,
            @org.springframework.web.bind.annotation.RequestParam(defaultValue = "20") int size
    ) {
        java.util.stream.Stream<Alert> stream = alertRepository.findAll().stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));
        
        if (status != null) {
            stream = stream.filter(a -> status.equals(a.getStatus()));
        }
        
        return stream.limit(size).toList();
    }

    @org.springframework.web.bind.annotation.PatchMapping("/{id}/read")
    public org.springframework.http.ResponseEntity<?> markRead(@org.springframework.web.bind.annotation.PathVariable java.util.UUID id) {
        return alertRepository.findById(id).map(alert -> {
            alert.setRead(true);
            alertRepository.save(alert);
            return org.springframework.http.ResponseEntity.ok().build();
        }).orElse(org.springframework.http.ResponseEntity.notFound().build());
    }
}