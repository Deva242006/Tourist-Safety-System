package com.example.TouristSafety.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "chat_messages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessage {

    @Id
    @GeneratedValue
    private UUID id;

    /** The UUID of the sender (touristId or officerId) */
    @Column(nullable = false)
    private UUID senderId;

    /** "TOURIST" or "OFFICER" */
    @Column(nullable = false)
    private String senderRole;

    /** The UUID of the recipient (touristId or officerId) */
    @Column(nullable = false)
    private UUID recipientId;

    /** Incident this chat belongs to */
    @Column(nullable = false)
    private UUID incidentId;

    @Lob
    @Column(nullable = false)
    private String message;

    @Column(nullable = false)
    private boolean isRead;

    @Column(nullable = false, updatable = false)
    private Instant timestamp;

    @PrePersist
    void onCreate() {
        this.timestamp = Instant.now();
        this.isRead = false;
    }
}
