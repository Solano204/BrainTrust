package com.braintrust.education.application.Maps;

import com.braintrust.education.application.dtos.dtos.CourseDTO;
import com.braintrust.education.application.dtos.dtos.CourseUnitDTO;
import com.braintrust.education.application.dtos.dtos.EnrollmentDTO;
import com.braintrust.education.application.dtos.dtos.GradeDTO;
import com.braintrust.education.domain.model.Course;
import com.braintrust.education.domain.model.CourseUnit;
import com.braintrust.education.domain.model.Enrollment;
public final class CourseMapper {

    private CourseMapper() {
        throw new AssertionError("Cannot instantiate utility class");
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