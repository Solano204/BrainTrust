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
                teacherName,
                course.isActive(),
                course.getEnrollments().size(),
                0, // TODO: Get assignment count
                course.getUnits().size(),
                java.time.LocalDateTime.now() // TODO: Add createdAt to Course entity
        );
    }


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


        return "Teacher Name";
    }


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
                LocalDateTime.now()
        );
    }


    public Course toDomain(CourseJpaEntity entity) {
        log.debug("Mapping Course JPA Entity {} back to Domain Model.", entity.getId());

        CourseId courseId = CourseId.fromString(entity.getId());
        CourseCode courseCode = new CourseCode(entity.getCode());
        UserId teacherId = UserId.fromString(entity.getTeacherId());

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
                Collections.emptySet(),
                Collections.emptyList()
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
                "Student Name", // TODO: Get from UserService
                "",
                "",
                enrollment.getEnrollmentDate().toString(),
                enrollment.getStatus().name(),
                gradeDTO
        );
    }

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
                "Student Name",
                "",
                "",
                enrollment.getEnrollmentDate().toString(),
                enrollment.getStatus().name(),
                gradeDTO
        );
    }


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