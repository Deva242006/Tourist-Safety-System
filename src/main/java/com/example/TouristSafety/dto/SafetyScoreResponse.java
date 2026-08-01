package com.example.TouristSafety.dto;

import java.util.List;

public record SafetyScoreResponse(
        int score,
        String level,
        List<String> factors
) {}