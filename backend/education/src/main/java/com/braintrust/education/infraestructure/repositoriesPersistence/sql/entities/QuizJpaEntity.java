package com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "quizzes", indexes = {
        @Index(name = "idx_quiz_course", columnList = "course_id"),
        @Index(name = "idx_quiz_active", columnList = "active"),
        @Index(name = "idx_quiz_unit", columnList = "unit_id")
})
public class QuizJpaEntity {

    @Id
    @Column(name = "id", length = 50)
    private String id;

    @Column(name = "course_id", length = 50, nullable = false)
    private String courseId;

    @Column(name = "title", length = 255, nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "unit_id", length = 50)
    private String unitId;

    @Column(name = "available_from")
    private LocalDateTime availableFrom;

    @Column(name = "available_until")
    private LocalDateTime availableUntil;

    @Column(name = "time_limit_minutes")
    private Integer timeLimitMinutes;

    @Column(name = "max_attempts", nullable = false)
    private int maxAttempts = 1;

    @Column(name = "shuffle_questions", nullable = false)
    private boolean shuffleQuestions = false;

    @Column(name = "show_correct_answers", nullable = false)
    private boolean showCorrectAnswers = true;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "active", nullable = false)
    private boolean active = true;


    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<QuizQuestionJpaEntity> questions = new ArrayList<>();

    public QuizJpaEntity() {}

    public QuizJpaEntity(String id, String courseId, String unitId, String title, String description,
                         LocalDateTime availableFrom, LocalDateTime availableUntil,
                         Integer timeLimitMinutes, int maxAttempts, boolean shuffleQuestions,
                         boolean showCorrectAnswers, LocalDateTime createdAt, boolean active) {
        this.id = id;
        this.courseId = courseId;
        this.unitId = unitId;
        this.title = title;
        this.description = description;
        this.availableFrom = availableFrom;
        this.availableUntil = availableUntil;
        this.timeLimitMinutes = timeLimitMinutes;
        this.maxAttempts = maxAttempts;
        this.shuffleQuestions = shuffleQuestions;
        this.showCorrectAnswers = showCorrectAnswers;
        this.createdAt = createdAt;
        this.active = active;
    }

    public void addQuestion(QuizQuestionJpaEntity question) {
        questions.add(question);
        question.setQuiz(this);
    }


    public void removeQuestion(QuizQuestionJpaEntity question) {
        questions.remove(question);
        question.setQuiz(null);
    }


    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getCourseId() { return courseId; }
    public void setCourseId(String courseId) { this.courseId = courseId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getUnitId() { return unitId; }
    public void setUnitId(String unitId) { this.unitId = unitId; }
    public LocalDateTime getAvailableFrom() { return availableFrom; }
    public void setAvailableFrom(LocalDateTime availableFrom) { this.availableFrom = availableFrom; }
    public LocalDateTime getAvailableUntil() { return availableUntil; }
    public void setAvailableUntil(LocalDateTime availableUntil) { this.availableUntil = availableUntil; }
    public Integer getTimeLimitMinutes() { return timeLimitMinutes; }
    public void setTimeLimitMinutes(Integer timeLimitMinutes) { this.timeLimitMinutes = timeLimitMinutes; }
    public int getMaxAttempts() { return maxAttempts; }
    public void setMaxAttempts(int maxAttempts) { this.maxAttempts = maxAttempts; }
    public boolean isShuffleQuestions() { return shuffleQuestions; }
    public void setShuffleQuestions(boolean shuffleQuestions) { this.shuffleQuestions = shuffleQuestions; }
    public boolean isShowCorrectAnswers() { return showCorrectAnswers; }
    public void setShowCorrectAnswers(boolean showCorrectAnswers) { this.showCorrectAnswers = showCorrectAnswers; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public List<QuizQuestionJpaEntity> getQuestions() { return questions; }
    public void setQuestions(List<QuizQuestionJpaEntity> questions) {
        this.questions = questions;

        if (questions != null) {
            for (QuizQuestionJpaEntity question : questions) {
                question.setQuiz(this);
            }
        }
    }
}