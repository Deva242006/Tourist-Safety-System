package com.example.TouristSafety.dto;

import java.util.UUID;

public record SosMessage(UUID touristId, double latitude, double longitude, String message) {}