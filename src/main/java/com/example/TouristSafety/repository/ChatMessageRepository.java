package com.example.TouristSafety.repository;

import com.example.TouristSafety.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, UUID> {
    List<ChatMessage> findByIncidentIdOrderByTimestampAsc(UUID incidentId);
    List<ChatMessage> findByRecipientIdAndIsReadFalse(UUID recipientId);
    long countByRecipientIdAndIncidentIdAndIsReadFalse(UUID recipientId, UUID incidentId);
}
