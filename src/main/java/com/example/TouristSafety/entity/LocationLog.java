package com.example.TouristSafety.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "location_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LocationLog {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private UUID touristId;

    @Column(nullable = false)
    private double latitude;

    @Column(nullable = false)
    private double longitude;

    @Column(nullable = false)
    private Instant recordedAt;

    @PrePersist
    void onCreate() {
        if (this.recordedAt == null) this.recordedAt = Instant.now();
    }
}
