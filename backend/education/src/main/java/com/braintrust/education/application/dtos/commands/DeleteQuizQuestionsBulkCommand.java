package com.braintrust.education.application.dtos.commands;

import java.util.List;

public record DeleteQuizQuestionsBulkCommand(
        String quizId,
        List<String> questionIds
) {}
