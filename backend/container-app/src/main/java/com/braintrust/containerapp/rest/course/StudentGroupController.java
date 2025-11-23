package com.braintrust.containerapp.rest.course;


import com.braintrust.education.application.dtos.commands.*;
import com.braintrust.education.application.dtos.dtos.StudentGroupDTO;
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

    @DeleteMapping("/{groupId}")
    public ResponseEntity<Void> deleteGroup(@PathVariable String groupId) {
        groupService.deleteGroup(StudentGroupId.fromString(groupId));
        return ResponseEntity.noContent().build();
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