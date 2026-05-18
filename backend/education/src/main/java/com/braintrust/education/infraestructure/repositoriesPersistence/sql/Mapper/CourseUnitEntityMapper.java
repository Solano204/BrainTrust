package com.braintrust.education.infraestructure.repositoriesPersistence.sql.Mapper;

import com.braintrust.education.domain.model.CourseUnit;
import com.braintrust.education.domain.valueobjects.CourseId;
import com.braintrust.education.domain.valueobjects.UnitId;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities.CourseUnitJpaEntity;
import lombok.extern.slf4j.Slf4j; // ⬅️ IMPORT LOMBOK SLF4J ANNOTATION
import org.springframework.stereotype.Component;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;


@Component
public class CourseUnitEntityMapper {

    private static final Logger log =
            LoggerFactory.getLogger(CourseUnitEntityMapper.class);

    public CourseUnitJpaEntity toEntity(CourseUnit unit) {
        log.debug("Mapping CourseUnit Domain ID {} to JPA Entity (Course ID: {}).",
                unit.getId().getValue(), unit.getCourseId().getValue());

        return new CourseUnitJpaEntity(
                unit.getId().getValue(),
                unit.getCourseId().getValue(),
                unit.getName(),
                unit.getUrlImage(),
                unit.getNumUnity(),
                unit.getDescription()
        );
    }


    public CourseUnit toDomain(CourseUnitJpaEntity entity) {
        log.debug("Mapping CourseUnit JPA Entity {} back to Domain Model (Course ID: {}).",
                entity.getId(), entity.getCourseId());

        UnitId id = UnitId.fromString(entity.getId());
        CourseId courseId = CourseId.fromString(entity.getCourseId());

        return CourseUnit.reconstitute(
                id,
                courseId,
                entity.getName(),
                entity.getNumUnity(),
                entity.getDescription(),
                entity.getUrlImage()
        );
    }
}