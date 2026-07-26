package com.example.TouristSafety.repository;


import com.example.TouristSafety.entity.Zone;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ZoneRepository extends JpaRepository<Zone, UUID> {
}
