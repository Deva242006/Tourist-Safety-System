package com.example.TouristSafety.repository;


import com.example.TouristSafety.entity.DigitalId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DigitalIdRepository extends JpaRepository<DigitalId, UUID> {
    List<DigitalId> findByTouristIdOrderByBlockIndexAsc(UUID touristId);
    Optional<DigitalId> findTopByOrderByBlockIndexDesc();
}
