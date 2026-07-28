package com.example.TouristSafety.service;


import com.example.TouristSafety.dto.RegisterRequest;
import com.example.TouristSafety.entity.DigitalId;
import com.example.TouristSafety.entity.Tourist;
import com.example.TouristSafety.repository.TouristRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
public class TouristService {

    private final TouristRepository touristRepository;
    private final PasswordEncoder passwordEncoder;
    private final HashChainService hashChainService;

    public TouristService(TouristRepository touristRepository,
                           PasswordEncoder passwordEncoder,
                           HashChainService hashChainService) {
        this.touristRepository = touristRepository;
        this.passwordEncoder = passwordEncoder;
        this.hashChainService = hashChainService;
    }

    public record RegistrationResult(Tourist tourist, DigitalId digitalId) {}

    @Transactional
    public RegistrationResult register(RegisterRequest req) {
        if (touristRepository.findByEmail(req.email()).isPresent()) {
            throw new IllegalArgumentException("Email already registered");
        }
        if (touristRepository.findByDocumentNumber(req.documentNumber()).isPresent()) {
            throw new IllegalArgumentException("Document number already registered");
        }

        String kycHash = hashChainService.computeKycHash(
                req.fullName(), req.email(), req.documentNumber(), req.phone());

        Tourist tourist = Tourist.builder()
                .fullName(req.fullName())
                .email(req.email())
                .password(passwordEncoder.encode(req.password()))
                .phone(req.phone())
                .documentNumber(req.documentNumber())
                .kycHash(kycHash)
                .itineraryJson(req.itinerary())
                .emergencyContactName(req.emergencyContactName())
                .emergencyContactPhone(req.emergencyContactPhone())
                .tripStart(req.tripStart())
                .tripEnd(req.tripEnd())
                .build();

        tourist = touristRepository.save(tourist);

        Instant validUntil = req.tripEnd() != null ? req.tripEnd() : Instant.now().plus(30, ChronoUnit.DAYS);
        DigitalId digitalId = hashChainService.issueDigitalId(tourist.getId(), kycHash, validUntil);

        return new RegistrationResult(tourist, digitalId);
    }
}
