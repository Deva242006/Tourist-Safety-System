package com.example.TouristSafety.service;

import com.example.TouristSafety.dto.DigitalIdResponse;
import com.example.TouristSafety.dto.TouristDetailResponse;
import com.example.TouristSafety.dto.TouristSummaryResponse;
import com.example.TouristSafety.entity.DigitalId;
import com.example.TouristSafety.entity.Tourist;
import com.example.TouristSafety.repository.DigitalIdRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TouristProfileService {

    private final DigitalIdRepository digitalIdRepository;

    public TouristProfileService(DigitalIdRepository digitalIdRepository) {
        this.digitalIdRepository = digitalIdRepository;
    }

    public TouristSummaryResponse toSummary(Tourist t) {
        return new TouristSummaryResponse(
                t.getId(), t.getFullName(), t.getEmail(), t.getPhone(),
                t.getDocumentNumber(), t.getTripStart(), t.getTripEnd(), t.getCreatedAt());
    }

    public TouristDetailResponse toDetail(Tourist t) {
        List<DigitalId> chain = digitalIdRepository.findByTouristIdOrderByBlockIndexAsc(t.getId());
        DigitalIdResponse digitalId = chain.isEmpty() ? null : toDigitalIdResponse(chain.get(chain.size() - 1));

        return new TouristDetailResponse(
                t.getId(), t.getFullName(), t.getEmail(), t.getPhone(), t.getDocumentNumber(),
                t.getEmergencyContactName(), t.getEmergencyContactPhone(),
                t.getTripStart(), t.getTripEnd(), digitalId);
    }

    private DigitalIdResponse toDigitalIdResponse(DigitalId d) {
        return new DigitalIdResponse(
                d.getId(), d.getTouristId(), d.getBlockIndex(), d.getPrevHash(),
                d.getCurrentHash(), d.getIssuedAt(), d.getValidUntil(), d.isValid());
    }
}