package com.braintrust.containerapp.rest.course;

import com.braintrust.education.application.dtos.commands.*;
import com.braintrust.education.application.dtos.dtos.*;
import com.braintrust.education.application.ports.in.QuizSubmissionService;
import com.braintrust.education.domain.model.QuizSubmissionStatus;
import com.braintrust.education.domain.valueobjects.*;
import com.braintrust.identity.domain.valueobjects.UserId;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quiz-submissions")
public class QuizSubmissionController {

    private static final Logger log = LoggerFactory.getLogger(QuizSubmissionController.class);

    private final QuizSubmissionService submissionService;

    public QuizSubmissionController(QuizSubmissionService submissionService) {
        this.submissionService = submissionService;
    }



    @PostMapping("/submit-with-answers")
    public ResponseEntity<QuizSubmissionDetailDTO> submitQuizWithAnswers(@RequestBody SubmitQuizWithAnswersCommand command) {
        QuizSubmissionId id = submissionService.submitQuizWithAnswers(command);
        QuizSubmissionDetailDTO submissionDetail = submissionService.getSubmissionDetailById(id);
        return ResponseEntity.status(HttpStatus.CREATED).body(submissionDetail);
    }

    @PostMapping("/{submissionId}/grade")
    public ResponseEntity<QuizSubmissionDetailDTO> gradeSubmission(
            @PathVariable String submissionId,
            @RequestBody GradeQuizSubmissionCommand command) {

        if (!submissionId.equals(command.quizSubmissionId())) {
            throw new IllegalArgumentException("Submission ID mismatch");
        }

        submissionService.gradeQuizSubmission(command);
        QuizSubmissionDetailDTO gradedSubmission = submissionService.getSubmissionDetailById(
                QuizSubmissionId.fromString(submissionId)
        );
        return ResponseEntity.ok(gradedSubmission);
    }



    /*
    @PostMapping("/start")
    public ResponseEntity<String> startQuiz(@RequestBody StartQuizCommand command) {
        QuizSubmissionId id = submissionService.startQuiz(command);
        return ResponseEntity.status(HttpStatus.CREATED).body(id.getValue());
    }
    */

    /*
    @PostMapping("/{submissionId}/answer")
    public ResponseEntity<Void> answerQuestion(
            @PathVariable String submissionId,
            @RequestBody AnswerQuestionCommand command) {
        submissionService.answerQuestion(command);
        return ResponseEntity.ok().build();
    }
    */

    /*
    @PostMapping("/{submissionId}/submit")
    public ResponseEntity<Void> submitQuiz(@PathVariable String submissionId) {
        submissionService.submitQuiz(new SubmitQuizCommand(submissionId));
        return ResponseEntity.ok().build();
    }
    */

    @GetMapping("/quiz/{quizId}/student/{studentId}/detail")
    public ResponseEntity<QuizSubmissionDetailDTO> getStudentQuizSubmissionDetail(
            @PathVariable String quizId,
            @PathVariable String studentId) {

        log.debug("Getting detailed submission for Quiz: {}, Student: {}", quizId, studentId);

        QuizSubmissionDetailDTO submission = submissionService.getStudentQuizSubmissionDetail(quizId, studentId);

        if (submission != null) {
            return ResponseEntity.ok(submission);
        } else {
            return ResponseEntity.notFound().build();
        }
    }


    // ✅ NEW: Get quiz submissions by course and unit with basic info
    @GetMapping("/course/{courseId}/unit/{unitId}/basic")
    public ResponseEntity<List<QuizSubmissionBasicDTO>> getSubmissionsByCourseAndUnitBasic(
            @PathVariable String courseId,
            @PathVariable String unitId) {

        log.debug("Fetching basic quiz submissions for Course: {}, Unit: {}", courseId, unitId);

        List<QuizSubmissionBasicDTO> submissions = submissionService.getSubmissionsByCourseAndUnitBasic(
                CourseId.fromString(courseId),
                UnitId.fromString(unitId)
        );

        return ResponseEntity.ok(submissions);
    }

    // ✅ NEW: Get quiz submissions by student, course and unit with basic info
    @GetMapping("/student/{studentId}/course/{courseId}/unit/{unitId}/basic")
    public ResponseEntity<List<QuizSubmissionBasicDTO>> getSubmissionsByStudentAndCourseAndUnitBasic(
            @PathVariable String studentId,
            @PathVariable String courseId,
            @PathVariable String unitId) {

        log.debug("Fetching basic quiz submissions for Student: {}, Course: {}, Unit: {}",
                studentId, courseId, unitId);

        List<QuizSubmissionBasicDTO> submissions = submissionService.getSubmissionsByStudentAndCourseAndUnitBasic(
                UserId.fromString(studentId),
                CourseId.fromString(courseId),
                UnitId.fromString(unitId)
        );

        return ResponseEntity.ok(submissions);
    }

    @GetMapping("/{submissionId}")
    public ResponseEntity<QuizSubmissionDTO> getSubmission(@PathVariable String submissionId) {
        QuizSubmissionDTO dto = submissionService.getSubmissionById(
                QuizSubmissionId.fromString(submissionId)
        );
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/{submissionId}/detail")
    public ResponseEntity<QuizSubmissionDetailDTO> getSubmissionDetail(@PathVariable String submissionId) {
        QuizSubmissionDetailDTO dto = submissionService.getSubmissionDetailById(
                QuizSubmissionId.fromString(submissionId)
        );
        return ResponseEntity.ok(dto);
    }

    /**
     * ✅ NEW: Get all quiz submissions for a course, ordered by date (recent first)
     */
    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<QuizSubmissionDTO>> getSubmissionsByCourse(@PathVariable String courseId) {
        List<QuizSubmissionDTO> submissions = submissionService.getSubmissionsByCourse(
                CourseId.fromString(courseId)
        );
        return ResponseEntity.ok(submissions);
    }

    /**
     * ✅ NEW: Get all quiz submissions for a course with basic info
     */
    @GetMapping("/course/{courseId}/basic")
    public ResponseEntity<List<QuizSubmissionBasicDTO>> getSubmissionsByCourseBasic(@PathVariable String courseId) {
        List<QuizSubmissionBasicDTO> submissions = submissionService.getSubmissionsByCourseBasic(
                CourseId.fromString(courseId)
        );
        return ResponseEntity.ok(submissions);
    }

    /*
    @GetMapping("/quiz/{quizId}")
    public ResponseEntity<List<QuizSubmissionDTO>> getSubmissionsByQuiz(@PathVariable String quizId) {
        List<QuizSubmissionDTO> submissions = submissionService.getSubmissionsByQuiz(
                QuizId.fromString(quizId)
        );
        return ResponseEntity.ok(submissions);
    }
    */

    @GetMapping("/student/{studentId}/{courseId}")
    public ResponseEntity<List<QuizSubmissionDTO>> getSubmissionsByStudent(@PathVariable String studentId, @PathVariable String courseId) {
        List<QuizSubmissionDTO> submissions = submissionService.getSubmissionsByStudent(
                UserId.fromString(studentId)
        );
        return ResponseEntity.ok(submissions);
    }

    /*
    @GetMapping("/quiz/{quizId}/student/{studentId}")
    public ResponseEntity<List<QuizSubmissionDTO>> getSubmissionsByQuizAndStudent(
            @PathVariable String quizId,
            @PathVariable String studentId) {
        List<QuizSubmissionDTO> submissions = submissionService.getSubmissionsByQuizAndStudent(
                QuizId.fromString(quizId),
                UserId.fromString(studentId)
        );
        return ResponseEntity.ok(submissions);
    }
    */

    /*
    @GetMapping("/quiz/{quizId}/student/{studentId}/latest")
    public ResponseEntity<QuizSubmissionDTO> getLatestSubmission(
            @PathVariable String quizId,
            @PathVariable String studentId) {
        QuizSubmissionDTO dto = submissionService.getLatestSubmission(
                QuizId.fromString(quizId),
                UserId.fromString(studentId)
        );
        return ResponseEntity.ok(dto);
    }
    */

    /*
    @GetMapping("/status/{status}")
    public ResponseEntity<List<QuizSubmissionDTO>> getSubmissionsByStatus(@PathVariable String status) {
        List<QuizSubmissionDTO> submissions = submissionService.getSubmissionsByStatus(
                QuizSubmissionStatus.valueOf(status)
        );
        return ResponseEntity.ok(submissions);
    }
    */

    /*
    @GetMapping("/quiz/{quizId}/analytics")
    public ResponseEntity<QuizSubmissionAnalyticsDTO> getAnalytics(@PathVariable String quizId) {
        QuizSubmissionAnalyticsDTO analytics = submissionService.getQuizAnalytics(
                QuizId.fromString(quizId)
        );
        return ResponseEntity.ok(analytics);
    }
    */

    /*
    @GetMapping("/quiz/{quizId}/student/{studentId}/attempts")
    public ResponseEntity<Integer> getAttemptCount(
            @PathVariable String quizId,
            @PathVariable String studentId) {
        int count = submissionService.getAttemptCount(
                QuizId.fromString(quizId),
                UserId.fromString(studentId)
        );
        return ResponseEntity.ok(count);
    }
    */

    // NEW: Delete submission and restart unit grade
    @DeleteMapping("/{submissionId}")
    public ResponseEntity<Void> deleteSubmission(@PathVariable String submissionId) {
        submissionService.deleteSubmission(QuizSubmissionId.fromString(submissionId));
        return ResponseEntity.noContent().build();
    }
}