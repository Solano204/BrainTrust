package com.braintrust.education.domain.model;

import com.braintrust.education.domain.valueobjects.*;
import com.braintrust.identity.domain.valueobjects.UserId;
import com.braintrust.shared.domain.Entity;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
public class UnitGrade extends Entity<UnitGradeId> {
    private UnitId unitId;
    private UserId studentId;

    // ✅ Store the RAW SUM of grades (no percentage conversion)
    private BigDecimal calculatedTotal;

    // ✅ Final grade assigned by teacher
    private BigDecimal finalGrade;
    private String finalFeedback;

    private final Map<AssignmentId, Grade> assignmentGrades;
    private final Map<QuizId, Grade> quizGrades;
    private LocalDateTime lastCalculated;

    private UnitGrade(UnitGradeId id, UnitId unitId, UserId studentId) {
        this.id = id;
        this.unitId = unitId;
        this.studentId = studentId;
        this.assignmentGrades = new HashMap<>();
        this.quizGrades = new HashMap<>();
        this.lastCalculated = LocalDateTime.now();
    }

    public static UnitGrade create(UnitId unitId, UserId studentId) {
        UnitGradeId id = UnitGradeId.generate();
        return new UnitGrade(id, unitId, studentId);
    }

    public static UnitGrade reconstitute(UnitGradeId id, UnitId unitId, UserId studentId,
                                         BigDecimal calculatedTotal, BigDecimal finalGrade, String finalFeedback,
                                         Map<AssignmentId, Grade> assignmentGrades,
                                         Map<QuizId, Grade> quizGrades, LocalDateTime lastCalculated) {
        UnitGrade unitGrade = new UnitGrade(id, unitId, studentId);
        unitGrade.calculatedTotal = calculatedTotal;
        unitGrade.finalGrade = finalGrade;
        unitGrade.finalFeedback = finalFeedback;
        if (assignmentGrades != null) unitGrade.assignmentGrades.putAll(assignmentGrades);
        if (quizGrades != null) unitGrade.quizGrades.putAll(quizGrades);
        unitGrade.lastCalculated = lastCalculated;
        return unitGrade;
    }

    // ✅ NEW: Check if assignment grade already exists
    public boolean hasAssignmentGrade(AssignmentId assignmentId) {
        return assignmentGrades.containsKey(assignmentId);
    }

    // ✅ NEW: Check if quiz grade already exists
    public boolean hasQuizGrade(QuizId quizId) {
        return quizGrades.containsKey(quizId);
    }

    // ✅ UPDATED: Add assignment grade (store the actual grade value)
    public void addAssignmentGrade(AssignmentId assignmentId, Grade grade) {
        if (assignmentId == null || grade == null) {
            throw new IllegalArgumentException("Assignment ID and grade cannot be null");
        }

        // ✅ Check if this assignment already exists
        if (assignmentGrades.containsKey(assignmentId)) {
            // Remove the old grade first
            assignmentGrades.remove(assignmentId);
        }

        assignmentGrades.put(assignmentId, grade);
        recalculateTotal();
    }

    // ✅ UPDATED: Add quiz grade (store the actual grade value)
    public void addQuizGrade(QuizId quizId, Grade grade) {
        if (quizId == null || grade == null) {
            throw new IllegalArgumentException("Quiz ID and grade cannot be null");
        }

        // ✅ Check if this quiz already exists
        if (quizGrades.containsKey(quizId)) {
            // Remove the old grade first
            quizGrades.remove(quizId);
        }

        quizGrades.put(quizId, grade);
        recalculateTotal();
    }

    // ✅ NEW: Removal methods
    public void removeAssignmentGrade(AssignmentId assignmentId) {
        if (this.assignmentGrades.containsKey(assignmentId)) {
            Grade removedGrade = this.assignmentGrades.remove(assignmentId);
            recalculateTotal();
        }
    }

    public void removeQuizGrade(QuizId quizId) {
        if (this.quizGrades.containsKey(quizId)) {
            Grade removedGrade = this.quizGrades.remove(quizId);
            recalculateTotal();
        }
    }

    // ✅ SIMPLIFIED: Recalculation - just SUM the earned points directly
    private void recalculateTotal() {
        if (assignmentGrades.isEmpty() && quizGrades.isEmpty()) {
            this.calculatedTotal = BigDecimal.ZERO; // Start from 0 instead of null
            this.lastCalculated = LocalDateTime.now();
            return;
        }

        BigDecimal totalEarned = BigDecimal.ZERO;

        // Sum assignment earned points directly
        for (Grade grade : assignmentGrades.values()) {
            totalEarned = totalEarned.add(grade.getValue());
        }

        // Sum quiz earned points directly
        for (Grade grade : quizGrades.values()) {
            totalEarned = totalEarned.add(grade.getValue());
        }

        // ✅ Store the RAW SUM without percentage conversion
        this.calculatedTotal = totalEarned;
        this.lastCalculated = LocalDateTime.now();
    }

    // 🎯 Teacher assigns final grade for unit
    public void assignFinalGrade(BigDecimal finalGrade, String feedback) {
        this.finalGrade = finalGrade;
        this.finalFeedback = feedback;
        this.lastCalculated = LocalDateTime.now();
    }

    // ✅ NEW: Clear quiz grades
    public void clearQuizGrades() {
        this.quizGrades.clear();
        this.calculatedTotal = BigDecimal.ZERO;
        this.lastCalculated = LocalDateTime.now();
    }

    // ✅ NEW: Clear assignment grades
    public void clearAssignmentGrades() {
        this.assignmentGrades.clear();
        this.calculatedTotal = BigDecimal.ZERO;
        this.lastCalculated = LocalDateTime.now();
    }

    // ✅ NEW: Clear all grades (both quizzes and assignments)
    public void clearAllGrades() {
        this.quizGrades.clear();
        this.assignmentGrades.clear();
        this.calculatedTotal = BigDecimal.ZERO;
        this.lastCalculated = LocalDateTime.now();
    }

    // ✅ Get display grade value (final if assigned, otherwise calculated)
    public BigDecimal getDisplayGradeValue() {
        return finalGrade != null ? finalGrade : calculatedTotal;
    }

    // Getters
    public UnitId getUnitId() { return unitId; }
    public UserId getStudentId() { return studentId; }
    public BigDecimal getCalculatedTotal() { return calculatedTotal; }
    public BigDecimal getFinalGrade() { return finalGrade; }
    public String getFinalFeedback() { return finalFeedback; }
    public Map<AssignmentId, Grade> getAssignmentGrades() { return Map.copyOf(assignmentGrades); }
    public Map<QuizId, Grade> getQuizGrades() { return Map.copyOf(quizGrades); }
    public LocalDateTime getLastCalculated() { return lastCalculated; }

    public void setFinalFeedback(String finalFeedback) {
        this.finalFeedback = finalFeedback;
    }
}