package com.braintrust.education.application.helpers.submission;

import com.braintrust.education.application.ports.out.SubmissionRepository;
import com.braintrust.education.domain.valueobjects.Document;
import com.braintrust.education.domain.model.StudentGroup;
import com.braintrust.education.domain.model.Submission;
import com.braintrust.education.domain.valueobjects.AssignmentId;
import com.braintrust.education.domain.valueobjects.StudentGroupId;
import com.braintrust.education.domain.model.SubmissionStatus;
import com.braintrust.identity.domain.valueobjects.UserId;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class TeamSubmissionHelper {

    private static final Logger log = LoggerFactory.getLogger(TeamSubmissionHelper.class);

    private final SubmissionRepository submissionRepository;

    public TeamSubmissionHelper(SubmissionRepository submissionRepository) {
        this.submissionRepository = submissionRepository;
    }

    public void createShadowSubmissionsForTeamMembers(
            StudentGroup team,
            AssignmentId assignmentId,
            Submission mainSubmission,
            StudentGroupId teamId) {

        int shadowCount = 0;

        for (UserId memberId : team.getMemberIds()) {
            if (memberId.equals(mainSubmission.getStudentId())) {
                continue;
            }

            try {
                Submission shadowSubmission = Submission.create(
                        assignmentId,
                        memberId,
                        mainSubmission.getContent(),
                        mainSubmission.getAttachments(),
                        SubmissionStatus.SUBMITTED,
                        teamId
                );

                submissionRepository.save(shadowSubmission);
                shadowCount++;

                log.debug("✅ Created shadow submission for team member: {}", memberId.getValue());

            } catch (Exception e) {
                log.error("❌ Failed to create shadow submission for team member {}: {}",
                        memberId.getValue(), e.getMessage());
            }
        }

        log.info("✅ Created {} shadow submissions for team {}", shadowCount, team.getId().getValue());
    }

    public void validateTeamAssignment(com.braintrust.education.domain.model.Assignment assignment) {
        if (!assignment.isTeamAssignment()) {
            throw new IllegalStateException("This assignment is not configured for teams");
        }

        if (!assignment.canAcceptSubmissions()) {
            throw new IllegalStateException("Assignment is closed and cannot accept submissions");
        }
    }
}