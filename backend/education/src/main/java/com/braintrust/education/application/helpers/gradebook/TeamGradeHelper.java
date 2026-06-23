package com.braintrust.education.application.helpers.gradebook;

import com.braintrust.education.application.ports.in.UnitGradeService;
import com.braintrust.education.application.ports.out.*;
import com.braintrust.education.domain.exceptions.*;
import com.braintrust.education.domain.model.*;
import com.braintrust.education.domain.valueobjects.*;
import com.braintrust.identity.domain.valueobjects.UserId;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class TeamGradeHelper {

    private static final Logger log = LoggerFactory.getLogger(TeamGradeHelper.class);

    private final SubmissionRepository submissionRepository;
    private final StudentGroupRepository studentGroupRepository;
    private final AssignmentRepository assignmentRepository;
    private final UnitGradeService unitGradeService;

    public TeamGradeHelper(
            SubmissionRepository submissionRepository,
            StudentGroupRepository studentGroupRepository,
            AssignmentRepository assignmentRepository,
            UnitGradeService unitGradeService) {
        this.submissionRepository = submissionRepository;
        this.studentGroupRepository = studentGroupRepository;
        this.assignmentRepository = assignmentRepository;
        this.unitGradeService = unitGradeService;
    }

    public void applyTeamGradeToAllMembers(AssignmentId assignmentId, StudentGroupId groupId) {
        log.info("Applying team grade to all members of group {}", groupId.getValue());

        List<Submission> teamSubmissions = submissionRepository.findByAssignmentId(assignmentId)
                .stream()
                .filter(s -> s.getTeamId() != null && s.getTeamId().equals(groupId))
                .filter(Submission::isGraded)
                .collect(Collectors.toList());

        if (teamSubmissions.isEmpty()) {
            throw new SubmissionNotFoundException("No graded team submission found for group " + groupId.getValue());
        }

        Submission teamSubmission = teamSubmissions.get(0);
        Grade teamGrade = teamSubmission.getGrade();
        String teamFeedback = teamSubmission.getTeacherFeedback();

        StudentGroup group = studentGroupRepository.findById(groupId)
                .orElseThrow(() -> new StudentGroupNotFoundException("Group not found"));

        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new AssignmentNotFoundException("Assignment not found"));

        int updatedCount = 0;

        for (UserId memberId : group.getMemberIds()) {
            try {
                List<Submission> memberSubmissions = submissionRepository.findByAssignmentAndStudent(
                        assignmentId, memberId);

                Submission memberSubmission;
                if (memberSubmissions.isEmpty()) {
                    memberSubmission = Submission.create(
                            assignmentId,
                            memberId,
                            "Team submission - " + teamSubmission.getContent(),
                            teamSubmission.getAttachments(),
                            SubmissionStatus.GRADED,
                            groupId
                    );
                    log.info("Created team submission record for member: {}", memberId.getValue());
                } else {
                    memberSubmission = memberSubmissions.get(0);
                }

                memberSubmission.grade(teamGrade, "Team Grade: " + teamFeedback);
                submissionRepository.save(memberSubmission);

                updateUnitGradeOnlyForTeamMember(assignment, memberId, assignmentId, teamGrade);

                updatedCount++;
                log.debug("Team grade applied to member: {}", memberId.getValue());

            } catch (Exception e) {
                log.error("Failed to apply team grade to member {}: {}",
                        memberId.getValue(), e.getMessage(), e);
            }
        }

        log.info("Team grade successfully applied to {}/{} members with UnitGrade updates only",
                updatedCount, group.getMemberCount());
    }

    private void updateUnitGradeOnlyForTeamMember(
            Assignment assignment,
            UserId studentId,
            AssignmentId assignmentId,
            Grade teamGrade) {

        UnitId unitId = assignment.getUnitId();
        if (unitId == null) {
            log.debug("Assignment {} not associated with any unit, skipping unit grade update",
                    assignmentId.getValue());
            return;
        }

        try {
            log.debug("Adding team assignment grade to UnitGrade for student {} in unit {}",
                    studentId.getValue(), unitId.getValue());

            unitGradeService.addAssignmentGradeToUnit(
                    unitId,
                    studentId,
                    assignmentId,
                    teamGrade
            );

            log.debug("Team assignment grade ADDED to UnitGrade for student {} in unit {} (not replaced)",
                    studentId.getValue(), unitId.getValue());

        } catch (Exception e) {
            log.error("Failed to update UnitGrade for student {}: {}",
                    studentId.getValue(), e.getMessage(), e);
        }
    }
}