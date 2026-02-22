package com.braintrust.education.application.helpers.studentgroup;

import com.braintrust.education.domain.model.StudentGroup;
import com.braintrust.identity.domain.valueobjects.UserId;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Component
public class StudentGroupMemberManager {

    public MemberOperationResult addMembers(StudentGroup group, List<String> memberIds) {
        int addedCount = 0;
        int skippedCount = 0;

        for (String memberId : memberIds) {
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

        return new MemberOperationResult(addedCount, skippedCount);
    }

    public void addInitialMembers(StudentGroup group, List<String> memberIds) {
        for (String memberId : memberIds) {
            UserId studentId = UserId.fromString(memberId);
            try {
                group.addMember(studentId);
                log.debug("Added initial member {} to group", studentId.getValue());
            } catch (IllegalStateException e) {
                log.warn("Cannot add member {}: {}", studentId.getValue(), e.getMessage());
            }
        }
    }

    public int removeMembers(StudentGroup group, List<String> studentIds) {
        int removedCount = 0;

        for (String studentId : studentIds) {
            try {
                UserId userId = UserId.fromString(studentId);
                if (group.isMember(userId)) {
                    group.removeMember(userId);
                    removedCount++;
                    log.debug("Removed member {} from group", studentId);
                }
            } catch (Exception e) {
                log.warn("Failed to remove member {} from group: {}",
                        studentId, e.getMessage());
            }
        }

        return removedCount;
    }

    public Set<UserId> convertToUserIds(List<String> studentIds) {
        return studentIds.stream()
                .map(UserId::fromString)
                .collect(Collectors.toSet());
    }

    public record MemberOperationResult(int addedCount, int skippedCount) {}
}