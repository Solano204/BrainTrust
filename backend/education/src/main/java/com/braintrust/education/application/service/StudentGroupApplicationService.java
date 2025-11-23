package com.braintrust.education.application.service;

import com.braintrust.education.application.dtos.commands.*;
import com.braintrust.education.application.dtos.dtos.GroupMemberDTO;
import com.braintrust.education.application.dtos.dtos.StudentGroupDTO;
import com.braintrust.education.application.ports.in.StudentGroupService;
import com.braintrust.education.application.ports.out.StudentGroupRepository;
import com.braintrust.education.domain.exceptions.StudentGroupNotFoundException;
import com.braintrust.education.domain.model.StudentGroup;
import com.braintrust.education.domain.valueobjects.*;
import com.braintrust.identity.application.ports.in.UserService;
import com.braintrust.identity.application.dtos.dtos.MinimalUserInfoDTO;
import com.braintrust.identity.domain.valueobjects.UserId;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
// other imports...

@Service
@Transactional
public class StudentGroupApplicationService implements StudentGroupService {

    private static final Logger log =
            LoggerFactory.getLogger(StudentGroupApplicationService.class);

    private final StudentGroupRepository groupRepository;
    private final UserService userService;

    public StudentGroupApplicationService(StudentGroupRepository groupRepository, UserService userService) {
        this.groupRepository = groupRepository;
        this.userService = userService;
    }

    @Override
    public void deleteGroup(StudentGroupId groupId) {
        log.warn("Deleting entire group ID: {}", groupId.getValue());

        StudentGroup group = findGroupByIdOrThrow(groupId);
        groupRepository.delete(group);

        log.info("Group {} deleted successfully", groupId.getValue());
    }

    @Override
    public StudentGroupId createGroupWithMembers(CreateStudentGroupWithMembersCommand command) {
        CourseId courseId = CourseId.fromString(command.courseId());

        log.info("Creating student group '{}' for course {} with {} initial members",
                command.name(), courseId.getValue(), command.memberIds().size());

        if (groupRepository.existsByNameAndCourse(command.name(), courseId)) {
            throw new IllegalArgumentException("Group with this name already exists in course");
        }

        StudentGroup group = StudentGroup.create(courseId, command.name(), command.description());

        for (String memberId : command.memberIds()) {
            UserId studentId = UserId.fromString(memberId);
            try {
                group.addMember(studentId);
                log.debug("Added initial member {} to group", studentId.getValue());
            } catch (IllegalStateException e) {
                log.warn("Cannot add member {}: {}", studentId.getValue(), e.getMessage());
            }
        }

        StudentGroup saved = groupRepository.save(group);

        log.info("Group created with {} initial members: {}",
                saved.getMemberCount(), saved.getId().getValue());

        return saved.getId();
    }

    @Override
    public void addMultipleMembers(AddMultipleMembersToGroupCommand command) {
        StudentGroupId groupId = StudentGroupId.fromString(command.groupId());

        log.info("Adding {} members to group {}",
                command.memberIds().size(), groupId.getValue());

        StudentGroup group = findGroupByIdOrThrow(groupId);

        int addedCount = 0;
        int skippedCount = 0;

        for (String memberId : command.memberIds()) {
            UserId studentId = UserId.fromString(memberId);

            try {
                if (!group.isMember(studentId)) {
                    group.addMember(studentId);
                    addedCount++;
                    log.debug("Added member {} to group", studentId.getValue());
                } else {
                    log.debug("Member {} already in group, skipping", studentId.getValue());
                    skippedCount++;
                }
            } catch (IllegalStateException e) {
                log.warn("Cannot add member {}: {}", studentId.getValue(), e.getMessage());
                skippedCount++;
            }
        }

        if (addedCount > 0) {
            groupRepository.save(group);
            log.info("Successfully added {} members to group {} ({} skipped)",
                    addedCount, groupId.getValue(), skippedCount);
        } else {
            log.info("No new members added to group {} (all {} members already exist or couldn't be added)",
                    groupId.getValue(), skippedCount);
        }
    }

    @Override
    public StudentGroupId createGroup(CreateStudentGroupCommand command) {
        CourseId courseId = CourseId.fromString(command.courseId());
        log.info("Creating student group '{}' for course {}", command.name(), courseId.getValue());

        if (groupRepository.existsByNameAndCourse(command.name(), courseId)) {
            throw new IllegalArgumentException("Group with this name already exists in course");
        }

        StudentGroup group = StudentGroup.create(courseId, command.name(), command.description());
        StudentGroup saved = groupRepository.save(group);

        log.info("Group created: {}", saved.getId().getValue());
        return saved.getId();
    }

    @Override
    public void addMember(AddMemberToGroupCommand command) {
        StudentGroupId groupId = StudentGroupId.fromString(command.groupId());
        UserId studentId = UserId.fromString(command.studentId());

        log.info("Adding student {} to group {}", studentId.getValue(), groupId.getValue());

        StudentGroup group = findGroupByIdOrThrow(groupId);
        group.addMember(studentId);
        groupRepository.save(group);

        log.info("Member added successfully");
    }

    @Override
    public void removeMember(RemoveMemberFromGroupCommand command) {
        StudentGroupId groupId = StudentGroupId.fromString(command.groupId());
        UserId studentId = UserId.fromString(command.studentId());

        log.info("Removing student {} from group {}", studentId.getValue(), groupId.getValue());

        StudentGroup group = findGroupByIdOrThrow(groupId);
        group.removeMember(studentId);
        groupRepository.save(group);

        log.info("Member removed successfully");
    }

    @Override
    public void deactivateGroup(DeactivateGroupCommand command) {
        StudentGroupId groupId = StudentGroupId.fromString(command.groupId());
        log.warn("Deactivating group {}", groupId.getValue());

        StudentGroup group = findGroupByIdOrThrow(groupId);
        group.deactivate();
        groupRepository.save(group);

        log.info("Group deactivated");
    }

    @Override
    @Transactional(readOnly = true)
    public StudentGroupDTO getGroupById(StudentGroupId groupId) {
        log.debug("Fetching group {}", groupId.getValue());
        StudentGroup group = findGroupByIdOrThrow(groupId);
        return mapToDTO(group);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentGroupDTO> getGroupsByCourse(CourseId courseId) {
        log.debug("Fetching all groups for course {}", courseId.getValue());
        return groupRepository.findByCourseId(courseId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentGroupDTO> getActiveGroupsByCourse(CourseId courseId) {
        log.debug("Fetching active groups for course {}", courseId.getValue());
        return groupRepository.findActiveByCourseId(courseId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentGroupDTO> getGroupsByStudent(UserId studentId) {
        log.debug("Fetching groups for student {}", studentId.getValue());
        return groupRepository.findByMember(studentId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isStudentInGroup(StudentGroupId groupId, UserId studentId) {
        StudentGroup group = findGroupByIdOrThrow(groupId);
        return group.isMember(studentId);
    }

    private StudentGroup findGroupByIdOrThrow(StudentGroupId groupId) {
        return groupRepository.findById(groupId)
                .orElseThrow(() -> new StudentGroupNotFoundException("Group not found: " + groupId.getValue()));
    }

    private StudentGroupDTO mapToDTO(StudentGroup group) {
        List<GroupMemberDTO> members = getGroupMembers(group.getMemberIds());

        return new StudentGroupDTO(
                group.getId().getValue(),
                group.getCourseId().getValue(),
                "Course Name", // TODO: Resolve from CourseService
                group.getName(),
                group.getDescription(),
                members,
                group.getMemberCount(),
                group.getCreatedAt().toString(),
                group.isActive()
        );
    }

    /**
     * Get group members with only minimal info (user ID, person ID, and names)
     */
    /**
     * Get group members with only minimal info (user ID, person ID, and names)
     */
    private List<GroupMemberDTO> getGroupMembers(Set<UserId> memberUserIds) {
        if (memberUserIds == null || memberUserIds.isEmpty()) {
            return List.of();
        }

        try {
            List<String> userIdStrings = memberUserIds.stream()
                    .map(UserId::getValue)
                    .collect(Collectors.toList());

            // Get minimal user info (only IDs and names)
            List<MinimalUserInfoDTO> minimalUserInfos = userService.getMinimalUserInfoByIds(userIdStrings);

            // Map to GroupMemberDTO
            return minimalUserInfos.stream()
                    .map(minimalInfo -> new GroupMemberDTO(
                            minimalInfo.userId(),
                            minimalInfo.personId(),
                            minimalInfo.firstName(),
                            minimalInfo.lastName(),
                            minimalInfo.fullName()
                    ))
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.warn("Failed to fetch minimal member info: {}", e.getMessage());
            // Return basic info with just user IDs if service fails
            return memberUserIds.stream()
                    .map(userId -> new GroupMemberDTO(
                            userId.getValue(),
                            "unknown",
                            "Unknown",
                            "User",
                            "Unknown User"
                    ))
                    .collect(Collectors.toList());
        }
    }
}