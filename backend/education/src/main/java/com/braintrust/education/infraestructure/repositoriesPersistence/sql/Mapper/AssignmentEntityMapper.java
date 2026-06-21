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
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.repositories.AssignmentJpaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

@Component
public class AssignmentEntityMapper {

    private static final Logger log = LoggerFactory.getLogger(AssignmentEntityMapper.class);

    private final UnitRepository courseUnitRepository;
    private final AssignmentJpaRepository assignmentJpaRepository;

    public AssignmentEntityMapper(UnitRepository courseUnitRepository,
                                  AssignmentJpaRepository assignmentJpaRepository) {
        this.courseUnitRepository = courseUnitRepository;
        this.assignmentJpaRepository = assignmentJpaRepository;
    }



    // AssignmentEntityMapper.java  add this method
    public void updateEntity(AssignmentJpaEntity entity, Assignment domain) {
        // AssignmentEntityMapper.java
            entity.setId(domain.getId().getValue());
            entity.setCourseId(domain.getCourseId().getValue());
            entity.setUnit(domain.getUnitId().getValue());
            entity.setTitle(domain.getTitle());
            entity.setDescription(domain.getDescription());
            entity.setCreatedAt(domain.getCreatedAt());
            entity.setDueDate(domain.getDueDate());
            entity.setMaxPoints(domain.getMaxScore().getMaxPoints());
            entity.setInstructions(domain.getInstructions());
            entity.setActive(domain.isActive());
            entity.setTargetType(domain.getTargetType().name());
            entity.setSubmissionFormat(domain.getSubmissionFormat().name());
            // DO NOT touch documents or links here  handled by syncDocuments/syncLinks

        // Use syncDocuments/syncLinks  mutates the SAME collection Hibernate tracks
        List<String[]> desiredDocs = domain.getAttachments().stream()
                .map(d -> new String[]{d.getName(), d.getStoragePath()})
                .toList();
        entity.syncDocuments(desiredDocs); // already exists in your entity!

        List<String> desiredLinks = domain.getLinks(); // whatever your domain exposes
        entity.syncLinks(desiredLinks); // already exists in your entity!
    }


    public AssignmentJpaEntity toEntity(Assignment assignment) {
        log.info("Mapping Assignment Domain ID {} to JPA Entity.", assignment.getId().getValue());

        String unitIdValue = null;
        if (assignment.getUnitId() != null) {
            CourseUnit unitEntity = courseUnitRepository
                    .findById(UnitId.fromString(assignment.getUnitId().getValue()))
                    .orElseThrow(() -> {
                        log.error("CourseUnit not found for Unit ID: {}", assignment.getUnitId().getValue());
                        return new IllegalArgumentException(
                                "CourseUnit not found: " + assignment.getUnitId().getValue());
                    });
            unitIdValue = unitEntity.getId().toString();
        }

        Optional<AssignmentJpaEntity> existingOpt =
                assignmentJpaRepository.findByIdWithDocumentsAndLinks(assignment.getId().getValue());

        AssignmentJpaEntity entity;

        if (existingOpt.isPresent()) {
            //  UPDATE path 
            entity = existingOpt.get();
            entity.setCourseId(assignment.getCourseId().getValue());
            entity.setUnit(unitIdValue);
            entity.setTitle(assignment.getTitle());
            entity.setDescription(assignment.getDescription());
            entity.setDueDate(assignment.getDueDate());
            entity.setMaxPoints(assignment.getMaxScore().getMaxPoints());
            entity.setInstructions(assignment.getInstructions());
            entity.setActive(assignment.isActive());
            entity.setTargetType(assignment.getTargetType().name());
            entity.setSubmissionFormat(assignment.getSubmissionFormat().name());

            // Build the desired name+path pairs from the domain object
            List<String[]> desiredDocs = assignment.getAttachments().stream()
                    .map(doc -> new String[]{doc.getName(), doc.getStoragePath()})
                    .collect(Collectors.toList());

            // Use syncDocuments  mutates the SAME Hibernate-tracked collection
            entity.syncDocuments(desiredDocs);

            // Use syncLinks  mutates the SAME Hibernate-tracked collection
            entity.syncLinks(new ArrayList<>(assignment.getLinks()));

        } else {
            //  INSERT path 
            entity = new AssignmentJpaEntity(
                    assignment.getId().getValue(),
                    assignment.getCourseId().getValue(),
                    unitIdValue,
                    assignment.getTitle(),
                    assignment.getDescription(),
                    assignment.getCreatedAt(),
                    assignment.getDueDate(),
                    assignment.getMaxScore().getMaxPoints(),
                    assignment.getInstructions(),
                    assignment.isActive(),
                    assignment.getTargetType().name(),
                    assignment.getSubmissionFormat().name()
            );

            List<DocumentJpaEntity> documentEntities = assignment.getAttachments().stream()
                    .map(doc -> {
                        DocumentJpaEntity d = new DocumentJpaEntity();
                        d.setName(doc.getName());
                        d.setStoragePath(doc.getStoragePath());
                        d.setAssignment(entity);
                        return d;
                    })
                    .collect(Collectors.toList());
            entity.setDocuments(documentEntities);

            Set<AssignmentLinkJpaEntity> linkEntities = assignment.getLinks().stream()
                    .map(url -> new AssignmentLinkJpaEntity(entity, url))
                    .collect(Collectors.toSet());
            entity.setLinks(linkEntities);
        }

        return entity;
    }

    public Assignment toDomain(AssignmentJpaEntity entity) {
        log.info("Mapping Assignment JPA Entity ID {} to Domain Model.", entity.getId());

        AssignmentId id = AssignmentId.fromString(entity.getId());
        CourseId courseId = CourseId.fromString(entity.getCourseId());

        UnitId unitId = null;
        if (entity.getUnit() != null) {
            unitId = UnitId.fromString(entity.getUnit());
        }

        Score maxScore = new Score(0, entity.getMaxPoints());

        List<Document> documents = new ArrayList<>();
        if (entity.getDocuments() != null && !entity.getDocuments().isEmpty()) {
            documents = entity.getDocuments().stream()
                    .map(this::toDomainDocument)
                    .collect(Collectors.toList());
        }

        List<String> links = new ArrayList<>();
        if (entity.getLinks() != null && !entity.getLinks().isEmpty()) {
            links = entity.getLinks().stream()
                    .map(AssignmentLinkJpaEntity::getLinkUrl)
                    .collect(Collectors.toList());
        }

        AssignmentTargetType targetType = AssignmentTargetType.valueOf(entity.getTargetType());

        SubmissionFormat submissionFormat;
        try {
            submissionFormat = SubmissionFormat.valueOf(entity.getSubmissionFormat());
        } catch (IllegalArgumentException e) {
            submissionFormat = SubmissionFormat.DIGITAL;
        }

        return Assignment.reconstitute(
                id, courseId, unitId,
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
                submissionFormat
        );
    }

    private Document toDomainDocument(DocumentJpaEntity entity) {
        return new Document(entity.getName(), entity.getStoragePath());
    }
}