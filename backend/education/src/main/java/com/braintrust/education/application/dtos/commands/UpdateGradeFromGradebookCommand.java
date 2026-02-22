package com.braintrust.education.application.dtos.commands;

public record UpdateGradeFromGradebookCommand(
        String gradebookId,
        String courseId,
        String studentId,
        String activityType,
        String activityId,
        String earnedPoints,
        String maxPoints,
        String feedback
) {

    public UpdateGradeFromGradebookCommand(
            String courseId,
            String studentId,
            String activityType,
            String activityId,
            String earnedPoints,
            String maxPoints,
            String feedback) {
        this(null, courseId, studentId, activityType, activityId,
                earnedPoints, maxPoints, feedback);
    }
}