package com.example.TouristSafety.service;

import com.example.TouristSafety.dto.TouristSummaryResponse;
import com.example.TouristSafety.dto.TravelGroupRequest;
import com.example.TouristSafety.dto.TravelGroupResponse;
import com.example.TouristSafety.entity.GroupMembership;
import com.example.TouristSafety.entity.Tourist;
import com.example.TouristSafety.entity.TravelGroup;
import com.example.TouristSafety.repository.GroupMembershipRepository;
import com.example.TouristSafety.repository.TouristRepository;
import com.example.TouristSafety.repository.TravelGroupRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
public class GroupService {

    private final TravelGroupRepository travelGroupRepository;
    private final GroupMembershipRepository groupMembershipRepository;
    private final TouristRepository touristRepository;
    private final TouristProfileService touristProfileService;

    public GroupService(TravelGroupRepository travelGroupRepository,
                        GroupMembershipRepository groupMembershipRepository,
                        TouristRepository touristRepository,
                        TouristProfileService touristProfileService) {
        this.travelGroupRepository = travelGroupRepository;
        this.groupMembershipRepository = groupMembershipRepository;
        this.touristRepository = touristRepository;
        this.touristProfileService = touristProfileService;
    }

    @Transactional
    public TravelGroupResponse createGroup(UUID leaderId, TravelGroupRequest req) {
        TravelGroup group = TravelGroup.builder()
                .name(req.name())
                .description(req.description())
                .leaderId(leaderId)
                .build();
        group = travelGroupRepository.save(group);

        // Auto-join the creator as a member
        GroupMembership membership = GroupMembership.builder()
                .groupId(group.getId())
                .touristId(leaderId)
                .build();
        groupMembershipRepository.save(membership);

        return toResponse(group);
    }

    @Transactional
    public void joinGroup(UUID groupId, UUID touristId) {
        if (!travelGroupRepository.existsById(groupId)) {
            throw new NoSuchElementException("Group not found: " + groupId);
        }
        if (groupMembershipRepository.existsByGroupIdAndTouristId(groupId, touristId)) {
            return; // already a member
        }
        GroupMembership membership = GroupMembership.builder()
                .groupId(groupId)
                .touristId(touristId)
                .build();
        groupMembershipRepository.save(membership);
    }

    @Transactional
    public void leaveGroup(UUID groupId, UUID touristId) {
        groupMembershipRepository.deleteByGroupIdAndTouristId(groupId, touristId);
    }

    public List<TravelGroupResponse> getGroupsForTourist(UUID touristId) {
        List<UUID> groupIds = groupMembershipRepository.findByTouristId(touristId)
                .stream().map(GroupMembership::getGroupId).toList();
        return travelGroupRepository.findAllById(groupIds)
                .stream().map(this::toResponse).toList();
    }

    public List<TravelGroupResponse> getAllGroups() {
        return travelGroupRepository.findAll().stream().map(this::toResponse).toList();
    }

    public TravelGroupResponse getGroup(UUID groupId) {
        return travelGroupRepository.findById(groupId)
                .map(this::toResponse)
                .orElseThrow(() -> new NoSuchElementException("Group not found: " + groupId));
    }

    @Transactional
    public void removeMember(UUID groupId, UUID touristId) {
        groupMembershipRepository.deleteByGroupIdAndTouristId(groupId, touristId);
    }

    private TravelGroupResponse toResponse(TravelGroup group) {
        List<GroupMembership> memberships = groupMembershipRepository.findByGroupId(group.getId());
        List<TouristSummaryResponse> members = memberships.stream()
                .map(m -> touristRepository.findById(m.getTouristId()).orElse(null))
                .filter(t -> t != null)
                .map(touristProfileService::toSummary)
                .toList();

        String leaderName = touristRepository.findById(group.getLeaderId())
                .map(Tourist::getFullName).orElse("Unknown");

        return new TravelGroupResponse(
                group.getId(), group.getName(), group.getDescription(),
                group.getLeaderId(), leaderName, members.size(), members, group.getCreatedAt()
        );
    }
}
