package com.braintrust.education.application.service;

import com.braintrust.education.application.dtos.commands.*;
import com.braintrust.education.application.dtos.dtos.*;
import com.braintrust.education.application.ports.in.QuizService;
import com.braintrust.education.application.ports.out.QuizRepository;
import com.braintrust.education.domain.exceptions.*;
import com.braintrust.education.domain.model.*;
import com.braintrust.education.domain.valueobjects.*;
import com.braintrust.education.domain.valueobjects.QuestionOption;
import com.braintrust.identity.domain.valueobjects.UserId;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@Transactional
public class QuizApplicationService implements QuizService {

    private static final Logger log = LoggerFactory.getLogger(QuizApplicationService.class);

    private final QuizRepository quizRepository;

    public QuizApplicationService(QuizRepository quizRepository) {
        this.quizRepository = quizRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public CompleteQuizDTO getCompleteQuiz(QuizId quizId) {
        Quiz quiz = findQuizByIdOrThrow(quizId);
        return mapToCompleteQuizDTO(quiz);
    }

    @Override
    @Transactional(readOnly = true)
    public MinimalQuizDTO getMinimalQuizById(QuizId quizId) {
        log.info("Getting minimal quiz information for ID: {}", quizId.getValue());

        Quiz quiz = findQuizByIdOrThrow(quizId);
        return mapToMinimalQuizDTO(quiz);
    }

    private MinimalQuizDTO mapToMinimalQuizDTO(Quiz quiz) {
        return new MinimalQuizDTO(
                quiz.getId().getValue(),
                quiz.getTitle(),
                quiz.getDescription()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuizDTO> getQuizzesByCourseAndUnit(CourseId courseId, UnitId unitId) {
        log.info("Getting quizzes for course {} and unit {}", courseId.getValue(), unitId.getValue());

        List<Quiz> quizzes = quizRepository.findByCourseIdAndUnitId(courseId, unitId);

        log.info("Found {} quizzes for course {} and unit {}",
                quizzes.size(), courseId.getValue(), unitId.getValue());

        return quizzes.stream()
                .map(this::mapToQuizDTO)
                .collect(Collectors.toList());
    }

    @Override
    public void addQuestionsBulk(AddQuizQuestionsBulkCommand command) {
        QuizId quizId = QuizId.fromString(command.quizId());
        log.info("Adding {} questions in bulk to quiz {}",
                command.questions().size(), quizId.getValue());

        Quiz quiz = findQuizByIdOrThrow(quizId);

        if (quiz.hasSubmissions()) {
            throw new IllegalStateException("Cannot add questions to a quiz that already has submissions");
        }

        for (AddQuizQuestionsBulkCommand.QuizQuestionData questionData : command.questions()) {
            QuizQuestion question;
            QuestionType type = QuestionType.valueOf(questionData.questionType());

            if (type == QuestionType.MULTIPLE_CHOICE || type == QuestionType.TRUE_FALSE) {
                List<QuestionOption> options = questionData.options().stream()
                        .map(opt -> new QuestionOption(opt.text(), opt.correct()))
                        .collect(Collectors.toList());

                question = QuizQuestion.createMultipleChoice(
                        questionData.questionText(),
                        questionData.points(),
                        options,
                        questionData.correctAnswer()
                );
            } else {
                question = QuizQuestion.createOpenEnded(
                        questionData.questionText(),
                        questionData.points(),
                        questionData.correctAnswer()
                );
            }

            quiz.addQuestion(question);
        }

        quizRepository.save(quiz);
        log.info("Successfully added {} questions to quiz {}",
                command.questions().size(), quizId.getValue());
    }

    @Override
    public void deleteQuestionsBulk(DeleteQuizQuestionsBulkCommand command) {
        QuizId quizId = QuizId.fromString(command.quizId());
        log.info("Deleting {} questions in bulk from quiz {}",
                command.questionIds().size(), quizId.getValue());

        Quiz quiz = findQuizByIdOrThrow(quizId);

        if (quiz.hasSubmissions()) {
            throw new IllegalStateException("Cannot delete questions from a quiz that already has submissions");
        }

        List<QuizQuestion> questionsToRemove = quiz.getQuestions().stream()
                .filter(question -> command.questionIds().contains(question.getId().getValue()))
                .collect(Collectors.toList());

        for (QuizQuestion question : questionsToRemove) {
            quiz.removeQuestion(question);
        }

        quizRepository.save(quiz);
        log.info("Successfully deleted {} questions from quiz {}",
                questionsToRemove.size(), quizId.getValue());
    }

    @Override
    public void updateQuestionsBulk(UpdateQuizQuestionsBulkCommand command) {
        QuizId quizId = QuizId.fromString(command.quizId());
        log.info("Updating {} questions in bulk for quiz {}",
                command.questions().size(), quizId.getValue());

        Quiz quiz = findQuizByIdOrThrow(quizId);

        if (quiz.hasSubmissions()) {
            throw new IllegalStateException("Cannot update questions for a quiz that already has submissions");
        }

        for (UpdateQuizQuestionsBulkCommand.QuestionUpdateData updateData : command.questions()) {
            QuizQuestion question = quiz.getQuestions().stream()
                    .filter(q -> q.getId().getValue().equals(updateData.questionId()))
                    .findFirst()
                    .orElseThrow(() -> new QuestionNotFoundException(
                            "Question not found: " + updateData.questionId()
                    ));

            switch (updateData.action()) {
                case UPDATE_TEXT:
                    if (updateData.questionText() != null) {
                        question.updateQuestionText(updateData.questionText());
                    }
                    break;

                case UPDATE_POINTS:
                    if (updateData.points() != null) {
                        question.updatePoints(updateData.points());
                    }
                    break;

                case UPDATE_ANSWER:
                    if (updateData.correctAnswer() != null) {
                        if (question.getType() == QuestionType.OPEN_ENDED) {
                            question.updateCorrectAnswer(updateData.correctAnswer());
                        } else if (updateData.options() != null) {
                            // For multiple choice, update options to reflect correct answer
                            List<QuestionOption> updatedOptions = new ArrayList<>();
                            for (int i = 0; i < question.getOptions().size(); i++) {
                                QuestionOption oldOption = question.getOptions().get(i);
                                String optionText = (updateData.options().size() > i) ?
                                        updateData.options().get(i).text() : oldOption.getText();
                                boolean isCorrect = (updateData.options().size() > i) ?
                                        updateData.options().get(i).correct() : oldOption.isCorrect();
                                updatedOptions.add(new QuestionOption(optionText, isCorrect));
                            }
                            question.updateOptions(updatedOptions);
                        }
                    }
                    break;

                case UPDATE_OPTIONS:
                    if (updateData.options() != null) {
                        List<QuestionOption> newOptions = updateData.options().stream()
                                .map(opt -> new QuestionOption(opt.text(), opt.correct()))
                                .collect(Collectors.toList());
                        question.updateOptions(newOptions);
                    }
                    break;

                case UPDATE_ALL:
                    updateQuestionProperties(question, updateData);
                    break;

                case CHANGE_TYPE:
                    handleQuestionTypeChange(quiz, question, updateData);
                    break;

                default:
                    log.warn("Unknown update action: {}", updateData.action());
            }
        }

        quizRepository.save(quiz);
        log.info("Successfully updated {} questions in quiz {}",
                command.questions().size(), quizId.getValue());
    }

    private void updateQuestionProperties(QuizQuestion question,
                                          UpdateQuizQuestionsBulkCommand.QuestionUpdateData updateData) {
        if (updateData.questionText() != null) {
            question.updateQuestionText(updateData.questionText());
        }

        if (updateData.points() != null) {
            question.updatePoints(updateData.points());
        }

        if (updateData.correctAnswer() != null &&
                question.getType() == QuestionType.OPEN_ENDED) {
            question.updateCorrectAnswer(updateData.correctAnswer());
        }

        if (updateData.options() != null &&
                (question.getType() == QuestionType.MULTIPLE_CHOICE ||
                        question.getType() == QuestionType.TRUE_FALSE)) {
            List<QuestionOption> newOptions = updateData.options().stream()
                    .map(opt -> new QuestionOption(opt.text(), opt.correct()))
                    .collect(Collectors.toList());
            question.updateOptions(newOptions);
        }
    }

    private void handleQuestionTypeChange(Quiz quiz, QuizQuestion oldQuestion,
                                          UpdateQuizQuestionsBulkCommand.QuestionUpdateData updateData) {
        quiz.removeQuestion(oldQuestion);

        QuizQuestion newQuestion;
        QuestionType newType = QuestionType.valueOf(updateData.questionType());

        if (newType == QuestionType.MULTIPLE_CHOICE || newType == QuestionType.TRUE_FALSE) {
            List<QuestionOption> options = updateData.options() != null ?
                    updateData.options().stream()
                            .map(opt -> new QuestionOption(opt.text(), opt.correct()))
                            .collect(Collectors.toList()) :
                    new ArrayList<>();

            newQuestion = QuizQuestion.createMultipleChoice(
                    updateData.questionText() != null ? updateData.questionText() : oldQuestion.getQuestionText(),
                    updateData.points() != null ? updateData.points() : oldQuestion.getPoints(),
                    options,
                    updateData.correctAnswer()
            );
        } else {
            newQuestion = QuizQuestion.createOpenEnded(
                    updateData.questionText() != null ? updateData.questionText() : oldQuestion.getQuestionText(),
                    updateData.points() != null ? updateData.points() : oldQuestion.getPoints(),
                    updateData.correctAnswer()
            );
        }

        quiz.addQuestion(newQuestion);
    }

    private boolean hasStudentSubmittedQuiz(UserId studentId, QuizId quizId) {
        log.debug("Checking if student {} has submitted quiz {}",
                studentId.getValue(), quizId.getValue());
        return false; // TODO: Implement actual submission check
    }

    @Override
    public QuizId createQuizWithQuestions(CreateQuizWithQuestionsCommand command) {
        CourseId courseId = CourseId.fromString(command.courseId());
        UnitId unitId = command.unitId() != null ? UnitId.fromString(command.unitId()) : null;

        log.info("Creating quiz '{}' for course {} with {} questions",
                command.title(), courseId.getValue(), command.questions().size());

        Quiz quiz = Quiz.create(
                courseId,
                unitId,
                command.title(),
                command.description(),
                command.availableFrom() != null ? Instant.parse(command.availableFrom()).atZone(ZoneId.systemDefault()).toLocalDateTime() : null,
                command.availableUntil() != null ? Instant.parse(command.availableUntil()).atZone(ZoneId.systemDefault()).toLocalDateTime() : null,
                command.timeLimitMinutes()
        );

        for (CreateQuizWithQuestionsCommand.QuizQuestionData questionData : command.questions()) {
            QuizQuestion question;
            QuestionType type = QuestionType.valueOf(questionData.questionType());

            if (type == QuestionType.MULTIPLE_CHOICE || type == QuestionType.TRUE_FALSE) {
                List<QuestionOption> options = questionData.options().stream()
                        .map(opt -> new QuestionOption(opt.text(), opt.correct()))
                        .collect(Collectors.toList());
                question = QuizQuestion.createMultipleChoice(
                        questionData.questionText(),
                        questionData.points(),
                        options,
                        questionData.correctAnswer()
                );
            } else {
                question = QuizQuestion.createOpenEnded(
                        questionData.questionText(),
                        questionData.points(),
                        questionData.correctAnswer()
                );
            }

            quiz.addQuestion(question);
        }

        Quiz saved = quizRepository.save(quiz);
        log.info("Quiz created with {} questions: {}", saved.getQuestions().size(), saved.getId().getValue());
        return saved.getId();
    }

    @Override
    public QuizId createQuiz(CreateQuizCommand command) {
        CourseId courseId = CourseId.fromString(command.courseId());
        UnitId unitId = UnitId.fromString(command.unitId());
        log.info("Creating quiz '{}' for course {}", command.title(), courseId.getValue());

        Quiz quiz = Quiz.create(
                courseId,
                unitId,
                command.title(),
                command.description(),
                command.availableFrom() != null ? LocalDateTime.parse(command.availableFrom()) : null,
                command.availableUntil() != null ? LocalDateTime.parse(command.availableUntil()) : null,
                command.timeLimitMinutes()
        );

        Quiz saved = quizRepository.save(quiz);
        log.info("Quiz created: {}", saved.getId().getValue());
        return saved.getId();
    }

    @Override
    public void addQuestion(AddQuizQuestionCommand command) {
        QuizId quizId = QuizId.fromString(command.quizId());
        log.info("Adding question to quiz {}", quizId.getValue());

        Quiz quiz = findQuizByIdOrThrow(quizId);

        QuizQuestion question;
        QuestionType type = QuestionType.valueOf(command.questionType());

        if (type == QuestionType.MULTIPLE_CHOICE || type == QuestionType.TRUE_FALSE) {
            List<QuestionOption> options = command.options().stream()
                    .map(opt -> new QuestionOption(opt.text(), opt.correct()))
                    .collect(Collectors.toList());
            question = QuizQuestion.createMultipleChoice(
                    command.questionText(),
                    command.points(),
                    options,
                    command.correctAnswer()
            );
        } else {
            question = QuizQuestion.createOpenEnded(
                    command.questionText(),
                    command.points(),
                    command.correctAnswer()
            );
        }

        quiz.addQuestion(question);
        quizRepository.save(quiz);
        log.info("Question added successfully");
    }

    @Override
    public void updateQuiz(UpdateQuizCommand command) {
        QuizId quizId = QuizId.fromString(command.quizId());
        log.info("Updating quiz {}", quizId.getValue());

        Quiz quiz = findQuizByIdOrThrow(quizId);

        LocalDateTime availableFrom = parseDateTime(command.availableFrom());
        LocalDateTime availableUntil = parseDateTime(command.availableUntil());

        quiz.update(
                command.title(),
                command.description(),
                availableFrom,
                availableUntil,
                command.timeLimitMinutes()
        );
        quizRepository.save(quiz);
        log.info("Quiz updated");
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuizDTO> getBasicQuizzesByCourse(CourseId courseId) {
        log.info("Getting basic quizzes for course {} (without questions)", courseId.getValue());
        return quizRepository.findBasicQuizzesByCourseId(courseId).stream()
                .map(this::mapToQuizDTO)
                .collect(Collectors.toList());
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
    @Transactional(readOnly = true)
    public QuizDTO getQuizById(QuizId quizId) {
        Quiz quiz = findQuizByIdOrThrow(quizId);
        return mapToQuizDTO(quiz);
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuizDTO> getQuizzesByCourse(CourseId courseId) {
        return quizRepository.findByCourseId(courseId).stream()
                .map(this::mapToQuizDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuizDTO> getAvailableQuizzesByCourse(CourseId courseId) {
        return quizRepository.findAvailableQuizzes(courseId, LocalDateTime.now()).stream()
                .map(this::mapToQuizDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuizQuestionDTO> getQuizQuestions(QuizId quizId) {
        Quiz quiz = findQuizByIdOrThrow(quizId);
        return quiz.getQuestions().stream()
                .map(this::mapToQuestionDTO)
                .collect(Collectors.toList());
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

    @Override
    @Transactional(readOnly = true)
    public List<QuizDTO> getQuizzesForStudentMonth(UserId studentId, String monthStart) {
        log.info("📅 Fetching month calendar quizzes for Student ID: {} starting {}",
                studentId.getValue(), monthStart);

        LocalDateTime start = parseDateTime(monthStart);
        LocalDateTime end = start.plusMonths(1);

        List<Quiz> quizzes = quizRepository.findQuizzesByStudentForMonth(studentId, start, end);

        log.info("✅ Found {} quizzes for student month view", quizzes.size());
        return quizzes.stream()
                .map(this::mapToQuizDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuizDTO> getQuizzesForTeacherMonth(UserId teacherId, String monthStart) {
        log.info("📅 Fetching month calendar quizzes for Teacher ID: {} starting {}",
                teacherId.getValue(), monthStart);

        LocalDateTime start = parseDateTime(monthStart);
        LocalDateTime end = start.plusMonths(1);

        List<Quiz> quizzes = quizRepository.findQuizzesByTeacherForMonth(teacherId, start, end);

        log.info("✅ Found {} quizzes for teacher month view", quizzes.size());
        return quizzes.stream()
                .map(this::mapToQuizDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuizDTO> getQuizzesForStudentWeek(UserId studentId, String weekStart) {
        log.info("📅 Fetching week calendar quizzes for Student ID: {} starting {}",
                studentId.getValue(), weekStart);

        LocalDateTime start = parseDateTime(weekStart);
        LocalDateTime end = start.plusDays(7);

        List<Quiz> quizzes = quizRepository.findQuizzesByStudentForWeek(studentId, start, end);

        log.info("✅ Found {} quizzes for student week view", quizzes.size());
        return quizzes.stream()
                .map(this::mapToQuizDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuizDTO> getQuizzesForTeacherWeek(UserId teacherId, String weekStart) {
        log.info("📅 Fetching week calendar quizzes for Teacher ID: {} starting {}",
                teacherId.getValue(), weekStart);

        LocalDateTime start = parseDateTime(weekStart);
        LocalDateTime end = start.plusDays(7);

        List<Quiz> quizzes = quizRepository.findQuizzesByTeacherForWeek(teacherId, start, end);

        log.info("✅ Found {} quizzes for teacher week view", quizzes.size());
        return quizzes.stream()
                .map(this::mapToQuizDTO)
                .collect(Collectors.toList());
    }

    private Quiz findQuizByIdOrThrow(QuizId quizId) {
        return quizRepository.findById(quizId)
                .orElseThrow(() -> new QuizNotFoundException("Quiz not found: " + quizId.getValue()));
    }

    private LocalDateTime parseDateTime(String dateTimeStr) {
        if (dateTimeStr == null || dateTimeStr.trim().isEmpty()) {
            throw new IllegalArgumentException("Date parameter cannot be null or empty");
        }

        try {
            if (dateTimeStr.endsWith("Z")) {
                return Instant.parse(dateTimeStr)
                        .atZone(ZoneId.systemDefault())
                        .toLocalDateTime();
            }
            return LocalDateTime.parse(dateTimeStr);

        } catch (Exception e) {
            log.error("Failed to parse date time '{}': {}", dateTimeStr, e.getMessage());
            throw new IllegalArgumentException("Invalid date format. Use ISO format like '2025-11-20T08:00:00' or '2025-11-20T08:00:00Z'");
        }
    }

    private QuizDTO mapToQuizDTO(Quiz quiz) {
        return new QuizDTO(
                quiz.getId().getValue(),
                quiz.getCourseId().getValue(),
                "Course Name",
                quiz.getTitle(),
                quiz.getDescription(),
                quiz.getAvailableFrom() != null ? quiz.getAvailableFrom().toString() : null,
                quiz.getAvailableUntil() != null ? quiz.getAvailableUntil().toString() : null,
                quiz.getTimeLimitMinutes(),
                quiz.getMaxAttempts(),
                quiz.isShuffleQuestions(),
                quiz.isShowCorrectAnswers(),
                quiz.getTotalPoints(),
                quiz.getQuestions().size(),
                quiz.getCreatedAt().toString(),
                quiz.isActive(),
                quiz.isAvailableNow(),
                quiz.getUnitId() != null ? quiz.getUnitId().getValue() : null
        );
    }

    private QuizQuestionDTO mapToQuestionDTO(QuizQuestion question) {
        List<QuestionOptionDTO> options = question.getOptions().stream()
                .map(opt -> new QuestionOptionDTO(opt.getText(), opt.isCorrect()))
                .collect(Collectors.toList());

        return new QuizQuestionDTO(
                question.getId().getValue(),
                question.getQuestionText(),
                question.getType().name(),
                question.getPoints(),
                options,
                null
        );
    }

    private CompleteQuizDTO mapToCompleteQuizDTO(Quiz quiz) {
        List<CompleteQuizQuestionDTO> questions = quiz.getQuestions().stream()
                .map(this::mapToCompleteQuestionDTO)
                .collect(Collectors.toList());

        return new CompleteQuizDTO(
                quiz.getId().getValue(),
                quiz.getCourseId().getValue(),
                "Course Name",
                quiz.getUnitId() != null ? quiz.getUnitId().getValue() : null,
                quiz.getTitle(),
                quiz.getDescription(),
                quiz.getAvailableFrom() != null ? quiz.getAvailableFrom().toString() : null,
                quiz.getAvailableUntil() != null ? quiz.getAvailableUntil().toString() : null,
                quiz.getTimeLimitMinutes(),
                quiz.getMaxAttempts(),
                quiz.isShuffleQuestions(),
                quiz.isShowCorrectAnswers(),
                quiz.getTotalPoints(),
                quiz.getQuestions().size(),
                quiz.getCreatedAt().toString(),
                quiz.isActive(),
                quiz.isAvailableNow(),
                questions
        );
    }

    private CompleteQuizQuestionDTO mapToCompleteQuestionDTO(QuizQuestion question) {
        List<QuestionOptionDTO> options = question.getOptions().stream()
                .map(opt -> new QuestionOptionDTO(opt.getText(), opt.isCorrect()))
                .collect(Collectors.toList());

        return new CompleteQuizQuestionDTO(
                question.getId().getValue(),
                question.getQuestionText(),
                question.getType().name(),
                question.getPoints(),
                options,
                question.getCorrectAnswer()
        );
    }
}