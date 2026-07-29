package com.example.TouristSafety.controller;

import com.example.TouristSafety.dto.LocationCheckRequest;
import com.example.TouristSafety.dto.ZoneCheckResponse;
import com.example.TouristSafety.dto.ZoneRequest;
import com.example.TouristSafety.dto.ZoneResponse;
import com.example.TouristSafety.service.GeoFenceService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/zones")
public class ZoneController {

    private final GeoFenceService geoFenceService;

    public ZoneController(GeoFenceService geoFenceService) {
        this.geoFenceService = geoFenceService;
    }

    @GetMapping
    public List<ZoneResponse> listZones() {
        return geoFenceService.listZones();
    }

    @PostMapping
    public ResponseEntity<ZoneResponse> createZone(@Valid @RequestBody ZoneRequest req) {
        return ResponseEntity.ok(geoFenceService.createZone(req));
    }

    @PostMapping("/check")
    public ResponseEntity<ZoneCheckResponse> check(@Valid @RequestBody LocationCheckRequest req,
                                                   Authentication authentication) {
        UUID touristId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(geoFenceService.checkLocation(touristId, req.latitude(), req.longitude()));
    }
}