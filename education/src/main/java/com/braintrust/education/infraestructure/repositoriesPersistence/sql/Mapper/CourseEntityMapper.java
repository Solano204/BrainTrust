package com.braintrust.education.infraestructure.repositoriesPersistence.sql.Mapper;

import com.braintrust.education.domain.model.Course;
import com.braintrust.education.domain.valueobjects.CourseCode;
import com.braintrust.education.domain.valueobjects.CourseId;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities.CourseJpaEntity;
import com.braintrust.identity.domain.valueobjects.UserId;
import org.springframework.stereotype.Component;

import java.sql.Time;
import java.time.LocalDateTime;
import java.util.Collections;

@Component
public class CourseEntityMapper {

    public CourseJpaEntity toEntity(Course course) {
        return new CourseJpaEntity(
                course.getId().getValue(),
                course.getCode().getValue(),
                course.getName(),
                course.getDescription(),
                course.getUrlImage(),
                course.getGrade(),
                course.getGroup(),
                course.getTeacherId().getValue(),
                course.isActive(),
                LocalDateTime.now() // ✅ FIXED
        );
    }

    public Course toDomain(CourseJpaEntity entity) {
        CourseId courseId = CourseId.fromString(entity.getId());
        CourseCode courseCode = new CourseCode(entity.getCode());
        UserId teacherId = UserId.fromString(entity.getTeacherId());

        // For now, we'll use empty collections for enrollments and units
        // You'll need to implement proper relationships in JPA for these
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
                Collections.emptySet(), // TODO: Load enrollments from separate table
                Collections.emptyList() // TODO: Load units from separate table
        );
    }
}