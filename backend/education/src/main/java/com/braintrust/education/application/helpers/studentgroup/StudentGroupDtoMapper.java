
package com.braintrust.education.application.helpers.studentgroup;

import com.braintrust.education.application.dtos.dtos.GroupMemberDTO;
import com.braintrust.education.application.dtos.dtos.StudentGroupDTO;
import com.braintrust.education.application.dtos.dtos.UserWithoutGroupDTO;
import com.braintrust.education.domain.model.StudentGroup;
import com.braintrust.identity.application.ports.in.UserService;
import com.braintrust.identity.application.dtos.dtos.MinimalUserInfoDTO;
import com.braintrust.identity.application.dtos.dtos.UserDTO;
import com.braintrust.identity.domain.valueobjects.UserId;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class StudentGroupDtoMapper {

    private final UserService userService;

    public StudentGroupDTO toDTO(StudentGroup group) {
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

    public List<GroupMemberDTO> getGroupMembers(Set<UserId> memberUserIds) {
        if (memberUserIds == null || memberUserIds.isEmpty()) {
            return List.of();
        }

        try {
            List<String> userIdStrings = memberUserIds.stream()
                    .map(UserId::getValue)
                    .collect(Collectors.toList());

            List<MinimalUserInfoDTO> minimalUserInfos =
                    userService.getMinimalUserInfoByIds(userIdStrings);

            return minimalUserInfos.stream()
                    .map(this::toGroupMemberDTO)
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.warn("Failed to fetch minimal member info: {}", e.getMessage());
            return createFallbackGroupMembers(memberUserIds);
        }
    }

    private GroupMemberDTO toGroupMemberDTO(MinimalUserInfoDTO minimalInfo) {
        return new GroupMemberDTO(
                minimalInfo.userId(),
                minimalInfo.personId(),
                minimalInfo.firstName(),
                minimalInfo.lastName(),
                minimalInfo.fullName()
        );
    }

    private List<GroupMemberDTO> createFallbackGroupMembers(Set<UserId> memberUserIds) {
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

    public UserWithoutGroupDTO toUserWithoutGroupDTO(UserDTO user) {
        return new UserWithoutGroupDTO(
                user.id(),
                user.person().id(),
                user.person().firstName(),
                user.person().lastName(),
                user.person().fullName(),
                user.email(),
                user.role(),
                user.studentId() != null ? user.studentId() : ""
        );
    }

    public List<UserWithoutGroupDTO> toUserWithoutGroupDTOList(List<UserDTO> users) {
        return users.stream()
                .map(this::toUserWithoutGroupDTO)
                .collect(Collectors.toList());
    }
}