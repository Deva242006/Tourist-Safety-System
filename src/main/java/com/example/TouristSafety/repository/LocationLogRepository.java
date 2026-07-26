package com.example.TouristSafety.repository;


import com.example.TouristSafety.entity.LocationLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface LocationLogRepository extends JpaRepository<LocationLog, UUID> {
    List<LocationLog> findTop50ByTouristIdOrderByRecordedAtDesc(UUID touristId);
}
