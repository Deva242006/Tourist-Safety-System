package com.example.TouristSafety.dto;

import java.util.List;
import java.util.UUID;

public record ZoneResponse(
        UUID id,
        String name,
        String riskLevel,
        String description,
        List<PointDto> polygon
) {}