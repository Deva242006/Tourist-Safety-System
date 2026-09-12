package com.example.TouristSafety.dto;

import java.util.UUID;

public record OfficerAuthResponse(
        String token,
        UUID officerId,
        String fullName,
        String email,
        String badgeNumber,
        String station,
        String role,
        long expiresInMs
) {}
