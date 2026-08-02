package com.example.TouristSafety.controller;

import com.example.TouristSafety.dto.IncidentDetailResponse;
import com.example.TouristSafety.dto.IncidentRequest;
import com.example.TouristSafety.dto.IncidentResponse;
import com.example.TouristSafety.service.IncidentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.UUID;

@RestController
@RequestMapping("/api/incidents")
public class IncidentController {

    private final IncidentService incidentService;

    public IncidentController(IncidentService incidentService) {
        this.incidentService = incidentService;
    }

    @GetMapping
    public List<IncidentResponse> listAll() {
        return incidentService.listIncidents();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getDetail(@PathVariable UUID id) {
        try {
            return ResponseEntity.ok(incidentService.getDetail(id));
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<?> fileIncident(@Valid @RequestBody IncidentRequest req) {
        try {
            return ResponseEntity.status(201).body(incidentService.fileIncident(req));
        } catch (NoSuchElementException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable UUID id, @RequestParam String status) {
        try {
            return ResponseEntity.ok(incidentService.updateStatus(id, status));
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }
}