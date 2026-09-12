package com.example.TouristSafety.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record ChatSendMessage(
        @NotNull UUID incidentId,
        @NotBlank String message,
        @NotBlank String senderRole  // "TOURIST" or "OFFICER"
) {}
