package com.example.TouristSafety.repository;

import com.example.TouristSafety.entity.TravelGroup;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface TravelGroupRepository extends JpaRepository<TravelGroup, UUID> {
    List<TravelGroup> findByLeaderId(UUID leaderId);
}
