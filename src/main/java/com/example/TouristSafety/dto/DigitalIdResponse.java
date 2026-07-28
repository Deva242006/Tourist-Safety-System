package com.example.TouristSafety.dto;

import java.time.Instant;
import java.util.UUID;

public record DigitalIdResponse(
        UUID id,
        UUID touristId,
        int blockIndex,
        String prevHash,
        String currentHash,
        Instant issuedAt,
        Instant validUntil,
        boolean isValid
) {}