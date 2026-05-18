package com.braintrust.education.application.dtos.commands;

import java.util.List;

public record AnswerQuestionCommand(
        String quizSubmissionId,
        String questionId,
        List<Integer> selectedOptions, // For multiple choice
        String textAnswer              // For open-ended
) {}