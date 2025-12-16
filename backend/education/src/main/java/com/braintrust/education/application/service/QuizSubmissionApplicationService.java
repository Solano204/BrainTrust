package com.braintrust.education.application.service;

import com.braintrust.education.application.dtos.commands.*;
import com.braintrust.education.application.dtos.dtos.*;
import com.braintrust.education.application.ports.in.*;
import com.braintrust.education.application.ports.out.*;
import com.braintrust.education.domain.exceptions.*;
import com.braintrust.education.domain.model.*;
import com.braintrust.education.domain.valueobjects.*;
import com.braintrust.education.domain.valueobjects.QuestionOption;
import com.braintrust.identity.domain.valueobjects.UserId;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
// other imports...

@Service
@Transactional
public class QuizSubmissionApplicationService implements QuizSubmissionService {

    private static final Logger log =
            LoggerFactory.getLogger(QuizSubmissionApplicationService.class);

    private final QuizSubmissionRepository submissionRepository;
    private final QuizRepository quizRepository;
    private final GradebookService gradebookService;
    private final UnitGradeService unitGradeService; // NEW: For restarting unit grade

    public QuizSubmissionApplicationService(
            QuizSubmissionRepository submissionRepository,
            QuizRepository quizRepository,
            GradebookService gradebookService,
            UnitGradeService unitGradeService) { // NEW: Added UnitGradeService
        this.submissionRepository = submissionRepository;
        this.quizRepository = quizRepository;
        this.gradebookService = gradebookService;
        this.unitGradeService = unitGradeService; // NEW
    }


    @Override
    @Transactional(readOnly = true)
    public List<QuizSubmissionBasicDTO> getSubmissionsByCourseBasic(CourseId courseId) {
        log.debug("Finding quiz submissions by Course ID: {} with basic info", courseId.getValue());

        return submissionRepository.findByCourseIdOrderBySubmittedAtDesc(courseId)
                .stream()
                .map(this::mapToBasicDTOBasic)
                .collect(Collectors.toList());
    }


    @Override
    public QuizSubmissionId submitQuizWithAnswers(SubmitQuizWithAnswersCommand command) {
        QuizId quizId = QuizId.fromString(command.quizId());
        UserId studentId = UserId.fromString(command.studentId());

        log.info("Student {} submitting quiz {} with {} answers in single call",
                studentId.getValue(), quizId.getValue(), command.answers().size());

        // 1. Get quiz with questions
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new QuizNotFoundException("Quiz not found"));

        if (!quiz.isAvailableNow()) {
            throw new IllegalStateException("Quiz is not available");
        }

        // 2. Check attempts
        int currentAttempts = submissionRepository.countAttempts(quizId, studentId);
        if (currentAttempts >= quiz.getMaxAttempts()) {
            throw new IllegalStateException("Maximum attempts reached");
        }

        // 3. Create submission
        QuizSubmission submission = QuizSubmission.start(quizId, studentId, currentAttempts + 1);

        // 4. Add all answers
        for (Map.Entry<String, SubmitQuizWithAnswersCommand.QuizAnswerData> entry : command.answers().entrySet()) {
            QuizQuestionId questionId = QuizQuestionId.fromString(entry.getKey());
            SubmitQuizWithAnswersCommand.QuizAnswerData answerData = entry.getValue();

            submission.answerQuestion(
                    questionId,
                    answerData.selectedOptions(),
                    answerData.textAnswer()
            );
        }

        // 5. Submit and auto-grade if possible
        submission.submit(quiz);
        QuizSubmission saved = submissionRepository.save(submission);

        // 6. Sync to gradebook if graded
        if (saved.getGrade() != null) {
            gradebookService.syncQuizGrade(
                    quiz.getCourseId(),
                    studentId,
                    quizId
            );
        }

        log.info("Quiz submitted with {} answers. Submission ID: {}",
                command.answers().size(), saved.getId().getValue());

        return saved.getId();
    }

    @Override
    @Transactional(readOnly = true)
    public QuizSubmissionDetailDTO getSubmissionDetailById(QuizSubmissionId submissionId) {
        log.debug("Getting detailed submission by ID: {}", submissionId.getValue());

        QuizSubmission submission = findSubmissionByIdOrThrow(submissionId);
        Quiz quiz = quizRepository.findById(submission.getQuizId())
                .orElseThrow(() -> new QuizNotFoundException("Quiz not found"));

        return mapToDetailDTO(submission, quiz);
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuizSubmissionDTO> getSubmissionsByCourse(CourseId courseId) {
        log.debug("Finding quiz submissions by Course ID: {} ordered by date", courseId.getValue());

        return submissionRepository.findByCourseIdOrderBySubmittedAtDesc(courseId)
                .stream()
                .map(this::mapToBasicDTO) // NEW: Use basic DTO mapping
                .collect(Collectors.toList());
    }

    /*
    @Override
    public QuizSubmissionId startQuiz(StartQuizCommand command) {
        QuizId quizId = QuizId.fromString(command.quizId());
        UserId studentId = UserId.fromString(command.studentId());

        log.info("Student {} starting quiz {}", studentId.getValue(), quizId.getValue());

        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new QuizNotFoundException("Quiz not found"));

        if (!quiz.isAvailableNow()) {
            throw new IllegalStateException("Quiz is not available");
        }

        int currentAttempts = submissionRepository.countAttempts(quizId, studentId);
        if (currentAttempts >= quiz.getMaxAttempts()) {
            throw new IllegalStateException("Maximum attempts reached");
        }

        QuizSubmission submission = QuizSubmission.start(quizId, studentId, currentAttempts + 1);
        QuizSubmission saved = submissionRepository.save(submission);

        log.info("Quiz submission started: {}", saved.getId().getValue());
        return saved.getId();
    }
    */

    /*
    @Override
    public void answerQuestion(AnswerQuestionCommand command) {
        QuizSubmissionId submissionId = QuizSubmissionId.fromString(command.quizSubmissionId());
        QuizQuestionId questionId = QuizQuestionId.fromString(command.questionId());

        log.debug("Answering question {} in submission {}", questionId.getValue(), submissionId.getValue());

        QuizSubmission submission = findSubmissionByIdOrThrow(submissionId);
        submission.answerQuestion(questionId, command.selectedOptions(), command.textAnswer());
        submissionRepository.save(submission);
    }
    */

    /*
    @Override
    public void submitQuiz(SubmitQuizCommand command) {
        QuizSubmissionId submissionId = QuizSubmissionId.fromString(command.quizSubmissionId());
        log.info("Submitting quiz submission {}", submissionId.getValue());

        QuizSubmission submission = findSubmissionByIdOrThrow(submissionId);
        Quiz quiz = quizRepository.findById(submission.getQuizId())
                .orElseThrow(() -> new QuizNotFoundException("Quiz not found"));

        submission.submit(quiz);
        QuizSubmission saved = submissionRepository.save(submission);

        // ✅ ALWAYS sync to gradebook (not just when auto-graded)
        if (saved.getGrade() != null) {
            gradebookService.syncQuizGrade(
                    quiz.getCourseId(),
                    submission.getStudentId(),
                    quiz.getId()
            );
        }

        log.info("Quiz submitted successfully");
    }
    */

    @Override
    public void gradeQuizSubmission(GradeQuizSubmissionCommand command) {
        QuizSubmissionId submissionId = QuizSubmissionId.fromString(command.quizSubmissionId());
        log.info("Manually grading quiz submission {}", submissionId.getValue());

        QuizSubmission submission = findSubmissionByIdOrThrow(submissionId);
        submission.manualGrade(command.earnedPoints(), command.totalPoints());
        submissionRepository.save(submission);

        // ✅ Sync to gradebook
        Quiz quiz = quizRepository.findById(submission.getQuizId())
                .orElseThrow(() -> new QuizNotFoundException("Quiz not found"));

        if (quiz.getUnitId() != null) {
            log.info("➕ Adding quiz grade to Unit ID: {} for student {}",
                    quiz.getUnitId().getValue(), submission.getStudentId().getValue());

            Grade grade = new Grade(
                    new BigDecimal(command.earnedPoints()),
                    new BigDecimal(command.totalPoints())
            );

            // Use the new additive method
            unitGradeService.addQuizGradeToUnit(
                    quiz.getUnitId(),
                    submission.getStudentId(),
                    quiz.getId(),
                    grade
            );
        }

        gradebookService.syncQuizGrade(
                quiz.getCourseId(),
                submission.getStudentId(),
                quiz.getId()
        );

        log.info("Quiz graded and synced to gradebook (ADDITIVE approach)");
    }




    @Override
    public void deleteSubmission(QuizSubmissionId submissionId) {
        log.warn("🗑️ Deleting quiz submission ID: {}", submissionId.getValue());

        QuizSubmission submission = findSubmissionByIdOrThrow(submissionId);
        Quiz quiz = quizRepository.findById(submission.getQuizId())
                .orElseThrow(() -> new QuizNotFoundException("Quiz not found"));

        // Store info before deletion for grade removal
        CourseId courseId = quiz.getCourseId();
        UserId studentId = submission.getStudentId();
        UnitId unitId = quiz.getUnitId();

        // Check if the submission is graded and affects unit grade
        boolean affectsUnitGrade = submission.getGrade() != null && unitId != null;

        // ✅ FIXED: Remove the grade from unit BEFORE deleting the submission
        if (affectsUnitGrade) {
            log.info("➖ Removing quiz grade from Unit ID: {} for student {} before deletion",
                    unitId.getValue(), studentId.getValue());

            // Remove the quiz grade from unit
            unitGradeService.removeQuizGradeFromUnit(unitId, studentId, quiz.getId());

            // Also sync to gradebook to ensure course grade is updated
            gradebookService.syncUnitGrade(courseId, studentId, unitId);
        }

        // Delete the submission AFTER removing the grade
        submissionRepository.delete(submission);

        log.info("✅ Quiz submission deleted and grade REMOVED from unit grade");
    }

    @Override
    @Transactional(readOnly = true)
    public QuizSubmissionDTO getSubmissionById(QuizSubmissionId submissionId) {
        QuizSubmission submission = findSubmissionByIdOrThrow(submissionId);
        return mapToBasicDTO(submission); // NEW: Use basic DTO mapping
    }

    /*
    @Override
    @Transactional(readOnly = true)
    public List<QuizSubmissionDTO> getSubmissionsByQuiz(QuizId quizId) {
        return submissionRepository.findByQuizId(quizId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    */

    @Override
    @Transactional(readOnly = true)
    public List<QuizSubmissionDTO> getSubmissionsByStudent(UserId studentId) {
        return submissionRepository.findByStudentId(studentId).stream()
                .map(this::mapToBasicDTO)
                .collect(Collectors.toList());
    }

    /*
    @Override
    @Transactional(readOnly = true)
    public List<QuizSubmissionDTO> getSubmissionsByQuizAndStudent(QuizId quizId, UserId studentId) {
        return submissionRepository.findByQuizAndStudent(quizId, studentId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    */

    /*
    @Override
    @Transactional(readOnly = true)
    public List<QuizSubmissionDTO> getSubmissionsByStatus(QuizSubmissionStatus status) {
        return submissionRepository.findByStatus(status).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    */

    /*
    @Override
    @Transactional(readOnly = true)
    public QuizSubmissionDTO getLatestSubmission(QuizId quizId, UserId studentId) {
        return submissionRepository.findLatestByQuizAndStudent(quizId, studentId)
                .map(this::mapToDTO)
                .orElse(null);
    }
    */

    /*
    @Override
    @Transactional(readOnly = true)
    public int getAttemptCount(QuizId quizId, UserId studentId) {
        return submissionRepository.countAttempts(quizId, studentId);
    }
    */

    /*
    @Override
    @Transactional(readOnly = true)
    public boolean hasPassedTimeLimit(QuizSubmissionId submissionId) {
        QuizSubmission submission = findSubmissionByIdOrThrow(submissionId);
        Quiz quiz = quizRepository.findById(submission.getQuizId())
                .orElseThrow(() -> new QuizNotFoundException("Quiz not found"));

        return submission.isTimeExpired(quiz.getTimeLimitMinutes());
    }
    */

    /*
    @Override
    @Transactional(readOnly = true)
    public QuizSubmissionAnalyticsDTO getQuizAnalytics(QuizId quizId) {
        List<QuizSubmission> submissions = submissionRepository.findByQuizId(quizId);

        int total = submissions.size();
        int completed = (int) submissions.stream()
                .filter(s -> s.getStatus() == QuizSubmissionStatus.GRADED)
                .count();
        int inProgress = (int) submissions.stream()
                .filter(s -> s.getStatus() == QuizSubmissionStatus.IN_PROGRESS)
                .count();

        BigDecimal avgScore = submissions.stream()
                .filter(s -> s.getGrade() != null)
                .map(s -> s.getGrade().getPercentage())
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(BigDecimal.valueOf(completed > 0 ? completed : 1), 2, BigDecimal.ROUND_HALF_UP);

        return new QuizSubmissionAnalyticsDTO(
                quizId.getValue(),
                total,
                completed,
                inProgress,
                avgScore.toString(),
                "100", // TODO: Calculate from actual submissions
                "0",   // TODO: Calculate from actual submissions
                total,
                "N/A"  // TODO: Calculate average time
        );
    }
    */

    private QuizSubmission findSubmissionByIdOrThrow(QuizSubmissionId submissionId) {
        return submissionRepository.findById(submissionId)
                .orElseThrow(() -> new SubmissionNotFoundException("Quiz submission not found"));
    }



    // Add this method for basic DTO mapping
    private QuizSubmissionBasicDTO mapToBasicDTOBasic(QuizSubmission submission) {
        // In a real implementation, you would resolve quiz title and student name
        // from their respective services/repositories

        return new QuizSubmissionBasicDTO(
                submission.getId().getValue(),
                submission.getQuizId().getValue(),
                "Quiz Title", // TODO: Resolve from quiz repository
                submission.getStudentId().getValue(),
                "Student Name", // TODO: Resolve from user service
                submission.getStatus().name(),
                submission.getSubmittedAt() != null ? submission.getSubmittedAt().toString() : null,
                submission.getAttemptNumber()
        );
    }

    // Update the existing method to use basic DTO
    @Transactional(readOnly = true)
    public List<QuizSubmissionDTO> getSubmissionsBasicByCourse(CourseId courseId) {
        log.debug("Finding quiz submissions by Course ID: {} ordered by date", courseId.getValue());

        return submissionRepository.findByCourseIdOrderBySubmittedAtDesc(courseId)
                .stream()
                .map(this::mapToBasicDTO) // Use basic DTO mapping
                .collect(Collectors.toList());
    }


    // NEW: Basic DTO mapping with only essential information
    private QuizSubmissionDTO mapToBasicDTO(QuizSubmission submission) {
        return new QuizSubmissionDTO(
                submission.getId().getValue(),
                submission.getQuizId().getValue(),
                "Quiz Title", // TODO: Resolve from quiz
                submission.getStudentId().getValue(),
                "Student Name", // TODO: Resolve from user service
                submission.getAttemptNumber(),
                submission.getStartedAt().toString(),
                submission.getSubmittedAt() != null ? submission.getSubmittedAt().toString() : null,
                submission.getStatus().name(),
                null, // No grade info in basic DTO
                false, // No auto-graded info
                List.of(), // No answers
                false // No time expiration
        );
    }

    private QuizSubmissionDetailDTO mapToDetailDTO(QuizSubmission submission, Quiz quiz) {
        GradeDTO gradeDTO = submission.getGrade() != null
                ? new GradeDTO(
                submission.getGrade().getValue().toString(),
                submission.getGrade().getMaxScore().toString(),
                submission.getGrade().getPercentage().toString()
        )
                : null;

        // Map question responses
        List<QuestionResponseDTO> questionResponses = mapToQuestionResponses(submission, quiz);

        return new QuizSubmissionDetailDTO(
                submission.getId().getValue(),
                submission.getQuizId().getValue(),
                quiz.getTitle(),
                submission.getStudentId().getValue(),
                "Student Name", // TODO: Resolve from UserService
                submission.getAttemptNumber(),
                submission.getStartedAt().toString(),
                submission.getSubmittedAt() != null ? submission.getSubmittedAt().toString() : null,
                submission.getStatus().name(),
                gradeDTO,
                submission.isAutoGraded(),
                questionResponses,
                submission.isTimeExpired(quiz.getTimeLimitMinutes())
        );
    }

    /**
     * ✅ Map submission answers to question responses
     */
    private List<QuestionResponseDTO> mapToQuestionResponses(QuizSubmission submission, Quiz quiz) {
        return quiz.getQuestions().stream()
                .map(question -> {
                    // Find the student's answer for this question
                    QuizAnswer studentAnswer = submission.getAnswerForQuestion(question.getId());

                    // Determine if answer is correct
                    boolean isCorrect = studentAnswer != null &&
                            question.isCorrectAnswer(studentAnswer.getSelectedOptions());

                    return new QuestionResponseDTO(
                            question.getId().getValue(),
                            question.getQuestionText(),
                            question.getType().name(),
                            question.getPoints(),
                            mapToOptionDTOs(question.getOptions()),
                            studentAnswer != null ? studentAnswer.getSelectedOptions() : List.of(),
                            studentAnswer != null ? studentAnswer.getTextAnswer() : null,
                            question.getCorrectAnswer(), // Include correct answer for teacher view
                            isCorrect
                    );
                })
                .collect(Collectors.toList());
    }

    private List<QuestionOptionDTO> mapToOptionDTOs(List<QuestionOption> options) {
        return options.stream()
                .map(opt -> new QuestionOptionDTO(opt.getText(), opt.isCorrect()))
                .collect(Collectors.toList());
    }





}