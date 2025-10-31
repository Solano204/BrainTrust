package com.braintrust.education.infraestructure.repositoriesPersistence.sql.Mapper;

import com.braintrust.education.domain.model.Assignment;
import com.braintrust.education.domain.valueobjects.AssignmentId;
import com.braintrust.education.domain.valueobjects.CourseId;
import com.braintrust.education.domain.valueobjects.Document;
import com.braintrust.education.domain.valueobjects.Score;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities.AssignmentJpaEntity;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities.DocumentJpaEntity;
import lombok.extern.slf4j.Slf4j; // ⬅️ IMPORT LOMBOK SLF4J ANNOTATION
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
@Slf4j // ⬅️ Enable the 'log' variable
public class AssignmentEntityMapper {

    /**
     * Converts a Domain Assignment model to a JPA Entity.
     */
    public AssignmentJpaEntity toEntity(Assignment assignment) {
        log.debug("Mapping Assignment Domain ID {} to JPA Entity.", assignment.getId().getValue());

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

        // Map attachments
        if (assignment.getAttachments() != null && !assignment.getAttachments().isEmpty()) {
            log.trace("Mapping {} attachments for Assignment ID {}.",
                    assignment.getAttachmentCount(), assignment.getId().getValue());

            List<DocumentJpaEntity> documentEntities = assignment.getAttachments().stream()
                    .map(this::toDocumentEntity)  // Map attachments (without manual IDs)
                    .collect(Collectors.toList());
            entity.setDocuments(documentEntities);
        } else {
            entity.setDocuments(new ArrayList<>());
            log.trace("No attachments found for Assignment ID {}.", assignment.getId().getValue());
        }

        return entity;
    }

    /**
     * Converts an Assignment JPA Entity back to a Domain Assignment model.
     */
    public Assignment toDomain(AssignmentJpaEntity entity) {
        log.debug("Mapping Assignment JPA Entity ID {} to Domain Model.", entity.getId());

        AssignmentId id = AssignmentId.fromString(entity.getId());
        CourseId courseId = CourseId.fromString(entity.getCourseId());
        Score maxScore = new Score(0, entity.getMaxPoints());

        // Map documents list from entity to domain
        List<Document> documents = new ArrayList<>();
        if (entity.getDocuments() != null && !entity.getDocuments().isEmpty()) {
            log.trace("Mapping {} attached documents from entity.", entity.getDocuments().size());
            documents = entity.getDocuments().stream()
                    .map(this::toDomainDocument)
                    .collect(Collectors.toList());
        }

        // Reconstitute the domain aggregate root
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
                Collections.emptyList(),  // Submissions are empty (lazy loaded/separate context)
                entity.isActive()
        );
    }

    // ------------------------------------------------------------------
    // ✅ DOCUMENT MAPPING HELPERS
    // ------------------------------------------------------------------

    private DocumentJpaEntity toDocumentEntity(Document doc) {
        // Logging trace level since this is a high-frequency helper method
        log.trace("Mapping Document: {}", doc.getName());

        DocumentJpaEntity entity = new DocumentJpaEntity();
        entity.setName(doc.getName());
        entity.setStoragePath(doc.getStoragePath());
        // JPA handles the foreign key (assignment_id) based on the cascade/relationship
        return entity;
    }

    private Document toDomainDocument(DocumentJpaEntity entity) {
        return new Document(
                entity.getName(),
                entity.getStoragePath()
        );
    }
}