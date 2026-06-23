package com.braintrust.education.application.mappers;

import com.braintrust.education.application.dtos.dtos.EnrollmentDTO;
import com.braintrust.education.application.dtos.dtos.GradeDTO;
import com.braintrust.education.domain.model.Course;
import com.braintrust.education.domain.model.Enrollment;

import  com.braintrust.education.domain.valueobjects.Grade;
import com.braintrust.education.domain.valueobjects.CourseId;
import com.braintrust.identity.application.dtos.dtos.UserDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Optional;

@Component
public class CourseDtoMapper {

    private static final Logger log = LoggerFactory.getLogger(CourseDtoMapper.class);

    public EnrollmentDTO mapToEnrollmentDTO(
            Enrollment enrollment,
            Course course,
            Map<String, UserDTO> userDetailsMap,
            Optional<GradeDTO> finalGrade) {

        try {
            UserDTO userDetail = userDetailsMap.get(enrollment.getStudentId().getValue());

            String studentName = userDetail != null ? userDetail.person().fullName() : "Unknown Student";
            String studentEmail = userDetail != null ? userDetail.email() : "";
            String studentRefId = userDetail != null ? userDetail.studentId() : "";

            return new EnrollmentDTO(
                    enrollment.getId().getValue(),
                    course.getId().getValue(),
                    course.getName(),
                    enrollment.getStudentId().getValue(),
                    studentName,
                    studentEmail,
                    studentRefId,
                    enrollment.getEnrollmentDate().toString(),
                    enrollment.getStatus().name(),
                    finalGrade.orElse(null)
            );

        } catch (Exception e) {
            log.warn("Failed to map enrollment {}, using fallback: {}",
                    enrollment.getId().getValue(), e.getMessage());
            return mapToEnrollmentDTOFallback(enrollment, course, finalGrade.orElse(null));
        }
    }

    public EnrollmentDTO mapToEnrollmentDTOFallback(
            Enrollment enrollment,
            Course course,
            GradeDTO gradeDTO) {

        return new EnrollmentDTO(
                enrollment.getId().getValue(),
                course.getId().getValue(),
                course.getName(),
                enrollment.getStudentId().getValue(),
                "Student Name",
                "",
                "",
                enrollment.getEnrollmentDate().toString(),
                enrollment.getStatus().name(),
                gradeDTO
        );
    }

    public GradeDTO mapToGradeDTO(Grade grade) {
        if (grade == null) {
            return null;
        }

        return new GradeDTO(
                grade.getValue().toString(),
                grade.getMaxScore().toString(),
                grade.getPercentage().toString()
        );
    }
}