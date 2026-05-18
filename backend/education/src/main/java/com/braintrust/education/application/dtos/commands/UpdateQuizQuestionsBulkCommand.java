package com.braintrust.education.application.dtos.commands;


import java.util.List;


public record UpdateQuizQuestionsBulkCommand(
        String quizId,
        List<QuestionUpdateData> questions
) {
    public record QuestionUpdateData(
            String questionId,
            String questionText,
            String questionType,
            Integer points,
            List<QuestionOptionUpdateData> options,
            String correctAnswer,
            UpdateAction action
    ) {
        public enum UpdateAction {
            UPDATE_TEXT,
            UPDATE_POINTS,
            UPDATE_ANSWER,
            UPDATE_OPTIONS,
            UPDATE_ALL,
            CHANGE_TYPE
        }
    }

    public record QuestionOptionUpdateData(
            String text,
            boolean correct,
            String optionId,
            OptionAction action
    ) {
        public enum OptionAction {
            ADD,
            UPDATE,
            REMOVE
        }
    }
}