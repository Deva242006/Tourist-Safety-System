package com.example.TouristSafety.controller;


import com.example.TouristSafety.dto.AuthResponse;
import com.example.TouristSafety.dto.LoginRequest;
import com.example.TouristSafety.dto.RegisterRequest;
import com.example.TouristSafety.entity.Tourist;
import com.example.TouristSafety.repository.TouristRepository;
import com.example.TouristSafety.security.JwtService;
import com.example.TouristSafety.service.TouristService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final TouristService touristService;
    private final TouristRepository touristRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(TouristService touristService,
                           TouristRepository touristRepository,
                           PasswordEncoder passwordEncoder,
                           JwtService jwtService) {
        this.touristService = touristService;
        this.touristRepository = touristRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
        try {

            System.out.println("hey");
            var result = touristService.register(req);
            Tourist tourist = result.tourist();
            String token = jwtService.generateToken(tourist.getId(), tourist.getEmail());

            return ResponseEntity.status(HttpStatus.CREATED).body(
                    new AuthResponse(token, tourist.getId(), tourist.getFullName(), tourist.getEmail(), 86_400_000L));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
        var touristOpt = touristRepository.findByEmail(req.email());

        if (touristOpt.isEmpty() || !passwordEncoder.matches(req.password(), touristOpt.get().getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid email or password"));
        }

        Tourist tourist = touristOpt.get();
        String token = jwtService.generateToken(tourist.getId(), tourist.getEmail());

        return ResponseEntity.ok(
                new AuthResponse(token, tourist.getId(), tourist.getFullName(), tourist.getEmail(), 86_400_000L));
    }
}
