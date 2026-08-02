package com.example.TouristSafety.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record IncidentRequest(
        @NotNull UUID alertId,
        String description
) {}