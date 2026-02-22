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


    @PostMapping("/with-members")
    public ResponseEntity<String> createGroupWithMembers(@RequestBody CreateStudentGroupWithMembersCommand command) {
        StudentGroupId id = groupService.createGroupWithMembers(command);
        return ResponseEntity.status(HttpStatus.CREATED).body(id.getValue());
    }

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

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<StudentGroupDTO>> getGroupsByUser(@PathVariable String userId) {
        List<StudentGroupDTO> groups = groupService.getGroupsByStudent(UserId.fromString(userId));
        return ResponseEntity.ok(groups);
    }

    @PutMapping("/{groupId}/info")
    public ResponseEntity<Void> updateGroupInfo(
            @PathVariable String groupId,
            @RequestBody UpdateGroupInfoRequest request) {


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

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<StudentGroupDTO>> getGroupsByCourse(@PathVariable String courseId) {
        List<StudentGroupDTO> groups = groupService.getGroupsByCourse(CourseId.fromString(courseId));
        return ResponseEntity.ok(groups);
    }


    @PostMapping("/{groupId}/members/bulk-add")
    public ResponseEntity<Void> bulkAddMembers(
            @PathVariable String groupId,
            @RequestParam String courseId,
            @RequestBody List<String> studentIds) {


        groupService.bulkAddMembersToGroup(courseId, groupId, studentIds);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{groupId}/members/bulk-remove")
    public ResponseEntity<Void> bulkRemoveMembers(
            @PathVariable String groupId,
            @RequestParam String courseId,
            @RequestBody List<String> studentIds) {


        groupService.bulkRemoveMembersFromGroup(courseId, groupId, studentIds);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/course/{courseId}/check-students-in-groups")
    public ResponseEntity<List<String>> checkStudentsInGroups(
            @PathVariable String courseId,
            @RequestBody List<String> studentIds) {


        List<String> studentsInGroups = groupService.getStudentsInGroups(
                CourseId.fromString(courseId), studentIds);

        return ResponseEntity.ok(studentsInGroups);
    }

    @GetMapping("/course/{courseId}/users-without-group")
    public ResponseEntity<List<UserWithoutGroupDTO>> getUsersWithoutGroup(@PathVariable String courseId) {
        List<UserWithoutGroupDTO> users = groupService.getUsersWithoutGroup(CourseId.fromString(courseId));
        return ResponseEntity.ok(users);
    }

}