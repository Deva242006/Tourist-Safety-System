package com.example.TouristSafety.service;

import com.example.TouristSafety.entity.DigitalId;
import com.example.TouristSafety.repository.DigitalIdRepository;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class HashChainService {

    private static final String GENESIS_PREV_HASH = "0".repeat(64);

    private final DigitalIdRepository digitalIdRepository;

    public HashChainService(DigitalIdRepository digitalIdRepository) {
        this.digitalIdRepository = digitalIdRepository;
    }

    public DigitalId issueDigitalId(UUID touristId, String kycHash, Instant validUntil) {
        List<DigitalId> existing = digitalIdRepository.findByTouristIdOrderByBlockIndexAsc(touristId);

        int nextIndex = existing.isEmpty() ? 0 : existing.get(existing.size() - 1).getBlockIndex() + 1;
        String prevHash = existing.isEmpty() ? GENESIS_PREV_HASH : existing.get(existing.size() - 1).getCurrentHash();

        Instant issuedAt = Instant.now();
        String currentHash = computeBlockHash(touristId, prevHash, kycHash, issuedAt, nextIndex);

        DigitalId block = DigitalId.builder()
                .touristId(touristId)
                .kycHash(kycHash)
                .prevHash(prevHash)
                .currentHash(currentHash)
                .blockIndex(nextIndex)
                .issuedAt(issuedAt)
                .validUntil(validUntil)
                .isValid(true)
                .build();

        return digitalIdRepository.save(block);
    }

    public boolean verifyChainIntegrity(List<DigitalId> chain) {
        String expectedPrevHash = GENESIS_PREV_HASH;

        for (DigitalId block : chain) {
            if (!block.getPrevHash().equals(expectedPrevHash)) {
                return false;
            }
            String recomputed = computeBlockHash(
                    block.getTouristId(), block.getPrevHash(), block.getKycHash(),
                    block.getIssuedAt(), block.getBlockIndex());

            if (!recomputed.equals(block.getCurrentHash())) {
                return false;
            }
            expectedPrevHash = block.getCurrentHash();
        }
        return true;
    }

    public String computeBlockHash(UUID touristId, String prevHash, String kycHash, Instant issuedAt, int blockIndex) {
        String input = touristId + "|" + prevHash + "|" + kycHash + "|" + issuedAt + "|" + blockIndex;
        return sha256Hex(input);
    }

    public String computeKycHash(String fullName, String email, String documentNumber, String phone) {
        String input = fullName + "|" + email + "|" + documentNumber + "|" + (phone == null ? "" : phone);
        return sha256Hex(input);
    }

    private String sha256Hex(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hashBytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }
}