package com.example.TouristSafety.dto;

public record IncidentDetailResponse(
        IncidentResponse incident,
        TouristDetailResponse tourist,
        AlertSummary alert
) {}