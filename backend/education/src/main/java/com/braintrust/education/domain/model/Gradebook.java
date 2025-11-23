package com.braintrust.education.domain.model;

import com.braintrust.education.domain.valueobjects.*;
import com.braintrust.identity.domain.valueobjects.UserId;
import com.braintrust.shared.domain.AggregateRoot;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

public class Gradebook extends AggregateRoot<GradebookId> {
    private CourseId courseId;
    private UserId studentId;

    // ✅ Calculated total sum from all units
    private BigDecimal calculatedTotal;

    // ✅ Final grade assigned by teacher
    private BigDecimal finalGrade;
    private String finalFeedback;

    // ✅ NEW: Store unit grades for recalculation
    private final Map<UnitId, Grade> unitGrades;

    private LocalDateTime lastCalculated;

    private Gradebook(GradebookId id, CourseId courseId, UserId studentId) {
        this.id = id;
        this.courseId = courseId;
        this.studentId = studentId;
        this.unitGrades = new HashMap<>();
        this.lastCalculated = LocalDateTime.now();
    }

    public static Gradebook create(CourseId courseId, UserId studentId) {
        GradebookId id = GradebookId.generate();
        return new Gradebook(id, courseId, studentId);
    }

    public static Gradebook reconstitute(GradebookId id, CourseId courseId, UserId studentId,
                                         BigDecimal calculatedTotal, BigDecimal finalGrade,
                                         String finalFeedback, Map<UnitId, Grade> unitGrades,
                                         LocalDateTime lastCalculated) {
        Gradebook gradebook = new Gradebook(id, courseId, studentId);
        gradebook.calculatedTotal = calculatedTotal;
        gradebook.finalGrade = finalGrade;
        gradebook.finalFeedback = finalFeedback;
        if (unitGrades != null) gradebook.unitGrades.putAll(unitGrades);
        gradebook.lastCalculated = lastCalculated;
        return gradebook;
    }

    // ✅ NEW: Update unit grade method
    public void updateUnitGrade(UnitId unitId, Grade unitGrade) {
        unitGrades.put(unitId, unitGrade);
        recalculateTotalFromUnits();
    }

    // ✅ NEW: Recalculate total from all unit grades
    private void recalculateTotalFromUnits() {
        if (unitGrades.isEmpty()) {
            this.calculatedTotal = null;
            return;
        }

        BigDecimal totalEarned = unitGrades.values().stream()
                .map(Grade::getValue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalMaxScore = unitGrades.values().stream()
                .map(Grade::getMaxScore)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (totalMaxScore.compareTo(BigDecimal.ZERO) > 0) {
            this.calculatedTotal = totalEarned;
        } else {
            this.calculatedTotal = null;
        }

        this.lastCalculated = LocalDateTime.now();
    }

    // 🎯 Update calculated total sum from unit grades (external method)
    public void updateCalculatedTotal(List<UnitGrade> unitGrades) {
        if (unitGrades.isEmpty()) {
            this.calculatedTotal = null;
            return;
        }

        BigDecimal totalSum = BigDecimal.ZERO;

        for (UnitGrade unitGrade : unitGrades) {
            BigDecimal unitGradeValue = unitGrade.getDisplayGradeValue();
            if (unitGradeValue != null) {
                totalSum = totalSum.add(unitGradeValue);
            }
        }

        this.calculatedTotal = totalSum.compareTo(BigDecimal.ZERO) > 0 ? totalSum : null;
        this.lastCalculated = LocalDateTime.now();
    }

    // 🎯 Teacher assigns final grade (can override calculated total)
    public void assignFinalGrade(BigDecimal finalGrade, String feedback) {
        this.finalGrade = finalGrade;
        this.finalFeedback = feedback;
        this.lastCalculated = LocalDateTime.now();
    }

    // ✅ Get display grade value (final if assigned, otherwise calculated)
    public BigDecimal getDisplayGradeValue() {
        return finalGrade != null ? finalGrade : calculatedTotal;
    }

    // ✅ Get unit grades for DTO mapping
    public Map<UnitId, Grade> getUnitGrades() {
        return Map.copyOf(unitGrades);
    }

    // ✅ Get total units count
    public int getTotalUnits() {
        return unitGrades.size();
    }

    // Getters
    public CourseId getCourseId() { return courseId; }
    public UserId getStudentId() { return studentId; }
    public BigDecimal getCalculatedTotal() { return calculatedTotal; }
    public BigDecimal getFinalGrade() { return finalGrade; }
    public String getFinalFeedback() { return finalFeedback; }
    public LocalDateTime getLastCalculated() { return lastCalculated; }
}