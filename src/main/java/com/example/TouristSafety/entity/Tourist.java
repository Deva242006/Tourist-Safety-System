package com.example.TouristSafety.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "tourists")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Tourist {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password; // BCrypt-hashed

    private String phone;

    @Column(nullable = false, unique = true)
    private String documentNumber; // passport or national ID number

    /** SHA-256 hash of KYC fields, used to seed the Digital ID hash-chain */
    private String kycHash;

    @Lob
    private String itineraryJson;

    private String emergencyContactName;
    private String emergencyContactPhone;

    private Instant tripStart;
    private Instant tripEnd;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
    }
}