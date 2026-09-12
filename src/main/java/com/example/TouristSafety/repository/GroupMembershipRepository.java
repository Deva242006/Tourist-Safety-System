package com.example.TouristSafety.repository;

import com.example.TouristSafety.entity.GroupMembership;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface GroupMembershipRepository extends JpaRepository<GroupMembership, UUID> {
    List<GroupMembership> findByGroupId(UUID groupId);
    List<GroupMembership> findByTouristId(UUID touristId);
    Optional<GroupMembership> findByGroupIdAndTouristId(UUID groupId, UUID touristId);
    boolean existsByGroupIdAndTouristId(UUID groupId, UUID touristId);

    @Transactional
    void deleteByGroupIdAndTouristId(UUID groupId, UUID touristId);
}
