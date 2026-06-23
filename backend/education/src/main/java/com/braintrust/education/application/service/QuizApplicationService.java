package com.braintrust.education.application.service;

import com.braintrust.education.application.dtos.commands.*;
import com.braintrust.education.application.dtos.dtos.*;
import com.braintrust.education.application.helpers.quiz.*;
import com.braintrust.education.application.ports.in.QuizService;
import com.braintrust.education.application.ports.out.QuizRepository;
import com.braintrust.education.domain.exceptions.QuizNotFoundException;
import com.braintrust.education.domain.model.Quiz;
import com.braintrust.education.domain.valueobjects.CourseId;
import com.braintrust.education.domain.valueobjects.QuizId;
import com.braintrust.education.domain.valueobjects.UnitId;
import com.braintrust.identity.domain.valueobjects.UserId;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class QuizApplicationService implements QuizService {

    private static final Logger log = LoggerFactory.getLogger(QuizApplicationService.class);

    private final QuizRepository quizRepository;

    private final QuizDtoMapper dtoMapper;
    private final QuizQuestionHelper questionHelper;
    private final QuizDateHelper dateHelper;

    public QuizApplicationService(
            QuizRepository quizRepository,
            QuizDtoMapper dtoMapper,
            QuizQuestionHelper questionHelper,
            QuizDateHelper dateHelper) {
        this.quizRepository = quizRepository;
        this.dtoMapper = dtoMapper;
        this.questionHelper = questionHelper;
        this.dateHelper = dateHelper;
        log.info("QuizApplicationService initialized");
    }

    @Override
    public QuizId createQuiz(CreateQuizCommand command) {
        CourseId courseId = CourseId.fromString(command.courseId());
        UnitId unitId = UnitId.fromString(command.unitId());
        log.info("Creating quiz '{}' for course {}", command.title(), courseId.getValue());

        Quiz quiz = Quiz.create(
                courseId, unitId,
                command.title(), command.description(),
                dateHelper.parseDateTimeNullable(command.availableFrom()),
                dateHelper.parseDateTimeNullable(command.availableUntil()),
                command.timeLimitMinutes(),
                command.allowSeeResults(),
                command.totalScore()
        );

        Quiz saved = quizRepository.save(quiz);
        log.info("Quiz created id={}", saved.getId().getValue());
        return saved.getId();
    }
    @Override
    public QuizId createQuizWithQuestions(CreateQuizWithQuestionsCommand command) {
        log.info("Creating quiz '{}' with {} questions courseId={} unitId={}",
                command.title(), command.questions().size(), command.courseId(), command.unitId());
        try {
            CourseId courseId = CourseId.fromString(command.courseId());
            UnitId unitId = command.unitId() != null ? UnitId.fromString(command.unitId()) : null;

            LocalDateTime availableFrom;
            LocalDateTime availableUntil;

            try {
                availableFrom = dateHelper.parseInstant(command.availableFrom());
            } catch (Exception e) {
                log.warn("Failed to parse availableFrom='{}', defaulting to now: {}", command.availableFrom(), e.getMessage());
                availableFrom = LocalDateTime.now();
            }

            try {
                availableUntil = dateHelper.parseInstant(command.availableUntil());
                if (command.timeLimitMinutes() != null && command.timeLimitMinutes() > 0) {
                    availableUntil = availableUntil.plusMinutes(command.timeLimitMinutes());
                }
            } catch (Exception e) {
                log.warn("Failed to parse availableUntil='{}', defaulting to +1 year: {}", command.availableUntil(), e.getMessage());
                availableUntil = LocalDateTime.now().plusYears(1);
            }

            Quiz quiz = Quiz.create(
                    courseId, unitId,
                    command.title(), command.description(),
                    availableFrom, availableUntil,
                    command.timeLimitMinutes(),
                    command.allowSeeResults(),
                    command.totalScore()
            );

            int questionIndex = 0;
            for (CreateQuizWithQuestionsCommand.QuizQuestionData questionData : command.questions()) {
                try {
                    quiz.addQuestion(createQuestionFromData(questionData));
                    questionIndex++;
                } catch (Exception e) {
                    log.error("Failed to add question at index {}: {}", questionIndex, e.getMessage(), e);
                    throw new IllegalArgumentException("Error adding question " + questionIndex + ": " + e.getMessage(), e);
                }
            }

            Quiz saved = quizRepository.save(quiz);
            log.info("Quiz created with {} questions id={}", questionIndex, saved.getId().getValue());
            return saved.getId();

        } catch (Exception e) {
            log.error("Failed to create quiz '{}': {}", command.title(), e.getMessage(), e);
            throw new RuntimeException("Failed to create quiz: " + e.getMessage(), e);
        }
    }

    @Override
    public void updateQuiz(UpdateQuizCommand command) {
        QuizId quizId = QuizId.fromString(command.quizId());
        log.info("Updating quiz {}", quizId.getValue());

        Quiz quiz = findQuizByIdOrThrow(quizId);

        LocalDateTime availableFrom = dateHelper.parseDateTimeNullable(command.availableFrom());
        LocalDateTime availableUntil = dateHelper.parseDateTimeNullable(command.availableUntil());

        quiz.update(
                command.title(), command.description(),
                availableFrom, availableUntil,
                command.timeLimitMinutes(),
                command.allowSeeResults(),
                command.totalScore()
        );

        quizRepository.save(quiz);
        log.info("Quiz updated");
    }

    @Override
    public void activateQuiz(ActivateQuizCommand command) {
        QuizId quizId = QuizId.fromString(command.quizId());
        Quiz quiz = findQuizByIdOrThrow(quizId);
        quizRepository.save(quiz);
    }

    @Override
    public void deactivateQuiz(DeactivateQuizCommand command) {
        QuizId quizId = QuizId.fromString(command.quizId());
        Quiz quiz = findQuizByIdOrThrow(quizId);
        quizRepository.save(quiz);
    }

    @Override
    public void deleteQuiz(QuizId quizId) {
        log.info("Deleting quiz: {}", quizId.getValue());
        Quiz quiz = findQuizByIdOrThrow(quizId);
        quizRepository.delete(quiz);
        log.info("Quiz deleted successfully: {}", quizId.getValue());
    }

    @Override
    public void addQuestion(AddQuizQuestionCommand command) {
        questionHelper.addQuestion(command);
    }

    @Override
    public void addQuestionsBulk(AddQuizQuestionsBulkCommand command) {
        questionHelper.addQuestionsBulk(command);
    }

    @Override
    public void deleteQuestionsBulk(DeleteQuizQuestionsBulkCommand command) {
        questionHelper.deleteQuestionsBulk(command);
    }

    @Override
    public void updateQuestionsBulk(UpdateQuizQuestionsBulkCommand command) {
        questionHelper.updateQuestionsBulk(command);
    }

    @Override
    @Transactional(readOnly = true)
    public QuizDTO getQuizById(QuizId quizId) {
        Quiz quiz = findQuizByIdOrThrow(quizId);
        return dtoMapper.toQuizDTO(quiz);
    }

    @Override
    @Transactional(readOnly = true)
    public MinimalQuizDTO getMinimalQuizById(QuizId quizId) {
        log.info("Getting minimal quiz information for ID: {}", quizId.getValue());
        Quiz quiz = findQuizByIdOrThrow(quizId);
        return dtoMapper.toMinimalQuizDTO(quiz);
    }

    @Override
    @Transactional(readOnly = true)
    public CompleteQuizDTO getCompleteQuiz(QuizId quizId) {
        Quiz quiz = findQuizByIdOrThrow(quizId);
        return dtoMapper.toCompleteQuizDTO(quiz);
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuizDTO> getQuizzesByCourse(CourseId courseId) {
        return dtoMapper.toQuizDTOList(quizRepository.findByCourseId(courseId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuizDTO> getQuizzesByCourseAndUnit(CourseId courseId, UnitId unitId) {
        log.info("Getting quizzes for course {} and unit {}", courseId.getValue(), unitId.getValue());

        List<Quiz> quizzes = quizRepository.findByCourseIdAndUnitId(courseId, unitId);

        log.info("Found {} quizzes for course {} and unit {}",
                quizzes.size(), courseId.getValue(), unitId.getValue());

        return dtoMapper.toQuizDTOList(quizzes);
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuizDTO> getBasicQuizzesByCourse(CourseId courseId) {
        log.info("Getting basic quizzes for course {} (without questions)", courseId.getValue());
        return dtoMapper.toQuizDTOList(quizRepository.findBasicQuizzesByCourseId(courseId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuizDTO> getAvailableQuizzesByCourse(CourseId courseId) {
        return dtoMapper.toQuizDTOList(
                quizRepository.findAvailableQuizzes(courseId, LocalDateTime.now())
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuizQuestionDTO> getQuizQuestions(QuizId quizId) {
        Quiz quiz = findQuizByIdOrThrow(quizId);
        return dtoMapper.toQuestionDTOList(quiz.getQuestions());
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuizDTO> getQuizzesForStudentWeek(UserId studentId, String weekStart) {
        log.info("Fetching week calendar quizzes for Student ID: {} starting {}",
                studentId.getValue(), weekStart);

        LocalDateTime start = dateHelper.parseDateTime(weekStart);
        LocalDateTime end = dateHelper.getWeekEnd(weekStart);

        List<Quiz> quizzes = quizRepository.findQuizzesByStudentForWeek(studentId, start, end);

        log.info("Found {} quizzes for student week view", quizzes.size());
        return dtoMapper.toQuizDTOList(quizzes);
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuizDTO> getQuizzesForTeacherWeek(UserId teacherId, String weekStart) {
        log.info("Fetching week calendar quizzes for Teacher ID: {} starting {}",
                teacherId.getValue(), weekStart);

        LocalDateTime start = dateHelper.parseDateTime(weekStart);
        LocalDateTime end = dateHelper.getWeekEnd(weekStart);

        List<Quiz> quizzes = quizRepository.findQuizzesByTeacherForWeek(teacherId, start, end);

        log.info("Found {} quizzes for teacher week view", quizzes.size());
        return dtoMapper.toQuizDTOList(quizzes);
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuizDTO> getQuizzesForStudentMonth(UserId studentId, String monthStart) {
        log.info("Fetching month calendar quizzes for Student ID: {} starting {}",
                studentId.getValue(), monthStart);

        LocalDateTime start = dateHelper.parseDateTime(monthStart);
        LocalDateTime end = dateHelper.getMonthEnd(monthStart);

        List<Quiz> quizzes = quizRepository.findQuizzesByStudentForMonth(studentId, start, end);

        log.info("Found {} quizzes for student month view", quizzes.size());
        return dtoMapper.toQuizDTOList(quizzes);
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuizDTO> getQuizzesForTeacherMonth(UserId teacherId, String monthStart) {
        log.info("Fetching month calendar quizzes for Teacher ID: {} starting {}",
                teacherId.getValue(), monthStart);

        LocalDateTime start = dateHelper.parseDateTime(monthStart);
        LocalDateTime end = dateHelper.getMonthEnd(monthStart);

        List<Quiz> quizzes = quizRepository.findQuizzesByTeacherForMonth(teacherId, start, end);

        log.info("Found {} quizzes for teacher month view", quizzes.size());
        return dtoMapper.toQuizDTOList(quizzes);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isQuizAvailable(QuizId quizId) {
        Quiz quiz = findQuizByIdOrThrow(quizId);
        return quiz.isAvailableNow();
    }

    @Override
    @Transactional(readOnly = true)
    public int getTotalPoints(QuizId quizId) {
        Quiz quiz = findQuizByIdOrThrow(quizId);
        return quiz.getTotalPoints();
    }

    private Quiz findQuizByIdOrThrow(QuizId quizId) {
        return quizRepository.findById(quizId)
                .orElseThrow(() -> new QuizNotFoundException("Quiz not found: " + quizId.getValue()));
    }

    private com.braintrust.education.domain.model.QuizQuestion createQuestionFromData(
            CreateQuizWithQuestionsCommand.QuizQuestionData questionData) {

        com.braintrust.education.domain.model.QuestionType type =
                com.braintrust.education.domain.model.QuestionType.valueOf(questionData.questionType());

        if (type == com.braintrust.education.domain.model.QuestionType.MULTIPLE_CHOICE ||
                type == com.braintrust.education.domain.model.QuestionType.TRUE_FALSE) {

            List<com.braintrust.education.domain.valueobjects.QuestionOption> options = questionData.options().stream()
                    .map(opt -> new com.braintrust.education.domain.valueobjects.QuestionOption(
                            opt.text(), opt.correct()
                    ))
                    .collect(java.util.stream.Collectors.toList());

            return com.braintrust.education.domain.model.QuizQuestion.createMultipleChoice(
                    questionData.questionText(),
                    questionData.points(),
                    options,
                    questionData.correctAnswer()
            );
        } else {
            return com.braintrust.education.domain.model.QuizQuestion.createOpenEnded(
                    questionData.questionText(),
                    questionData.points(),
                    questionData.correctAnswer()
            );
        }
    }
}