package com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "gradebooks", indexes = {
        @Index(name = "idx_gradebook_course", columnList = "course_id"),
        @Index(name = "idx_gradebook_student", columnList = "student_id"),
        @Index(name = "idx_gradebook_course_student", columnList = "course_id,student_id", unique = true)
})
public class GradebookJpaEntity {

    @Id
    @Column(name = "id", length = 50)
    private String id;

    @Column(name = "course_id", length = 50, nullable = false)
    private String courseId;

    @Column(name = "student_id", length = 50, nullable = false)
    private String studentId;

    // ✅ CALCULATED TOTAL (Auto-calculated sum from all units)
    @Column(name = "calculated_total_value", precision = 10, scale = 2)
    private BigDecimal calculatedTotalValue;

    // ✅ FINAL GRADE (Assigned by teacher - can override calculated total)
    @Column(name = "final_grade_value", precision = 10, scale = 2)
    private BigDecimal finalGradeValue;

    @Column(name = "final_feedback", columnDefinition = "TEXT")
    private String finalFeedback;

    @Column(name = "last_calculated", nullable = false)
    private LocalDateTime lastCalculated;

    public GradebookJpaEntity() {}

    public GradebookJpaEntity(String id, String courseId, String studentId,
                              BigDecimal calculatedTotalValue,
                              BigDecimal finalGradeValue,
                              String finalFeedback, LocalDateTime lastCalculated) {
        this.id = id;
        this.courseId = courseId;
        this.studentId = studentId;
        this.calculatedTotalValue = calculatedTotalValue;
        this.finalGradeValue = finalGradeValue;
        this.finalFeedback = finalFeedback;
        this.lastCalculated = lastCalculated;
    }

    // Getters/Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getCourseId() { return courseId; }
    public void setCourseId(String courseId) { this.courseId = courseId; }
    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }
    public BigDecimal getCalculatedTotalValue() { return calculatedTotalValue; }
    public void setCalculatedTotalValue(BigDecimal calculatedTotalValue) { this.calculatedTotalValue = calculatedTotalValue; }
    public BigDecimal getFinalGradeValue() { return finalGradeValue; }
    public void setFinalGradeValue(BigDecimal finalGradeValue) { this.finalGradeValue = finalGradeValue; }
    public String getFinalFeedback() { return finalFeedback; }
    public void setFinalFeedback(String finalFeedback) { this.finalFeedback = finalFeedback; }
    public LocalDateTime getLastCalculated() { return lastCalculated; }
    public void setLastCalculated(LocalDateTime lastCalculated) { this.lastCalculated = lastCalculated; }
}