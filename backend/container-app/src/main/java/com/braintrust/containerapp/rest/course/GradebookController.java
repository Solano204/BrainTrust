package com.braintrust.containerapp.rest.course;

import com.braintrust.education.application.dtos.commands.*;
import com.braintrust.education.application.dtos.dtos.*;
import com.braintrust.education.application.ports.in.GradebookService;
import com.braintrust.education.application.ports.in.SubmissionService;
import com.braintrust.education.application.ports.in.QuizSubmissionService;
import com.braintrust.education.domain.valueobjects.*;
import com.braintrust.identity.application.dtos.commands.AssignFinalGradeCommand;
import com.braintrust.identity.domain.valueobjects.UserId;
import com.braintrust.shared.application.dtos.dtos.SuccessResponseDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;


@RestController
@RequestMapping("/api/gradebook")
@CrossOrigin(origins = "*")
public class GradebookController {
    private static final Logger log =
            LoggerFactory.getLogger(GradebookController.class);
    private final GradebookService gradebookService;
    private final SubmissionService submissionService;
    private final QuizSubmissionService quizSubmissionService;

    public GradebookController(GradebookService gradebookService, SubmissionService submissionService, QuizSubmissionService quizSubmissionService) {
        this.gradebookService = gradebookService;
        this.submissionService = submissionService;
        this.quizSubmissionService = quizSubmissionService;
    }

    @PutMapping("/course/{courseId}/student/{studentId}/final-grade")
    public ResponseEntity<Void> assignFinalGrade(
            @PathVariable String courseId,
            @PathVariable String studentId,
            @RequestBody AssignFinalGradeCommand command) {

        log.info("Assigning final grade for student {} in course {}: {}",
                studentId, courseId, command.gradeValue());

        gradebookService.assignFinalGrade(
                CourseId.fromString(courseId),
                UserId.fromString(studentId),
                new BigDecimal(command.gradeValue()),
                command.feedback()
        );

        return ResponseEntity.ok().build();
    }

    @GetMapping("/course/{courseId}/student/{studentId}")
    public ResponseEntity<GradebookDTO> getGradebookByStudent(
            @PathVariable String courseId,
            @PathVariable String studentId) {

        GradebookDTO dto = gradebookService.getGradebookByStudent(
                CourseId.fromString(courseId),
                UserId.fromString(studentId)
        );
        return ResponseEntity.ok(dto);
    }


    @PutMapping("/course/{courseId}/bulk-grades")
    public ResponseEntity<SuccessResponseDTO> bulkUpdateCourseGrades(
            @PathVariable String courseId,
            @RequestBody BulkUpdateCourseGradesCommand command) {

        log.info("Bulk updating grades for {} students in course {}",
                command.grades().size(), courseId);

        BulkUpdateCourseGradesCommand finalCommand = new BulkUpdateCourseGradesCommand(
                courseId,
                command.grades()
        );

        gradebookService.bulkUpdateCourseGrades(finalCommand);

        return ResponseEntity.ok(new SuccessResponseDTO(
                true,
                String.format("Bulk updated %d grades for course %s",
                        command.grades().size(), courseId),
                null
        ));
    }


    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<GradebookDTO>> getGradebooksByCourse(
            @PathVariable String courseId) {

        log.debug("Fetching gradebook table for course {}", courseId);

        List<GradebookDTO> gradebooks = gradebookService.getGradebooksByCourse(
                CourseId.fromString(courseId)
        );

        log.info("Retrieved {} student gradebooks", gradebooks.size());
        return ResponseEntity.ok(gradebooks);
    }


}