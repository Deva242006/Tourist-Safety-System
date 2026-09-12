package com.example.TouristSafety.dto;

import lombok.Data;

@Data
public class UpdateContactRequest {
    private String emergencyContactName;
    private String emergencyContactPhone;
}
