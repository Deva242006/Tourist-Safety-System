package com.example.TouristSafety.service;

import com.example.TouristSafety.dto.ChatMessageDto;
import com.example.TouristSafety.entity.ChatMessage;
import com.example.TouristSafety.entity.Officer;
import com.example.TouristSafety.entity.Tourist;
import com.example.TouristSafety.repository.ChatMessageRepository;
import com.example.TouristSafety.repository.IncidentRepository;
import com.example.TouristSafety.repository.OfficerRepository;
import com.example.TouristSafety.repository.TouristRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final TouristRepository touristRepository;
    private final OfficerRepository officerRepository;
    private final IncidentRepository incidentRepository;

    public ChatService(ChatMessageRepository chatMessageRepository,
                       TouristRepository touristRepository,
                       OfficerRepository officerRepository,
                       IncidentRepository incidentRepository) {
        this.chatMessageRepository = chatMessageRepository;
        this.touristRepository = touristRepository;
        this.officerRepository = officerRepository;
        this.incidentRepository = incidentRepository;
    }

    @Transactional
    public ChatMessageDto sendMessage(UUID senderId, String senderRole,
                                      UUID recipientId, UUID incidentId, String message) {
        ChatMessage chat = ChatMessage.builder()
                .senderId(senderId)
                .senderRole(senderRole)
                .recipientId(recipientId)
                .incidentId(incidentId)
                .message(message)
                .build();
        chat = chatMessageRepository.save(chat);
        return toDto(chat);
    }

    public List<ChatMessageDto> getHistory(UUID incidentId) {
        return chatMessageRepository.findByIncidentIdOrderByTimestampAsc(incidentId)
                .stream().map(this::toDto).toList();
    }

    @Transactional
    public void markRead(UUID recipientId, UUID incidentId) {
        List<ChatMessage> unread = chatMessageRepository.findByIncidentIdOrderByTimestampAsc(incidentId)
                .stream()
                .filter(m -> m.getRecipientId().equals(recipientId) && !m.isRead())
                .toList();
        unread.forEach(m -> m.setRead(true));
        chatMessageRepository.saveAll(unread);
    }

    public long countUnread(UUID recipientId, UUID incidentId) {
        return chatMessageRepository.countByRecipientIdAndIncidentIdAndIsReadFalse(recipientId, incidentId);
    }

    private ChatMessageDto toDto(ChatMessage m) {
        String senderName = resolveName(m.getSenderId(), m.getSenderRole());
        return new ChatMessageDto(
                m.getId(), m.getSenderId(), m.getSenderRole(), senderName,
                m.getRecipientId(), m.getIncidentId(),
                m.getMessage(), m.isRead(), m.getTimestamp()
        );
    }

    private String resolveName(UUID id, String role) {
        if ("TOURIST".equalsIgnoreCase(role)) {
            return touristRepository.findById(id).map(Tourist::getFullName).orElse("Tourist");
        } else {
            return officerRepository.findById(id).map(Officer::getFullName).orElse("Officer");
        }
    }
}
