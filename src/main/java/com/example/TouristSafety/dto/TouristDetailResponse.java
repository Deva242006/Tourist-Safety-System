package com.example.TouristSafety.dto;

import java.time.Instant;
import java.util.UUID;

public record TouristDetailResponse(
        UUID id,
        String fullName,
        String email,
        String phone,
        String documentNumber,
        String emergencyContactName,
        String emergencyContactPhone,
        Instant tripStart,
        Instant tripEnd,
        DigitalIdResponse digitalId
) {}