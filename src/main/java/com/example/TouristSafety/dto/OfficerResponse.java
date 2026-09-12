package com.example.TouristSafety.dto;

import java.time.Instant;
import java.util.UUID;

public record OfficerResponse(
        UUID id,
        String fullName,
        String email,
        String badgeNumber,
        String station,
        String role,
        Instant createdAt
) {}
