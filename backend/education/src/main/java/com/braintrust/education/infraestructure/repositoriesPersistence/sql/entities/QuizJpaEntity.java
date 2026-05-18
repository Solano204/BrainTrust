package com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "quizzes", indexes = {
        @Index(name = "idx_quiz_course", columnList = "course_id"),
        @Index(name = "idx_quiz_active",  columnList = "active"),
        @Index(name = "idx_quiz_unit",    columnList = "unit_id")
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

    @Column(name = "allow_see_results", nullable = false)   // ✅ NEW
    private boolean allowSeeResults = false;

    @Column(name = "total_score", nullable = false, columnDefinition = "NUMERIC(10,2)")
    private double totalScore = 0;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "active", nullable = false)
    private boolean active = true;

    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL,
            orphanRemoval = true, fetch = FetchType.LAZY)
    private List<QuizQuestionJpaEntity> questions = new ArrayList<>();

    public QuizJpaEntity() {}

    public QuizJpaEntity(String id, String courseId, String unitId, String title, String description,
                         LocalDateTime availableFrom, LocalDateTime availableUntil,
                         Integer timeLimitMinutes, int maxAttempts, boolean shuffleQuestions,
                         boolean showCorrectAnswers, boolean allowSeeResults, double totalScore,
                         LocalDateTime createdAt, boolean active) {
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
        this.allowSeeResults = allowSeeResults;
        this.totalScore = totalScore;
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

    // ── Getters & Setters ────────────────────────────────────────────────────
    public String getId()                          { return id; }
    public void setId(String id)                   { this.id = id; }
    public String getCourseId()                    { return courseId; }
    public void setCourseId(String courseId)       { this.courseId = courseId; }
    public String getTitle()                       { return title; }
    public void setTitle(String title)             { this.title = title; }
    public String getDescription()                 { return description; }
    public void setDescription(String d)           { this.description = d; }
    public String getUnitId()                      { return unitId; }
    public void setUnitId(String unitId)           { this.unitId = unitId; }
    public LocalDateTime getAvailableFrom()        { return availableFrom; }
    public void setAvailableFrom(LocalDateTime t)  { this.availableFrom = t; }
    public LocalDateTime getAvailableUntil()       { return availableUntil; }
    public void setAvailableUntil(LocalDateTime t) { this.availableUntil = t; }
    public Integer getTimeLimitMinutes()            { return timeLimitMinutes; }
    public void setTimeLimitMinutes(Integer m)     { this.timeLimitMinutes = m; }
    public int getMaxAttempts()                    { return maxAttempts; }
    public void setMaxAttempts(int m)              { this.maxAttempts = m; }
    public boolean isShuffleQuestions()            { return shuffleQuestions; }
    public void setShuffleQuestions(boolean b)     { this.shuffleQuestions = b; }
    public boolean isShowCorrectAnswers()          { return showCorrectAnswers; }
    public void setShowCorrectAnswers(boolean b)   { this.showCorrectAnswers = b; }
    public boolean isAllowSeeResults()             { return allowSeeResults; }   // ✅ NEW
    public void setAllowSeeResults(boolean b)      { this.allowSeeResults = b; } // ✅ NEW
    public double getTotalScore()                  { return totalScore; }         // ✅ NEW
    public void setTotalScore(double s)            { this.totalScore = s; }       // ✅ NEW
    public LocalDateTime getCreatedAt()            { return createdAt; }
    public void setCreatedAt(LocalDateTime t)      { this.createdAt = t; }
    public boolean isActive()                      { return active; }
    public void setActive(boolean active)          { this.active = active; }
    public List<QuizQuestionJpaEntity> getQuestions() { return questions; }
    public void setQuestions(List<QuizQuestionJpaEntity> questions) {
        this.questions = questions;
        if (questions != null) {
            for (QuizQuestionJpaEntity q : questions) q.setQuiz(this);
        }
    }
}