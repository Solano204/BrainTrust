package com.braintrust.education.infraestructure.repositoriesPersistence.sql.Mapper;

import com.braintrust.education.domain.model.Submission;
import com.braintrust.education.domain.model.SubmissionStatus;
import com.braintrust.education.domain.valueobjects.AssignmentId;
import com.braintrust.education.domain.valueobjects.Document;
import com.braintrust.education.domain.valueobjects.Grade;
import com.braintrust.education.domain.valueobjects.SubmissionId;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities.DocumentJpaEntity;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities.SubmissionJpaEntity;
import com.braintrust.identity.domain.valueobjects.UserId;
import lombok.extern.slf4j.Slf4j; // ⬅️ IMPORT LOMBOK SLF4J ANNOTATION
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Component
@Slf4j // ⬅️ Enable the 'log' variable
public class SubmissionEntityMapper {

    /**
     * Converts a Submission Domain Model to a JPA Entity.
     */
    public SubmissionJpaEntity toEntity(Submission submission) {
        log.debug("Mapping Submission Domain ID {} (Status: {}) to JPA Entity.",
                submission.getId().getValue(), submission.getStatus().name());

        BigDecimal gradeValue = null;
        BigDecimal gradeMaxScore = null;

        if (submission.getGrade() != null) {
            gradeValue = submission.getGrade().getValue();
            gradeMaxScore = submission.getGrade().getMaxScore();
            log.trace("Mapping grade: {}/{}", gradeValue, gradeMaxScore);
        }

        SubmissionJpaEntity entity = new SubmissionJpaEntity(
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

        // Map attachments
        if (submission.getAttachments() != null && !submission.getAttachments().isEmpty()) {
            log.trace("Mapping {} attached documents.", submission.getAttachments().size());
            List<DocumentJpaEntity> documentEntities = submission.getAttachments().stream()
                    .map(this::toDocumentEntity)  // Without passing IDs
                    .collect(Collectors.toList());
            entity.setDocuments(documentEntities);
        } else {
            entity.setDocuments(new ArrayList<>());
            log.trace("No attachments found for submission.");
        }

        return entity;
    }

    /**
     * Converts a Submission JPA Entity back to a Domain Submission model.
     */
    public Submission toDomain(SubmissionJpaEntity entity) {
        log.debug("Mapping Submission JPA Entity {} back to Domain Model.", entity.getId());

        SubmissionId id = SubmissionId.fromString(entity.getId());
        AssignmentId assignmentId = AssignmentId.fromString(entity.getAssignmentId());
        UserId studentId = UserId.fromString(entity.getStudentId());

        Grade grade = null;
        if (entity.getGradeValue() != null && entity.getGradeMaxScore() != null) {
            grade = new Grade(entity.getGradeValue(), entity.getGradeMaxScore());
            log.trace("Reconstituting grade: {}/{}", grade.getValue(), grade.getMaxScore());
        }

        SubmissionStatus status = SubmissionStatus.valueOf(entity.getStatus());

        // Map documents list from entity to domain
        List<Document> documents = new ArrayList<>();
        if (entity.getDocuments() != null && !entity.getDocuments().isEmpty()) {
            log.trace("Mapping {} documents from entity.", entity.getDocuments().size());
            documents = entity.getDocuments().stream()
                    .map(this::toDomainDocument)
                    .collect(Collectors.toList());
        }

        return Submission.reconstitute(
                id,
                assignmentId,
                studentId,
                entity.getContent(),
                documents,
                entity.getSubmittedAt(),
                status,
                grade,
                entity.getTeacherFeedback()
        );
    }

    // ------------------------------------------------------------------
    // ✅ DOCUMENT MAPPING HELPERS
    // ------------------------------------------------------------------

    private DocumentJpaEntity toDocumentEntity(Document doc) {
        log.trace("Mapping Document entity for storage path: {}", doc.getStoragePath());
        DocumentJpaEntity entity = new DocumentJpaEntity();
        entity.setName(doc.getName());
        entity.setStoragePath(doc.getStoragePath());
        // JPA handles the foreign key (submission_id)
        return entity;
    }

    private Document toDomainDocument(DocumentJpaEntity entity) {
        return new Document(
                entity.getName(),
                entity.getStoragePath()
        );
    }
}