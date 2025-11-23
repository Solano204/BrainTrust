package com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "unit_grades", indexes = {
        @Index(name = "idx_ugrade_unit", columnList = "unit_id"),
        @Index(name = "idx_ugrade_student", columnList = "student_id"),
        @Index(name = "idx_ugrade_unit_student", columnList = "unit_id,student_id")
})
public class UnitGradeJpaEntity {

    @Id
    @Column(name = "id", length = 50)
    private String id;

    @Column(name = "unit_id", length = 50, nullable = false)
    private String unitId;

    @Column(name = "student_id", length = 50, nullable = false)
    private String studentId;

    // ✅ CALCULATED TOTAL (Auto-calculated sum from all assignments and quizzes)
    @Column(name = "calculated_total_value", precision = 10, scale = 2)
    private BigDecimal calculatedTotalValue;

    // ✅ FINAL GRADE (Assigned by teacher - can override calculated total)
    @Column(name = "final_grade_value", precision = 10, scale = 2)
    private BigDecimal finalGradeValue;

    @Column(name = "final_feedback", columnDefinition = "TEXT")
    private String finalFeedback;

    // ✅ JSON stores individual assignment and quiz grades for recalculation
    @Column(name = "assignment_grades_json", columnDefinition = "TEXT")
    private String assignmentGradesJson;

    @Column(name = "quiz_grades_json", columnDefinition = "TEXT")
    private String quizGradesJson;

    @Column(name = "last_calculated", nullable = false)
    private LocalDateTime lastCalculated;

    public UnitGradeJpaEntity() {}

    public UnitGradeJpaEntity(String id, String unitId, String studentId,
                              BigDecimal calculatedTotalValue,
                              BigDecimal finalGradeValue,
                              String finalFeedback, String assignmentGradesJson,
                              String quizGradesJson, LocalDateTime lastCalculated) {
        this.id = id;
        this.unitId = unitId;
        this.studentId = studentId;
        this.calculatedTotalValue = calculatedTotalValue;
        this.finalGradeValue = finalGradeValue;
        this.finalFeedback = finalFeedback;
        this.assignmentGradesJson = assignmentGradesJson;
        this.quizGradesJson = quizGradesJson;
        this.lastCalculated = lastCalculated;
    }

    // Getters/Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUnitId() { return unitId; }
    public void setUnitId(String unitId) { this.unitId = unitId; }
    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }
    public BigDecimal getCalculatedTotalValue() { return calculatedTotalValue; }
    public void setCalculatedTotalValue(BigDecimal calculatedTotalValue) { this.calculatedTotalValue = calculatedTotalValue; }
    public BigDecimal getFinalGradeValue() { return finalGradeValue; }
    public void setFinalGradeValue(BigDecimal finalGradeValue) { this.finalGradeValue = finalGradeValue; }
    public String getFinalFeedback() { return finalFeedback; }
    public void setFinalFeedback(String finalFeedback) { this.finalFeedback = finalFeedback; }
    public String getAssignmentGradesJson() { return assignmentGradesJson; }
    public void setAssignmentGradesJson(String assignmentGradesJson) { this.assignmentGradesJson = assignmentGradesJson; }
    public String getQuizGradesJson() { return quizGradesJson; }
    public void setQuizGradesJson(String quizGradesJson) { this.quizGradesJson = quizGradesJson; }
    public LocalDateTime getLastCalculated() { return lastCalculated; }
    public void setLastCalculated(LocalDateTime lastCalculated) { this.lastCalculated = lastCalculated; }
}