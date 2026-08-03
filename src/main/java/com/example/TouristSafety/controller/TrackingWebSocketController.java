package com.example.TouristSafety.controller;

import com.example.TouristSafety.dto.AlertBroadcast;
import com.example.TouristSafety.dto.LocationBroadcast;
import com.example.TouristSafety.dto.LocationUpdateMessage;
import com.example.TouristSafety.dto.SosMessage;
import com.example.TouristSafety.dto.ZoneCheckResponse;
import com.example.TouristSafety.entity.Alert;
import com.example.TouristSafety.entity.LocationLog;
import com.example.TouristSafety.repository.AlertRepository;
import com.example.TouristSafety.repository.LocationLogRepository;
import com.example.TouristSafety.service.AnomalyDetectionService;
import com.example.TouristSafety.service.GeoFenceService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.time.Instant;

@Controller
public class TrackingWebSocketController {

    private final LocationLogRepository locationLogRepository;
    private final AlertRepository alertRepository;
    private final GeoFenceService geoFenceService;
    private final AnomalyDetectionService anomalyDetectionService;
    private final SimpMessagingTemplate messagingTemplate;

    public TrackingWebSocketController(LocationLogRepository locationLogRepository,
                                       AlertRepository alertRepository,
                                       GeoFenceService geoFenceService,
                                       AnomalyDetectionService anomalyDetectionService,
                                       SimpMessagingTemplate messagingTemplate) {
        this.locationLogRepository = locationLogRepository;
        this.alertRepository = alertRepository;
        this.geoFenceService = geoFenceService;
        this.anomalyDetectionService = anomalyDetectionService;
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/location.update")
    public void updateLocation(LocationUpdateMessage msg) {
        Instant now = Instant.now();

        LocationLog log = LocationLog.builder()
                .touristId(msg.touristId())
                .latitude(msg.latitude())
                .longitude(msg.longitude())
                .recordedAt(now)
                .build();
        locationLogRepository.save(log);

        messagingTemplate.convertAndSend(
                "/topic/tracking",
                new LocationBroadcast(msg.touristId(), msg.latitude(), msg.longitude(), now));

        ZoneCheckResponse zoneCheck = geoFenceService.checkLocation(msg.touristId(), msg.latitude(), msg.longitude());
        if (zoneCheck.insideAnyZone()) {
            for (var match : zoneCheck.matchedZones()) {
                if (!"LOW".equalsIgnoreCase(match.riskLevel())) {
                    boolean isHighRisk = "HIGH".equalsIgnoreCase(match.riskLevel());
                    String severity = isHighRisk ? "CRITICAL" : match.riskLevel();
                    String message = isHighRisk
                            ? "AUTOMATIC ALERT: Entered HIGH risk zone \"" + match.zoneName() + "\" -- immediate attention required"
                            : "Entered risk zone: " + match.zoneName();

                    messagingTemplate.convertAndSend("/topic/alerts", new AlertBroadcast(
                            null, msg.touristId(), "GEOFENCE", severity, message,
                            msg.latitude(), msg.longitude(), "OPEN", now));
                }
            }
        }

        anomalyDetectionService.checkRouteDeviation(msg.touristId(), msg.latitude(), msg.longitude(), now);
    }

    @MessageMapping("/sos")
    public void sos(SosMessage msg) {
        Alert alert = Alert.builder()
                .touristId(msg.touristId())
                .type("SOS")
                .severity("CRITICAL")
                .latitude(msg.latitude())
                .longitude(msg.longitude())
                .message(msg.message() != null && !msg.message().isBlank() ? msg.message() : "SOS triggered")
                .status("OPEN")
                .build();
        alert = alertRepository.save(alert);

        messagingTemplate.convertAndSend("/topic/alerts", new AlertBroadcast(
                alert.getId(), alert.getTouristId(), alert.getType(), alert.getSeverity(),
                alert.getMessage(), alert.getLatitude(), alert.getLongitude(),
                alert.getStatus(), alert.getCreatedAt()));
    }
}