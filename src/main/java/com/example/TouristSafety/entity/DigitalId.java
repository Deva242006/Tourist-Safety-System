package com.example.TouristSafety.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * A single block in the tamper-evident hash-chain used to represent
 * a tourist's Digital ID. currentHash = SHA256(prevHash + kycHash + issuedAt + blockIndex).
 * Chain integrity is verified by recomputing hashes and comparing prevHash links.
 */
@Entity
@Table(name = "digital_ids")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DigitalId {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private UUID touristId;

    @Column(nullable = false)
    private String kycHash;

    @Column(nullable = false)
    private String prevHash;

    @Column(nullable = false, unique = true)
    private String currentHash;

    @Column(nullable = false)
    private int blockIndex;

    @Column(nullable = false)
    private Instant issuedAt;

    @Column(nullable = false)
    private Instant validUntil;

    @Column(nullable = false)
    private boolean isValid;
}
