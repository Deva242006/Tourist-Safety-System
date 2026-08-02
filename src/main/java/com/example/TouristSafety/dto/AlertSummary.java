package com.example.TouristSafety.dto;

import java.time.Instant;
import java.util.UUID;

public record AlertSummary(
        UUID id,
        String type,
        String severity,
        String message,
        double latitude,
        double longitude,
        String status,
        Instant createdAt
) {}