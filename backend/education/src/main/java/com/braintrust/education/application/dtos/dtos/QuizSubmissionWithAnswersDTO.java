package com.braintrust.education.application.dtos.dtos;

import com.braintrust.education.application.dtos.commands.QuestionOptionDTO;

import java.util.List;

public record QuizSubmissionWithAnswersDTO(
        String id,
        String quizId,
        String quizTitle,
        String studentId,
        String studentName,
        int attemptNumber,
        String startedAt,
        String submittedAt,
        String status,
        GradeDTO grade,
        boolean autoGraded,
        List<QuestionAnswerDTO> questionAnswers,
        boolean timeExpired
) {
    public record QuestionAnswerDTO(
            String questionId,
            String questionText,
            String questionType,
            int points,
            List<QuestionOptionDTO> options,
            List<Integer> selectedOptions,
            String textAnswer,
            boolean isCorrect,
            int earnedPoints
    ) {}
}