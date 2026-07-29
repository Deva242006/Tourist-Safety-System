package com.example.TouristSafety.dto;

import jakarta.validation.constraints.NotNull;

public record LocationCheckRequest(
        @NotNull Double latitude,
        @NotNull Double longitude
) {}