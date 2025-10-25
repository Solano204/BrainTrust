package com.braintrust.education.infraestructure.repositoriesPersistence.sql.Mapper;

import com.braintrust.education.domain.model.Submission;
import com.braintrust.education.domain.model.SubmissionStatus;
import com.braintrust.education.domain.valueobjects.AssignmentId;
import com.braintrust.education.domain.valueobjects.Grade;
import com.braintrust.education.domain.valueobjects.SubmissionId;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities.SubmissionJpaEntity;
import com.braintrust.identity.domain.valueobjects.UserId;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Collections;

@Component
public class SubmissionEntityMapper {

    public SubmissionJpaEntity toEntity(Submission submission) {
        BigDecimal gradeValue = null;
        BigDecimal gradeMaxScore = null;

        if (submission.getGrade() != null) {
            gradeValue = submission.getGrade().getValue();
            gradeMaxScore = submission.getGrade().getMaxScore();
        }

        return new SubmissionJpaEntity(
                submission.getId().getValue(),
                submission.getAssignmentId().getValue(),
                submission.getStudentId().getValue(),
                submission.getContent(),
                submission.getSubmittedAt(),
                submission.getStatus().name(),
                gradeValue,
                gradeMaxScore,
                submission.getTeacherFeedback()
        );
    }

    public Submission toDomain(SubmissionJpaEntity entity) {
        SubmissionId submissionId = SubmissionId.fromString(entity.getId());
        AssignmentId assignmentId = AssignmentId.fromString(entity.getAssignmentId());
        UserId studentId = UserId.fromString(entity.getStudentId());

        Grade grade = null;
        if (entity.getGradeValue() != null && entity.getGradeMaxScore() != null) {
            grade = new Grade(
                    entity.getGradeValue(),
                    entity.getGradeMaxScore()
            );
        }

        // Create submission using factory method and then set additional state
        Submission submission = Submission.create(
                assignmentId,
                studentId,
                entity.getContent(),
                Collections.emptyList() // TODO: Load attachments from separate table
        );

        // Use reflection or add setters to set the remaining state
        // For now, we'll assume you add protected setters for reconstruction
        setSubmissionState(submission, entity, grade);

        return submission;
    }

    // Helper method to set the submission state (you might want to make this part of your domain model)
    private void setSubmissionState(Submission submission, SubmissionJpaEntity entity, Grade grade) {
        // This would require adding protected setters to your Submission class
        // or using reflection. Alternatively, modify your Submission class to have
        // a proper reconstitute method that takes all parameters.

        // For now, this is a placeholder - you'll need to implement proper state setting
        // based on your domain model's reconstruction pattern
    }
}