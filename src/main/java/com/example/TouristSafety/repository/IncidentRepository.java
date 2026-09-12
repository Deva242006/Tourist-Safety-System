package com.example.TouristSafety.repository;


import com.example.TouristSafety.entity.Incident;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface IncidentRepository extends JpaRepository<Incident, UUID> {
    List<Incident> findByTouristIdOrderByCreatedAtDesc(UUID touristId);
}
