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
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/quizzes")
public class QuizController {

    private final QuizService quizService;

    public QuizController(QuizService quizService) {
        this.quizService = quizService;
    }



    @PostMapping("/with-questions")
    public ResponseEntity<CompleteQuizDTO> createQuizWithQuestions(@RequestBody CreateQuizWithQuestionsCommand command) {
        QuizId id = quizService.createQuizWithQuestions(command);
        CompleteQuizDTO createdQuiz = quizService.getCompleteQuiz(id);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdQuiz);
    }

    @PutMapping("/{quizId}")
    public ResponseEntity<CompleteQuizDTO> updateQuiz(
            @PathVariable String quizId,
            @RequestBody UpdateQuizCommand command) {

        if (!quizId.equals(command.quizId())) {
            throw new IllegalArgumentException("Quiz ID in path and body must match");
        }

        quizService.updateQuiz(command);
        CompleteQuizDTO updatedQuiz = quizService.getCompleteQuiz(QuizId.fromString(quizId));
        return ResponseEntity.ok(updatedQuiz);
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
                                null,
                                null,
                                null,
                                null,
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
                                entry.getValue(),
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
            @RequestBody Map<String, List<QuestionOptionUpdateData>> questionOptions) {

        List<UpdateQuizQuestionsBulkCommand.QuestionUpdateData> updates =
                questionOptions.entrySet().stream()
                        .map(entry -> new UpdateQuizQuestionsBulkCommand.QuestionUpdateData(
                                entry.getKey(),
                                null, // no text change
                                null, // no type change
                                null, // no points change
                                entry.getValue().stream()
                                        .map(opt -> new UpdateQuizQuestionsBulkCommand.QuestionOptionUpdateData(
                                                opt.text(),
                                                opt.correct(),
                                                opt.optionId(),
                                                UpdateQuizQuestionsBulkCommand.QuestionOptionUpdateData.OptionAction.UPDATE
                                        ))
                                        .collect(Collectors.toList()),
                                null, // no correct answer change
                                UpdateQuizQuestionsBulkCommand.QuestionUpdateData.UpdateAction.UPDATE_OPTIONS
                        ))
                        .collect(Collectors.toList());

        UpdateQuizQuestionsBulkCommand command = new UpdateQuizQuestionsBulkCommand(
                quizId,
                updates
        );

        quizService.updateQuestionsBulk(command);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{quizId}/questions/types")
    public ResponseEntity<Void> updateQuestionsTypesBulk(
            @PathVariable String quizId,
            @RequestBody Map<String, String> questionTypes) {

        List<UpdateQuizQuestionsBulkCommand.QuestionUpdateData> updates =
                questionTypes.entrySet().stream()
                        .map(entry -> new UpdateQuizQuestionsBulkCommand.QuestionUpdateData(
                                entry.getKey(),
                                null, // no text change
                                entry.getValue(),
                                null, // no points change
                                null, // no options change
                                null, // no correct answer change
                                UpdateQuizQuestionsBulkCommand.QuestionUpdateData.UpdateAction.CHANGE_TYPE
                        ))
                        .collect(Collectors.toList());

        UpdateQuizQuestionsBulkCommand command = new UpdateQuizQuestionsBulkCommand(
                quizId,
                updates
        );

        quizService.updateQuestionsBulk(command);
        return ResponseEntity.ok().build();
    }

    public record QuestionOptionUpdateData(
            String text,
            boolean correct,
            String optionId
    ) {}


    @PostMapping("/{quizId}/questions")
    public ResponseEntity<Void> addQuestion(
            @PathVariable String quizId,
            @RequestBody AddQuizQuestionCommand command) {
        quizService.addQuestion(command);
        return ResponseEntity.status(HttpStatus.CREATED).build();
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

    @GetMapping("/{quizId}/questions/{questionId}")
    public ResponseEntity<CompleteQuizQuestionDTO> getQuestion(
            @PathVariable String quizId,
            @PathVariable String questionId) {
        CompleteQuizDTO completeQuiz = quizService.getCompleteQuiz(QuizId.fromString(quizId));
        CompleteQuizQuestionDTO question = completeQuiz.questions().stream()
                .filter(q -> q.id().equals(questionId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Question not found"));
        return ResponseEntity.ok(question);
    }

    @PutMapping("/{quizId}/questions/{questionId}")
    public ResponseEntity<Void> updateQuestion(
            @PathVariable String quizId,
            @PathVariable String questionId,
            @RequestBody UpdateQuizQuestionsBulkCommand.QuestionUpdateData updateData) {

        if (!questionId.equals(updateData.questionId())) {
            throw new IllegalArgumentException("Question ID in path and body must match");
        }

        UpdateQuizQuestionsBulkCommand command = new UpdateQuizQuestionsBulkCommand(
                quizId,
                List.of(updateData)
        );

        quizService.updateQuestionsBulk(command);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{quizId}/questions/{questionId}")
    public ResponseEntity<Void> deleteQuestion(
            @PathVariable String quizId,
            @PathVariable String questionId) {

        DeleteQuizQuestionsBulkCommand command = new DeleteQuizQuestionsBulkCommand(
                quizId,
                List.of(questionId)
        );

        quizService.deleteQuestionsBulk(command);
        return ResponseEntity.noContent().build();
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleIllegalArgumentException(IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(e.getMessage());
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<String> handleIllegalStateException(IllegalStateException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleGeneralException(Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("An error occurred: " + e.getMessage());
    }
}