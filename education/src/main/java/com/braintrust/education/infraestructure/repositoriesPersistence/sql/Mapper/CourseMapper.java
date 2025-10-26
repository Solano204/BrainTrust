package com.braintrust.education.infraestructure.repositoriesPersistence.sql.Mapper;

import com.braintrust.education.application.dtos.dtos.CourseDTO;
import com.braintrust.education.application.dtos.dtos.CourseUnitDTO;
import com.braintrust.education.application.dtos.dtos.EnrollmentDTO;
import com.braintrust.education.application.dtos.dtos.GradeDTO;
import com.braintrust.education.domain.model.Course;
import com.braintrust.education.domain.model.CourseUnit;
import com.braintrust.education.domain.model.Enrollment;
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

    // ✅ STATIC METHODS
    public static CourseDTO mapToCourseDTO(Course course) {
        return new CourseDTO(
                course.getId().getValue(),
                course.getCode().getValue(),
                course.getName(),
                course.getDescription(),
                course.getUrlImage(),
                course.getGrade(),
                course.getGroup(),
                course.getTeacherId().getValue(),
                "Teacher Name", // TODO: Get from UserQueryPort
                course.isActive(),
                course.getEnrollments().size(),
                0, // TODO: Get assignment count
                course.getUnits().size(),
                java.time.LocalDateTime.now() // TODO: Add createdAt to Course entity
        );
    }

    public static EnrollmentDTO mapToEnrollmentDTO(Enrollment enrollment) {
        GradeDTO gradeDTO = enrollment.getFinalGrade() != null
                ? new GradeDTO(
                enrollment.getFinalGrade().getValue().toString(),
                enrollment.getFinalGrade().getMaxScore().toString(),
                enrollment.getFinalGrade().getPercentage().toString()
        )
                : null;

        return new EnrollmentDTO(
                enrollment.getId().getValue(),
                enrollment.getCourseId().getValue(),
                "Course Name", // TODO: Get from Course
                enrollment.getStudentId().getValue(),
                "Student Name", // TODO: Get from UserQueryPort
                enrollment.getEnrollmentDate().toString(),
                enrollment.getStatus().name(),
                gradeDTO
        );
    }

    public static CourseUnitDTO mapToUnitDTO(CourseUnit unit) {
        return new CourseUnitDTO(
                unit.getId().getValue(),
                unit.getCourseId().getValue(),
                unit.getName(),
                unit.getUrlImage(),
                unit.getNumUnity(),
                unit.getDescription()
        );
    }


}