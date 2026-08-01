package com.example.TouristSafety.service;

import com.example.TouristSafety.dto.SafetyScoreResponse;
import com.example.TouristSafety.entity.Alert;
import com.example.TouristSafety.entity.LocationLog;
import com.example.TouristSafety.entity.Tourist;
import com.example.TouristSafety.repository.AlertRepository;
import com.example.TouristSafety.repository.LocationLogRepository;
import com.example.TouristSafety.repository.TouristRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class AnomalyDetectionService {

    private static final Logger log = LoggerFactory.getLogger(AnomalyDetectionService.class);

    private static final double IMPLAUSIBLE_SPEED_KMH = 150.0;
    private static final int INACTIVITY_THRESHOLD_MINUTES = 30;
    private static final int ALERT_DEDUPE_WINDOW_MINUTES = 15;

    private final LocationLogRepository locationLogRepository;
    private final AlertRepository alertRepository;
    private final TouristRepository touristRepository;

    public AnomalyDetectionService(LocationLogRepository locationLogRepository,
                                   AlertRepository alertRepository,
                                   TouristRepository touristRepository) {
        this.locationLogRepository = locationLogRepository;
        this.alertRepository = alertRepository;
        this.touristRepository = touristRepository;
    }

    public void checkRouteDeviation(UUID touristId, double latitude, double longitude, Instant now) {
        List<LocationLog> recent = locationLogRepository.findTop50ByTouristIdOrderByRecordedAtDesc(touristId);
        if (recent.size() < 2) return;

        LocationLog previous = recent.get(1);
        double distanceKm = haversineKm(previous.getLatitude(), previous.getLongitude(), latitude, longitude);
        double hoursElapsed = ChronoUnit.MILLIS.between(previous.getRecordedAt(), now) / 3_600_000.0;
        if (hoursElapsed <= 0) return;

        double speedKmh = distanceKm / hoursElapsed;

        if (speedKmh > IMPLAUSIBLE_SPEED_KMH && !hasRecentAlert(touristId, "ROUTE_DEVIATION")) {
            createAlert(touristId, "ROUTE_DEVIATION", "HIGH", latitude, longitude,
                    String.format("Unusual movement detected: %.1f km in %.1f minutes (~%.0f km/h)",
                            distanceKm, hoursElapsed * 60, speedKmh));
        }
    }

    @Scheduled(fixedDelay = 300_000)
    public void scanForInactiveTourists() {
        Instant cutoff = Instant.now().minus(INACTIVITY_THRESHOLD_MINUTES, ChronoUnit.MINUTES);

        for (Tourist tourist : touristRepository.findAll()) {
            Optional<LocationLog> lastLog = locationLogRepository.findTopByTouristIdOrderByRecordedAtDesc(tourist.getId());
            if (lastLog.isEmpty()) continue;

            if (lastLog.get().getRecordedAt().isBefore(cutoff) && !hasRecentAlert(tourist.getId(), "INACTIVITY")) {
                createAlert(tourist.getId(), "INACTIVITY", "MEDIUM",
                        lastLog.get().getLatitude(), lastLog.get().getLongitude(),
                        String.format("No location update for over %d minutes", INACTIVITY_THRESHOLD_MINUTES));
                log.info("Inactivity alert created for tourist {}", tourist.getId());
            }
        }
    }

    public SafetyScoreResponse computeSafetyScore(UUID touristId) {
        Instant window = Instant.now().minus(24, ChronoUnit.HOURS);
        List<Alert> recentAlerts = alertRepository.findByTouristIdOrderByCreatedAtDesc(touristId).stream()
                .filter(a -> a.getCreatedAt().isAfter(window))
                .filter(a -> "OPEN".equals(a.getStatus()))
                .toList();

        int score = 100;
        List<String> factors = new ArrayList<>();

        for (Alert alert : recentAlerts) {
            int penalty = switch (alert.getSeverity() == null ? "" : alert.getSeverity().toUpperCase()) {
                case "CRITICAL" -> 35;
                case "HIGH" -> 20;
                case "MEDIUM" -> 10;
                default -> 5;
            };
            score -= penalty;
            factors.add(describeAlert(alert));
        }

        score = Math.max(0, Math.min(100, score));

        String level;
        if (score >= 80) level = "SAFE";
        else if (score >= 55) level = "CAUTION";
        else if (score >= 30) level = "AT_RISK";
        else level = "CRITICAL";

        if (factors.isEmpty()) {
            factors.add("No recent alerts");
        }

        return new SafetyScoreResponse(score, level, factors);
    }

    private String describeAlert(Alert alert) {
        return switch (alert.getType()) {
            case "SOS" -> "Recent SOS triggered";
            case "GEOFENCE" -> "Entered a " + alert.getSeverity() + " risk zone";
            case "ROUTE_DEVIATION" -> "Unusual movement pattern detected";
            case "INACTIVITY" -> "Extended period without location update";
            default -> alert.getMessage();
        };
    }

    private boolean hasRecentAlert(UUID touristId, String type) {
        Instant cutoff = Instant.now().minus(ALERT_DEDUPE_WINDOW_MINUTES, ChronoUnit.MINUTES);
        return alertRepository.findByTouristIdOrderByCreatedAtDesc(touristId).stream()
                .anyMatch(a -> type.equals(a.getType()) && a.getCreatedAt().isAfter(cutoff));
    }

    private void createAlert(UUID touristId, String type, String severity, double lat, double lng, String message) {
        Alert alert = Alert.builder()
                .touristId(touristId)
                .type(type)
                .severity(severity)
                .latitude(lat)
                .longitude(lng)
                .message(message)
                .status("OPEN")
                .build();
        alertRepository.save(alert);
    }

    private double haversineKm(double lat1, double lng1, double lat2, double lng2) {
        double R = 6371.0;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}