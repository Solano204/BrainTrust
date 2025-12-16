package com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities;


import com.braintrust.education.domain.valueobjects.QuizQuestionId;

import java.util.Objects;

public class QuestionGrade {
    private final QuizQuestionId questionId;
    private final int earnedPoints;
    private final int maxPoints;
    private final String feedback;
    private final boolean autoGraded;

    public QuestionGrade(QuizQuestionId questionId, int earnedPoints, int maxPoints,
                         String feedback, boolean autoGraded) {
        if (questionId == null) {
            throw new IllegalArgumentException("Question ID cannot be null");
        }
        if (earnedPoints < 0 || maxPoints < 0) {
            throw new IllegalArgumentException("Points cannot be negative");
        }
        if (earnedPoints > maxPoints) {
            throw new IllegalArgumentException("Earned points cannot exceed max points");
        }

        this.questionId = questionId;
        this.earnedPoints = earnedPoints;
        this.maxPoints = maxPoints;
        this.feedback = feedback != null ? feedback : "";
        this.autoGraded = autoGraded;
    }

    public QuizQuestionId getQuestionId() { return questionId; }
    public int getEarnedPoints() { return earnedPoints; }
    public int getMaxPoints() { return maxPoints; }
    public String getFeedback() { return feedback; }
    public boolean isAutoGraded() { return autoGraded; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        QuestionGrade that = (QuestionGrade) o;
        return earnedPoints == that.earnedPoints &&
                maxPoints == that.maxPoints &&
                autoGraded == that.autoGraded &&
                Objects.equals(questionId, that.questionId) &&
                Objects.equals(feedback, that.feedback);
    }

    @Override
    public int hashCode() {
        return Objects.hash(questionId, earnedPoints, maxPoints, feedback, autoGraded);
    }

    @Override
    public String toString() {
        return "QuestionGrade{" +
                "questionId=" + questionId +
                ", earnedPoints=" + earnedPoints +
                ", maxPoints=" + maxPoints +
                ", feedback='" + feedback + '\'' +
                ", autoGraded=" + autoGraded +
                '}';
    }
}