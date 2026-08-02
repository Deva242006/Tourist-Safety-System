package com.example.TouristSafety.service;

import com.example.TouristSafety.dto.*;
import com.example.TouristSafety.entity.Alert;
import com.example.TouristSafety.entity.Incident;
import com.example.TouristSafety.entity.Tourist;
import com.example.TouristSafety.repository.AlertRepository;
import com.example.TouristSafety.repository.IncidentRepository;
import com.example.TouristSafety.repository.TouristRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.time.ZoneOffset;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
public class IncidentService {

    private static final DateTimeFormatter FIR_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyyMMdd").withZone(ZoneOffset.UTC);

    private final IncidentRepository incidentRepository;
    private final AlertRepository alertRepository;
    private final TouristRepository touristRepository;
    private final TouristProfileService touristProfileService;

    public IncidentService(IncidentRepository incidentRepository,
                           AlertRepository alertRepository,
                           TouristRepository touristRepository,
                           TouristProfileService touristProfileService) {
        this.incidentRepository = incidentRepository;
        this.alertRepository = alertRepository;
        this.touristRepository = touristRepository;
        this.touristProfileService = touristProfileService;
    }

    @Transactional
    public IncidentResponse fileIncident(IncidentRequest req) {
        Alert alert = alertRepository.findById(req.alertId())
                .orElseThrow(() -> new NoSuchElementException("Alert not found: " + req.alertId()));

        Tourist tourist = touristRepository.findById(alert.getTouristId())
                .orElseThrow(() -> new NoSuchElementException("Tourist not found for this alert"));

        String firNumber = "FIR-" + FIR_DATE_FORMAT.format(Instant.now()) + "-" + shortId();

        Incident incident = Incident.builder()
                .alertId(alert.getId())
                .touristId(tourist.getId())
                .description(req.description())
                .status("FILED")
                .firNumber(firNumber)
                .build();

        incident = incidentRepository.save(incident);

        alert.setStatus("ACKNOWLEDGED");
        alertRepository.save(alert);

        return toResponse(incident, tourist.getFullName());
    }

    public List<IncidentResponse> listIncidents() {
        return incidentRepository.findAll().stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(i -> toResponse(i, resolveTouristName(i.getTouristId())))
                .toList();
    }

    public IncidentDetailResponse getDetail(UUID incidentId) {
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new NoSuchElementException("Incident not found: " + incidentId));

        Tourist tourist = touristRepository.findById(incident.getTouristId())
                .orElseThrow(() -> new NoSuchElementException("Tourist not found for this incident"));

        AlertSummary alertSummary = alertRepository.findById(incident.getAlertId())
                .map(a -> new AlertSummary(a.getId(), a.getType(), a.getSeverity(), a.getMessage(),
                        a.getLatitude(), a.getLongitude(), a.getStatus(), a.getCreatedAt()))
                .orElse(null);

        IncidentResponse incidentResponse = toResponse(incident, tourist.getFullName());
        TouristDetailResponse touristDetail = touristProfileService.toDetail(tourist);

        return new IncidentDetailResponse(incidentResponse, touristDetail, alertSummary);
    }

    @Transactional
    public IncidentResponse updateStatus(UUID incidentId, String status) {
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new NoSuchElementException("Incident not found: " + incidentId));

        incident.setStatus(status);
        if ("RESOLVED".equalsIgnoreCase(status)) {
            incident.setResolvedAt(Instant.now());
        }
        incident = incidentRepository.save(incident);

        return toResponse(incident, resolveTouristName(incident.getTouristId()));
    }

    private String resolveTouristName(UUID touristId) {
        return touristRepository.findById(touristId).map(Tourist::getFullName).orElse("Unknown");
    }

    private IncidentResponse toResponse(Incident i, String touristName) {
        return new IncidentResponse(
                i.getId(), i.getAlertId(), i.getTouristId(), touristName,
                i.getDescription(), i.getStatus(), i.getFirNumber(), i.getCreatedAt(), i.getResolvedAt());
    }

    private String shortId() {
        return UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}