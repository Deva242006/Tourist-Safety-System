package com.example.TouristSafety.controller;


import com.example.TouristSafety.entity.Tourist;
import com.example.TouristSafety.repository.TouristRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Day 1 placeholder: read-only list endpoint to prove the JPA + Postgres
 * connection works end-to-end. Registration/KYC logic + JWT arrive Day 2.
 */

@RestController
@RequestMapping("/api/tourists")
@RequiredArgsConstructor
public class TouristController {

    private final TouristRepository touristRepository;

    @GetMapping
    public List<Tourist> listAll() {
        return touristRepository.findAll();
    }
}
