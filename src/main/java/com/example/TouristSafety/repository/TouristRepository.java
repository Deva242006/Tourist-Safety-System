package com.example.TouristSafety.repository;


import com.example.TouristSafety.entity.Tourist;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface TouristRepository extends JpaRepository<Tourist, UUID> {
    Optional<Tourist> findByEmail(String email);
    Optional<Tourist> findByDocumentNumber(String documentNumber);
}
