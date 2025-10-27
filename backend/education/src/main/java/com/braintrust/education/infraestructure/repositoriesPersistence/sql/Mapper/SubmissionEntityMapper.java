package com.braintrust.education.infraestructure.repositoriesPersistence.sql.Mapper;

import com.braintrust.education.domain.model.DocumentType;
import com.braintrust.education.domain.model.Submission;
import com.braintrust.education.domain.model.SubmissionStatus;
import com.braintrust.education.domain.valueobjects.AssignmentId;
import com.braintrust.education.domain.valueobjects.Document;
import com.braintrust.education.domain.valueobjects.Grade;
import com.braintrust.education.domain.valueobjects.SubmissionId;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities.DocumentJpaEntity;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities.SubmissionJpaEntity;
import com.braintrust.identity.domain.valueobjects.UserId;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import com.braintrust.education.domain.model.Submission;
import com.braintrust.education.domain.model.SubmissionStatus;
import com.braintrust.education.domain.valueobjects.*;
import com.braintrust.identity.domain.valueobjects.UserId;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class SubmissionEntityMapper {

    public SubmissionJpaEntity toEntity(Submission submission) {
        BigDecimal gradeValue = null;
        BigDecimal gradeMaxScore = null;

        if (submission.getGrade() != null) {
            gradeValue = submission.getGrade().getValue();
            gradeMaxScore = submission.getGrade().getMaxScore();
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

        // ✅ Dejar que JPA maneje los IDs automáticamente
        if (submission.getAttachments() != null && !submission.getAttachments().isEmpty()) {
            List<DocumentJpaEntity> documentEntities = submission.getAttachments().stream()
                    .map(this::toDocumentEntity)  // Sin pasar IDs
                    .collect(Collectors.toList());
            entity.setDocuments(documentEntities);
        } else {
            entity.setDocuments(new ArrayList<>());
        }

        return entity;
    }

    public Submission toDomain(SubmissionJpaEntity entity) {
        SubmissionId id = SubmissionId.fromString(entity.getId());
        AssignmentId assignmentId = AssignmentId.fromString(entity.getAssignmentId());
        UserId studentId = UserId.fromString(entity.getStudentId());

        Grade grade = null;
        if (entity.getGradeValue() != null && entity.getGradeMaxScore() != null) {
            grade = new Grade(entity.getGradeValue(), entity.getGradeMaxScore());
        }

        SubmissionStatus status = SubmissionStatus.valueOf(entity.getStatus());

        // Map documents list from entity to domain
        List<Document> documents = new ArrayList<>();
        if (entity.getDocuments() != null && !entity.getDocuments().isEmpty()) {
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

    // ✅ Sin establecer IDs manualmente
    private DocumentJpaEntity toDocumentEntity(Document doc) {
        DocumentJpaEntity entity = new DocumentJpaEntity();
        entity.setName(doc.getName());
        entity.setStoragePath(doc.getStoragePath());
        // ✅ NO establecer submissionId - JPA lo hace automáticamente
        return entity;
    }

    private Document toDomainDocument(DocumentJpaEntity entity) {
        return new Document(
                entity.getName(),
                entity.getStoragePath()        );
    }
}