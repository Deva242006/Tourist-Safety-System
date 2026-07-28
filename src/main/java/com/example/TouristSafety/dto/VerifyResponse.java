package com.example.TouristSafety.dto;

public record VerifyResponse(
        boolean chainIntact,
        int blockCount,
        String message
) {}
