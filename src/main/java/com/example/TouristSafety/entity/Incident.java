package com.example.TouristSafety.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "incidents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Incident {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private UUID alertId;

    @Column(nullable = false)
    private UUID touristId;

    private UUID officerId;

    @Lob
    private String description;

    @Column(nullable = false)
    private String status; // FILED, IN_PROGRESS, RESOLVED

    private String firNumber;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    private Instant resolvedAt;

    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
        if (this.status == null) this.status = "FILED";
    }
}
