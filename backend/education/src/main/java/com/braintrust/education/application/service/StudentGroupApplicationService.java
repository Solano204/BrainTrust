package com.braintrust.education.application.service;

import com.braintrust.education.application.dtos.commands.*;
import com.braintrust.education.application.dtos.dtos.StudentGroupDTO;
import com.braintrust.education.application.dtos.dtos.UserWithoutGroupDTO;
import com.braintrust.education.application.helpers.studentgroup.*;
import com.braintrust.education.application.ports.in.StudentGroupService;
import com.braintrust.education.application.ports.out.CourseRepository;
import com.braintrust.education.application.ports.out.StudentGroupRepository;
import com.braintrust.education.domain.exceptions.CourseNotFoundException;
import com.braintrust.education.domain.exceptions.StudentGroupNotFoundException;
import com.braintrust.education.domain.model.Course;
import com.braintrust.education.domain.model.StudentGroup;
import com.braintrust.education.domain.valueobjects.*;
import com.braintrust.identity.application.dtos.dtos.UserDTO;
import com.braintrust.identity.domain.valueobjects.UserId;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class StudentGroupApplicationService implements StudentGroupService {

    private final StudentGroupRepository groupRepository;
    private final CourseRepository courseRepository;

    private final StudentGroupValidator validator;
    private final StudentGroupMemberManager memberManager;
    private final StudentGroupDtoMapper dtoMapper;
    private final StudentGroupEligibilityChecker eligibilityChecker;

    @Override
    public StudentGroupId createGroup(CreateStudentGroupCommand command) {
        CourseId courseId = CourseId.fromString(command.courseId());
        log.info("Creating student group '{}' for course {}",
                command.name(), courseId.getValue());

        validator.validateGroupNameUniqueness(command.name(), courseId);

        StudentGroup group = StudentGroup.create(
                courseId,
                command.name(),
                command.description()
        );
        StudentGroup saved = groupRepository.save(group);

        log.info("Group created: {}", saved.getId().getValue());
        return saved.getId();
    }

    @Override
    public StudentGroupId createGroupWithMembers(CreateStudentGroupWithMembersCommand command) {
        CourseId courseId = CourseId.fromString(command.courseId());
        log.info("Creating student group '{}' for course {} with {} initial members",
                command.name(), courseId.getValue(), command.memberIds().size());

        validator.validateGroupNameUniqueness(command.name(), courseId);

        StudentGroup group = StudentGroup.create(
                courseId,
                command.name(),
                command.description()
        );
        memberManager.addInitialMembers(group, command.memberIds());

        StudentGroup saved = groupRepository.save(group);
        log.info("Group created with {} initial members: {}",
                saved.getMemberCount(), saved.getId().getValue());

        return saved.getId();
    }

    @Override
    public void updateGroupInfo(StudentGroupId groupId, String name, String description) {
        log.info("Updating group info for group ID: {}", groupId.getValue());

        try {
            StudentGroup group = findGroupByIdOrThrow(groupId);

            validator.validateGroupIsActive(group);
            validator.validateGroupNameChange(group, name);

            group.updateInfo(name, description);
            groupRepository.save(group);

            log.info("Successfully updated group info for group ID: {}",
                    groupId.getValue());

        } catch (StudentGroupNotFoundException | IllegalArgumentException |
                 IllegalStateException e) {
            log.warn("Failed to update group info for group {}: {}",
                    groupId.getValue(), e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Failed to update group info for group {}: {}",
                    groupId.getValue(), e.getMessage(), e);
            throw new RuntimeException("Failed to update group information", e);
        }
    }

    @Override
    public void deleteGroup(StudentGroupId groupId) {
        log.warn("Deleting entire group ID: {}", groupId.getValue());

        StudentGroup group = findGroupByIdOrThrow(groupId);
        groupRepository.delete(group);

        log.info("Group {} deleted successfully", groupId.getValue());
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
    public void addMember(AddMemberToGroupCommand command) {
        StudentGroupId groupId = StudentGroupId.fromString(command.groupId());
        UserId studentId = UserId.fromString(command.studentId());

        log.info("Adding student {} to group {}",
                studentId.getValue(), groupId.getValue());

        StudentGroup group = findGroupByIdOrThrow(groupId);
        group.addMember(studentId);
        groupRepository.save(group);

        log.info("Member added successfully");
    }

    @Override
    public void addMultipleMembers(AddMultipleMembersToGroupCommand command) {
        StudentGroupId groupId = StudentGroupId.fromString(command.groupId());
        log.info("Adding {} members to group {}",
                command.memberIds().size(), groupId.getValue());

        StudentGroup group = findGroupByIdOrThrow(groupId);
        StudentGroupMemberManager.MemberOperationResult result =
                memberManager.addMembers(group, command.memberIds());

        if (result.addedCount() > 0) {
            groupRepository.save(group);
            log.info("Successfully added {} members to group {} ({} skipped)",
                    result.addedCount(), groupId.getValue(), result.skippedCount());
        } else {
            log.info("No new members added to group {} ({} skipped)",
                    groupId.getValue(), result.skippedCount());
        }
    }

    @Override
    public void removeMember(RemoveMemberFromGroupCommand command) {
        StudentGroupId groupId = StudentGroupId.fromString(command.groupId());
        UserId studentId = UserId.fromString(command.studentId());

        log.info("Removing student {} from group {}",
                studentId.getValue(), groupId.getValue());

        StudentGroup group = findGroupByIdOrThrow(groupId);
        group.removeMember(studentId);
        groupRepository.save(group);

        log.info("Member removed successfully");
    }

    @Override
    public void bulkAddMembersToGroup(String courseId, String groupId,
                                      List<String> studentIds) {
        log.info("Bulk adding {} members to group {} in course {}",
                studentIds.size(), groupId, courseId);

        try {
            Course course = findCourseOrThrow(courseId);
            StudentGroup group = findGroupByIdOrThrow(StudentGroupId.fromString(groupId));

            validator.validateGroupBelongsToCourse(group, courseId);

            List<String> eligibleStudents =
                    eligibilityChecker.getEligibleStudentsForGroup(course, studentIds);

            if (eligibleStudents.isEmpty()) {
                log.warn("No eligible students found to add to group");
                return;
            }

            Set<UserId> userIds = memberManager.convertToUserIds(eligibleStudents);
            group.addMembers(userIds);
            groupRepository.save(group);

            log.info("Successfully added {} members to group {}",
                    eligibleStudents.size(), groupId);
        } catch (Exception e) {
            log.error("Failed to bulk add members to group {}: {}",
                    groupId, e.getMessage(), e);
            throw new RuntimeException("Failed to bulk add members to group", e);
        }
    }

    @Override
    public void bulkRemoveMembersFromGroup(String courseId, String groupId,
                                           List<String> studentIds) {
        log.info("Bulk removing {} members from group {} in course {}",
                studentIds.size(), groupId, courseId);

        try {
            StudentGroup group = findGroupByIdOrThrow(StudentGroupId.fromString(groupId));
            validator.validateGroupBelongsToCourse(group, courseId);

            int removedCount = memberManager.removeMembers(group, studentIds);

            if (removedCount > 0) {
                groupRepository.save(group);
                log.info("Successfully removed {} members from group {}",
                        removedCount, groupId);
            }
        } catch (Exception e) {
            log.error("Failed to bulk remove members from group {}: {}",
                    groupId, e.getMessage(), e);
            throw new RuntimeException("Failed to bulk remove members from group", e);
        }
    }

    // ==================== Query Operations ====================

    @Override
    @Transactional(readOnly = true)
    public StudentGroupDTO getGroupById(StudentGroupId groupId) {
        log.debug("Fetching group {}", groupId.getValue());
        StudentGroup group = findGroupByIdOrThrow(groupId);
        return dtoMapper.toDTO(group);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentGroupDTO> getGroupsByCourse(CourseId courseId) {
        log.debug("Fetching all groups for course {}", courseId.getValue());
        return groupRepository.findByCourseId(courseId).stream()
                .map(dtoMapper::toDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentGroupDTO> getActiveGroupsByCourse(CourseId courseId) {
        log.debug("Fetching active groups for course {}", courseId.getValue());
        return groupRepository.findActiveByCourseId(courseId).stream()
                .map(dtoMapper::toDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentGroupDTO> getGroupsByStudent(UserId studentId) {
        log.debug("Fetching groups for student {}", studentId.getValue());
        return groupRepository.findByMember(studentId).stream()
                .map(dtoMapper::toDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isStudentInGroup(StudentGroupId groupId, UserId studentId) {
        StudentGroup group = findGroupByIdOrThrow(groupId);
        return group.isMember(studentId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserWithoutGroupDTO> getUsersWithoutGroup(CourseId courseId) {
        log.debug("Fetching users without group for course {}", courseId.getValue());

        try {
            Course course = findCourseOrThrow(courseId.getValue());
            List<UserDTO> enrolledStudents =
                    eligibilityChecker.getEnrolledStudents(course);

            if (enrolledStudents.isEmpty()) {
                log.info("No enrolled students found in course {}", courseId.getValue());
                return List.of();
            }

            Set<String> studentsInGroups =
                    eligibilityChecker.getAllStudentsInCourseGroups(courseId);

            List<UserDTO> studentsWithoutGroup =
                    eligibilityChecker.filterStudentsWithoutGroup(
                            enrolledStudents,
                            studentsInGroups
                    );

            List<UserWithoutGroupDTO> result =
                    dtoMapper.toUserWithoutGroupDTOList(studentsWithoutGroup);

            log.info("Found {} students without groups in course {}",
                    result.size(), courseId.getValue());

            return result;

        } catch (Exception e) {
            log.error("Failed to fetch users without group for course {}: {}",
                    courseId.getValue(), e.getMessage(), e);
            throw new RuntimeException("Failed to fetch users without group", e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getStudentsInGroups(CourseId courseId, List<String> studentIds) {
        log.debug("Checking which of {} students are in groups for course {}",
                studentIds.size(), courseId.getValue());

        try {
            Set<String> studentsInGroups =
                    eligibilityChecker.getAllStudentsInCourseGroups(courseId);

            return studentIds.stream()
                    .filter(studentsInGroups::contains)
                    .toList();

        } catch (Exception e) {
            log.error("Failed to check students in groups for course {}: {}",
                    courseId.getValue(), e.getMessage(), e);
            return List.of();
        }
    }

    private StudentGroup findGroupByIdOrThrow(StudentGroupId groupId) {
        return groupRepository.findById(groupId)
                .orElseThrow(() -> new StudentGroupNotFoundException(
                        "Group not found: " + groupId.getValue()
                ));
    }

    private Course findCourseOrThrow(String courseId) {
        return courseRepository.findById(CourseId.fromString(courseId))
                .orElseThrow(() -> new CourseNotFoundException("Course not found"));
    }
}