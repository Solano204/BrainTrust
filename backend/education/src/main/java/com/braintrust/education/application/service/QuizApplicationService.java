package com.braintrust.education.application.service;

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
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/quizzes")
public class QuizController {

    private final QuizService quizService;

    public QuizController(QuizService quizService) {
        this.quizService = quizService;
    }

    @PostMapping("/{quizId}/questions/bulk")
    public ResponseEntity<Void> addQuestionsBulk(
            @PathVariable String quizId,
            @RequestBody AddQuizQuestionsBulkCommand command) {

        if (!quizId.equals(command.quizId())) {
            throw new IllegalArgumentException("Quiz ID in path and body must match");
        }

        quizService.addQuestionsBulk(command);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @DeleteMapping("/{quizId}/questions/bulk")
    public ResponseEntity<Void> deleteQuestionsBulk(
            @PathVariable String quizId,
            @RequestBody DeleteQuizQuestionsBulkCommand command) {

        if (!quizId.equals(command.quizId())) {
            throw new IllegalArgumentException("Quiz ID in path and body must match");
        }

        quizService.deleteQuestionsBulk(command);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{quizId}/questions/bulk")
    public ResponseEntity<Void> updateQuestionsBulk(
            @PathVariable String quizId,
            @RequestBody UpdateQuizQuestionsBulkCommand command) {

        if (!quizId.equals(command.quizId())) {
            throw new IllegalArgumentException("Quiz ID in path and body must match");
        }

        quizService.updateQuestionsBulk(command);
        return ResponseEntity.ok().build();
    }

    // Batch modification endpoints

    @PatchMapping("/{quizId}/questions/points")
    public ResponseEntity<Void> updateQuestionsPointsBulk(
            @PathVariable String quizId,
            @RequestBody Map<String, Integer> questionPoints) {

        List<UpdateQuizQuestionsBulkCommand.QuestionUpdateData> updates =
                questionPoints.entrySet().stream()
                        .map(entry -> new UpdateQuizQuestionsBulkCommand.QuestionUpdateData(
                                entry.getKey(),
                                null, // no text change
                                null, // no type change
                                entry.getValue(),
                                null, // no options change
                                null, // no correct answer change
                                UpdateQuizQuestionsBulkCommand.QuestionUpdateData.UpdateAction.UPDATE_POINTS
                        ))
                        .collect(Collectors.toList());

        UpdateQuizQuestionsBulkCommand command = new UpdateQuizQuestionsBulkCommand(
                quizId,
                updates
        );

        quizService.updateQuestionsBulk(command);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{quizId}/questions/text")
    public ResponseEntity<Void> updateQuestionsTextBulk(
            @PathVariable String quizId,
            @RequestBody Map<String, String> questionTexts) {

        List<UpdateQuizQuestionsBulkCommand.QuestionUpdateData> updates =
                questionTexts.entrySet().stream()
                        .map(entry -> new UpdateQuizQuestionsBulkCommand.QuestionUpdateData(
                                entry.getKey(),
                                entry.getValue(),
                                null, // no type change
                                null, // no points change
                                null, // no options change
                                null, // no correct answer change
                                UpdateQuizQuestionsBulkCommand.QuestionUpdateData.UpdateAction.UPDATE_TEXT
                        ))
                        .collect(Collectors.toList());

        UpdateQuizQuestionsBulkCommand command = new UpdateQuizQuestionsBulkCommand(
                quizId,
                updates
        );

        quizService.updateQuestionsBulk(command);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{quizId}/questions/answers")
    public ResponseEntity<Void> updateQuestionsAnswersBulk(
            @PathVariable String quizId,
            @RequestBody Map<String, String> questionAnswers) {

        List<UpdateQuizQuestionsBulkCommand.QuestionUpdateData> updates =
                questionAnswers.entrySet().stream()
                        .map(entry -> new UpdateQuizQuestionsBulkCommand.QuestionUpdateData(
                                entry.getKey(),
                                null, // no text change
                                null, // no type change
                                null, // no points change
                                null, // no options change
                                entry.getValue(), // correct answer
                                UpdateQuizQuestionsBulkCommand.QuestionUpdateData.UpdateAction.UPDATE_ANSWER
                        ))
                        .collect(Collectors.toList());

        UpdateQuizQuestionsBulkCommand command = new UpdateQuizQuestionsBulkCommand(
                quizId,
                updates
        );

        quizService.updateQuestionsBulk(command);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{quizId}/questions/options")
    public ResponseEntity<Void> updateQuestionsOptionsBulk(
            @PathVariable String quizId,
            @RequestBody Map<String, List<QuestionOptionData>> questionOptions) {

        List<UpdateQuizQuestionsBulkCommand.QuestionUpdateData> updates =
                questionOptions.entrySet().stream()
                        .map(entry -> {
                            List<UpdateQuizQuestionsBulkCommand.QuestionOptionUpdateData> optionUpdates =
                                    entry.getValue().stream()
                                            .map(opt -> new UpdateQuizQuestionsBulkCommand.QuestionOptionUpdateData(
                                                    opt.text(),
                                                    opt.correct(),
                                                    null, // no optionId for bulk replacement
                                                    UpdateQuizQuestionsBulkCommand.QuestionOptionUpdateData.OptionAction.UPDATE
                                            ))
                                            .collect(Collectors.toList());

                            return new UpdateQuizQuestionsBulkCommand.QuestionUpdateData(
                                    entry.getKey(),
                                    null, // no text change
                                    null, // no type change
                                    null, // no points change
                                    optionUpdates,
                                    null, // no correct answer change
                                    UpdateQuizQuestionsBulkCommand.QuestionUpdateData.UpdateAction.UPDATE_OPTIONS
                            );
                        })
                        .collect(Collectors.toList());

        UpdateQuizQuestionsBulkCommand command = new UpdateQuizQuestionsBulkCommand(
                quizId,
                updates
        );

        quizService.updateQuestionsBulk(command);
        return ResponseEntity.ok().build();
    }

    // Utility record for option updates
    public record QuestionOptionData(
            String text,
            boolean correct
    ) {}

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

    @GetMapping("/course/{courseId}/unit/{unitId}")
    public ResponseEntity<List<QuizDTO>> getQuizzesByCourseAndUnit(
            @PathVariable String courseId,
            @PathVariable String unitId) {

        try {
            CourseId courseIdVo = CourseId.fromString(courseId);
            UnitId unitIdVo = UnitId.fromString(unitId);

            List<QuizDTO> quizzes = quizService.getQuizzesByCourseAndUnit(courseIdVo, unitIdVo);
            return ResponseEntity.ok(quizzes);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/{quizId}")
    public ResponseEntity<Void> deleteQuiz(@PathVariable String quizId) {
        quizService.deleteQuiz(QuizId.fromString(quizId));
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{quizId}/complete")
    public ResponseEntity<CompleteQuizDTO> getCompleteQuiz(@PathVariable String quizId) {
        CompleteQuizDTO completeQuiz = quizService.getCompleteQuiz(QuizId.fromString(quizId));
        return ResponseEntity.ok(completeQuiz);
    }

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
    }
}