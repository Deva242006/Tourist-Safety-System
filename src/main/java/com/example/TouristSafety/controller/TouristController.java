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
}