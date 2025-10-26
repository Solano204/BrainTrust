package com.braintrust.education.infraestructure.repositoriesPersistence.sql.Mapper;

import com.braintrust.education.domain.model.CourseUnit;
import com.braintrust.education.domain.valueobjects.CourseId;
import com.braintrust.education.domain.valueobjects.UnitId;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities.CourseUnitJpaEntity;
import org.springframework.stereotype.Component;

@Component
public class CourseUnitEntityMapper {

    public CourseUnitJpaEntity toEntity(CourseUnit unit) {
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