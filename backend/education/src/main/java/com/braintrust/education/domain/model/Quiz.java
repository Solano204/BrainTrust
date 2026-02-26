package com.braintrust.education.domain.model;

import com.braintrust.education.domain.valueobjects.*;
import com.braintrust.shared.domain.AggregateRoot;
import java.time.LocalDateTime;
import java.util.*;

public class Quiz extends AggregateRoot<QuizId> {
    private CourseId courseId;
    private String title;
    private String description;
    private LocalDateTime availableFrom;
    private LocalDateTime availableUntil;
    private Integer timeLimitMinutes;
    private int maxAttempts;
    private UnitId unitId;
    private boolean shuffleQuestions;
    private boolean showCorrectAnswers;
    private boolean allowSeeResults;   // ✅ NEW
    private double totalScore;         // ✅ NEW
    private LocalDateTime createdAt;
    private final List<QuizQuestion> questions;
    private boolean active;

    private Quiz(QuizId id, CourseId courseId, String title) {
        this.id = id;
        this.courseId = courseId;
        this.title = validateTitle(title);
        this.createdAt = LocalDateTime.now();
        this.questions = new ArrayList<>();
        this.active = true;
        this.maxAttempts = 1;
        this.shuffleQuestions = false;
        this.showCorrectAnswers = true;
        this.allowSeeResults = false;
        this.totalScore = 0;
    }

    public void update(String title, String description, LocalDateTime availableFrom,
                       LocalDateTime availableUntil, Integer timeLimitMinutes,
                       boolean allowSeeResults, double totalScore) {  // ✅ NEW params
        this.title = validateTitle(title);
        this.description = description;
        this.availableFrom = availableFrom;
        this.availableUntil = availableUntil;
        this.timeLimitMinutes = timeLimitMinutes;
        this.allowSeeResults = allowSeeResults;
        this.totalScore = totalScore;
    }

    public static Quiz create(CourseId courseId, UnitId unitId, String title, String description,
                              LocalDateTime availableFrom, LocalDateTime availableUntil,
                              Integer timeLimitMinutes, boolean allowSeeResults, double totalScore) { // ✅ NEW
        QuizId id = QuizId.generate();
        Quiz quiz = new Quiz(id, courseId, title);
        quiz.unitId = unitId;
        quiz.description = description;
        quiz.availableFrom = availableFrom;
        quiz.availableUntil = availableUntil;
        quiz.timeLimitMinutes = timeLimitMinutes;
        quiz.allowSeeResults = allowSeeResults;
        quiz.totalScore = totalScore;
        return quiz;
    }

    public static Quiz reconstitute(QuizId id, CourseId courseId, UnitId unitId, String title,
                                    String description, LocalDateTime availableFrom,
                                    LocalDateTime availableUntil, Integer timeLimitMinutes,
                                    int maxAttempts, boolean shuffleQuestions,
                                    boolean showCorrectAnswers, boolean allowSeeResults,
                                    double totalScore, LocalDateTime createdAt,
                                    List<QuizQuestion> questions, boolean active) {
        Quiz quiz = new Quiz(id, courseId, title);
        quiz.unitId = unitId;
        quiz.description = description;
        quiz.availableFrom = availableFrom;
        quiz.availableUntil = availableUntil;
        quiz.timeLimitMinutes = timeLimitMinutes;
        quiz.maxAttempts = maxAttempts;
        quiz.shuffleQuestions = shuffleQuestions;
        quiz.showCorrectAnswers = showCorrectAnswers;
        quiz.allowSeeResults = allowSeeResults;
        quiz.totalScore = totalScore;
        quiz.createdAt = createdAt;
        quiz.active = active;
        if (questions != null) {
            quiz.questions.addAll(questions);
        }
        return quiz;
    }

    public void addQuestion(QuizQuestion question) { questions.add(question); }
    public void removeQuestion(QuizQuestion question) { questions.remove(question); }

    public boolean isAvailableNow() {
        LocalDateTime now = LocalDateTime.now();
        return active &&
                (availableFrom == null || now.isAfter(availableFrom)) &&
                (availableUntil == null || now.isBefore(availableUntil));
    }

    public boolean hasTimeLimit() { return timeLimitMinutes != null && timeLimitMinutes > 0; }

    public int getTotalPoints() {
        return questions.stream().mapToInt(QuizQuestion::getPoints).sum();
    }

    /**
     * Returns the points each question should carry if totalScore is
     * distributed evenly across all questions.
     * e.g. totalScore=75, 5 questions → 15.0 per question
     */
    public double getPointsPerQuestion() {
        if (questions.isEmpty()) return 0;
        return totalScore / questions.size();
    }

    public boolean hasSubmissions() { return false; }

    private String validateTitle(String title) {
        if (title == null || title.trim().isEmpty()) {
            throw new IllegalArgumentException("Quiz title cannot be null or empty");
        }
        return title.trim();
    }

    // ── Getters ──────────────────────────────────────────────────────────────
    public UnitId getUnitId()                  { return unitId; }
    public CourseId getCourseId()              { return courseId; }
    public String getTitle()                   { return title; }
    public String getDescription()             { return description; }
    public LocalDateTime getAvailableFrom()    { return availableFrom; }
    public LocalDateTime getAvailableUntil()   { return availableUntil; }
    public Integer getTimeLimitMinutes()        { return timeLimitMinutes; }
    public int getMaxAttempts()                { return maxAttempts; }
    public boolean isShuffleQuestions()        { return shuffleQuestions; }
    public boolean isShowCorrectAnswers()      { return showCorrectAnswers; }
    public boolean isAllowSeeResults()         { return allowSeeResults; }   // ✅ NEW
    public double getTotalScore()              { return totalScore; }         // ✅ NEW
    public LocalDateTime getCreatedAt()        { return createdAt; }
    public List<QuizQuestion> getQuestions()   { return List.copyOf(questions); }
    public boolean isActive()                  { return active; }
}