package com.example.TouristSafety.dto;

import java.util.UUID;

public record LocationUpdateMessage(UUID touristId, double latitude, double longitude) {}