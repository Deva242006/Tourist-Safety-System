package com.example.TouristSafety.dto;

import java.time.Instant;
import java.util.UUID;

public record ChatMessageDto(
        UUID id,
        UUID senderId,
        String senderRole,
        String senderName,
        UUID recipientId,
        UUID incidentId,
        String message,
        boolean isRead,
        Instant timestamp
) {}
