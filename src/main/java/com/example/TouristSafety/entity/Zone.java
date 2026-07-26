package com.example.TouristSafety.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * Day 1: polygon stored as raw GeoJSON text so the project compiles/runs
 * without PostGIS installed yet. Day 3 upgrades this column to a native
 * PostGIS `geometry(Polygon,4326)` type + spatial queries (ST_Contains/ST_DWithin).
 */
@Entity
@Table(name = "zones")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Zone {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String riskLevel; // LOW, MEDIUM, HIGH

    @Lob
    private String polygonGeoJson;

    private String description;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
    }
}
