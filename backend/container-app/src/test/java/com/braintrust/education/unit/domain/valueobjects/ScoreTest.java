package com.braintrust.education.unit.domain.valueobjects;


import com.braintrust.education.domain.valueobjects.Score;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import static org.assertj.core.api.Assertions.*;

@DisplayName("Score Value Object Tests")
class ScoreTest {

    // ========================================
    // ✅ CREATION TESTS
    // ========================================

    @Test
    @DisplayName("Should create score with valid values")
    void shouldCreateScoreWithValidValues() {
        // When
        Score score = new Score(85, 100);

        // Then
        assertThat(score.getValue()).isEqualTo(85);
        assertThat(score.getMaxPoints()).isEqualTo(100);
    }

    // ========================================
    // ✅ VALIDATION TESTS
    // ========================================

    @Test
    @DisplayName("Should throw exception when value is negative")
    void shouldThrowExceptionWhenValueIsNegative() {
        // When/Then
        assertThatThrownBy(() -> new Score(-10, 100))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Score cannot be negative");
    }

    @Test
    @DisplayName("Should throw exception when maxPoints is zero or negative")
    void shouldThrowExceptionWhenMaxPointsIsZeroOrNegative() {
        // When/Then
        assertThatThrownBy(() -> new Score(50, 0))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Max points must be positive");

        assertThatThrownBy(() -> new Score(50, -100))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Max points must be positive");
    }

    @Test
    @DisplayName("Should throw exception when value exceeds maxPoints")
    void shouldThrowExceptionWhenValueExceedsMaxPoints() {
        // When/Then
        assertThatThrownBy(() -> new Score(110, 100))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Score cannot exceed max points");
    }

    // ========================================
    // ✅ PERCENTAGE CALCULATION TESTS
    // ========================================

    @ParameterizedTest
    @CsvSource({
            "85, 100, 85.0",
            "50, 100, 50.0",
            "100, 100, 100.0",
            "45, 50, 90.0",
            "0, 100, 0.0",
            "25, 25, 100.0"
    })
    @DisplayName("Should calculate percentage correctly")
    void shouldCalculatePercentageCorrectly(int value, int maxPoints, double expectedPercentage) {
        // Given
        Score score = new Score(value, maxPoints);

        // When
        double percentage = score.getPercentage();

        // Then
        assertThat(percentage).isEqualTo(expectedPercentage);
    }

    // ========================================
    // ✅ EQUALITY TESTS
    // ========================================

    @Test
    @DisplayName("Should be equal when value and maxPoints are the same")
    void shouldBeEqualWhenValueAndMaxPointsAreTheSame() {
        // Given
        Score score1 = new Score(85, 100);
        Score score2 = new Score(85, 100);

        // Then
        assertThat(score1).isEqualTo(score2);
        assertThat(score1.hashCode()).isEqualTo(score2.hashCode());
    }

    @Test
    @DisplayName("Should not be equal when values differ")
    void shouldNotBeEqualWhenValuesDiffer() {
        // Given
        Score score1 = new Score(85, 100);
        Score score2 = new Score(90, 100);

        // Then
        assertThat(score1).isNotEqualTo(score2);
    }

    @Test
    @DisplayName("Should not be equal when maxPoints differ")
    void shouldNotBeEqualWhenMaxPointsDiffer() {
        // Given
        Score score1 = new Score(85, 100);
        Score score2 = new Score(85, 200);

        // Then
        assertThat(score1).isNotEqualTo(score2);
    }
}