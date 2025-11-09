package com.braintrust.iadetectition.unit.domain.valueobjects;


import com.braintrust.aidetectition.domain.valueobjects.AIProbability;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;

import java.math.BigDecimal;
import java.math.RoundingMode;

import static org.assertj.core.api.Assertions.*;

/**
 * Unit tests for AIProbability value object.
 * Tests all validation rules and business logic.
 */
@DisplayName("AIProbability Value Object Tests")
class AIProbabilityTest {

    // ========================================
    // ✅ CREATION TESTS
    // ========================================

    @Test
    @DisplayName("Should create AI probability with valid value")
    void shouldCreateAIProbabilityWithValidValue() {
        // Given
        BigDecimal value = new BigDecimal("0.85");

        // When
        AIProbability probability = new AIProbability(value);

        // Then
        assertThat(probability).isNotNull();
        assertThat(probability.getValue()).isEqualByComparingTo("0.8500");
        assertThat(probability.getValue().scale()).isEqualTo(4);
    }

    @Test
    @DisplayName("Should round value to 4 decimal places")
    void shouldRoundValueTo4DecimalPlaces() {
        // Given
        BigDecimal value = new BigDecimal("0.856789123");

        // When
        AIProbability probability = new AIProbability(value);

        // Then
        assertThat(probability.getValue()).isEqualByComparingTo("0.8568");
    }

    @Test
    @DisplayName("Should round up correctly")
    void shouldRoundUpCorrectly() {
        // Given
        BigDecimal value = new BigDecimal("0.85675");

        // When
        AIProbability probability = new AIProbability(value);

        // Then
        assertThat(probability.getValue()).isEqualByComparingTo("0.8568");
    }

    @Test
    @DisplayName("Should round down correctly")
    void shouldRoundDownCorrectly() {
        // Given
        BigDecimal value = new BigDecimal("0.85674");

        // When
        AIProbability probability = new AIProbability(value);

        // Then
        assertThat(probability.getValue()).isEqualByComparingTo("0.8567");
    }

    // ========================================
    // ✅ VALIDATION TESTS
    // ========================================

    @Test
    @DisplayName("Should throw exception when value is null")
    void shouldThrowExceptionWhenValueIsNull() {
        // When/Then
        assertThatThrownBy(() -> new AIProbability(null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("AI probability cannot be null");
    }

    @Test
    @DisplayName("Should throw exception when value is negative")
    void shouldThrowExceptionWhenValueIsNegative() {
        // Given
        BigDecimal negativeValue = new BigDecimal("-0.1");

        // When/Then
        assertThatThrownBy(() -> new AIProbability(negativeValue))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("AI probability must be between 0 and 1");
    }

    @Test
    @DisplayName("Should throw exception when value exceeds 1")
    void shouldThrowExceptionWhenValueExceedsOne() {
        // Given
        BigDecimal tooLarge = new BigDecimal("1.1");

        // When/Then
        assertThatThrownBy(() -> new AIProbability(tooLarge))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("AI probability must be between 0 and 1");
    }

    @Test
    @DisplayName("Should accept value at minimum boundary")
    void shouldAcceptValueAtMinimumBoundary() {
        // When
        AIProbability probability = new AIProbability(BigDecimal.ZERO);

        // Then
        assertThat(probability.getValue()).isEqualByComparingTo(BigDecimal.ZERO);
    }

    @Test
    @DisplayName("Should accept value at maximum boundary")
    void shouldAcceptValueAtMaximumBoundary() {
        // When
        AIProbability probability = new AIProbability(BigDecimal.ONE);

        // Then
        assertThat(probability.getValue()).isEqualByComparingTo(BigDecimal.ONE);
    }

    // ========================================
    // ✅ PERCENTAGE CALCULATION TESTS
    // ========================================

    @ParameterizedTest
    @CsvSource({
            "0.00, 0.00",
            "0.25, 25.00",
            "0.50, 50.00",
            "0.75, 75.00",
            "0.85, 85.00",
            "0.9567, 95.67",
            "1.00, 100.00"
    })
    @DisplayName("Should calculate percentage correctly")
    void shouldCalculatePercentageCorrectly(String probability, String expectedPercentage) {
        // Given
        AIProbability aiProbability = new AIProbability(new BigDecimal(probability));

        // When
        BigDecimal percentage = aiProbability.getPercentage();

        // Then
        assertThat(percentage).isEqualByComparingTo(expectedPercentage);
    }

    @Test
    @DisplayName("Should calculate percentage for zero probability")
    void shouldCalculatePercentageForZeroProbability() {
        // Given
        AIProbability probability = new AIProbability(BigDecimal.ZERO);

        // When
        BigDecimal percentage = probability.getPercentage();

        // Then
        assertThat(percentage).isEqualByComparingTo(BigDecimal.ZERO);
    }

    @Test
    @DisplayName("Should calculate percentage for maximum probability")
    void shouldCalculatePercentageForMaximumProbability() {
        // Given
        AIProbability probability = new AIProbability(BigDecimal.ONE);

        // When
        BigDecimal percentage = probability.getPercentage();

        // Then
        assertThat(percentage).isEqualByComparingTo("100");
    }

    // ========================================
    // ✅ LIKELY AI TESTS (>70% threshold)
    // ========================================

    @ParameterizedTest
    @ValueSource(strings = {"0.71", "0.75", "0.85", "0.95", "1.0"})
    @DisplayName("Should identify as likely AI when above 70% threshold")
    void shouldIdentifyAsLikelyAIWhenAboveThreshold(String value) {
        // Given
        AIProbability probability = new AIProbability(new BigDecimal(value));

        // Then
        assertThat(probability.isLikelyAI()).isTrue();
    }

    @ParameterizedTest
    @ValueSource(strings = {"0.0", "0.3", "0.5", "0.69", "0.70"})
    @DisplayName("Should not identify as likely AI when at or below 70% threshold")
    void shouldNotIdentifyAsLikelyAIWhenAtOrBelowThreshold(String value) {
        // Given
        AIProbability probability = new AIProbability(new BigDecimal(value));

        // Then
        assertThat(probability.isLikelyAI()).isFalse();
    }

    @Test
    @DisplayName("Should identify maximum probability as likely AI")
    void shouldIdentifyMaximumProbabilityAsLikelyAI() {
        // Given
        AIProbability probability = new AIProbability(BigDecimal.ONE);

        // Then
        assertThat(probability.isLikelyAI()).isTrue();
    }

    // ========================================
    // ✅ UNCERTAIN TESTS (30%-70% range)
    // ========================================

    @ParameterizedTest
    @CsvSource({
            "0.31, true",
            "0.40, true",
            "0.50, true",
            "0.60, true",
            "0.70, true",   // At upper boundary
            "0.30, false",  // At lower boundary
            "0.71, false",  // Above upper boundary
            "0.29, false",  // Below lower boundary
            "0.0, false",
            "1.0, false"
    })
    @DisplayName("Should identify uncertain range correctly")
    void shouldIdentifyUncertainRangeCorrectly(String value, boolean expectedUncertain) {
        // Given
        AIProbability probability = new AIProbability(new BigDecimal(value));

        // Then
        assertThat(probability.isUncertain()).isEqualTo(expectedUncertain);
    }

    // ========================================
    // ✅ LIKELY HUMAN TESTS (≤30% threshold)
    // ========================================

    @ParameterizedTest
    @ValueSource(strings = {"0.0", "0.10", "0.20", "0.29", "0.30"})
    @DisplayName("Should identify as likely human when at or below 30% threshold")
    void shouldIdentifyAsLikelyHumanWhenAtOrBelowThreshold(String value) {
        // Given
        AIProbability probability = new AIProbability(new BigDecimal(value));

        // Then
        assertThat(probability.isLikelyHuman()).isTrue();
    }

    @ParameterizedTest
    @ValueSource(strings = {"0.31", "0.50", "0.75", "1.0"})
    @DisplayName("Should not identify as likely human when above 30% threshold")
    void shouldNotIdentifyAsLikelyHumanWhenAboveThreshold(String value) {
        // Given
        AIProbability probability = new AIProbability(new BigDecimal(value));

        // Then
        assertThat(probability.isLikelyHuman()).isFalse();
    }

    @Test
    @DisplayName("Should identify zero probability as likely human")
    void shouldIdentifyZeroProbabilityAsLikelyHuman() {
        // Given
        AIProbability probability = new AIProbability(BigDecimal.ZERO);

        // Then
        assertThat(probability.isLikelyHuman()).isTrue();
    }

    // ========================================
    // ✅ CLASSIFICATION BOUNDARY TESTS
    // ========================================

    @Test
    @DisplayName("Should classify 0.30 as likely human (at boundary)")
    void shouldClassify030AsLikelyHuman() {
        // Given
        AIProbability probability = new AIProbability(new BigDecimal("0.30"));

        // Then
        assertThat(probability.isLikelyHuman()).isTrue();
        assertThat(probability.isUncertain()).isFalse();
        assertThat(probability.isLikelyAI()).isFalse();
    }

    @Test
    @DisplayName("Should classify 0.31 as uncertain (just above lower boundary)")
    void shouldClassify031AsUncertain() {
        // Given
        AIProbability probability = new AIProbability(new BigDecimal("0.31"));

        // Then
        assertThat(probability.isLikelyHuman()).isFalse();
        assertThat(probability.isUncertain()).isTrue();
        assertThat(probability.isLikelyAI()).isFalse();
    }

    @Test
    @DisplayName("Should classify 0.70 as uncertain (at upper boundary)")
    void shouldClassify070AsUncertain() {
        // Given
        AIProbability probability = new AIProbability(new BigDecimal("0.70"));

        // Then
        assertThat(probability.isLikelyHuman()).isFalse();
        assertThat(probability.isUncertain()).isTrue();
        assertThat(probability.isLikelyAI()).isFalse();
    }

    @Test
    @DisplayName("Should classify 0.71 as likely AI (just above upper boundary)")
    void shouldClassify071AsLikelyAI() {
        // Given
        AIProbability probability = new AIProbability(new BigDecimal("0.71"));

        // Then
        assertThat(probability.isLikelyHuman()).isFalse();
        assertThat(probability.isUncertain()).isFalse();
        assertThat(probability.isLikelyAI()).isTrue();
    }

    // ========================================
    // ✅ MUTUAL EXCLUSIVITY TESTS
    // ========================================

    @Test
    @DisplayName("Should never be both likely AI and likely human")
    void shouldNeverBeBothLikelyAIAndLikelyHuman() {
        // Test all possible values
        for (int i = 0; i <= 100; i++) {
            BigDecimal value = new BigDecimal(i).divide(new BigDecimal(100), 2, RoundingMode.HALF_UP);
            AIProbability probability = new AIProbability(value);

            boolean isAI = probability.isLikelyAI();
            boolean isHuman = probability.isLikelyHuman();

            assertThat(isAI && isHuman)
                    .as("Value %s should not be both AI and Human", value)
                    .isFalse();
        }
    }

    @Test
    @DisplayName("Should always fall into exactly one category")
    void shouldAlwaysFallIntoExactlyOneCategory() {
        // Test all possible values
        for (int i = 0; i <= 100; i++) {
            BigDecimal value = new BigDecimal(i).divide(new BigDecimal(100), 2, RoundingMode.HALF_UP);
            AIProbability probability = new AIProbability(value);

            int categoryCount = 0;
            if (probability.isLikelyHuman()) categoryCount++;
            if (probability.isUncertain()) categoryCount++;
            if (probability.isLikelyAI()) categoryCount++;

            assertThat(categoryCount)
                    .as("Value %s should fall into exactly one category", value)
                    .isEqualTo(1);
        }
    }

    // ========================================
    // ✅ EQUALITY TESTS
    // ========================================

    @Test
    @DisplayName("Should be equal when values are the same")
    void shouldBeEqualWhenValuesAreTheSame() {
        // Given
        AIProbability prob1 = new AIProbability(new BigDecimal("0.85"));
        AIProbability prob2 = new AIProbability(new BigDecimal("0.85"));

        // Then
        assertThat(prob1).isEqualTo(prob2);
        assertThat(prob1.hashCode()).isEqualTo(prob2.hashCode());
    }

    @Test
    @DisplayName("Should not be equal when values differ")
    void shouldNotBeEqualWhenValuesDiffer() {
        // Given
        AIProbability prob1 = new AIProbability(new BigDecimal("0.85"));
        AIProbability prob2 = new AIProbability(new BigDecimal("0.75"));

        // Then
        assertThat(prob1).isNotEqualTo(prob2);
    }

    @Test
    @DisplayName("Should be equal after rounding to same value")
    void shouldBeEqualAfterRoundingToSameValue() {
        // Given
        AIProbability prob1 = new AIProbability(new BigDecimal("0.85001"));
        AIProbability prob2 = new AIProbability(new BigDecimal("0.85004"));

        // Both round to 0.8500
        // Then
        assertThat(prob1).isEqualTo(prob2);
    }

    @Test
    @DisplayName("Should not be equal to null")
    void shouldNotBeEqualToNull() {
        // Given
        AIProbability probability = new AIProbability(new BigDecimal("0.85"));

        // Then
        assertThat(probability).isNotEqualTo(null);
    }

    // ========================================
    // ✅ PRECISION TESTS
    // ========================================

    @Test
    @DisplayName("Should maintain 4 decimal places precision")
    void shouldMaintain4DecimalPlacesPrecision() {
        // Given
        AIProbability probability = new AIProbability(new BigDecimal("0.8567"));

        // Then
        assertThat(probability.getValue().scale()).isEqualTo(4);
        assertThat(probability.getValue().toString()).isEqualTo("0.8567");
    }

    @Test
    @DisplayName("Should add trailing zeros to maintain scale")
    void shouldAddTrailingZerosToMaintainScale() {
        // Given
        AIProbability probability = new AIProbability(new BigDecimal("0.5"));

        // Then
        assertThat(probability.getValue().scale()).isEqualTo(4);
        assertThat(probability.getValue()).isEqualByComparingTo("0.5000");
    }

    // ========================================
    // ✅ EDGE CASE TESTS
    // ========================================

    @Test
    @DisplayName("Should handle very small positive value")
    void shouldHandleVerySmallPositiveValue() {
        // Given
        BigDecimal verySmall = new BigDecimal("0.00001");

        // When
        AIProbability probability = new AIProbability(verySmall);

        // Then
        assertThat(probability.getValue()).isEqualByComparingTo("0.0000");
        assertThat(probability.isLikelyHuman()).isTrue();
    }

    @Test
    @DisplayName("Should handle value very close to 1")
    void shouldHandleValueVeryCloseTo1() {
        // Given
        BigDecimal veryClose = new BigDecimal("0.99999");

        // When
        AIProbability probability = new AIProbability(veryClose);

        // Then
        assertThat(probability.getValue()).isEqualByComparingTo("1.0000");
        assertThat(probability.isLikelyAI()).isTrue();
    }

    @Test
    @DisplayName("Should handle value exactly at threshold boundaries")
    void shouldHandleValueExactlyAtThresholdBoundaries() {
        // Test lower boundary
        AIProbability lower = new AIProbability(new BigDecimal("0.3000"));
        assertThat(lower.isLikelyHuman()).isTrue();

        // Test upper boundary
        AIProbability upper = new AIProbability(new BigDecimal("0.7000"));
        assertThat(upper.isUncertain()).isTrue();
    }

    // ========================================
    // ✅ STRING REPRESENTATION TESTS
    // ========================================

    @Test
    @DisplayName("Should have meaningful toString representation")
    void shouldHaveMeaningfulToStringRepresentation() {
        // Given
        AIProbability probability = new AIProbability(new BigDecimal("0.85"));

        // When
        String toString = probability.toString();

        // Then
        assertThat(toString).isNotNull();
        assertThat(toString).isNotEmpty();
    }
}