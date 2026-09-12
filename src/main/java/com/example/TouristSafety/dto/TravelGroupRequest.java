package com.example.TouristSafety.dto;

import jakarta.validation.constraints.NotBlank;

public record TravelGroupRequest(
        @NotBlank String name,
        String description
) {}
