package com.braintrust.containerapp.rest.course;

import com.braintrust.education.application.dtos.commands.*;
import com.braintrust.education.application.dtos.dtos.StudentGroupDTO;
import com.braintrust.education.application.dtos.dtos.UserWithoutGroupDTO;
import com.braintrust.education.application.ports.in.StudentGroupService;
import com.braintrust.education.domain.valueobjects.*;
import com.braintrust.identity.domain.valueobjects.UserId;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/groups")
public class StudentGroupController {

    private final StudentGroupService groupService;

    public StudentGroupController(StudentGroupService groupService) {
        this.groupService = groupService;
    }

    // Add these endpoints to StudentGroupController

    @PostMapping("/with-members")
    public ResponseEntity<String> createGroupWithMembers(@RequestBody CreateStudentGroupWithMembersCommand command) {
        StudentGroupId id = groupService.createGroupWithMembers(command);
        return ResponseEntity.status(HttpStatus.CREATED).body(id.getValue());
    }

    // Get group by ID (Frontend team-api needs this)
    @GetMapping("/{groupId}")
    public ResponseEntity<StudentGroupDTO> getGroupById(@PathVariable String groupId) {
        StudentGroupDTO group = groupService.getGroupById(StudentGroupId.fromString(groupId));
        return ResponseEntity.ok(group);
    }

    @DeleteMapping("/{groupId}")
    public ResponseEntity<Void> deleteGroup(@PathVariable String groupId) {
        groupService.deleteGroup(StudentGroupId.fromString(groupId));
        return ResponseEntity.noContent().build();
    }

    // ✅ NEW: Get groups for specific user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<StudentGroupDTO>> getGroupsByUser(@PathVariable String userId) {
        List<StudentGroupDTO> groups = groupService.getGroupsByStudent(UserId.fromString(userId));
        return ResponseEntity.ok(groups);
    }

    // ✅ NEW: Update group information
    @PutMapping("/{groupId}/info")
    public ResponseEntity<Void> updateGroupInfo(
            @PathVariable String groupId,
            @RequestBody UpdateGroupInfoRequest request) {


        // Validate request
        if (request.name() == null || request.name().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        groupService.updateGroupInfo(
                StudentGroupId.fromString(groupId),
                request.name().trim(),
                request.description() != null ? request.description().trim() : null
        );

        return ResponseEntity.ok().build();
    }




//
//    @PostMapping("/{groupId}/members/bulk")
//    public ResponseEntity<Void> addMultipleMembers(
//            @PathVariable String groupId,
//            @RequestBody AddMultipleMembersToGroupCommand command) {
//
//        // Ensure the groupId in path matches the command
//        if (!groupId.equals(command.groupId())) {
//            throw new IllegalArgumentException("Group ID in path does not match request body");
//        }
//
//        groupService.addMultipleMembers(command);
//        return ResponseEntity.ok().build();
//    }

    @PostMapping
    public ResponseEntity<String> createGroup(@RequestBody CreateStudentGroupCommand command) {
        StudentGroupId id = groupService.createGroup(command);
        return ResponseEntity.status(HttpStatus.CREATED).body(id.getValue());
    }

    @PostMapping("/{groupId}/members")
    public ResponseEntity<Void> addMember(
            @PathVariable String groupId,
            @RequestBody AddMemberToGroupCommand command) {
        groupService.addMember(command);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{groupId}/members/{studentId}")
    public ResponseEntity<Void> removeMember(
            @PathVariable String groupId,
            @PathVariable String studentId) {
        groupService.removeMember(new RemoveMemberFromGroupCommand(groupId, studentId));
        return ResponseEntity.noContent().build();
    }

//    @PutMapping("/{groupId}/deactivate")
//    public ResponseEntity<Void> deactivateGroup(@PathVariable String groupId) {
//        groupService.deactivateGroup(new DeactivateGroupCommand(groupId));
//        return ResponseEntity.ok().build();
//    }

//    @GetMapping("/{groupId}")
//    public ResponseEntity<StudentGroupDTO> getGroup(@PathVariable String groupId) {
//        StudentGroupDTO dto = groupService.getGroupById(StudentGroupId.fromString(groupId));
//        return ResponseEntity.ok(dto);
//    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<StudentGroupDTO>> getGroupsByCourse(@PathVariable String courseId) {
        List<StudentGroupDTO> groups = groupService.getGroupsByCourse(CourseId.fromString(courseId));
        return ResponseEntity.ok(groups);
    }



    // ✅ NEW: Bulk add members to group
    @PostMapping("/{groupId}/members/bulk-add")
    public ResponseEntity<Void> bulkAddMembers(
            @PathVariable String groupId,
            @RequestParam String courseId,
            @RequestBody List<String> studentIds) {


        groupService.bulkAddMembersToGroup(courseId, groupId, studentIds);
        return ResponseEntity.ok().build();
    }

    // ✅ NEW: Bulk remove members from group
    @DeleteMapping("/{groupId}/members/bulk-remove")
    public ResponseEntity<Void> bulkRemoveMembers(
            @PathVariable String groupId,
            @RequestParam String courseId,
            @RequestBody List<String> studentIds) {


        groupService.bulkRemoveMembersFromGroup(courseId, groupId, studentIds);
        return ResponseEntity.noContent().build();
    }

    // ✅ NEW: Check which students are already in groups
    @PostMapping("/course/{courseId}/check-students-in-groups")
    public ResponseEntity<List<String>> checkStudentsInGroups(
            @PathVariable String courseId,
            @RequestBody List<String> studentIds) {


        List<String> studentsInGroups = groupService.getStudentsInGroups(
                CourseId.fromString(courseId), studentIds);

        return ResponseEntity.ok(studentsInGroups);
    }

    // ✅ UPDATED: Get users without group for a course
    @GetMapping("/course/{courseId}/users-without-group")
    public ResponseEntity<List<UserWithoutGroupDTO>> getUsersWithoutGroup(@PathVariable String courseId) {
        List<UserWithoutGroupDTO> users = groupService.getUsersWithoutGroup(CourseId.fromString(courseId));
        return ResponseEntity.ok(users);
    }

//
//    @GetMapping("/course/{courseId}/active")
//    public ResponseEntity<List<StudentGroupDTO>> getActiveGroupsByCourse(@PathVariable String courseId) {
//        List<StudentGroupDTO> groups = groupService.getActiveGroupsByCourse(CourseId.fromString(courseId));
//        return ResponseEntity.ok(groups);
//    }

//    @GetMapping("/student/{studentId}")
//    public ResponseEntity<List<StudentGroupDTO>> getGroupsByStudent(@PathVariable String studentId) {
//        List<StudentGroupDTO> groups = groupService.getGroupsByStudent(UserId.fromString(studentId));
//        return ResponseEntity.ok(groups);
//    }
//
//    @GetMapping("/{groupId}/has-member/{studentId}")
//    public ResponseEntity<Boolean> isStudentInGroup(
//            @PathVariable String groupId,
//            @PathVariable String studentId) {
//        boolean isMember = groupService.isStudentInGroup(
//                StudentGroupId.fromString(groupId),
//                UserId.fromString(studentId)
//        );
//        return ResponseEntity.ok(isMember);
//    }
}