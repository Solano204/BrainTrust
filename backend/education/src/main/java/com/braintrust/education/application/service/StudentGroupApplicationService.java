package com.braintrust.education.application.service;

import com.braintrust.education.application.dtos.commands.*;
import com.braintrust.education.application.dtos.dtos.GroupMemberDTO;
import com.braintrust.education.application.dtos.dtos.StudentGroupDTO;
import com.braintrust.education.application.dtos.dtos.UserWithoutGroupDTO;
import com.braintrust.education.application.ports.in.StudentGroupService;
import com.braintrust.education.application.ports.out.CourseRepository;
import com.braintrust.education.application.ports.out.StudentGroupRepository;
import com.braintrust.education.domain.exceptions.CourseNotFoundException;
import com.braintrust.education.domain.exceptions.StudentGroupNotFoundException;
import com.braintrust.education.domain.model.Course;
import com.braintrust.education.domain.model.EnrollmentStatus;
import com.braintrust.education.domain.model.StudentGroup;
import com.braintrust.education.domain.valueobjects.*;
import com.braintrust.identity.application.ports.in.UserService;
import com.braintrust.identity.application.dtos.dtos.MinimalUserInfoDTO;
import com.braintrust.identity.application.dtos.dtos.UserDTO;
import com.braintrust.identity.domain.valueobjects.UserId;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@Transactional
public class StudentGroupApplicationService implements StudentGroupService {

    private static final Logger log =
            LoggerFactory.getLogger(StudentGroupApplicationService.class);

    private final StudentGroupRepository groupRepository;
    private final UserService userService;
    private final CourseRepository courseRepository; // Add this to get course enrollments

    public StudentGroupApplicationService(StudentGroupRepository groupRepository,
                                          UserService userService,
                                          CourseRepository courseRepository) {
        this.groupRepository = groupRepository;
        this.userService = userService;
        this.courseRepository = courseRepository;
    }


    // ✅ NEW: Update group information (name and description)
    @Override
    public void updateGroupInfo(StudentGroupId groupId, String name, String description) {
        log.info("Updating group info for group ID: {}", groupId.getValue());

        try {
            // Find the group
            StudentGroup group = findGroupByIdOrThrow(groupId);

            // Validate the group is active
            if (!group.isActive()) {
                throw new IllegalStateException("Cannot update information of an inactive group");
            }

            // Check if name is being changed and if it conflicts with existing groups
            if (!group.getName().equals(name)) {
                boolean nameExists = groupRepository.existsByNameAndCourse(name, group.getCourseId());
                if (nameExists) {
                    throw new IllegalArgumentException("A group with name '" + name + "' already exists in this course");
                }
            }

            // Update group information
            group.updateInfo(name, description);

            // Save the updated group
            groupRepository.save(group);

            log.info("Successfully updated group info for group ID: {}", groupId.getValue());

        } catch (StudentGroupNotFoundException e) {
            throw e;
        } catch (IllegalArgumentException | IllegalStateException e) {
            log.warn("Failed to update group info for group {}: {}", groupId.getValue(), e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Failed to update group info for group {}: {}", groupId.getValue(), e.getMessage(), e);
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





    /**
     * ✅ NEW: Get all students enrolled in a course
     * This method needs to be implemented based on your enrollment system
     */
    private List<UserDTO> getStudentsByCourse(CourseId courseId) {
        // TODO: Implement this method to get all students enrolled in the course
        // This would typically call an EnrollmentService or CourseService
        // For now, return empty list - you'll need to implement this
        log.warn("getStudentsByCourse not implemented yet for course: {}", courseId.getValue());
        return List.of();
    }





    //



    // ✅ NEW: Bulk add members to group
    @Override
    public void bulkAddMembersToGroup(String courseId, String groupId, List<String> studentIds) {
        log.info("Bulk adding {} members to group {} in course {}",
                studentIds.size(), groupId, courseId);

        try {
            // Validate course exists
            Course course = courseRepository.findById(CourseId.fromString(courseId))
                    .orElseThrow(() -> new CourseNotFoundException("Course not found"));

            // Get group
            StudentGroup group = findGroupByIdOrThrow(StudentGroupId.fromString(groupId));

            // Verify group belongs to the course
            if (!group.getCourseId().getValue().equals(courseId)) {
                throw new IllegalArgumentException("Group does not belong to the specified course");
            }

            // Get all students in course (enrolled students)
            Set<String> enrolledStudentIds = getEnrolledStudentIds(course);

            // Filter studentIds to only include enrolled students
            List<String> enrolledToAdd = studentIds.stream()
                    .filter(enrolledStudentIds::contains)
                    .collect(Collectors.toList());

            if (enrolledToAdd.isEmpty()) {
                log.warn("No enrolled students found to add to group");
                return;
            }

            // Get students already in groups
            Set<String> studentsInGroups = getAllStudentsInCourseGroups(course.getId());

            // Filter out students already in groups
            List<String> eligibleToAdd = enrolledToAdd.stream()
                    .filter(id -> !studentsInGroups.contains(id))
                    .collect(Collectors.toList());

            if (eligibleToAdd.isEmpty()) {
                log.warn("All selected students are already in groups");
                return;
            }

            // Convert to UserId set
            Set<UserId> userIds = eligibleToAdd.stream()
                    .map(UserId::fromString)
                    .collect(Collectors.toSet());

            // Add members to group
            group.addMembers(userIds);
            groupRepository.save(group);

            log.info("Successfully added {} members to group {}",
                    eligibleToAdd.size(), groupId);

        } catch (Exception e) {
            log.error("Failed to bulk add members to group {}: {}", groupId, e.getMessage(), e);
            throw new RuntimeException("Failed to bulk add members to group", e);
        }
    }

    // ✅ NEW: Bulk remove members from group
    @Override
    public void bulkRemoveMembersFromGroup(String courseId, String groupId, List<String> studentIds) {
        log.info("Bulk removing {} members from group {} in course {}",
                studentIds.size(), groupId, courseId);

        try {
            // Get group
            StudentGroup group = findGroupByIdOrThrow(StudentGroupId.fromString(groupId));

            // Verify group belongs to the course
            if (!group.getCourseId().getValue().equals(courseId)) {
                throw new IllegalArgumentException("Group does not belong to the specified course");
            }

            int removedCount = 0;

            for (String studentId : studentIds) {
                try {
                    UserId userId = UserId.fromString(studentId);
                    if (group.isMember(userId)) {
                        group.removeMember(userId);
                        removedCount++;
                        log.debug("Removed member {} from group {}", studentId, groupId);
                    }
                } catch (Exception e) {
                    log.warn("Failed to remove member {} from group {}: {}",
                            studentId, groupId, e.getMessage());
                }
            }

            if (removedCount > 0) {
                groupRepository.save(group);
                log.info("Successfully removed {} members from group {}", removedCount, groupId);
            }

        } catch (Exception e) {
            log.error("Failed to bulk remove members from group {}: {}", groupId, e.getMessage(), e);
            throw new RuntimeException("Failed to bulk remove members from group", e);
        }
    }

    // ✅ UPDATED: Get users without group for a course
    @Override
    @Transactional(readOnly = true)
    public List<UserWithoutGroupDTO> getUsersWithoutGroup(CourseId courseId) {
        log.debug("Fetching users without group for course {}", courseId.getValue());

        try {
            // Get course
            Course course = courseRepository.findById(courseId)
                    .orElseThrow(() -> new CourseNotFoundException("Course not found"));

            // Get all enrolled students in the course
            List<UserDTO> enrolledStudents = getEnrolledStudents(course);

            if (enrolledStudents.isEmpty()) {
                log.info("No enrolled students found in course {}", courseId.getValue());
                return List.of();
            }

            // Get all students already in groups for this course
            Set<String> studentsInGroups = getAllStudentsInCourseGroups(courseId);

            // Filter students not in any group and map to DTO
            List<UserWithoutGroupDTO> result = enrolledStudents.stream()
                    .filter(student -> !studentsInGroups.contains(student.id()))
                    .map(this::mapToUserWithoutGroupDTO)
                    .collect(Collectors.toList());

            log.info("Found {} students without groups in course {}",
                    result.size(), courseId.getValue());

            return result;

        } catch (Exception e) {
            log.error("Failed to fetch users without group for course {}: {}",
                    courseId.getValue(), e.getMessage(), e);
            throw new RuntimeException("Failed to fetch users without group", e);
        }
    }

    // ✅ NEW: Get which students are already in groups
    @Override
    @Transactional(readOnly = true)
    public List<String> getStudentsInGroups(CourseId courseId, List<String> studentIds) {
        log.debug("Checking which of {} students are in groups for course {}",
                studentIds.size(), courseId.getValue());

        try {
            // Get all students in groups for this course
            Set<String> studentsInGroups = getAllStudentsInCourseGroups(courseId);

            // Filter input studentIds that are in groups
            return studentIds.stream()
                    .filter(studentsInGroups::contains)
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("Failed to check students in groups for course {}: {}",
                    courseId.getValue(), e.getMessage(), e);
            return List.of();
        }
    }

    // ... existing methods ...

    // ✅ NEW: Helper method to get enrolled student IDs from course
    private Set<String> getEnrolledStudentIds(Course course) {
        return course.getEnrollments().stream()
                .filter(enrollment -> enrollment.getStatus() == EnrollmentStatus.ACTIVE)
                .map(enrollment -> enrollment.getStudentId().getValue())
                .collect(Collectors.toSet());
    }

    // ✅ NEW: Helper method to get enrolled students with details
    private List<UserDTO> getEnrolledStudents(Course course) {
        try {
            // Get all enrolled student IDs
            Set<String> enrolledStudentIds = getEnrolledStudentIds(course);

            if (enrolledStudentIds.isEmpty()) {
                return List.of();
            }

            // Get user details for all enrolled students
            return userService.getUsersByIds(new ArrayList<>(enrolledStudentIds));

        } catch (Exception e) {
            log.error("Failed to get enrolled students for course {}: {}",
                    course.getId().getValue(), e.getMessage());
            return List.of();
        }
    }

    // ✅ NEW: Get all students already in groups for a course
    private Set<String> getAllStudentsInCourseGroups(CourseId courseId) {
        List<StudentGroup> groups = groupRepository.findByCourseId(courseId);
        return groups.stream()
                .flatMap(group -> group.getMemberIds().stream())
                .map(UserId::getValue)
                .collect(Collectors.toSet());
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

    private List<GroupMemberDTO> getGroupMembers(Set<UserId> memberUserIds) {
        if (memberUserIds == null || memberUserIds.isEmpty()) {
            return List.of();
        }

        try {
            List<String> userIdStrings = memberUserIds.stream()
                    .map(UserId::getValue)
                    .collect(Collectors.toList());

            List<MinimalUserInfoDTO> minimalUserInfos = userService.getMinimalUserInfoByIds(userIdStrings);

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

    // ✅ UPDATED: Map UserDTO to UserWithoutGroupDTO
    private UserWithoutGroupDTO mapToUserWithoutGroupDTO(UserDTO user) {
        return new UserWithoutGroupDTO(
                user.id(),
                user.person().id(),
                user.person().firstName(),
                user.person().lastName(),
                user.person().fullName(),
                user.email(),
                user.role(),
                user.studentId() != null ? user.studentId() : "" // Add student reference ID
        );
    }


}