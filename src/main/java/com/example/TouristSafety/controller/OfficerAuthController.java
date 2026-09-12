package com.example.TouristSafety.controller;

import com.example.TouristSafety.dto.OfficerAuthResponse;
import com.example.TouristSafety.dto.OfficerLoginRequest;
import com.example.TouristSafety.dto.OfficerRegisterRequest;
import com.example.TouristSafety.entity.Officer;
import com.example.TouristSafety.repository.OfficerRepository;
import com.example.TouristSafety.security.JwtService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/officer/auth")
public class OfficerAuthController {

    private final OfficerRepository officerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public OfficerAuthController(OfficerRepository officerRepository,
                                  PasswordEncoder passwordEncoder,
                                  JwtService jwtService) {
        this.officerRepository = officerRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody OfficerRegisterRequest req) {
        if (officerRepository.findByEmail(req.email()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already registered"));
        }

        String role = (req.role() != null && !req.role().isBlank()) ? req.role().toUpperCase() : "OFFICER";

        Officer officer = Officer.builder()
                .fullName(req.fullName())
                .email(req.email())
                .passwordHash(passwordEncoder.encode(req.password()))
                .badgeNumber(req.badgeNumber())
                .station(req.station())
                .role(role)
                .build();

        officer = officerRepository.save(officer);
        String token = jwtService.generateToken(officer.getId(), officer.getEmail(), role);

        return ResponseEntity.status(HttpStatus.CREATED).body(
                new OfficerAuthResponse(token, officer.getId(), officer.getFullName(),
                        officer.getEmail(), officer.getBadgeNumber(),
                        officer.getStation(), officer.getRole(), 86_400_000L));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody OfficerLoginRequest req) {
        var officerOpt = officerRepository.findByEmail(req.email());
        if (officerOpt.isEmpty() || !passwordEncoder.matches(req.password(), officerOpt.get().getPasswordHash())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid email or password"));
        }

        Officer officer = officerOpt.get();
        String token = jwtService.generateToken(officer.getId(), officer.getEmail(), officer.getRole());

        return ResponseEntity.ok(
                new OfficerAuthResponse(token, officer.getId(), officer.getFullName(),
                        officer.getEmail(), officer.getBadgeNumber(),
                        officer.getStation(), officer.getRole(), 86_400_000L));
    }
}
