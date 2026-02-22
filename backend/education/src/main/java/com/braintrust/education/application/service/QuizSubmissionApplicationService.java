package com.braintrust.education.application.service;

import com.braintrust.education.application.dtos.commands.*;
import com.braintrust.education.application.dtos.dtos.*;
import com.braintrust.education.application.helpers.quiz.QuizSubmissionHelper;
import com.braintrust.education.application.mappers.QuizSubmissionMapper;
import com.braintrust.education.application.ports.in.*;
import com.braintrust.education.application.ports.out.*;
import com.braintrust.education.domain.exceptions.*;
import com.braintrust.education.domain.model.*;
import com.braintrust.education.domain.valueobjects.*;
import com.braintrust.identity.application.dtos.dtos.MinimalUserInfoDTO;
import com.braintrust.identity.application.ports.in.UserService;
import com.braintrust.identity.domain.valueobjects.UserId;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class QuizSubmissionApplicationService implements QuizSubmissionService {

    private final QuizSubmissionRepository submissionRepository;
    private final QuizRepository quizRepository;
    private final GradebookService gradebookService;
    private final UnitGradeService unitGradeService;
    private final QuizService quizService;
    private final UserService userService;
    private final QuizSubmissionConverter converter;
    private final QuizSubmissionMapper submissionMapper;

    @Override
    @Transactional(readOnly = true)
    public List<QuizSubmissionBasicDTO> getSubmissionsByCourseBasic(CourseId courseId) {
        log.debug("Finding quiz submissions by Course ID: {} with basic info", courseId.getValue());

        return submissionRepository.findByCourseIdOrderBySubmittedAtDesc(courseId)
                .stream()
                .map(submissionMapper::mapToBasicDTOBasic)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuizSubmissionBasicDTO> getSubmissionsByCourseAndUnitBasic(
            CourseId courseId,
            UnitId unitId) {

        log.debug("Finding quiz submissions by Course ID: {} and Unit ID: {} with basic info",
                courseId.getValue(), unitId.getValue());

        List<QuizSubmission> submissions = submissionRepository
                .findByCourseIdAndUnitIdOrderBySubmittedAtDesc(courseId, unitId);

        return submissions.stream()
                .map(this::mapToBasicDTOWithRealData)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public QuizSubmissionDetailDTO getStudentQuizSubmissionDetail(String quizId, String studentId) {
        log.debug("Getting detailed submission for student {} and quiz {}", studentId, quizId);

        QuizId quizIdObj = QuizId.fromString(quizId);
        UserId studentIdObj = UserId.fromString(studentId);

        Optional<QuizSubmission> submission = submissionRepository
                .findLatestByQuizAndStudent(quizIdObj, studentIdObj);

        if (submission.isPresent()) {
            log.debug("Found existing detailed submission for student {} and quiz {}", studentId, quizId);

            Quiz quiz = quizRepository.findById(quizIdObj)
                    .orElseThrow(() -> new QuizNotFoundException("Quiz not found"));

            String studentName = getStudentNameOrFallback(studentIdObj);
            return submissionMapper.mapToDetailDTO(submission.get(), quiz, studentName);
        }

        log.debug("No existing submission found for student {} and quiz {}", studentId, quizId);
        return null;
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuizSubmissionBasicDTO> getSubmissionsByStudentAndCourseAndUnitBasic(
            UserId studentId,
            CourseId courseId,
            UnitId unitId) {

        log.debug("Finding quiz submissions by Student ID: {}, Course ID: {} and Unit ID: {} with basic info",
                studentId.getValue(), courseId.getValue(), unitId.getValue());

        List<QuizSubmission> submissions = submissionRepository
                .findByStudentIdAndCourseIdAndUnitIdOrderBySubmittedAtDesc(studentId, courseId, unitId);

        return submissions.stream()
                .map(this::mapToBasicDTOWithRealData)
                .collect(Collectors.toList());
    }

    @Override
    public QuizSubmissionId submitQuizWithAnswers(SubmitQuizWithAnswersCommand command) {
        QuizId quizId = QuizId.fromString(command.quizId());
        UserId studentId = UserId.fromString(command.studentId());

        log.info("Student {} submitting quiz {} with {} answers in single call",
                studentId.getValue(), quizId.getValue(), command.answers().size());

        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new QuizNotFoundException("Quiz not found"));

        validateQuizSubmission(quiz, quizId, studentId);

        int currentAttempts = submissionRepository.countAttempts(quizId, studentId);
        QuizSubmission submission = QuizSubmission.start(quizId, studentId, currentAttempts + 1);

        processAnswers(submission, command.answers());
        submission.submit(quiz);
        QuizSubmission saved = submissionRepository.save(submission);

        syncGradeAfterSubmission(saved, quiz);

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

        String studentName = getStudentNameOrFallback(submission.getStudentId());
        return submissionMapper.mapToDetailDTO(submission, quiz, studentName);
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuizSubmissionDTO> getSubmissionsByCourse(CourseId courseId) {
        log.debug("Finding quiz submissions by Course ID: {} ordered by date", courseId.getValue());

        return submissionRepository.findByCourseIdOrderBySubmittedAtDesc(courseId)
                .stream()
                .map(this::mapToBasicDTO)
                .collect(Collectors.toList());
    }

    @Override
    public void gradeQuizSubmission(GradeQuizSubmissionCommand command) {
        QuizSubmissionId submissionId = QuizSubmissionId.fromString(command.quizSubmissionId());
        log.info("Manually grading quiz submission {} with {} question grades",
                submissionId.getValue(), command.questionGrades().size());

        QuizSubmission submission = findSubmissionByIdOrThrow(submissionId);
        Quiz quiz = quizRepository.findById(submission.getQuizId())
                .orElseThrow(() -> new QuizNotFoundException("Quiz not found"));

        Map<QuizQuestionId, QuestionGrade> questionGrades = converter.toQuestionGrades(command);
        validatePointsConsistency(command, questionGrades);

        applyManualGrading(submission, command, questionGrades);
        submissionRepository.save(submission);

        syncGradesAfterManualGrading(submission, quiz, command, questionGrades);

        log.info("Quiz graded with {} question grades and synced to gradebook", questionGrades.size());
    }

    @Override
    public void deleteSubmission(QuizSubmissionId submissionId) {
        log.warn("🗑️ Deleting quiz submission ID: {}", submissionId.getValue());

        QuizSubmission submission = findSubmissionByIdOrThrow(submissionId);
        Quiz quiz = quizRepository.findById(submission.getQuizId())
                .orElseThrow(() -> new QuizNotFoundException("Quiz not found"));

        CourseId courseId = quiz.getCourseId();
        UserId studentId = submission.getStudentId();
        UnitId unitId = quiz.getUnitId();

        handleUnitGradeRemovalBeforeDeletion(submission, unitId, studentId, quiz.getId());
        submissionRepository.delete(submission);

        log.info("✅ Quiz submission deleted and grade REMOVED from unit grade");
    }

    @Override
    @Transactional(readOnly = true)
    public QuizSubmissionDTO getSubmissionById(QuizSubmissionId submissionId) {
        QuizSubmission submission = findSubmissionByIdOrThrow(submissionId);
        return mapToBasicDTO(submission);
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuizSubmissionDTO> getSubmissionsByStudent(UserId studentId) {
        return submissionRepository.findByStudentId(studentId).stream()
                .map(this::mapToBasicDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<QuizSubmissionDTO> getSubmissionsBasicByCourse(CourseId courseId) {
        log.debug("Finding quiz submissions by Course ID: {} ordered by date", courseId.getValue());

        return submissionRepository.findByCourseIdOrderBySubmittedAtDesc(courseId)
                .stream()
                .map(this::mapToBasicDTO)
                .collect(Collectors.toList());
    }

    // Métodos privados de apoyo

    private QuizSubmission findSubmissionByIdOrThrow(QuizSubmissionId submissionId) {
        return submissionRepository.findById(submissionId)
                .orElseThrow(() -> new SubmissionNotFoundException("Quiz submission not found"));
    }

    private QuizSubmissionBasicDTO mapToBasicDTOWithRealData(QuizSubmission submission) {
        try {
            String quizTitle = getQuizTitleOrFallback(submission.getQuizId());
            String studentName = getStudentNameOrFallback(submission.getStudentId());

            return submissionMapper.mapToBasicDTOWithRealData(submission, quizTitle, studentName);
        } catch (Exception e) {
            log.warn("Failed to get real data for submission {}, using fallback: {}",
                    submission.getId().getValue(), e.getMessage());
            return submissionMapper.mapToBasicDTOBasic(submission);
        }
    }

    private String getQuizTitleOrFallback(QuizId quizId) {
        try {
            MinimalQuizDTO quiz = quizService.getMinimalQuizById(quizId);
            return quiz.title();
        } catch (Exception e) {
            log.warn("Failed to get quiz title for quiz {}, using fallback", quizId.getValue());
            return "Quiz Title";
        }
    }

    private String getStudentNameOrFallback(UserId studentId) {
        try {
            MinimalUserInfoDTO userInfo = userService.getMinimalUserInfo(studentId);
            return userInfo.fullName();
        } catch (Exception e) {
            log.warn("Failed to get student name for user {}, using fallback", studentId.getValue());
            return "Student Name";
        }
    }

    private QuizSubmissionDTO mapToBasicDTO(QuizSubmission submission) {
        try {
            MinimalQuizDTO quiz = quizService.getMinimalQuizById(submission.getQuizId());
            Quiz fullQuiz = quizRepository.findById(submission.getQuizId())
                    .orElseThrow(() -> new QuizNotFoundException("Quiz not found"));

            return submissionMapper.mapToBasicDTO(submission, quiz, fullQuiz);
        } catch (Exception e) {
            log.warn("Failed to get real data for submission {}, using fallback: {}",
                    submission.getId().getValue(), e.getMessage());

            Quiz quiz = quizRepository.findById(submission.getQuizId())
                    .orElseThrow(() -> new QuizNotFoundException("Quiz not found"));

            return submissionMapper.mapToBasicDTOFallback(submission, quiz);
        }
    }

    private void validateQuizSubmission(Quiz quiz, QuizId quizId, UserId studentId) {
        if (!quiz.isAvailableNow()) {
            throw new IllegalStateException("Quiz is not available");
        }

        int currentAttempts = submissionRepository.countAttempts(quizId, studentId);
        if (currentAttempts >= quiz.getMaxAttempts()) {
            throw new IllegalStateException("Maximum attempts reached");
        }
    }

    private void processAnswers(QuizSubmission submission, Map<String, SubmitQuizWithAnswersCommand.QuizAnswerData> answers) {
        for (Map.Entry<String, SubmitQuizWithAnswersCommand.QuizAnswerData> entry : answers.entrySet()) {
            QuizQuestionId questionId = QuizQuestionId.fromString(entry.getKey());
            SubmitQuizWithAnswersCommand.QuizAnswerData answerData = entry.getValue();

            submission.answerQuestion(
                    questionId,
                    answerData.selectedOptions(),
                    answerData.textAnswer()
            );
        }
    }

    private void syncGradeAfterSubmission(QuizSubmission saved, Quiz quiz) {
        if (saved.getGrade() != null) {
            gradebookService.syncQuizGrade(
                    quiz.getCourseId(),
                    saved.getStudentId(),
                    quiz.getId()
            );
        }
    }

    private void validatePointsConsistency(
            GradeQuizSubmissionCommand command,
            Map<QuizQuestionId, QuestionGrade> questionGrades) {

        if (command.questionGrades() != null && !command.questionGrades().isEmpty()) {
            QuizSubmissionConverter.TotalPoints calculated = converter.calculateTotals(questionGrades);

            if (calculated.earned() != command.earnedPoints() ||
                    calculated.max() != command.totalPoints()) {
                log.warn("Calculated points ({}/{}) don't match command points ({}/{}), using calculated",
                        calculated.earned(), calculated.max(),
                        command.earnedPoints(), command.totalPoints());
            }
        }
    }

    private void applyManualGrading(
            QuizSubmission submission,
            GradeQuizSubmissionCommand command,
            Map<QuizQuestionId, QuestionGrade> questionGrades) {

        if (questionGrades.isEmpty()) {
            submission.manualGrade(command.earnedPoints(), command.totalPoints());
        } else {
            submission.manualGrade(questionGrades);
        }
    }

    private void syncGradesAfterManualGrading(
            QuizSubmission submission,
            Quiz quiz,
            GradeQuizSubmissionCommand command,
            Map<QuizQuestionId, QuestionGrade> questionGrades) {

        if (quiz.getUnitId() != null) {
            log.info("➕ Adding quiz grade to Unit ID: {} for student {}",
                    quiz.getUnitId().getValue(), submission.getStudentId().getValue());

            Grade grade = getGradeForUnitSync(submission, command);
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
    }

    private Grade getGradeForUnitSync(QuizSubmission submission, GradeQuizSubmissionCommand command) {
        if (submission.getGrade() != null) {
            return submission.getGrade();
        }

        return new Grade(
                BigDecimal.valueOf(command.earnedPoints()),
                BigDecimal.valueOf(command.totalPoints())
        );
    }

    private void handleUnitGradeRemovalBeforeDeletion(
            QuizSubmission submission,
            UnitId unitId,
            UserId studentId,
            QuizId quizId) {

        boolean affectsUnitGrade = submission.getGrade() != null && unitId != null;

        if (affectsUnitGrade) {
            log.info("➖ Removing quiz grade from Unit ID: {} for student {} before deletion",
                    unitId.getValue(), studentId.getValue());

            unitGradeService.removeQuizGradeFromUnit(unitId, studentId, quizId);

            Quiz quiz = quizRepository.findById(quizId)
                    .orElseThrow(() -> new QuizNotFoundException("Quiz not found"));

            gradebookService.syncUnitGrade(quiz.getCourseId(), studentId, unitId);
        }
    }
}