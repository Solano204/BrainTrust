package com.braintrust.education.infraestructure.repositoriesPersistence.sql.Mapper;


import com.braintrust.education.domain.model.Assignment;
import com.braintrust.education.domain.valueobjects.AssignmentId;
import com.braintrust.education.domain.valueobjects.CourseId;
import com.braintrust.education.domain.valueobjects.Document;
import com.braintrust.education.domain.valueobjects.Score;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities.AssignmentJpaEntity;
import org.springframework.stereotype.Component;

import java.util.Collections;

@Component
public class AssignmentEntityMapper {

    public AssignmentJpaEntity toEntity(Assignment assignment) {
        return new AssignmentJpaEntity(
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
    }

    public Assignment toDomain(AssignmentJpaEntity entity) {
        AssignmentId assignmentId = AssignmentId.fromString(entity.getId());
        CourseId courseId = CourseId.fromString(entity.getCourseId());

        // For now, we'll use empty lists for attachments and submissions
        // You'll need to implement proper relationships in JPA for these
        return Assignment.reconstitute(
                assignmentId,
                courseId,
                entity.getTitle(),
                entity.getDescription(),
                entity.getCreatedAt(),
                Collections.emptyList(), // TODO: Load attachments from separate table
                entity.getDueDate(),
                new Score(entity.getMaxPoints(), entity.getMaxPoints()),
                entity.getInstructions(),
                Collections.emptyList(), // TODO: Load submissions from separate table
                entity.isActive()
        );
    }
}