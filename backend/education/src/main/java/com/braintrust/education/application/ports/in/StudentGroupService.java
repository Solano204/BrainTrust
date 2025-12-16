package com.braintrust.education.application.ports.in;

import com.braintrust.education.application.dtos.commands.*;
import com.braintrust.education.application.dtos.dtos.StudentGroupDTO;
import com.braintrust.education.application.dtos.dtos.UserWithoutGroupDTO;
import com.braintrust.education.domain.valueobjects.CourseId;
import com.braintrust.education.domain.valueobjects.StudentGroupId;
import com.braintrust.identity.domain.valueobjects.UserId;
import java.util.List;

public interface StudentGroupService {

    // Commands
    StudentGroupId createGroup(CreateStudentGroupCommand command);
    void addMember(AddMemberToGroupCommand command);
    void removeMember(RemoveMemberFromGroupCommand command);
    void deactivateGroup(DeactivateGroupCommand command);
    StudentGroupId createGroupWithMembers(CreateStudentGroupWithMembersCommand command);
    void deleteGroup(StudentGroupId groupId);
    void addMultipleMembers(AddMultipleMembersToGroupCommand command);

    // Queries
    StudentGroupDTO getGroupById(StudentGroupId groupId);
    List<StudentGroupDTO> getGroupsByCourse(CourseId courseId);
    List<StudentGroupDTO> getActiveGroupsByCourse(CourseId courseId);
    List<StudentGroupDTO> getGroupsByStudent(UserId studentId);
    boolean isStudentInGroup(StudentGroupId groupId, UserId studentId);


    void updateGroupInfo(StudentGroupId groupId, String name, String description);


    // ✅ NEW: Get users without group for a course
    List<UserWithoutGroupDTO> getUsersWithoutGroup(CourseId courseId);

    // ✅ NEW: Bulk add/remove members
    void bulkAddMembersToGroup(String courseId, String groupId, List<String> studentIds);
    void bulkRemoveMembersFromGroup(String courseId, String groupId, List<String> studentIds);

    // ✅ NEW: Get users without group for a course

    // ✅ NEW: Check if students are in any group
    List<String> getStudentsInGroups(CourseId courseId, List<String> studentIds);
}