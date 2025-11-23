package com.braintrust.education.domain.model;

import java.math.BigDecimal;

public class GradeWeightConfig {
    private final BigDecimal assignmentWeight;
    private final BigDecimal quizWeight;
    private final BigDecimal unitWeight;

    public GradeWeightConfig(BigDecimal assignmentWeight, BigDecimal quizWeight, BigDecimal unitWeight) {
        validateWeights(assignmentWeight, quizWeight, unitWeight);
        this.assignmentWeight = assignmentWeight;
        this.quizWeight = quizWeight;
        this.unitWeight = unitWeight;
    }

    private void validateWeights(BigDecimal assignmentWeight, BigDecimal quizWeight, BigDecimal unitWeight) {
        BigDecimal total = assignmentWeight.add(quizWeight).add(unitWeight);
        if (total.compareTo(new BigDecimal("100")) != 0) {
            throw new IllegalArgumentException("Grade weights must sum to 100%");
        }

        if (assignmentWeight.compareTo(BigDecimal.ZERO) < 0 ||
                quizWeight.compareTo(BigDecimal.ZERO) < 0 ||
                unitWeight.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Grade weights cannot be negative");
        }
    }

    // Getters
    public BigDecimal getAssignmentWeight() { return assignmentWeight; }
    public BigDecimal getQuizWeight() { return quizWeight; }
    public BigDecimal getUnitWeight() { return unitWeight; }
}