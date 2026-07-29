package com.example.TouristSafety.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

public record ZoneRequest(
        @NotBlank String name,
        @NotBlank String riskLevel,
        String description,
        @NotEmpty @Size(min = 3, message = "A polygon needs at least 3 points") List<PointDto> polygon
) {}