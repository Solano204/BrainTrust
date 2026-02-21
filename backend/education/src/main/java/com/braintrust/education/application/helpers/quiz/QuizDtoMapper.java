package com.braintrust.education.application.helpers.quiz;

import com.braintrust.education.application.dtos.dtos.*;
import com.braintrust.education.application.dtos.commands.QuestionOptionDTO;
import com.braintrust.education.domain.model.Quiz;
import com.braintrust.education.domain.model.QuizQuestion;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class QuizDtoMapper {

    public QuizDTO toQuizDTO(Quiz quiz) {
        return new QuizDTO(
                quiz.getId().getValue(),
                quiz.getCourseId().getValue(),
                "Course Name", // TODO: Resolve from CourseService
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

    /**
     * Maps Quiz entity to MinimalQuizDTO
     */
    public MinimalQuizDTO toMinimalQuizDTO(Quiz quiz) {
        return new MinimalQuizDTO(
                quiz.getId().getValue(),
                quiz.getTitle(),
                quiz.getDescription()
        );
    }

    public CompleteQuizDTO toCompleteQuizDTO(Quiz quiz) {
        List<CompleteQuizQuestionDTO> questions = quiz.getQuestions().stream()
                .map(this::toCompleteQuestionDTO)
                .collect(Collectors.toList());

        return new CompleteQuizDTO(
                quiz.getId().getValue(),
                quiz.getCourseId().getValue(),
                "Course Name", // TODO: Resolve from CourseService
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

    public QuizQuestionDTO toQuestionDTO(QuizQuestion question) {
        List<QuestionOptionDTO> options = question.getOptions().stream()
                .map(opt -> new QuestionOptionDTO(opt.getText(), opt.isCorrect()))
                .collect(Collectors.toList());

        return new QuizQuestionDTO(
                question.getId().getValue(),
                question.getQuestionText(),
                question.getType().name(),
                question.getPoints(),
                options,
                null // Don't expose correct answer in basic DTO
        );
    }

    /**
     * Maps QuizQuestion to CompleteQuizQuestionDTO (with correct answer)
     */
    public CompleteQuizQuestionDTO toCompleteQuestionDTO(QuizQuestion question) {
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

    public List<QuizDTO> toQuizDTOList(List<Quiz> quizzes) {
        return quizzes.stream()
                .map(this::toQuizDTO)
                .collect(Collectors.toList());
    }

    public List<QuizQuestionDTO> toQuestionDTOList(List<QuizQuestion> questions) {
        return questions.stream()
                .map(this::toQuestionDTO)
                .collect(Collectors.toList());
    }
}