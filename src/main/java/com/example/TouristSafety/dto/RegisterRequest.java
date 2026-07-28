package com.example.TouristSafety.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.Instant;

public record RegisterRequest(
        @NotBlank String fullName,
        @NotBlank @Email String email,
        @NotBlank @Size(min = 6, message = "Password must be at least 6 characters") String password,
        String phone,
        @NotBlank String documentNumber,
        String itinerary,
        String emergencyContactName,
        String emergencyContactPhone,
        Instant tripStart,
        Instant tripEnd
) {}
