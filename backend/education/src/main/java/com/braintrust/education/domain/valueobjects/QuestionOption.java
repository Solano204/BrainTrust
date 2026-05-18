package com.braintrust.education.domain.valueobjects;


public class QuestionOption {
    private final String text;
    private final boolean correct;

    public QuestionOption(String text, boolean correct) {
        this.text = text;
        this.correct = correct;
    }

    public static QuestionOption create(String text, boolean correct) {
        return new QuestionOption(text, correct);
    }


    public String getText() { return text; }
    public boolean isCorrect() { return correct; }
}