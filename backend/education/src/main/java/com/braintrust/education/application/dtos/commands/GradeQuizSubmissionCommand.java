package com.braintrust.education.application.dtos.commands;

import java.util.List;

public record GradeQuizSubmissionCommand(
        String quizSubmissionId,
        int earnedPoints,
        int totalPoints,
        List<QuestionGrade> questionGrades
) {
    public record QuestionGrade(
            String questionId,
            int earnedPoints,
            int maxPoints,
            String feedback
    ) {}
}