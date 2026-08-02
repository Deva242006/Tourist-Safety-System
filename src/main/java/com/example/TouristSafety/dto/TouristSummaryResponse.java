package com.example.TouristSafety.dto;

import java.time.Instant;
import java.util.UUID;

public record TouristSummaryResponse(
        UUID id,
        String fullName,
        String email,
        String phone,
        String documentNumber,
        Instant tripStart,
        Instant tripEnd,
        Instant createdAt
) {}