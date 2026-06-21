package com.braintrust.education.application.helpers.course;

import com.braintrust.education.application.dtos.dtos.GradeDTO;
import com.braintrust.education.application.ports.out.GradebookRepository;
import com.braintrust.education.domain.model.Enrollment;
import com.braintrust.education.domain.model.Gradebook;
import com.braintrust.education.domain.valueobjects.CourseId;
import com.braintrust.education.domain.valueobjects.Grade;
import com.braintrust.identity.domain.valueobjects.UserId;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.Optional;


@Component
public class GradebookHelper {

    private static final Logger log = LoggerFactory.getLogger(GradebookHelper.class);

    private final GradebookRepository gradebookRepository;

    public GradebookHelper(GradebookRepository gradebookRepository) {
        this.gradebookRepository = gradebookRepository;
    }

    public void createEmptyGradebook(CourseId courseId, UserId studentId) {
        try {
            boolean gradebookExists = gradebookRepository.existsByCourseAndStudent(courseId, studentId);

            if (!gradebookExists) {
                log.info("Creating empty Gradebook for Student {} in Course {}",
                        studentId.getValue(), courseId.getValue());

                Gradebook emptyGradebook = Gradebook.create(courseId, studentId);
                gradebookRepository.save(emptyGradebook);

                log.info("Empty Gradebook created for Student {} in Course {}",
                        studentId.getValue(), courseId.getValue());
            } else {
                log.debug("Gradebook already exists for Student {} in Course {}",
                        studentId.getValue(), courseId.getValue());
            }

        } catch (Exception e) {
            log.error("Failed to create Gradebook for Student {} in Course {}: {}",
                    studentId.getValue(), courseId.getValue(), e.getMessage(), e);
        }
    }

    public Optional<GradeDTO> getFinalGrade(Enrollment enrollment, CourseId courseId) {
        try {

            if (enrollment.getFinalGrade() != null) {
                Grade grade = enrollment.getFinalGrade();
                return Optional.of(new GradeDTO(
                        grade.getValue().toString(),
                        grade.getMaxScore().toString(),
                        grade.getPercentage().toString()
                ));
            }

            try {
                Optional<Gradebook> gradebook = gradebookRepository.findByCourseAndStudent(
                        courseId, enrollment.getStudentId());

                if (gradebook.isPresent() && gradebook.get().getFinalGrade() != null) {
                    Grade grade = new Grade(
                            gradebook.get().getFinalGrade(),
                            gradebook.get().getFinalGrade()
                    );
                    return Optional.of(new GradeDTO(
                            grade.getValue().toString(),
                            grade.getMaxScore().toString(),
                            grade.getPercentage().toString()
                    ));
                }
            } catch (Exception e) {
                log.debug("No gradebook found for student {} in course {}",
                        enrollment.getStudentId().getValue(), courseId.getValue());
            }

            return Optional.empty();

        } catch (Exception e) {
            log.warn("Failed to get final grade for enrollment {}: {}",
                    enrollment.getId().getValue(), e.getMessage());
            return Optional.empty();
        }
    }

    public void deleteCourseGradebooks(CourseId courseId) {
        try {
            var gradebooks = gradebookRepository.findByCourseId(courseId);
            if (!gradebooks.isEmpty()) {
                log.info("Deleting {} gradebooks for Course ID: {}", gradebooks.size(), courseId.getValue());
                for (Gradebook gradebook : gradebooks) {
                    gradebookRepository.delete(gradebook);
                }
                log.info("Gradebooks deleted for Course ID: {}", courseId.getValue());
            }
        } catch (Exception e) {
            log.error("Failed to delete gradebooks for Course ID {}: {}", courseId.getValue(), e.getMessage());
        }
    }
}