package com.braintrust.education.unit.domain.valueobjects;


import com.braintrust.education.domain.valueobjects.Grade;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.*;

@DisplayName("Grade Value Object Tests")
class GradeTest {

    // ========================================
    // ✅ CREATION TESTS
    // ========================================

    @Test
    @DisplayName("Should create grade with valid values")
    void shouldCreateGradeWithValidValues() {
        // Given
        BigDecimal value = new BigDecimal("85.50");
        BigDecimal maxScore = new BigDecimal("100.00");

        // When
        Grade grade = new Grade(value, maxScore);

        // Then
        assertThat(grade.getValue()).isEqualByComparingTo("85.50");
        assertThat(grade.getMaxScore()).isEqualByComparingTo("100.00");
    }

    @Test
    @DisplayName("Should round value to 2 decimal places")
    void shouldRoundValueTo2DecimalPlaces() {
        // Given
        BigDecimal value = new BigDecimal("85.567");
        BigDecimal maxScore = new BigDecimal("100.00");

        // When
        Grade grade = new Grade(value, maxScore);

        // Then
        assertThat(grade.getValue()).isEqualByComparingTo("85.57");
    }

    // ========================================
    // ✅ VALIDATION TESTS
    // ========================================

    @Test
    @DisplayName("Should throw exception when value is null")
    void shouldThrowExceptionWhenValueIsNull() {
        // When/Then
        assertThatThrownBy(() -> new Grade(null, new BigDecimal("100")))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("cannot be null");
    }

    @Test
    @DisplayName("Should throw exception when maxScore is null")
    void shouldThrowExceptionWhenMaxScoreIsNull() {
        // When/Then
        assertThatThrownBy(() -> new Grade(new BigDecimal("85"), null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("cannot be null");
    }

    @Test
    @DisplayName("Should throw exception when value is negative")
    void shouldThrowExceptionWhenValueIsNegative() {
        // When/Then
        assertThatThrownBy(() -> new Grade(new BigDecimal("-10"), new BigDecimal("100")))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Grade cannot be negative");
    }

    @Test
    @DisplayName("Should throw exception when maxScore is zero or negative")
    void shouldThrowExceptionWhenMaxScoreIsZeroOrNegative() {
        // When/Then
        assertThatThrownBy(() -> new Grade(new BigDecimal("50"), BigDecimal.ZERO))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Max score must be positive");

        assertThatThrownBy(() -> new Grade(new BigDecimal("50"), new BigDecimal("-100")))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Max score must be positive");
    }

    @Test
    @DisplayName("Should throw exception when value exceeds maxScore")
    void shouldThrowExceptionWhenValueExceedsMaxScore() {
        // When/Then
        assertThatThrownBy(() -> new Grade(new BigDecimal("110"), new BigDecimal("100")))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Grade cannot exceed max score");
    }

    // ========================================
    // ✅ PERCENTAGE CALCULATION TESTS
    // ========================================

    @ParameterizedTest
    @CsvSource({
            "85, 100, 85.0000",
            "50, 100, 50.0000",
            "95.5, 100, 95.5000",
            "45, 50, 90.0000",
            "100, 100, 100.0000",
            "0, 100, 0.0000"
    })
    @DisplayName("Should calculate percentage correctly")
    void shouldCalculatePercentageCorrectly(String value, String maxScore, String expectedPercentage) {
        // Given
        Grade grade = new Grade(new BigDecimal(value), new BigDecimal(maxScore));

        // When
        BigDecimal percentage = grade.getPercentage();

        // Then
        assertThat(percentage).isEqualByComparingTo(expectedPercentage);
    }

    // ========================================
    // ✅ PASSING GRADE TESTS
    // ========================================

    @Test
    @DisplayName("Should determine if grade is passing")
    void shouldDetermineIfGradeIsPassing() {
        // Given
        Grade grade = new Grade(new BigDecimal("75"), new BigDecimal("100"));
        BigDecimal passingPercentage = new BigDecimal("70");

        // When
        boolean isPassing = grade.isPassing(passingPercentage);

        // Then
        assertThat(isPassing).isTrue();
    }

    @Test
    @DisplayName("Should determine if grade is not passing")
    void shouldDetermineIfGradeIsNotPassing() {
        // Given
        Grade grade = new Grade(new BigDecimal("65"), new BigDecimal("100"));
        BigDecimal passingPercentage = new BigDecimal("70");

        // When
        boolean isPassing = grade.isPassing(passingPercentage);

        // Then
        assertThat(isPassing).isFalse();
    }

    @Test
    @DisplayName("Should consider exact passing grade as passing")
    void shouldConsiderExactPassingGradeAsPassing() {
        // Given
        Grade grade = new Grade(new BigDecimal("70"), new BigDecimal("100"));
        BigDecimal passingPercentage = new BigDecimal("70");

        // When
        boolean isPassing = grade.isPassing(passingPercentage);

        // Then
        assertThat(isPassing).isTrue();
    }

    // ========================================
    // ✅ EQUALITY TESTS
    // ========================================

    @Test
    @DisplayName("Should be equal when value and maxScore are the same")
    void shouldBeEqualWhenValueAndMaxScoreAreTheSame() {
        // Given
        Grade grade1 = new Grade(new BigDecimal("85.50"), new BigDecimal("100.00"));
        Grade grade2 = new Grade(new BigDecimal("85.50"), new BigDecimal("100.00"));

        // Then
        assertThat(grade1).isEqualTo(grade2);
        assertThat(grade1.hashCode()).isEqualTo(grade2.hashCode());
    }

    @Test
    @DisplayName("Should not be equal when values differ")
    void shouldNotBeEqualWhenValuesDiffer() {
        // Given
        Grade grade1 = new Grade(new BigDecimal("85"), new BigDecimal("100"));
        Grade grade2 = new Grade(new BigDecimal("90"), new BigDecimal("100"));

        // Then
        assertThat(grade1).isNotEqualTo(grade2);
    }
}