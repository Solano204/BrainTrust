package com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities;


import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "enrollments", indexes = {
        @Index(name = "idx_enrollment_course", columnList = "course_id"),
        @Index(name = "idx_enrollment_student", columnList = "student_id"),
        @Index(name = "idx_enrollment_status", columnList = "status"),
        @Index(name = "idx_enrollment_course_student", columnList = "course_id,student_id", unique = true)
})
public class EnrollmentJpaEntity {

    @Id
    @Column(name = "id", length = 50)
    private String id;

    @Column(name = "course_id", length = 50, nullable = false, insertable = false, updatable = false)
    private String courseId;

    @Column(name = "student_id", length = 50, nullable = false)
    private String studentId;

    @Column(name = "enrollment_date", nullable = false)
    private LocalDate enrollmentDate;

    @Column(name = "status", length = 20, nullable = false)
    private String status;

    @Column(name = "final_grade_value", precision = 10, scale = 2)
    private BigDecimal finalGradeValue;

    @Column(name = "final_grade_max_score", precision = 10, scale = 2)
    private BigDecimal finalGradeMaxScore;

    public EnrollmentJpaEntity() {}

    public EnrollmentJpaEntity(String id, String courseId, String studentId,
                               LocalDate enrollmentDate, String status,
                               BigDecimal finalGradeValue, BigDecimal finalGradeMaxScore) {
        this.id = id;
        this.courseId = courseId;
        this.studentId = studentId;
        this.enrollmentDate = enrollmentDate;
        this.status = status;
        this.finalGradeValue = finalGradeValue;
        this.finalGradeMaxScore = finalGradeMaxScore;
    }


    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCourseId() { return courseId; }
    public void setCourseId(String courseId) { this.courseId = courseId; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public LocalDate getEnrollmentDate() { return enrollmentDate; }
    public void setEnrollmentDate(LocalDate enrollmentDate) { this.enrollmentDate = enrollmentDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public BigDecimal getFinalGradeValue() { return finalGradeValue; }
    public void setFinalGradeValue(BigDecimal finalGradeValue) { this.finalGradeValue = finalGradeValue; }

    public BigDecimal getFinalGradeMaxScore() { return finalGradeMaxScore; }
    public void setFinalGradeMaxScore(BigDecimal finalGradeMaxScore) { this.finalGradeMaxScore = finalGradeMaxScore; }
}