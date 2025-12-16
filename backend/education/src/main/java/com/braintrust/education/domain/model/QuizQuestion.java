package com.braintrust.education.domain.model;


// ========================================
// 📍 ENTITY: QuizQuestion
// ========================================

import com.braintrust.education.domain.valueobjects.QuestionOption;
import com.braintrust.education.domain.valueobjects.QuizQuestionId;
import com.braintrust.shared.domain.Entity;
import java.util.*;

public class QuizQuestion extends Entity<QuizQuestionId> {
    private String questionText;
    private QuestionType type;
    private int points;
    private final List<QuestionOption> options; // For multiple choice
    private String correctAnswer; // For open-ended

    private QuizQuestion(QuizQuestionId id, String questionText, QuestionType type, int points) {
        this.id = id;
        this.questionText = questionText;
        this.type = type;
        this.points = validatePoints(points);
        this.options = new ArrayList<>();
    }

    // ✅ Factory for Multiple Choice
// ✅ Fixed Factory for Multiple Choice - ADD correctAnswer parameter
// ✅ Fixed Factory for Multiple Choice - ADD correctAnswer parameter
    public static QuizQuestion createMultipleChoice(String questionText, int points,
                                                    List<QuestionOption> options,
                                                    String correctAnswer) { // ✅ ADD THIS PARAMETER
        QuizQuestionId id = QuizQuestionId.generate();
        QuizQuestion question = new QuizQuestion(id, questionText, QuestionType.MULTIPLE_CHOICE, points);
        if (options != null) {
            question.options.addAll(options);
        }
        question.correctAnswer = correctAnswer; // ✅ STORE THE CORRECT ANSWER
        return question;
    }


    // ✅ Fixed reconstitute method
    public static QuizQuestion reconstitute(QuizQuestionId id, String questionText,
                                            QuestionType type, int points,
                                            List<QuestionOption> options, String correctAnswer) {
        QuizQuestion question = new QuizQuestion(id, questionText, type, points);

        // ✅ Store the correct answer first
        question.correctAnswer = correctAnswer;

        // ✅ Then add options
        if (options != null) {
            question.options.addAll(options);
        }

        return question;
    }


    // In QuizQuestion class
    public void updateQuestionText(String newText) {
        if (newText == null || newText.trim().isEmpty()) {
            throw new IllegalArgumentException("Question text cannot be null or empty");
        }
        this.questionText = newText.trim();
    }

    public void updatePoints(int newPoints) {
        this.points = validatePoints(newPoints);
    }

    public void updateCorrectAnswer(String newCorrectAnswer) {
        if (this.type == QuestionType.OPEN_ENDED) {
            this.correctAnswer = newCorrectAnswer;
        } else {
            throw new IllegalStateException("Cannot set correct answer directly for multiple choice questions");
        }
    }

    public void updateOptions(List<QuestionOption> newOptions) {
        if (this.type == QuestionType.MULTIPLE_CHOICE || this.type == QuestionType.TRUE_FALSE) {
            this.options.clear();
            this.options.addAll(newOptions);
        } else {
            throw new IllegalStateException("Cannot set options for non-multiple choice questions");
        }
    }

    public void addOption(QuestionOption newOption) {
        if (this.type == QuestionType.MULTIPLE_CHOICE || this.type == QuestionType.TRUE_FALSE) {
            this.options.add(newOption);
        } else {
            throw new IllegalStateException("Cannot add options to non-multiple choice questions");
        }
    }

    public void removeOption(int index) {
        if (this.type == QuestionType.MULTIPLE_CHOICE || this.type == QuestionType.TRUE_FALSE) {
            if (index >= 0 && index < this.options.size()) {
                this.options.remove(index);
            } else {
                throw new IllegalArgumentException("Invalid option index: " + index);
            }
        } else {
            throw new IllegalStateException("Cannot remove options from non-multiple choice questions");
        }
    }





    // ✅ Factory for Open-Ended
    public static QuizQuestion createOpenEnded(String questionText, int points, String correctAnswer) {
        QuizQuestionId id = QuizQuestionId.generate();
        QuizQuestion question = new QuizQuestion(id, questionText, QuestionType.OPEN_ENDED, points);
        question.correctAnswer = correctAnswer;
        return question;
    }

    // ✅ Reconstitute
    public boolean isCorrectAnswer(List<Integer> selectedOptionIndices) {
        if (type != QuestionType.MULTIPLE_CHOICE) {
            throw new IllegalStateException("This method is only for multiple choice questions");
        }

        Set<Integer> correctIndices = new HashSet<>();
        for (int i = 0; i < options.size(); i++) {
            if (options.get(i).isCorrect()) {
                correctIndices.add(i);
            }
        }

        return new HashSet<>(selectedOptionIndices).equals(correctIndices);
    }

    private int validatePoints(int points) {
        if (points < 0) {
            throw new IllegalArgumentException("Points cannot be negative");
        }
        return points;
    }

    // Getters
    public String getQuestionText() { return questionText; }
    public QuestionType getType() { return type; }
    public int getPoints() { return points; }
    public List<QuestionOption> getOptions() { return List.copyOf(options); }
    public String getCorrectAnswer() { return correctAnswer; }
}