package com.example.TouristSafety.controller;

import com.example.TouristSafety.dto.OfficerResponse;
import com.example.TouristSafety.entity.Officer;
import com.example.TouristSafety.repository.OfficerRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/officers")
public class OfficerController {

    private final OfficerRepository officerRepository;

    public OfficerController(OfficerRepository officerRepository) {
        this.officerRepository = officerRepository;
    }

    @GetMapping
    public List<OfficerResponse> listAll() {
        return officerRepository.findAll().stream().map(this::toResponse).toList();
    }

    @GetMapping("/me")
    public ResponseEntity<OfficerResponse> getMe(Authentication authentication) {
        UUID officerId = UUID.fromString(authentication.getName());
        return officerRepository.findById(officerId)
                .map(this::toResponse)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<OfficerResponse> getById(@PathVariable UUID id) {
        return officerRepository.findById(id)
                .map(this::toResponse)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/station")
    public ResponseEntity<OfficerResponse> updateStation(@PathVariable UUID id,
                                                          @RequestParam String station) {
        return officerRepository.findById(id).map(officer -> {
            officer.setStation(station);
            return ResponseEntity.ok(toResponse(officerRepository.save(officer)));
        }).orElse(ResponseEntity.notFound().build());
    }

    private OfficerResponse toResponse(Officer o) {
        return new OfficerResponse(o.getId(), o.getFullName(), o.getEmail(),
                o.getBadgeNumber(), o.getStation(), o.getRole(), o.getCreatedAt());
    }
}
