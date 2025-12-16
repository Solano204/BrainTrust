package com.braintrust.education.infraestructure.repositoriesPersistence.sql.Mapper;

import com.braintrust.education.application.ports.out.UnitRepository;
import com.braintrust.education.domain.model.Assignment;
import com.braintrust.education.domain.model.AssignmentTargetType;
import com.braintrust.education.domain.model.CourseUnit;
import com.braintrust.education.domain.model.SubmissionFormat;
import com.braintrust.education.domain.valueobjects.*;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities.AssignmentJpaEntity;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities.AssignmentLinkJpaEntity;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities.DocumentJpaEntity;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class AssignmentEntityMapper {

    private static final Logger log =
            LoggerFactory.getLogger(AssignmentEntityMapper.class);

    private final UnitRepository courseUnitRepository;

    public AssignmentEntityMapper(UnitRepository courseUnitRepository) {
        this.courseUnitRepository = courseUnitRepository;
    }

    /**
     * Converts a Domain Assignment model to a JPA Entity.
     */
    public AssignmentJpaEntity toEntity(Assignment assignment) {
        log.info("Mapping Assignment Domain ID {} to JPA Entity.", assignment.getId().getValue());

        // ✅ Find the CourseUnit entity by UnitId
        CourseUnit unitEntity = null;
        if (assignment.getUnitId() != null) {
            unitEntity = courseUnitRepository.findById(UnitId.fromString(assignment.getUnitId().getValue()))
                    .orElseThrow(() -> {
                        log.error("CourseUnit not found for Unit ID: {}", assignment.getUnitId().getValue());
                        return new IllegalArgumentException("CourseUnit not found: " + assignment.getUnitId().getValue());
                    });
        }

        AssignmentJpaEntity entity = new AssignmentJpaEntity(
                assignment.getId().getValue(),
                assignment.getCourseId().getValue(),
                unitEntity.getId().toString(),
                assignment.getTitle(),
                assignment.getDescription(),
                assignment.getCreatedAt(),
                assignment.getDueDate(),
                assignment.getMaxScore().getMaxPoints(),
                assignment.getInstructions(),
                assignment.isActive(),
                assignment.getTargetType().name(),
                assignment.getSubmissionFormat().name() // ✅ NEW: Map submission format
        );
        // ✅ Map attachments with bidirectional relationship
        if (assignment.getAttachments() != null && !assignment.getAttachments().isEmpty()) {
            log.trace("Mapping {} attachments for Assignment ID {}.",
                    assignment.getAttachmentCount(), assignment.getId().getValue());

            List<DocumentJpaEntity> documentEntities = assignment.getAttachments().stream()
                    .map(doc -> toDocumentEntity(doc, entity))
                    .collect(Collectors.toList());
            entity.setDocuments(documentEntities);
        } else {
            entity.setDocuments(new ArrayList<>());
            log.trace("No attachments found for Assignment ID {}.", assignment.getId().getValue());
        }

        // ✅ UPDATED - Map links to AssignmentLinkJpaEntity (using Set)
        if (assignment.getLinks() != null && !assignment.getLinks().isEmpty()) {
            log.trace("Mapping {} links for Assignment ID {}.",
                    assignment.getLinkCount(), assignment.getId().getValue());

            Set<AssignmentLinkJpaEntity> linkEntities = assignment.getLinks().stream()
                    .map(linkUrl -> new AssignmentLinkJpaEntity(entity, linkUrl))
                    .collect(Collectors.toSet());
            entity.setLinks(linkEntities);
        } else {
            entity.setLinks(new HashSet<>());
            log.trace("No links found for Assignment ID {}.", assignment.getId().getValue());
        }

        return entity;
    }

    /**
     * Converts an Assignment JPA Entity back to a Domain Assignment model.
     */
    public Assignment toDomain(AssignmentJpaEntity entity) {
        log.info("Mapping Assignment JPA Entity ID {} to Domain Model.", entity.getId());

        AssignmentId id = AssignmentId.fromString(entity.getId());
        CourseId courseId = CourseId.fromString(entity.getCourseId());

        // ✅ Get UnitId from the CourseUnit entity
        UnitId unitId = null;
        if (entity.getUnit() != null) {
            unitId = UnitId.fromString(entity.getUnit());
        }

        Score maxScore = new Score(0, entity.getMaxPoints());

        // Map documents list from entity to domain
        List<Document> documents = new ArrayList<>();
        if (entity.getDocuments() != null && !entity.getDocuments().isEmpty()) {
            log.trace("Mapping {} attached documents from entity.", entity.getDocuments().size());
            documents = entity.getDocuments().stream()
                    .map(this::toDomainDocument)
                    .collect(Collectors.toList());
        }

        // ✅ UPDATED - Map links from AssignmentLinkJpaEntity (Set) to domain
        List<String> links = new ArrayList<>();
        if (entity.getLinks() != null && !entity.getLinks().isEmpty()) {
            log.trace("Mapping {} links from entity.", entity.getLinks().size());
            links = entity.getLinks().stream()
                    .map(AssignmentLinkJpaEntity::getLinkUrl)
                    .collect(Collectors.toList());
        }

        // Convert targetType string to enum
        AssignmentTargetType targetType = AssignmentTargetType.valueOf(entity.getTargetType());
        SubmissionFormat submissionFormat;
        try {
            submissionFormat = SubmissionFormat.valueOf(entity.getSubmissionFormat());
        } catch (IllegalArgumentException e) {
            submissionFormat = SubmissionFormat.DIGITAL; // Default if invalid
        }
        return Assignment.reconstitute(
                id,
                courseId,
                unitId,
                entity.getTitle(),
                entity.getDescription(),
                entity.getCreatedAt(),
                documents,
                links,
                entity.getDueDate(),
                maxScore,
                entity.getInstructions(),
                Collections.emptyList(),
                entity.isActive(),
                targetType,
                submissionFormat // ✅ NEW: Include submission format
        );}

    // ------------------------------------------------------------------
    // ✅ DOCUMENT MAPPING HELPERS
    // ------------------------------------------------------------------

    private DocumentJpaEntity toDocumentEntity(Document doc, AssignmentJpaEntity assignment) {
        log.trace("Mapping Document: {}", doc.getName());

        DocumentJpaEntity entity = new DocumentJpaEntity();
        entity.setName(doc.getName());
        entity.setStoragePath(doc.getStoragePath());
        entity.setAssignment(assignment);
        return entity;
    }

    private Document toDomainDocument(DocumentJpaEntity entity) {
        return new Document(
                entity.getName(),
                entity.getStoragePath()
        );
    }
}