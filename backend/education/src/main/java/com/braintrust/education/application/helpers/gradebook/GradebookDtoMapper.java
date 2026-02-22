package com.braintrust.education.application.helpers.gradebook;

import com.braintrust.education.application.dtos.dtos.GradeDTO;
import com.braintrust.education.application.dtos.dtos.GradebookDTO;
import com.braintrust.education.application.ports.out.CourseRepository;
import com.braintrust.education.domain.exceptions.CourseNotFoundException;
import com.braintrust.education.domain.model.Course;
import com.braintrust.education.domain.model.Gradebook;
import com.braintrust.education.domain.valueobjects.CourseId;
import com.braintrust.education.domain.valueobjects.Grade;
import com.braintrust.identity.application.dtos.dtos.MinimalUserInfoDTO;
import com.braintrust.identity.application.ports.in.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;


@Component
public class GradebookDtoMapper {

    private static final Logger log = LoggerFactory.getLogger(GradebookDtoMapper.class);

    private final UserService userService;
    private final CourseRepository courseRepository;

    public GradebookDtoMapper(UserService userService, CourseRepository courseRepository) {
        this.userService = userService;
        this.courseRepository = courseRepository;
    }

    public GradebookDTO toDTO(Gradebook gradebook) {
        MinimalUserInfoDTO studentInfo = userService.getMinimalUserInfo(gradebook.getStudentId());
        String studentName = studentInfo != null ? studentInfo.fullName() : "Unknown Student";

        String courseName = getCourseName(gradebook.getCourseId());

        return new GradebookDTO(
                gradebook.getId().getValue(),
                gradebook.getCourseId().getValue(),
                courseName,
                gradebook.getStudentId().getValue(),
                studentName,
                gradebook.getLastCalculated().toString(),
                gradebook.getCalculatedTotal() != null ? gradebook.getCalculatedTotal().toString() : null,
                gradebook.getFinalGrade() != null ? gradebook.getFinalGrade().toString() : null,
                gradebook.getFinalFeedback()
        );
    }

    public GradeDTO toGradeDTO(Grade grade) {
        return new GradeDTO(
                grade.getValue().toString(),
                grade.getMaxScore().toString(),
                grade.getPercentage().toString()
        );
    }

    private String getCourseName(CourseId courseId) {
        try {
            Course course = courseRepository.findById(courseId)
                    .orElseThrow(() -> new CourseNotFoundException("Course not found"));
            return course.getName();
        } catch (Exception e) {
            log.warn("Could not resolve course name for course ID: {}", courseId.getValue());
            return "Course";
        }
    }
}