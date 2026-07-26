package com.example.TouristSafety.repository;


import com.example.TouristSafety.entity.Officer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface OfficerRepository extends JpaRepository<Officer, UUID> {
    Optional<Officer> findByEmail(String email);
}
