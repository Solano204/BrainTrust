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
import com.braintrust.identity.application.dtos.dtos.MinimalUserInfoDTO;
import com.braintrust.identity.application.ports.in.UserService;
import com.braintrust.identity.domain.valueobjects.UserId;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Collections;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class CourseMapper {

    private static final Logger log =
            LoggerFactory.getLogger(CourseMapper.class);


    private final UserService userService;

    // ✅ Add constructor injection for UserService
    public CourseMapper(UserService userService) {
        this.userService = userService;
        log.info("✅ CourseMapper initialized with UserService");
    }

    public CourseDTO mapToCourseDTO(Course course) {
        log.trace("Mapping Course {} to DTO.", course.getId().getValue());

        String teacherName = getTeacherName(course.getTeacherId());

        return new CourseDTO(
                course.getId().getValue(),
                course.getCode().getValue(),
                course.getName(),
                course.getDescription(),
                course.getUrlImage(),
                course.getGrade(),
                course.getGroup(),
                course.getTeacherId().getValue(),
                teacherName, // ✅ Now using real teacher name
                course.isActive(),
                course.getEnrollments().size(),
                0, // TODO: Get assignment count
                course.getUnits().size(),
                java.time.LocalDateTime.now() // TODO: Add createdAt to Course entity
        );
    }

    /**
     * Get teacher name from UserService
     */
    private String getTeacherName(UserId teacherId) {
        try {
            MinimalUserInfoDTO teacherInfo = userService.getMinimalUserInfo(teacherId);
            if (teacherInfo != null) {
                return teacherInfo.fullName();
            }
        } catch (Exception e) {
            log.warn("Failed to get teacher name for ID {}: {}",
                    teacherId.getValue(), e.getMessage());
        }

        // Fallback
        return "Teacher Name";
    }


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
     * Maps the Enrollment Domain Model to the public EnrollmentDTO.
     * NOTE: This is a basic mapping without user details. For full details,
     * use the method in CourseApplicationService that fetches user information.
     */
    public static EnrollmentDTO mapToEnrollmentDTO(Enrollment enrollment) {
        GradeDTO gradeDTO = enrollment.getFinalGrade() != null
                ? new GradeDTO(
                enrollment.getFinalGrade().getValue().toString(),
                enrollment.getFinalGrade().getMaxScore().toString(),
                enrollment.getFinalGrade().getPercentage().toString()
        )
                : null;

        // Return basic EnrollmentDTO without user details
        return new EnrollmentDTO(
                enrollment.getId().getValue(),
                enrollment.getCourseId().getValue(),
                "Course Name", // TODO: Get from Course
                enrollment.getStudentId().getValue(),
                "Student Name", // TODO: Get from UserService
                "", // studentEmail - empty in basic mapping
                "", // studentRefId - empty in basic mapping
                enrollment.getEnrollmentDate().toString(),
                enrollment.getStatus().name(),
                gradeDTO
        );
    }

    /**
     * Overloaded method to map Enrollment with Course name
     */
    public static EnrollmentDTO mapToEnrollmentDTO(Enrollment enrollment, String courseName) {
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
                courseName,
                enrollment.getStudentId().getValue(),
                "Student Name", // TODO: Get from UserService
                "", // studentEmail - empty in basic mapping
                "", // studentRefId - empty in basic mapping
                enrollment.getEnrollmentDate().toString(),
                enrollment.getStatus().name(),
                gradeDTO
        );
    }

    /**
     * Maps the CourseUnit Domain Model to the public CourseUnitDTO.
     */
    public CourseUnitDTO mapToUnitDTO(CourseUnit unit) {
        return new CourseUnitDTO(
                unit.getId().getValue(),
                unit.getCourseId().getValue(),
                unit.getName(),
                unit.getUrlImage(),
                unit.getNumUnity(),
                unit.getDescription()
        );
    }





    /**
     * Maps Enrollment with all user details (to be used with UserService)
     * This is the complete mapping method for enrollment details.
     */
    public static EnrollmentDTO mapToEnrollmentDTOWithDetails(
            Enrollment enrollment,
            String courseName,
            String studentName,
            String studentEmail,
            String studentRefId) {

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
                courseName,
                enrollment.getStudentId().getValue(),
                studentName,
                studentEmail,
                studentRefId,
                enrollment.getEnrollmentDate().toString(),
                enrollment.getStatus().name(),
                gradeDTO
        );
    }
}