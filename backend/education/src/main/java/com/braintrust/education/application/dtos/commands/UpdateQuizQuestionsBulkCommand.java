package com.braintrust.education.application.dtos.commands;


import java.util.List;

// For bulk updating questions
public record UpdateQuizQuestionsBulkCommand(
        String quizId,
        List<QuestionUpdateData> questions
) {
    public record QuestionUpdateData(
            String questionId,
            String questionText,
            String questionType,  // Only needed if changing type
            Integer points,
            List<QuestionOptionUpdateData> options,
            String correctAnswer,
            UpdateAction action
    ) {
        public enum UpdateAction {
            UPDATE_TEXT,        // Update question text only
            UPDATE_POINTS,      // Update points only
            UPDATE_ANSWER,      // Update correct answer
            UPDATE_OPTIONS,     // Update options
            UPDATE_ALL,         // Update multiple fields
            CHANGE_TYPE         // Change question type
        }
    }

    public record QuestionOptionUpdateData(
            String text,
            boolean correct,
            String optionId,    // For existing options
            OptionAction action // ADD, UPDATE, REMOVE
    ) {
        public enum OptionAction {
            ADD,
            UPDATE,
            REMOVE
        }
    }
}