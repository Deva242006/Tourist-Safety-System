package com.example.TouristSafety.controller;

import com.example.TouristSafety.dto.TravelGroupRequest;
import com.example.TouristSafety.dto.TravelGroupResponse;
import com.example.TouristSafety.service.GroupService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.UUID;

@RestController
@RequestMapping("/api/groups")
public class GroupController {

    private final GroupService groupService;

    public GroupController(GroupService groupService) {
        this.groupService = groupService;
    }

    /** Tourist creates a new group (auto-joins as leader) */
    @PostMapping
    public ResponseEntity<TravelGroupResponse> create(@Valid @RequestBody TravelGroupRequest req,
                                                       Authentication authentication) {
        UUID touristId = UUID.fromString(authentication.getName());
        return ResponseEntity.status(201).body(groupService.createGroup(touristId, req));
    }

    /** Tourist gets their own groups */
    @GetMapping("/mine")
    public List<TravelGroupResponse> getMyGroups(Authentication authentication) {
        UUID touristId = UUID.fromString(authentication.getName());
        return groupService.getGroupsForTourist(touristId);
    }

    /** Admin gets all groups */
    @GetMapping
    public List<TravelGroupResponse> getAllGroups() {
        return groupService.getAllGroups();
    }

    /** Get single group */
    @GetMapping("/{id}")
    public ResponseEntity<TravelGroupResponse> getGroup(@PathVariable UUID id) {
        try {
            return ResponseEntity.ok(groupService.getGroup(id));
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /** Tourist joins a group by ID */
    @PostMapping("/{id}/join")
    public ResponseEntity<Map<String, String>> joinGroup(@PathVariable UUID id,
                                                          Authentication authentication) {
        UUID touristId = UUID.fromString(authentication.getName());
        try {
            groupService.joinGroup(id, touristId);
            return ResponseEntity.ok(Map.of("status", "joined"));
        } catch (NoSuchElementException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /** Tourist leaves a group */
    @DeleteMapping("/{id}/leave")
    public ResponseEntity<Map<String, String>> leaveGroup(@PathVariable UUID id,
                                                           Authentication authentication) {
        UUID touristId = UUID.fromString(authentication.getName());
        groupService.leaveGroup(id, touristId);
        return ResponseEntity.ok(Map.of("status", "left"));
    }

    /** Admin removes a specific tourist from a group */
    @DeleteMapping("/{groupId}/members/{touristId}")
    public ResponseEntity<Map<String, String>> removeMember(@PathVariable UUID groupId,
                                                             @PathVariable UUID touristId) {
        groupService.removeMember(groupId, touristId);
        return ResponseEntity.ok(Map.of("status", "removed"));
    }
}
