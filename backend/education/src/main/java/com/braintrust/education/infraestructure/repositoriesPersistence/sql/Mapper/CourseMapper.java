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
import lombok.extern.slf4j.Slf4j; // ⬅️ IMPORT LOMBOK SLF4J ANNOTATION
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Collections;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
// other imports...

@Component
public class CourseMapper {

    private static final Logger log =
            LoggerFactory.getLogger(CourseMapper.class);

    /**
     * Converts a Domain Course model to a JPA Entity.
     */
    public CourseJpaEntity toEntity(Course course) {
        log.debug("Mapping Course Domain {} to JPA Entity.", course.getId().getValue());

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
                LocalDateTime.now() // Creation/Update timestamp
        );
    }

    /**
     * Converts a Course JPA Entity back to a Domain Course model.
     */
    public Course toDomain(CourseJpaEntity entity) {
        log.debug("Mapping Course JPA Entity {} back to Domain Model.", entity.getId());

        CourseId courseId = CourseId.fromString(entity.getId());
        CourseCode courseCode = new CourseCode(entity.getCode());
        UserId teacherId = UserId.fromString(entity.getTeacherId());

        // For now, we'll use empty collections for enrollments and units
        log.warn("Course reconstruction: Enrollments and Units are empty collections and must be loaded separately.");

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
                Collections.emptySet(), // Submissions/Enrollments
                Collections.emptyList() // Units
        );
    }

    // ------------------------------------------------------------------
    // ✅ STATIC DTO MAPPING HELPERS
    // ------------------------------------------------------------------

    /**
     * Maps the Course Domain Model to the public CourseDTO.
     */
    public static CourseDTO mapToCourseDTO(Course course) {
        // Logging trace level for frequent DTO operations
        log.trace("Mapping Course {} to DTO.", course.getId().getValue());

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

    /**
     * Maps the Enrollment Domain Model to the public EnrollmentDTO.
     */
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

    /**
     * Maps the CourseUnit Domain Model to the public CourseUnitDTO.
     */
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