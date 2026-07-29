package com.example.TouristSafety.dto;

import java.util.List;
import java.util.UUID;

public record ZoneCheckResponse(
        boolean insideAnyZone,
        List<MatchedZone> matchedZones
) {
    public record MatchedZone(UUID zoneId, String zoneName, String riskLevel) {}
}