package com.example.TouristSafety.controller;

import com.example.TouristSafety.dto.SafetyScoreResponse;
import com.example.TouristSafety.service.AnomalyDetectionService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/safety-score")
public class SafetyScoreController {

    private final AnomalyDetectionService anomalyDetectionService;

    public SafetyScoreController(AnomalyDetectionService anomalyDetectionService) {
        this.anomalyDetectionService = anomalyDetectionService;
    }

    @GetMapping("/me")
    public SafetyScoreResponse getMyScore(Authentication authentication) {
        UUID touristId = UUID.fromString(authentication.getName());
        return anomalyDetectionService.computeSafetyScore(touristId);
    }
}