package com.example.TouristSafety.controller;

import com.example.TouristSafety.dto.TouristDetailResponse;
import com.example.TouristSafety.dto.TouristSummaryResponse;
import com.example.TouristSafety.repository.TouristRepository;
import com.example.TouristSafety.service.TouristProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tourists")
public class TouristController {

    private final TouristRepository touristRepository;
    private final TouristProfileService touristProfileService;

    public TouristController(TouristRepository touristRepository, TouristProfileService touristProfileService) {
        this.touristRepository = touristRepository;
        this.touristProfileService = touristProfileService;
    }

    @GetMapping
    public List<TouristSummaryResponse> listAll() {
        return touristRepository.findAll().stream()
                .map(touristProfileService::toSummary)
                .toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<TouristDetailResponse> getDetail(@PathVariable UUID id) {
        return touristRepository.findById(id)
                .map(touristProfileService::toDetail)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @org.springframework.web.bind.annotation.PatchMapping("/me/contact")
    public ResponseEntity<?> updateContact(java.security.Principal principal, 
            @org.springframework.web.bind.annotation.RequestBody com.example.TouristSafety.dto.UpdateContactRequest request) {
        if (principal == null) return ResponseEntity.status(401).build();
        UUID touristId = UUID.fromString(principal.getName());
        return touristRepository.findById(touristId).map(t -> {
            if (request.getEmergencyContactName() != null) {
                t.setEmergencyContactName(request.getEmergencyContactName());
            }
            if (request.getEmergencyContactPhone() != null) {
                t.setEmergencyContactPhone(request.getEmergencyContactPhone());
            }
            touristRepository.save(t);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }
}