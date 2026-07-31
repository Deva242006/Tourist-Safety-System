package com.example.TouristSafety.service;

import com.example.TouristSafety.dto.PointDto;
import com.example.TouristSafety.dto.ZoneCheckResponse;
import com.example.TouristSafety.dto.ZoneRequest;
import com.example.TouristSafety.dto.ZoneResponse;
import com.example.TouristSafety.entity.Alert;
import com.example.TouristSafety.entity.Zone;
import com.example.TouristSafety.repository.AlertRepository;
import com.example.TouristSafety.repository.ZoneRepository;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
public class GeoFenceService {

    private final ZoneRepository zoneRepository;
    private final AlertRepository alertRepository;
    private final ObjectMapper objectMapper;

    public GeoFenceService(ZoneRepository zoneRepository, AlertRepository alertRepository, ObjectMapper objectMapper) {
        this.zoneRepository = zoneRepository;
        this.alertRepository = alertRepository;
        this.objectMapper = objectMapper;
    }

    public ZoneResponse createZone(ZoneRequest req) {
        String polygonJson = writePolygon(req.polygon());

        Zone zone = Zone.builder()
                .name(req.name())
                .riskLevel(req.riskLevel())
                .description(req.description())
                .polygonGeoJson(polygonJson)
                .build();

        zone = zoneRepository.save(zone);
        return toResponse(zone);
    }

    public List<ZoneResponse> listZones() {
        List<ZoneResponse> result = new ArrayList<>();
        for (Zone zone : zoneRepository.findAll()) {
            result.add(toResponse(zone));
        }
        return result;
    }

    public ZoneCheckResponse checkLocation(UUID touristId, double latitude, double longitude) {
        List<ZoneCheckResponse.MatchedZone> matches = new ArrayList<>();

        for (Zone zone : zoneRepository.findAll()) {
            List<PointDto> polygon = readPolygon(zone.getPolygonGeoJson());
            if (isPointInPolygon(latitude, longitude, polygon)) {
                matches.add(new ZoneCheckResponse.MatchedZone(zone.getId(), zone.getName(), zone.getRiskLevel()));

                if (!"LOW".equalsIgnoreCase(zone.getRiskLevel()) && !hasRecentOpenAlert(touristId, zone.getId())) {
                    Alert alert = Alert.builder()
                            .touristId(touristId)
                            .zoneId(zone.getId())
                            .type("GEOFENCE")
                            .severity(zone.getRiskLevel())
                            .latitude(latitude)
                            .longitude(longitude)
                            .message("Entered risk zone: " + zone.getName())
                            .status("OPEN")
                            .build();
                    alertRepository.save(alert);
                }
            }
        }

        return new ZoneCheckResponse(!matches.isEmpty(), matches);
    }

    public boolean isPointInPolygon(double lat, double lng, List<PointDto> polygon) {
        boolean inside = false;
        int n = polygon.size();

        for (int i = 0, j = n - 1; i < n; j = i++) {
            double latI = polygon.get(i).lat();
            double lngI = polygon.get(i).lng();
            double latJ = polygon.get(j).lat();
            double lngJ = polygon.get(j).lng();

            boolean edgeCrosses = ((lngI > lng) != (lngJ > lng))
                    && (lat < (latJ - latI) * (lng - lngI) / (lngJ - lngI) + latI);

            if (edgeCrosses) {
                inside = !inside;
            }
        }
        return inside;
    }

    private ZoneResponse toResponse(Zone zone) {
        return new ZoneResponse(
                zone.getId(), zone.getName(), zone.getRiskLevel(),
                zone.getDescription(), readPolygon(zone.getPolygonGeoJson()));
    }

    private String writePolygon(List<PointDto> polygon) {
        try {
            return objectMapper.writeValueAsString(polygon);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to serialize polygon", e);
        }
    }

    private List<PointDto> readPolygon(String json) {
        try {
            return objectMapper.readValue(json, new TypeReference<List<PointDto>>() {});
        } catch (Exception e) {
            throw new IllegalStateException("Failed to parse stored polygon", e);
        }
    }
    private boolean hasRecentOpenAlert(UUID touristId, UUID zoneId) {
        Instant cutoff = Instant.now().minus(5, ChronoUnit.MINUTES);
        return alertRepository.findByTouristIdOrderByCreatedAtDesc(touristId).stream()
                .anyMatch(a -> zoneId.equals(a.getZoneId())
                        && "OPEN".equals(a.getStatus())
                        && a.getCreatedAt().isAfter(cutoff));
    }
}