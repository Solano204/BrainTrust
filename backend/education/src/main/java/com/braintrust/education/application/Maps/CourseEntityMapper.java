package com.braintrust.education.application.Maps;

import com.braintrust.education.domain.model.Course;
import com.braintrust.education.domain.model.CourseUnit;
import com.braintrust.education.domain.model.Enrollment;
import com.braintrust.education.domain.valueobjects.CourseCode;
import com.braintrust.education.domain.valueobjects.CourseId;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.Mapper.CourseUnitEntityMapper;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.Mapper.EnrollmentEntityMapper;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities.CourseJpaEntity;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities.CourseUnitJpaEntity;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities.EnrollmentJpaEntity;
import com.braintrust.identity.domain.valueobjects.UserId;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component


public class CourseEntityMapper {

    private final EnrollmentEntityMapper enrollmentMapper;
    private final CourseUnitEntityMapper unitMapper;

    public CourseEntityMapper(EnrollmentEntityMapper enrollmentMapper,
                              CourseUnitEntityMapper unitMapper) {
        this.enrollmentMapper = enrollmentMapper;
        this.unitMapper = unitMapper;
    }

    public CourseJpaEntity toEntity(Course course) {
        CourseJpaEntity entity = new CourseJpaEntity(
                course.getId().getValue(),
                course.getCode().getValue(),
                course.getName(),
                course.getDescription(),
                course.getUrlImage(),
                course.getGrade(),
                course.getGroup(),
                course.getTeacherId().getValue(),
                course.isActive(),
                LocalDateTime.now()
        );

        Set<EnrollmentJpaEntity> enrollmentEntities = course.getEnrollments().stream()
                .map(enrollmentMapper::toEntity)
                .collect(Collectors.toSet());
        entity.setEnrollments(enrollmentEntities);

        List<CourseUnitJpaEntity> unitEntities = course.getUnits().stream()
                .map(unitMapper::toEntity)
                .collect(Collectors.toList());
        entity.setUnits(unitEntities);

        return entity;
    }

    public Course toDomain(CourseJpaEntity entity) {
        CourseId courseId = CourseId.fromString(entity.getId());
        CourseCode courseCode = new CourseCode(entity.getCode());
        UserId teacherId = UserId.fromString(entity.getTeacherId());

        Set<Enrollment> enrollments = entity.getEnrollments().stream()
                .map(enrollmentMapper::toDomain)
                .collect(Collectors.toSet());

        List<CourseUnit> units = entity.getUnits().stream()
                .map(unitMapper::toDomain)
                .collect(Collectors.toList());

        return Course.reconstitute(
                courseId,
                courseCode,
                entity.getName(),
                entity.getDescription(),
                entity.getUrlImage(),
                entity.getGrade(),
                entity.getGroup(),
                teacherId,
                entity.isActive(),
                enrollments,
                units
        );
    }
}