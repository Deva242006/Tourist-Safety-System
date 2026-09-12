package com.example.TouristSafety.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record OfficerRegisterRequest(
        @NotBlank String fullName,
        @NotBlank @Email String email,
        @NotBlank @Size(min = 6) String password,
        @NotBlank String badgeNumber,
        String station,
        String role   // "OFFICER" or "ADMIN"; defaults to "OFFICER" if blank
) {}
