package com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
@Entity
@Table(name = "submissions", indexes = {
        @Index(name = "idx_submission_assignment", columnList = "assignment_id"),
        @Index(name = "idx_submission_student", columnList = "student_id"),
        @Index(name = "idx_submission_status", columnList = "status"),
        @Index(name = "idx_submission_team", columnList = "team_id")
})
public class SubmissionJpaEntity {
    @Id
    @Column(name = "id", length = 50)
    private String id;

    @Column(name = "assignment_id", length = 50, nullable = false)
    private String assignmentId;

    @Column(name = "student_id", length = 50, nullable = false)
    private String studentId;

    @Column(name = "team_id", length = 50)
    private String teamId;

    @Column(name = "content", columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(name = "submitted_at", nullable = false)
    private LocalDateTime submittedAt;

    @Column(name = "status", length = 20, nullable = false)
    private String status;

    @Column(name = "grade_value", precision = 10, scale = 2)
    private BigDecimal gradeValue;

    @Column(name = "grade_max_score", precision = 10, scale = 2)
    private BigDecimal gradeMaxScore;

    @Column(name = "teacher_feedback", columnDefinition = "TEXT")
    private String teacherFeedback;



    @OneToMany(mappedBy = "submission", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<DocumentJpaEntity> documents = new ArrayList<>();


    public SubmissionJpaEntity() {}

    public SubmissionJpaEntity(String id, String assignmentId, String studentId, String content,
                               LocalDateTime submittedAt, String status, BigDecimal gradeValue,
                               BigDecimal gradeMaxScore, String teacherFeedback, String teamId) {
        this.id = id;
        this.assignmentId = assignmentId;
        this.studentId = studentId;
        this.content = content;
        this.submittedAt = submittedAt;
        this.status = status;
        this.gradeValue = gradeValue;
        this.gradeMaxScore = gradeMaxScore;
        this.teacherFeedback = teacherFeedback;
        this.teamId = teamId;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getAssignmentId() { return assignmentId; }
    public void setAssignmentId(String assignmentId) { this.assignmentId = assignmentId; }



    public List<DocumentJpaEntity> getDocuments() { return documents; }
    public void setDocuments(List<DocumentJpaEntity> documents) { this.documents = documents; }


    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public BigDecimal getGradeValue() { return gradeValue; }
    public void setGradeValue(BigDecimal gradeValue) { this.gradeValue = gradeValue; }

    public BigDecimal getGradeMaxScore() { return gradeMaxScore; }
    public void setGradeMaxScore(BigDecimal gradeMaxScore) { this.gradeMaxScore = gradeMaxScore; }
    public String getTeamId() { return teamId; }
    public void setTeamId(String teamId) { this.teamId = teamId; }
    public String getTeacherFeedback() { return teacherFeedback; }
    public void setTeacherFeedback(String teacherFeedback) { this.teacherFeedback = teacherFeedback; }
}