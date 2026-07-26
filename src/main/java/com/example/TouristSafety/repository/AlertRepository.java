package com.example.TouristSafety.repository;

import com.example.TouristSafety.entity.Alert;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AlertRepository extends JpaRepository<Alert, UUID> {
    List<Alert> findByTouristIdOrderByCreatedAtDesc(UUID touristId);
    List<Alert> findByStatus(String status);
}
