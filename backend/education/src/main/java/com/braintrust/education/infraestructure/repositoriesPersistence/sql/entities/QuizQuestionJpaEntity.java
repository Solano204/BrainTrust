package com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "quiz_questions")
public class QuizQuestionJpaEntity {

    @Id
    @Column(name = "id", length = 50)
    private String id;

    // ✅ FIXED: Proper ManyToOne relationship with QuizJpaEntity
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    private QuizJpaEntity quiz;

    @Column(name = "question_text", columnDefinition = "TEXT", nullable = false)
    private String questionText;

    @Column(name = "question_type", length = 50, nullable = false)
    private String questionType;

    @Column(name = "points", nullable = false)
    private int points;

    @Column(name = "options_json", columnDefinition = "TEXT")
    private String optionsJson;

    @Column(name = "correct_answer", columnDefinition = "TEXT")
    private String correctAnswer;

    public QuizQuestionJpaEntity() {}

    public QuizQuestionJpaEntity(String id, String questionText, String questionType,
                                 int points, String optionsJson, String correctAnswer) {
        this.id = id;
        this.questionText = questionText;
        this.questionType = questionType;
        this.points = points;
        this.optionsJson = optionsJson;
        this.correctAnswer = correctAnswer;
    }

    // ✅ Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public QuizJpaEntity getQuiz() { return quiz; }
    public void setQuiz(QuizJpaEntity quiz) { this.quiz = quiz; }

    public String getQuestionText() { return questionText; }
    public void setQuestionText(String questionText) { this.questionText = questionText; }
    public String getQuestionType() { return questionType; }
    public void setQuestionType(String questionType) { this.questionType = questionType; }
    public int getPoints() { return points; }
    public void setPoints(int points) { this.points = points; }
    public String getOptionsJson() { return optionsJson; }
    public void setOptionsJson(String optionsJson) { this.optionsJson = optionsJson; }
    public String getCorrectAnswer() { return correctAnswer; }
    public void setCorrectAnswer(String correctAnswer) { this.correctAnswer = correctAnswer; }
}