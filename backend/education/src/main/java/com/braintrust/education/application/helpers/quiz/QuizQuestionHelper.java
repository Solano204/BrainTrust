package com.braintrust.education.application.helpers.quiz;

import com.braintrust.education.application.dtos.commands.*;
import com.braintrust.education.application.dtos.commands.QuestionOptionDTO;
import com.braintrust.education.application.ports.out.QuizRepository;
import com.braintrust.education.domain.exceptions.QuestionNotFoundException;
import com.braintrust.education.domain.exceptions.QuizNotFoundException;
import com.braintrust.education.domain.model.Quiz;
import com.braintrust.education.domain.model.QuizQuestion;
import com.braintrust.education.domain.model.QuestionType;
import com.braintrust.education.domain.valueobjects.QuestionOption;
import com.braintrust.education.domain.valueobjects.QuizId;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class QuizQuestionHelper {

    private static final Logger log = LoggerFactory.getLogger(QuizQuestionHelper.class);

    private final QuizRepository quizRepository;

    public QuizQuestionHelper(QuizRepository quizRepository) {
        this.quizRepository = quizRepository;
    }

    public void addQuestion(AddQuizQuestionCommand command) {
        QuizId quizId = QuizId.fromString(command.quizId());
        log.info("Adding question to quiz {}", quizId.getValue());

        Quiz quiz = findQuizByIdOrThrow(quizId);

        QuizQuestion question = createQuestionFromCommand(
                command.questionType(),
                command.questionText(),
                command.points(),
                command.options(),
                command.correctAnswer()
        );

        quiz.addQuestion(question);
        quizRepository.save(quiz);
        log.info("Question added successfully");
    }

    public void addQuestionsBulk(AddQuizQuestionsBulkCommand command) {
        QuizId quizId = QuizId.fromString(command.quizId());
        log.info("Adding {} questions in bulk to quiz {}",
                command.questions().size(), quizId.getValue());

        Quiz quiz = findQuizByIdOrThrow(quizId);

        if (quiz.hasSubmissions()) {
            throw new IllegalStateException("Cannot add questions to a quiz that already has submissions");
        }

        for (AddQuizQuestionsBulkCommand.QuizQuestionData questionData : command.questions()) {
            QuizQuestion question = createQuestionFromBulkData(questionData);
            quiz.addQuestion(question);
        }

        quizRepository.save(quiz);
        log.info("Successfully added {} questions to quiz {}",
                command.questions().size(), quizId.getValue());
    }

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

            processQuestionUpdate(quiz, question, updateData);
        }

        quizRepository.save(quiz);
        log.info("Successfully updated {} questions in quiz {}",
                command.questions().size(), quizId.getValue());
    }

    private void processQuestionUpdate(
            Quiz quiz,
            QuizQuestion question,
            UpdateQuizQuestionsBulkCommand.QuestionUpdateData updateData) {

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
                updateQuestionAnswer(question, updateData);
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
                updateAllQuestionProperties(question, updateData);
                break;

            case CHANGE_TYPE:
                handleQuestionTypeChange(quiz, question, updateData);
                break;

            default:
                log.warn("Unknown update action: {}", updateData.action());
        }
    }

    private void updateQuestionAnswer(
            QuizQuestion question,
            UpdateQuizQuestionsBulkCommand.QuestionUpdateData updateData) {

        if (updateData.correctAnswer() == null) {
            return;
        }

        if (question.getType() == QuestionType.OPEN_ENDED) {
            question.updateCorrectAnswer(updateData.correctAnswer());
        } else if (updateData.options() != null) {
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

    private void updateAllQuestionProperties(
            QuizQuestion question,
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

    private void handleQuestionTypeChange(
            Quiz quiz,
            QuizQuestion oldQuestion,
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

    private QuizQuestion createQuestionFromCommand(
            String questionType,
            String questionText,
            Integer points,
            List<QuestionOptionDTO> optionData,
            String correctAnswer) {

        QuestionType type = QuestionType.valueOf(questionType);

        if (type == QuestionType.MULTIPLE_CHOICE || type == QuestionType.TRUE_FALSE) {
            List<QuestionOption> options = optionData.stream()
                    .map(opt -> new QuestionOption(opt.text(), opt.correct()))
                    .collect(Collectors.toList());
            return QuizQuestion.createMultipleChoice(questionText, points, options, correctAnswer);
        } else {
            return QuizQuestion.createOpenEnded(questionText, points, correctAnswer);
        }
    }

    private QuizQuestion createQuestionFromBulkData(
            AddQuizQuestionsBulkCommand.QuizQuestionData questionData) {

        QuestionType type = QuestionType.valueOf(questionData.questionType());

        if (type == QuestionType.MULTIPLE_CHOICE || type == QuestionType.TRUE_FALSE) {
            List<QuestionOption> options = questionData.options().stream()
                    .map(opt -> new QuestionOption(opt.text(), opt.correct()))
                    .collect(Collectors.toList());

            return QuizQuestion.createMultipleChoice(
                    questionData.questionText(),
                    questionData.points(),
                    options,
                    questionData.correctAnswer()
            );
        } else {
            return QuizQuestion.createOpenEnded(
                    questionData.questionText(),
                    questionData.points(),
                    questionData.correctAnswer()
            );
        }
    }

    private Quiz findQuizByIdOrThrow(QuizId quizId) {
        return quizRepository.findById(quizId)
                .orElseThrow(() -> new QuizNotFoundException("Quiz not found: " + quizId.getValue()));
    }
}