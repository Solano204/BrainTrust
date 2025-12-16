package com.braintrust.education.infraestructure.repositoriesPersistence.sql.Mapper;

import com.braintrust.education.domain.model.StudentGroup;
import com.braintrust.education.domain.valueobjects.*;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities.StudentGroupJpaEntity;
import com.braintrust.identity.domain.valueobjects.UserId;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import java.util.*;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class StudentGroupEntityMapper {

    private static final Logger log =
            LoggerFactory.getLogger(StudentGroupEntityMapper.class);

    public StudentGroupJpaEntity toEntity(StudentGroup group) {
        log.debug("Mapping StudentGroup Domain {} to JPA Entity", group.getId().getValue());

        Set<String> memberIdStrings = group.getMemberIds().stream()
                .map(UserId::getValue)
                .collect(Collectors.toSet());

        return new StudentGroupJpaEntity(
                group.getId().getValue(),
                group.getCourseId().getValue(),
                group.getName(),
                group.getDescription(),
                memberIdStrings,
                group.getCreatedAt(),
                group.isActive()
        );
    }

    public StudentGroup toDomain(StudentGroupJpaEntity entity) {
        log.debug("Mapping StudentGroup JPA Entity {} to Domain", entity.getId());

        StudentGroupId id = StudentGroupId.fromString(entity.getId());
        CourseId courseId = CourseId.fromString(entity.getCourseId());

        Set<UserId> memberIds = entity.getMemberIds().stream()
                .map(UserId::fromString)
                .collect(Collectors.toSet());

        return StudentGroup.reconstitute(
                id,
                courseId,
                entity.getName(),
                entity.getDescription(),
                memberIds,
                entity.getCreatedAt(),
                entity.isActive()
        );
    }
}