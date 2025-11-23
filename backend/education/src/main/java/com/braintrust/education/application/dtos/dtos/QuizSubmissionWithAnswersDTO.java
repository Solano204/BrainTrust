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
        List<QuestionAnswerDTO> questionAnswers, // ✅ Detailed question responses
        boolean timeExpired
) {
    public record QuestionAnswerDTO(
            String questionId,
            String questionText,
            String questionType,
            int points,
            List<QuestionOptionDTO> options,
            List<Integer> selectedOptions, // For multiple choice
            String textAnswer, // For open-ended
            boolean isCorrect,
            int earnedPoints
    ) {}
}