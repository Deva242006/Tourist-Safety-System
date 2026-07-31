package com.example.TouristSafety.dto;

import java.time.Instant;
import java.util.UUID;

public record AlertBroadcast(
        UUID id,
        UUID touristId,
        String type,
        String severity,
        String message,
        double latitude,
        double longitude,
        String status,
        Instant createdAt
) {}