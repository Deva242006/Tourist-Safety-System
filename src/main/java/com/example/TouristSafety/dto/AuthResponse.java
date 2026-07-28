package com.example.TouristSafety.dto;

import java.util.UUID;

public record AuthResponse(
        String token,
        UUID touristId,
        String fullName,
        String email,
        long expiresInMs
) {}