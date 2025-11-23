package com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities;


import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "quiz_submissions", indexes = {
        @Index(name = "idx_qsubm_quiz", columnList = "quiz_id"),
        @Index(name = "idx_qsubm_student", columnList = "student_id"),
        @Index(name = "idx_qsubm_status", columnList = "status")
})
public class QuizSubmissionJpaEntity {

    @Id
    @Column(name = "id", length = 50)
    private String id;

    @Column(name = "quiz_id", length = 50, nullable = false)
    private String quizId;

    @Column(name = "student_id", length = 50, nullable = false)
    private String studentId;

    @Column(name = "attempt_number", nullable = false)
    private int attemptNumber;

    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "status", length = 50, nullable = false)
    private String status;

    @Column(name = "answers_json", columnDefinition = "TEXT")
    private String answersJson; // JSON serialized List<QuizAnswer>

    @Column(name = "grade_value", precision = 10, scale = 2)
    private BigDecimal gradeValue;

    @Column(name = "grade_max_score", precision = 10, scale = 2)
    private BigDecimal gradeMaxScore;

    @Column(name = "auto_graded", nullable = false)
    private boolean autoGraded;

    public QuizSubmissionJpaEntity() {}

    public QuizSubmissionJpaEntity(String id, String quizId, String studentId, int attemptNumber,
                                   LocalDateTime startedAt, LocalDateTime submittedAt, String status,
                                   String answersJson, BigDecimal gradeValue, BigDecimal gradeMaxScore,
                                   boolean autoGraded) {
        this.id = id;
        this.quizId = quizId;
        this.studentId = studentId;
        this.attemptNumber = attemptNumber;
        this.startedAt = startedAt;
        this.submittedAt = submittedAt;
        this.status = status;
        this.answersJson = answersJson;
        this.gradeValue = gradeValue;
        this.gradeMaxScore = gradeMaxScore;
        this.autoGraded = autoGraded;
    }

    // Getters/Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getQuizId() { return quizId; }
    public void setQuizId(String quizId) { this.quizId = quizId; }
    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }
    public int getAttemptNumber() { return attemptNumber; }
    public void setAttemptNumber(int attemptNumber) { this.attemptNumber = attemptNumber; }
    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getAnswersJson() { return answersJson; }
    public void setAnswersJson(String answersJson) { this.answersJson = answersJson; }
    public BigDecimal getGradeValue() { return gradeValue; }
    public void setGradeValue(BigDecimal gradeValue) { this.gradeValue = gradeValue; }
    public BigDecimal getGradeMaxScore() { return gradeMaxScore; }
    public void setGradeMaxScore(BigDecimal gradeMaxScore) { this.gradeMaxScore = gradeMaxScore; }
    public boolean isAutoGraded() { return autoGraded; }
    public void setAutoGraded(boolean autoGraded) { this.autoGraded = autoGraded; }
}