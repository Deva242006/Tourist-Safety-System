package com.example.TouristSafety.dto;

import java.time.Instant;
import java.util.UUID;

public record IncidentResponse(
        UUID id,
        UUID alertId,
        UUID touristId,
        String touristName,
        UUID officerId,
        String officerName,
        String description,
        String status,
        String firNumber,
        Instant createdAt,
        Instant resolvedAt
) {}