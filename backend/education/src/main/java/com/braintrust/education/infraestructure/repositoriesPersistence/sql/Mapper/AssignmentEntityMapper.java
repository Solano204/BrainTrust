package com.braintrust.education.infraestructure.repositoriesPersistence.sql.Mapper;


import com.braintrust.education.domain.model.Assignment;
import com.braintrust.education.domain.model.DocumentType;
import com.braintrust.education.domain.valueobjects.AssignmentId;
import com.braintrust.education.domain.valueobjects.CourseId;
import com.braintrust.education.domain.valueobjects.Document;
import com.braintrust.education.domain.valueobjects.Score;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities.AssignmentJpaEntity;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities.DocumentJpaEntity;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class AssignmentEntityMapper {

    public AssignmentJpaEntity toEntity(Assignment assignment) {
        AssignmentJpaEntity entity = new AssignmentJpaEntity(
                assignment.getId().getValue(),
                assignment.getCourseId().getValue(),
                assignment.getTitle(),
                assignment.getDescription(),
                assignment.getCreatedAt(),
                assignment.getDueDate(),
                assignment.getMaxScore().getMaxPoints(),
                assignment.getInstructions(),
                assignment.isActive()
        );

        // ✅ Dejar que JPA maneje los IDs automáticamente
        if (assignment.getAttachments() != null && !assignment.getAttachments().isEmpty()) {
            List<DocumentJpaEntity> documentEntities = assignment.getAttachments().stream()
                    .map(this::toDocumentEntity)  // Sin pasar IDs manualmente
                    .collect(Collectors.toList());
            entity.setDocuments(documentEntities);
        } else {
            entity.setDocuments(new ArrayList<>());
        }

        return entity;
    }

    public Assignment toDomain(AssignmentJpaEntity entity) {
        AssignmentId id = AssignmentId.fromString(entity.getId());
        CourseId courseId = CourseId.fromString(entity.getCourseId());
        Score maxScore = new Score(0, entity.getMaxPoints());

        // Map documents list from entity to domain
        List<Document> documents = new ArrayList<>();
        if (entity.getDocuments() != null && !entity.getDocuments().isEmpty()) {
            documents = entity.getDocuments().stream()
                    .map(this::toDomainDocument)
                    .collect(Collectors.toList());
        }

        // ✅ Reconstituir sin submissions (se cargan por separado si se necesitan)
        return Assignment.reconstitute(
                id,
                courseId,
                entity.getTitle(),
                entity.getDescription(),
                entity.getCreatedAt(),
                documents,
                entity.getDueDate(),
                maxScore,
                entity.getInstructions(),
                Collections.emptyList(),  // ✅ Lista vacía de submissions
                entity.isActive()
        );
    }

    // ✅ Sin parámetros de IDs - JPA los maneja automáticamente
    private DocumentJpaEntity toDocumentEntity(Document doc) {
        DocumentJpaEntity entity = new DocumentJpaEntity();
        entity.setName(doc.getName());
        entity.setStoragePath(doc.getStoragePath());
        // ✅ NO establecer assignmentId ni submissionId
        // JPA lo hace automáticamente por el @JoinColumn
        return entity;
    }

    private Document toDomainDocument(DocumentJpaEntity entity) {
        return new Document(
                entity.getName(),
                entity.getStoragePath()
        );
    }
}