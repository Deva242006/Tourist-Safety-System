package com.example.TouristSafety.controller;


import com.example.TouristSafety.entity.DigitalId;
import com.example.TouristSafety.dto.*;
import com.example.TouristSafety.repository.DigitalIdRepository;
import com.example.TouristSafety.service.HashChainService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/digital-id")
public class DigitalIdController {

    private final DigitalIdRepository digitalIdRepository;
    private final HashChainService hashChainService;

    public DigitalIdController(DigitalIdRepository digitalIdRepository, HashChainService hashChainService) {
        this.digitalIdRepository = digitalIdRepository;
        this.hashChainService = hashChainService;
    }

    /** The logged-in tourist's own latest Digital ID block (for the ID card view). */
    @GetMapping("/me")
    public ResponseEntity<?> getMyDigitalId(Authentication authentication) {
        UUID touristId = UUID.fromString(authentication.getName());
        List<DigitalId> chain = digitalIdRepository.findByTouristIdOrderByBlockIndexAsc(touristId);

        if (chain.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        DigitalId latest = chain.get(chain.size() - 1);
        return ResponseEntity.ok(toResponse(latest));
    }

    /** Recomputes the whole chain to prove (or disprove) it hasn't been tampered with. */
    @GetMapping("/verify/{touristId}")
    public ResponseEntity<VerifyResponse> verify(@PathVariable UUID touristId) {
        List<DigitalId> chain = digitalIdRepository.findByTouristIdOrderByBlockIndexAsc(touristId);

        if (chain.isEmpty()) {
            return ResponseEntity.ok(new VerifyResponse(false, 0, "No Digital ID found for this tourist"));
        }

        boolean intact = hashChainService.verifyChainIntegrity(chain);
        String message = intact
                ? "Digital ID is intact and has not been tampered with"
                : "Integrity check FAILED -- chain has been altered or corrupted";

        return ResponseEntity.ok(new VerifyResponse(intact, chain.size(), message));
    }

    private DigitalIdResponse toResponse(DigitalId d) {
        return new DigitalIdResponse(
                d.getId(), d.getTouristId(), d.getBlockIndex(), d.getPrevHash(),
                d.getCurrentHash(), d.getIssuedAt(), d.getValidUntil(), d.isValid());
    }
}
