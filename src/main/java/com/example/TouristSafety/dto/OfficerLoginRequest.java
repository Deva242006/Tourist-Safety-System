package com.example.TouristSafety.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record OfficerLoginRequest(
        @NotBlank @Email String email,
        @NotBlank String password
) {}
