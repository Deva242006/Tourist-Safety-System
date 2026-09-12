package com.example.TouristSafety.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record TravelGroupResponse(
        UUID id,
        String name,
        String description,
        UUID leaderId,
        String leaderName,
        int memberCount,
        List<TouristSummaryResponse> members,
        Instant createdAt
) {}
