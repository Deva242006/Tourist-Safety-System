package com.example.TouristSafety.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "alerts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Alert {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private UUID touristId;

    private UUID zoneId;

    @Column(nullable = false)
    private String type; // SOS, GEOFENCE, ANOMALY

    @Column(nullable = false)
    private String severity; // LOW, MEDIUM, HIGH, CRITICAL

    private double latitude;
    private double longitude;

    private String message;

    @Column(nullable = false)
    private String status; // OPEN, ACKNOWLEDGED, RESOLVED

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
        if (this.status == null) this.status = "OPEN";
    }
}
