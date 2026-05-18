package com.braintrust.education.domain.model;

import com.braintrust.education.domain.valueobjects.QuizQuestionId;
import java.util.*;

import com.braintrust.education.domain.valueobjects.QuizQuestionId;
import java.util.*;


public class QuizAnswer {
    private final QuizQuestionId questionId;
    private final List<Integer> selectedOptions;
    private final String textAnswer;

    public QuizAnswer(QuizQuestionId questionId, List<Integer> selectedOptions, String textAnswer) {
        this.questionId = questionId;
        this.selectedOptions = selectedOptions != null ? List.copyOf(selectedOptions) : List.of();
        this.textAnswer = textAnswer;
    }

    public QuizQuestionId getQuestionId() { return questionId; }
    public List<Integer> getSelectedOptions() { return List.copyOf(selectedOptions); }
    public String getTextAnswer() { return textAnswer; }
}