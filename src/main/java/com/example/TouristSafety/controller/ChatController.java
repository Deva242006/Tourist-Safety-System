package com.example.TouristSafety.controller;

import com.example.TouristSafety.dto.ChatMessageDto;
import com.example.TouristSafety.dto.ChatSendMessage;
import com.example.TouristSafety.entity.Incident;
import com.example.TouristSafety.repository.IncidentRepository;
import com.example.TouristSafety.service.ChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.UUID;

@Controller
@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;
    private final IncidentRepository incidentRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatController(ChatService chatService,
                          IncidentRepository incidentRepository,
                          SimpMessagingTemplate messagingTemplate) {
        this.chatService = chatService;
        this.incidentRepository = incidentRepository;
        this.messagingTemplate = messagingTemplate;
    }

    /** REST: Get full chat history for an incident */
    @GetMapping("/{incidentId}/history")
    public ResponseEntity<List<ChatMessageDto>> getHistory(@PathVariable UUID incidentId) {
        return ResponseEntity.ok(chatService.getHistory(incidentId));
    }

    /** REST: Mark all messages in an incident as read for the authenticated user */
    @PatchMapping("/{incidentId}/read")
    public ResponseEntity<Map<String, String>> markRead(@PathVariable UUID incidentId,
                                                         Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        chatService.markRead(userId, incidentId);
        return ResponseEntity.ok(Map.of("status", "ok"));
    }

    /** REST: Get unread count for a user in an incident */
    @GetMapping("/{incidentId}/unread")
    public ResponseEntity<Map<String, Long>> getUnread(@PathVariable UUID incidentId,
                                                        Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        long count = chatService.countUnread(userId, incidentId);
        return ResponseEntity.ok(Map.of("unread", count));
    }

    /**
     * WebSocket: Receive a chat message from tourist or officer.
     * Client publishes to /app/chat.send
     * Server broadcasts to /topic/chat/{incidentId}
     */
    @MessageMapping("/chat.send")
    public void receiveMessage(ChatSendMessage msg, Authentication authentication) {
        if (authentication == null) return;
        UUID senderId = UUID.fromString(authentication.getName());

        Incident incident = incidentRepository.findById(msg.incidentId()).orElse(null);
        if (incident == null) return;

        // Determine recipient: if sender is tourist, recipient is assigned officer, and vice versa
        UUID recipientId;
        if ("TOURIST".equalsIgnoreCase(msg.senderRole())) {
            recipientId = incident.getOfficerId() != null ? incident.getOfficerId() : senderId;
        } else {
            recipientId = incident.getTouristId();
        }

        ChatMessageDto saved = chatService.sendMessage(
                senderId, msg.senderRole(), recipientId, msg.incidentId(), msg.message());

        // Broadcast to both parties via incident-scoped topic
        messagingTemplate.convertAndSend("/topic/chat/" + msg.incidentId(), saved);
    }
}
