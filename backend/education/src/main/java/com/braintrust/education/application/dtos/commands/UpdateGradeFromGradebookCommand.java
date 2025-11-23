package com.braintrust.education.application.dtos.commands;

public record UpdateGradeFromGradebookCommand(
        String gradebookId,      // Optional - can find by courseId + studentId
        String courseId,         // Required for lookup
        String studentId,        // Required for lookup
        String activityType,     // "ASSIGNMENT", "QUIZ", "UNIT"
        String activityId,       // Assignment/Quiz/Unit ID
        String earnedPoints,     // New score
        String maxPoints,        // Total possible points
        String feedback          // Optional teacher feedback
) {
    /**
     * Constructor without gradebookId (finds gradebook by course + student)
     */
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