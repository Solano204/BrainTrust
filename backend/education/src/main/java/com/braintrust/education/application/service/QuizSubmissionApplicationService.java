package com.braintrust.education.application.service;

import com.braintrust.education.application.dtos.commands.*;
import com.braintrust.education.application.dtos.dtos.*;
import com.braintrust.education.application.ports.in.*;
import com.braintrust.education.application.ports.out.*;
import com.braintrust.education.domain.exceptions.*;
import com.braintrust.education.domain.model.*;
import com.braintrust.education.domain.valueobjects.*;
import com.braintrust.education.domain.valueobjects.QuestionOption;
import com.braintrust.identity.application.dtos.dtos.MinimalUserInfoDTO;
import com.braintrust.identity.application.ports.in.UserService;
import com.braintrust.identity.domain.valueobjects.UserId;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@Transactional
public class QuizSubmissionApplicationService implements QuizSubmissionService {

    private static final Logger log = LoggerFactory.getLogger(QuizSubmissionApplicationService.class);

    private final QuizSubmissionRepository submissionRepository;
    private final QuizRepository quizRepository;
    private final GradebookService gradebookService;
    private final UnitGradeService unitGradeService; // NEW: For restarting unit grade
    private final QuizService quizService; // ✅ ADD THIS
    private final UserService userService; // ✅ ADD
    private final QuizSubmissionConverter converter; // ✅ ADD THIS

    public QuizSubmissionApplicationService(
            QuizSubmissionRepository submissionRepository,
            QuizRepository quizRepository,
            GradebookService gradebookService,
            UnitGradeService unitGradeService, QuizService quizService, UserService userService, QuizSubmissionConverter converter) { // NEW: Added UnitGradeService
        this.submissionRepository = submissionRepository;
        this.quizRepository = quizRepository;
        this.gradebookService = gradebookService;
        this.unitGradeService = unitGradeService; // NEW
        this.quizService = quizService;
        this.userService = userService;
        this.converter = converter;
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
    @Transactional(readOnly = true)
    public List<QuizSubmissionBasicDTO> getSubmissionsByCourseAndUnitBasic(CourseId courseId, UnitId unitId) {
        log.debug("Finding quiz submissions by Course ID: {} and Unit ID: {} with basic info",
                courseId.getValue(), unitId.getValue());

        List<QuizSubmission> submissions = submissionRepository.findByCourseIdAndUnitIdOrderBySubmittedAtDesc(courseId, unitId);

        return submissions.stream()
                .map(this::mapToBasicDTOWithRealData) // ✅ Use the new method with real data
                .collect(Collectors.toList());
    }


    @Override
    @Transactional(readOnly = true)
    public QuizSubmissionDetailDTO getStudentQuizSubmissionDetail(String quizId, String studentId) {
        log.debug("Getting detailed submission for student {} and quiz {}", studentId, quizId);

        QuizId quizIdObj = QuizId.fromString(quizId);
        UserId studentIdObj = UserId.fromString(studentId);

        // Find the latest submission for this quiz and student
        Optional<QuizSubmission> submission = submissionRepository.findLatestByQuizAndStudent(quizIdObj, studentIdObj);

        if (submission.isPresent()) {
            log.debug("Found existing detailed submission for student {} and quiz {}", studentId, quizId);

            // Get the quiz to include questions
            Quiz quiz = quizRepository.findById(quizIdObj)
                    .orElseThrow(() -> new QuizNotFoundException("Quiz not found"));

            return mapToDetailDTO(submission.get(), quiz);
        }

        log.debug("No existing submission found for student {} and quiz {}", studentId, quizId);
        return null;
    }


    @Override
    @Transactional(readOnly = true)
    public List<QuizSubmissionBasicDTO> getSubmissionsByStudentAndCourseAndUnitBasic(UserId studentId, CourseId courseId, UnitId unitId) {
        log.debug("Finding quiz submissions by Student ID: {}, Course ID: {} and Unit ID: {} with basic info",
                studentId.getValue(), courseId.getValue(), unitId.getValue());

        List<QuizSubmission> submissions = submissionRepository.findByStudentIdAndCourseIdAndUnitIdOrderBySubmittedAtDesc(studentId, courseId, unitId);

        return submissions.stream()
                .map(this::mapToBasicDTOWithRealData) // ✅ Use the new method with real data
                .collect(Collectors.toList());
    }

    // ✅ NEW: Method to get basic DTO with real quiz and user data
    private QuizSubmissionBasicDTO mapToBasicDTOWithRealData(QuizSubmission submission) {
        try {
            // Get real quiz title
            String quizTitle = getQuizTitle(submission.getQuizId());

            // Get real student name
            String studentName = getStudentName(submission.getStudentId());

            return new QuizSubmissionBasicDTO(
                    submission.getId().getValue(),
                    submission.getQuizId().getValue(),
                    quizTitle, // ✅ Real quiz title
                    submission.getStudentId().getValue(),
                    studentName, // ✅ Real student name
                    submission.getStatus().name(),
                    submission.getSubmittedAt() != null ? submission.getSubmittedAt().toString() : null,
                    submission.getAttemptNumber()
            );
        } catch (Exception e) {
            log.warn("Failed to get real data for submission {}, using fallback: {}",
                    submission.getId().getValue(), e.getMessage());

            // Fallback to basic mapping if real data fails
            return mapToBasicDTOBasic(submission);
        }
    }

    // ✅ NEW: Get real quiz title
    private String getQuizTitle(QuizId quizId) {
        try {
            MinimalQuizDTO quiz = quizService.getMinimalQuizById(quizId);
            return quiz.title();
        } catch (Exception e) {
            log.warn("Failed to get quiz title for quiz {}, using fallback", quizId.getValue());
            return "Quiz Title"; // Fallback
        }
    }

    // ✅ NEW: Get real student name
    private String getStudentName(UserId studentId) {
        try {
            MinimalUserInfoDTO userInfo = userService.getMinimalUserInfo(studentId);
            return userInfo.fullName();
        } catch (Exception e) {
            log.warn("Failed to get student name for user {}, using fallback", studentId.getValue());
            return "Student Name"; // Fallback
        }
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
        log.info("Manually grading quiz submission {} with {} question grades",
                submissionId.getValue(), command.questionGrades().size());

        QuizSubmission submission = findSubmissionByIdOrThrow(submissionId);
        Quiz quiz = quizRepository.findById(submission.getQuizId())
                .orElseThrow(() -> new QuizNotFoundException("Quiz not found"));

        // ✅ Convert DTO to domain objects using converter
        Map<QuizQuestionId, QuestionGrade> questionGrades = converter.toQuestionGrades(command);

        // ✅ Calculate totals for verification
        QuizSubmissionConverter.TotalPoints calculated = converter.calculateTotals(questionGrades);

        // Verify totals match (optional, for data consistency)
        if (command.questionGrades() != null && !command.questionGrades().isEmpty()) {
            if (calculated.earned() != command.earnedPoints() ||
                    calculated.max() != command.totalPoints()) {
                log.warn("Calculated points ({}/{}) don't match command points ({}/{}), using calculated",
                        calculated.earned(), calculated.max(),
                        command.earnedPoints(), command.totalPoints());
            }
        }

        // ✅ Use the domain method for grading with question grades
        if (questionGrades.isEmpty()) {
            // Fallback to simple grading if no question grades provided
            submission.manualGrade(command.earnedPoints(), command.totalPoints());
        } else {
            submission.manualGrade(questionGrades);
        }

        submissionRepository.save(submission);

        // ✅ Sync to gradebook
        if (quiz.getUnitId() != null) {
            log.info("➕ Adding quiz grade to Unit ID: {} for student {}",
                    quiz.getUnitId().getValue(), submission.getStudentId().getValue());

            Grade grade = submission.getGrade(); // Get the grade calculated by domain
            if (grade == null) {
                // Fallback if domain didn't calculate grade
                grade = new Grade(
                        BigDecimal.valueOf(command.earnedPoints()),
                        BigDecimal.valueOf(command.totalPoints())
                );
            }

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

        log.info("Quiz graded with {} question grades and synced to gradebook",
                questionGrades.size());
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

    // Update the existing basic DTO mapping method
    private QuizSubmissionDTO mapToBasicDTO(QuizSubmission submission) {
        try {
            // Get real quiz data
            MinimalQuizDTO quiz = quizService.getMinimalQuizById(submission.getQuizId());
            Quiz fullQuiz = quizRepository.findById(submission.getQuizId())
                    .orElseThrow(() -> new QuizNotFoundException("Quiz not found"));

            // Get real student data
            MinimalUserInfoDTO studentInfo = userService.getMinimalUserInfo(submission.getStudentId());

            GradeDTO gradeDTO = submission.getGrade() != null
                    ? new GradeDTO(
                    submission.getGrade().getValue().toString(),
                    submission.getGrade().getMaxScore().toString(),
                    submission.getGrade().getPercentage().toString()
            )
                    : null;

            return new QuizSubmissionDTO(
                    submission.getId().getValue(),
                    submission.getQuizId().getValue(),
                    quiz.title(), // ✅ Real quiz title
                    submission.getStudentId().getValue(),
                    studentInfo.fullName(), // ✅ Real student name
                    submission.getAttemptNumber(),
                    submission.getStartedAt().toString(),
                    submission.getSubmittedAt() != null ? submission.getSubmittedAt().toString() : null,
                    submission.getStatus().name(),
                    gradeDTO,
                    submission.isAutoGraded(),
                    List.of(), // No answers in basic DTO
                    submission.isTimeExpired(fullQuiz.getTimeLimitMinutes()),
                    fullQuiz.getUnitId() != null ? fullQuiz.getUnitId().getValue() : null,
                    "Unit Name" // TODO: Resolve unit name from unit service
            );
        } catch (Exception e) {
            log.warn("Failed to get real data for submission {}, using fallback: {}",
                    submission.getId().getValue(), e.getMessage());

            // Fallback implementation
            return mapToBasicDTOFallback(submission);
        }
    }

    // Fallback method if real data fails
    private QuizSubmissionDTO mapToBasicDTOFallback(QuizSubmission submission) {
        Quiz quiz = quizRepository.findById(submission.getQuizId())
                .orElseThrow(() -> new QuizNotFoundException("Quiz not found"));

        GradeDTO gradeDTO = submission.getGrade() != null
                ? new GradeDTO(
                submission.getGrade().getValue().toString(),
                submission.getGrade().getMaxScore().toString(),
                submission.getGrade().getPercentage().toString()
        )
                : null;

        return new QuizSubmissionDTO(
                submission.getId().getValue(),
                submission.getQuizId().getValue(),
                quiz.getTitle(), // Use quiz title from domain
                submission.getStudentId().getValue(),
                "Student Name", // Fallback
                submission.getAttemptNumber(),
                submission.getStartedAt().toString(),
                submission.getSubmittedAt() != null ? submission.getSubmittedAt().toString() : null,
                submission.getStatus().name(),
                gradeDTO,
                submission.isAutoGraded(),
                List.of(),
                submission.isTimeExpired(quiz.getTimeLimitMinutes()),
                quiz.getUnitId() != null ? quiz.getUnitId().getValue() : null,
                "Unit Name"
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

        // ✅ Map question responses WITH grades
        List<GradedQuestionResponseDTO> questionResponses = mapToGradedQuestionResponses(submission, quiz);

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
                submission.isTimeExpired(quiz.getTimeLimitMinutes()),
                quiz.getUnitId() != null ? quiz.getUnitId().getValue() : null,
                "Unit Name"
        );
    }



    /**
     * ✅ Map submission answers to graded question responses
     */
    private List<GradedQuestionResponseDTO> mapToGradedQuestionResponses(QuizSubmission submission, Quiz quiz) {
        Map<QuizQuestionId, QuestionGrade> questionGrades = submission.getQuestionGrades();

        return quiz.getQuestions().stream()
                .map(question -> {
                    // Find the student's answer for this question
                    QuizAnswer studentAnswer = submission.getAnswerForQuestion(question.getId());

                    // Get question grade if exists
                    QuestionGrade questionGrade = questionGrades.get(question.getId());

                    int earnedPoints = 0;
                    String teacherFeedback = null;
                    boolean isAutoGradedForQuestion = false;

                    if (questionGrade != null) {
                        earnedPoints = questionGrade.getEarnedPoints();
                        teacherFeedback = questionGrade.getFeedback();
                        isAutoGradedForQuestion = questionGrade.isAutoGraded();
                    } else if (submission.isAutoGraded() && studentAnswer != null) {
                        // Calculate earned points for auto-graded questions
                        if (question.getType() == QuestionType.MULTIPLE_CHOICE ||
                                question.getType() == QuestionType.TRUE_FALSE) {

                            boolean isCorrect = question.isCorrectAnswer(studentAnswer.getSelectedOptions());
                            earnedPoints = isCorrect ? question.getPoints() : 0;
                            isAutoGradedForQuestion = true;
                        }
                    }

                    // Determine if answer is correct
                    boolean isCorrect = false;
                    if (studentAnswer != null) {
                        if (question.getType() == QuestionType.MULTIPLE_CHOICE ||
                                question.getType() == QuestionType.TRUE_FALSE) {

                            isCorrect = question.isCorrectAnswer(studentAnswer.getSelectedOptions());

                        } else if (question.getType() == QuestionType.OPEN_ENDED) {
                            // For open-ended questions, check if teacher graded it
                            isCorrect = (earnedPoints == question.getPoints());
                        }
                    }

                    return new GradedQuestionResponseDTO(
                            question.getId().getValue(),
                            question.getQuestionText(),
                            question.getType().name(),
                            question.getPoints(),
                            earnedPoints,
                            teacherFeedback,
                            isAutoGradedForQuestion,
                            mapToOptionDTOs(question.getOptions()),
                            studentAnswer != null ? studentAnswer.getSelectedOptions() : List.of(),
                            studentAnswer != null ? studentAnswer.getTextAnswer() : null,
                            question.getCorrectAnswer(),
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


    /**
     * ✅ Map submission answers to question responses
     */
    private List<QuestionResponseDTO> mapToQuestionResponses(QuizSubmission submission, Quiz quiz) {
        return quiz.getQuestions().stream()
                .map(question -> {
                    // Find the student's answer for this question
                    QuizAnswer studentAnswer = submission.getAnswerForQuestion(question.getId());

                    // Determine if answer is correct based on question type
                    boolean isCorrect = false;

                    if (studentAnswer != null) {
                        // Check question type before calling isCorrectAnswer
                        if (question.getType() == QuestionType.MULTIPLE_CHOICE ||
                                question.getType() == QuestionType.TRUE_FALSE) {

                            // For multiple choice questions, check selected options
                            isCorrect = question.isCorrectAnswer(studentAnswer.getSelectedOptions());

                        } else if (question.getType() == QuestionType.OPEN_ENDED) {
                            // For open-ended questions, we need a different logic
                            // You might want to check if it's been graded, or compare text
                            // For now, we'll assume it's not auto-correct
                            isCorrect = false; // Open-ended questions usually need manual grading
                        }
                    }

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


}