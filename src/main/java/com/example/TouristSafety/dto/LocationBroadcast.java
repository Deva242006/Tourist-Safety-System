package com.example.TouristSafety.dto;

import java.time.Instant;
import java.util.UUID;

public record LocationBroadcast(UUID touristId, double latitude, double longitude, Instant timestamp) {}