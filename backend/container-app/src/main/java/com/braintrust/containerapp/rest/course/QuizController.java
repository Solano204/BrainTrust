package com.braintrust.containerapp.rest.course;


import com.braintrust.education.application.dtos.commands.*;
import com.braintrust.education.application.dtos.dtos.*;
import com.braintrust.education.application.ports.in.QuizService;
import com.braintrust.education.domain.valueobjects.*;
import com.braintrust.identity.domain.valueobjects.UserId;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;


@RestController
@RequestMapping("/api/quizzes")
public class QuizController {

    private final QuizService quizService;

    public QuizController(QuizService quizService) {
        this.quizService = quizService;
    }

//    @PostMapping
//    public ResponseEntity<String> createQuiz(@RequestBody CreateQuizCommand command) {
//        QuizId id = quizService.createQuiz(command);
//        return ResponseEntity.status(HttpStatus.CREATED).body(id.getValue());
//    }

    @PostMapping("/with-questions")
    public ResponseEntity<String> createQuizWithQuestions(@RequestBody CreateQuizWithQuestionsCommand command) {
        QuizId id = quizService.createQuizWithQuestions(command);
        return ResponseEntity.status(HttpStatus.CREATED).body(id.getValue());
    }


    @PostMapping("/{quizId}/questions")
    public ResponseEntity<Void> addQuestion(
            @PathVariable String quizId,
            @RequestBody AddQuizQuestionCommand command) {
        quizService.addQuestion(command);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PutMapping("/{quizId}")
    public ResponseEntity<Void> updateQuiz(
            @PathVariable String quizId,
            @RequestBody UpdateQuizCommand command) {
        quizService.updateQuiz(command);
        return ResponseEntity.ok().build();
    }


    @GetMapping("/course/{courseId}/basic")
    public ResponseEntity<List<QuizDTO>> getBasicQuizzesByCourse(@PathVariable String courseId) {
        List<QuizDTO> quizzes = quizService.getBasicQuizzesByCourse(CourseId.fromString(courseId));
        return ResponseEntity.ok(quizzes);
    }


//
//    @PutMapping("/{quizId}/activate")
//    public ResponseEntity<Void> activateQuiz(@PathVariable String quizId) {
//        quizService.activateQuiz(new ActivateQuizCommand(quizId));
//        return ResponseEntity.ok().build();
//    }
//
//    @PutMapping("/{quizId}/deactivate")
//    public ResponseEntity<Void> deactivateQuiz(@PathVariable String quizId) {
//        quizService.deactivateQuiz(new DeactivateQuizCommand(quizId));
//        return ResponseEntity.ok().build();
//    }
//
//    @GetMapping("/{quizId}")
//    public ResponseEntity<QuizDTO> getQuiz(@PathVariable String quizId) {
//        QuizDTO dto = quizService.getQuizById(QuizId.fromString(quizId));
//        return ResponseEntity.ok(dto);
//    }
//
//    @GetMapping("/{quizId}/questions")
//    public ResponseEntity<List<QuizQuestionDTO>> getQuestions(@PathVariable String quizId) {
//        List<QuizQuestionDTO> questions = quizService.getQuizQuestions(QuizId.fromString(quizId));
//        return ResponseEntity.ok(questions);
//    }


    @GetMapping("/{quizId}/complete")
    public ResponseEntity<CompleteQuizDTO> getCompleteQuiz(@PathVariable String quizId) {
        CompleteQuizDTO completeQuiz = quizService.getCompleteQuiz(QuizId.fromString(quizId));
        return ResponseEntity.ok(completeQuiz);
    }

    // NEW: Month calendar endpoints for student and teacher
    @GetMapping("/calendar/student/{studentId}/month")
    public ResponseEntity<List<QuizDTO>> getStudentMonthCalendar(
            @PathVariable String studentId,
            @RequestParam String monthStart) {

        List<QuizDTO> quizzes = quizService.getQuizzesForStudentMonth(
                UserId.fromString(studentId),
                monthStart
        );
        return ResponseEntity.ok(quizzes);
    }

    @GetMapping("/calendar/teacher/{teacherId}/month")
    public ResponseEntity<List<QuizDTO>> getTeacherMonthCalendar(
            @PathVariable String teacherId,
            @RequestParam String monthStart) {

        List<QuizDTO> quizzes = quizService.getQuizzesForTeacherMonth(
                UserId.fromString(teacherId),
                monthStart
        );
        return ResponseEntity.ok(quizzes);
    }

    // NEW: Week calendar endpoints for student and teacher
    @GetMapping("/calendar/student/{studentId}/week")
    public ResponseEntity<List<QuizDTO>> getStudentWeekCalendar(
            @PathVariable String studentId,
            @RequestParam String weekStart) {

        List<QuizDTO> quizzes = quizService.getQuizzesForStudentWeek(
                UserId.fromString(studentId),
                weekStart
        );
        return ResponseEntity.ok(quizzes);
    }

    @GetMapping("/calendar/teacher/{teacherId}/week")
    public ResponseEntity<List<QuizDTO>> getTeacherWeekCalendar(
            @PathVariable String teacherId,
            @RequestParam String weekStart) {

        List<QuizDTO> quizzes = quizService.getQuizzesForTeacherWeek(
                UserId.fromString(teacherId),
                weekStart
        );
        return ResponseEntity.ok(quizzes);


//
//
//    @GetMapping("/course/{courseId}")
//    public ResponseEntity<List<QuizDTO>> getQuizzesByCourse(@PathVariable String courseId) {
//        List<QuizDTO> quizzes = quizService.getQuizzesByCourse(CourseId.fromString(courseId));
//        return ResponseEntity.ok(quizzes);
//    }
//
//    @GetMapping("/course/{courseId}/available")
//    public ResponseEntity<List<QuizDTO>> getAvailableQuizzes(@PathVariable String courseId) {
//        List<QuizDTO> quizzes = quizService.getAvailableQuizzesByCourse(CourseId.fromString(courseId));
//        return ResponseEntity.ok(quizzes);
//    }
//
//    @GetMapping("/{quizId}/available")
//    public ResponseEntity<Boolean> isQuizAvailable(@PathVariable String quizId) {
//        boolean available = quizService.isQuizAvailable(QuizId.fromString(quizId));
//        return ResponseEntity.ok(available);
//    }
//
//    @GetMapping("/{quizId}/total-points")
//    public ResponseEntity<Integer> getTotalPoints(@PathVariable String quizId) {
//        int points = quizService.getTotalPoints(QuizId.fromString(quizId));
//        return ResponseEntity.ok(points);
//    }
    }
}