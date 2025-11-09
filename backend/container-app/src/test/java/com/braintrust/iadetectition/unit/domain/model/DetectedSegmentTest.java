package com.braintrust.iadetectition.unit.domain.model;


import com.braintrust.aidetectition.domain.model.DetectedSegment;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.*;

/**
 * Unit tests for DetectedSegment value object.
 * Tests all validation and business logic.
 */
@DisplayName("DetectedSegment Value Object Tests")
class DetectedSegmentTest {

    private static final String VALID_TEXT = "This is a detected AI-generated segment";
    private static final int VALID_START_INDEX = 0;
    private static final int VALID_END_INDEX = 40;
    private static final BigDecimal VALID_AI_PROBABILITY = new BigDecimal("0.85");
    private static final String VALID_REASON = "High confidence AI pattern detected";

    // ========================================
    // ✅ CREATION TESTS
    // ========================================

    @Test
    @DisplayName("Should create detected segment with valid data")
    void shouldCreateDetectedSegmentWithValidData() {
        // When
        DetectedSegment segment = new DetectedSegment(
                VALID_TEXT,
                VALID_START_INDEX,
                VALID_END_INDEX,
                VALID_AI_PROBABILITY,
                VALID_REASON
        );

        // Then
        assertThat(segment).isNotNull();
        assertThat(segment.getText()).isEqualTo(VALID_TEXT);
        assertThat(segment.getStartIndex()).isEqualTo(VALID_START_INDEX);
        assertThat(segment.getEndIndex()).isEqualTo(VALID_END_INDEX);
        assertThat(segment.getAiProbability()).isEqualByComparingTo(VALID_AI_PROBABILITY);
        assertThat(segment.getReason()).isEqualTo(VALID_REASON);
    }

    @Test
    @DisplayName("Should create segment with null reason")
    void shouldCreateSegmentWithNullReason() {
        // When
        DetectedSegment segment = new DetectedSegment(
                VALID_TEXT,
                VALID_START_INDEX,
                VALID_END_INDEX,
                VALID_AI_PROBABILITY,
                null
        );

        // Then
        assertThat(segment.getReason()).isNull();
    }

    // ========================================
    // ✅ HIGH CONFIDENCE TESTS
    // ========================================

    @ParameterizedTest
    @CsvSource({
            "0.70, true",   // Exactly at threshold
            "0.75, true",   // Above threshold
            "0.85, true",   // Well above threshold
            "0.99, true",   // Maximum high confidence
            "0.69, false",  // Just below threshold
            "0.50, false",  // Medium confidence
            "0.30, false"   // Low confidence
    })
    @DisplayName("Should determine high confidence correctly")
    void shouldDetermineHighConfidenceCorrectly(String probability, boolean expectedHighConfidence) {
        // Given
        DetectedSegment segment = new DetectedSegment(
                VALID_TEXT,
                VALID_START_INDEX,
                VALID_END_INDEX,
                new BigDecimal(probability),
                VALID_REASON
        );

        // Then
        assertThat(segment.isHighConfidence()).isEqualTo(expectedHighConfidence);
    }

    @Test
    @DisplayName("Should identify maximum confidence as high confidence")
    void shouldIdentifyMaximumConfidenceAsHighConfidence() {
        // Given
        DetectedSegment segment = new DetectedSegment(
                VALID_TEXT,
                VALID_START_INDEX,
                VALID_END_INDEX,
                new BigDecimal("1.0"),
                VALID_REASON
        );

        // Then
        assertThat(segment.isHighConfidence()).isTrue();
    }

    @Test
    @DisplayName("Should identify minimum confidence as not high confidence")
    void shouldIdentifyMinimumConfidenceAsNotHighConfidence() {
        // Given
        DetectedSegment segment = new DetectedSegment(
                VALID_TEXT,
                VALID_START_INDEX,
                VALID_END_INDEX,
                BigDecimal.ZERO,
                VALID_REASON
        );

        // Then
        assertThat(segment.isHighConfidence()).isFalse();
    }

    // ========================================
    // ✅ INDEX VALIDATION TESTS
    // ========================================

    @Test
    @DisplayName("Should create segment with zero start index")
    void shouldCreateSegmentWithZeroStartIndex() {
        // When
        DetectedSegment segment = new DetectedSegment(
                VALID_TEXT,
                0,
                10,
                VALID_AI_PROBABILITY,
                VALID_REASON
        );

        // Then
        assertThat(segment.getStartIndex()).isEqualTo(0);
    }

    @Test
    @DisplayName("Should create segment with negative indices when needed")
    void shouldCreateSegmentWithNegativeIndicesWhenNeeded() {
        // When - This might be needed for special cases like "not found"
        DetectedSegment segment = new DetectedSegment(
                VALID_TEXT,
                -1,
                -1,
                VALID_AI_PROBABILITY,
                VALID_REASON
        );

        // Then
        assertThat(segment.getStartIndex()).isEqualTo(-1);
        assertThat(segment.getEndIndex()).isEqualTo(-1);
    }

    @Test
    @DisplayName("Should handle segment where end index equals start index")
    void shouldHandleSegmentWhereEndIndexEqualsStartIndex() {
        // When
        DetectedSegment segment = new DetectedSegment(
                "",
                5,
                5,
                VALID_AI_PROBABILITY,
                "Empty segment"
        );

        // Then
        assertThat(segment.getStartIndex()).isEqualTo(5);
        assertThat(segment.getEndIndex()).isEqualTo(5);
    }

    // ========================================
    // ✅ PROBABILITY BOUNDARY TESTS
    // ========================================

    @Test
    @DisplayName("Should accept probability at maximum boundary")
    void shouldAcceptProbabilityAtMaximumBoundary() {
        // When
        DetectedSegment segment = new DetectedSegment(
                VALID_TEXT,
                VALID_START_INDEX,
                VALID_END_INDEX,
                new BigDecimal("1.0"),
                VALID_REASON
        );

        // Then
        assertThat(segment.getAiProbability()).isEqualByComparingTo("1.0");
    }

    @Test
    @DisplayName("Should accept probability at minimum boundary")
    void shouldAcceptProbabilityAtMinimumBoundary() {
        // When
        DetectedSegment segment = new DetectedSegment(
                VALID_TEXT,
                VALID_START_INDEX,
                VALID_END_INDEX,
                BigDecimal.ZERO,
                VALID_REASON
        );

        // Then
        assertThat(segment.getAiProbability()).isEqualByComparingTo(BigDecimal.ZERO);
    }

    @Test
    @DisplayName("Should handle high precision probability values")
    void shouldHandleHighPrecisionProbabilityValues() {
        // Given
        BigDecimal highPrecision = new BigDecimal("0.8567891234");

        // When
        DetectedSegment segment = new DetectedSegment(
                VALID_TEXT,
                VALID_START_INDEX,
                VALID_END_INDEX,
                highPrecision,
                VALID_REASON
        );

        // Then
        assertThat(segment.getAiProbability()).isEqualByComparingTo(highPrecision);
    }

    // ========================================
    // ✅ TEXT CONTENT TESTS
    // ========================================

    @Test
    @DisplayName("Should handle empty text")
    void shouldHandleEmptyText() {
        // When
        DetectedSegment segment = new DetectedSegment(
                "",
                0,
                0,
                VALID_AI_PROBABILITY,
                VALID_REASON
        );

        // Then
        assertThat(segment.getText()).isEmpty();
    }

    @Test
    @DisplayName("Should handle null text")
    void shouldHandleNullText() {
        // When
        DetectedSegment segment = new DetectedSegment(
                null,
                VALID_START_INDEX,
                VALID_END_INDEX,
                VALID_AI_PROBABILITY,
                VALID_REASON
        );

        // Then
        assertThat(segment.getText()).isNull();
    }

    @Test
    @DisplayName("Should preserve text with special characters")
    void shouldPreserveTextWithSpecialCharacters() {
        // Given
        String specialText = "Text with émojis 😀, symbols ©®™, and ñoñó";

        // When
        DetectedSegment segment = new DetectedSegment(
                specialText,
                VALID_START_INDEX,
                VALID_END_INDEX,
                VALID_AI_PROBABILITY,
                VALID_REASON
        );

        // Then
        assertThat(segment.getText()).isEqualTo(specialText);
    }

    @Test
    @DisplayName("Should preserve multiline text")
    void shouldPreserveMultilineText() {
        // Given
        String multilineText = "First line\nSecond line\nThird line";

        // When
        DetectedSegment segment = new DetectedSegment(
                multilineText,
                VALID_START_INDEX,
                VALID_END_INDEX,
                VALID_AI_PROBABILITY,
                VALID_REASON
        );

        // Then
        assertThat(segment.getText()).isEqualTo(multilineText);
        assertThat(segment.getText()).contains("\n");
    }

    // ========================================
    // ✅ REASON TESTS
    // ========================================

    @Test
    @DisplayName("Should handle empty reason")
    void shouldHandleEmptyReason() {
        // When
        DetectedSegment segment = new DetectedSegment(
                VALID_TEXT,
                VALID_START_INDEX,
                VALID_END_INDEX,
                VALID_AI_PROBABILITY,
                ""
        );

        // Then
        assertThat(segment.getReason()).isEmpty();
    }

    @Test
    @DisplayName("Should preserve detailed reason")
    void shouldPreserveDetailedReason() {
        // Given
        String detailedReason = "Multiple indicators detected: repetitive patterns, " +
                "unnatural sentence structure, consistent tone throughout, " +
                "lack of personal anecdotes, and formal academic style.";

        // When
        DetectedSegment segment = new DetectedSegment(
                VALID_TEXT,
                VALID_START_INDEX,
                VALID_END_INDEX,
                VALID_AI_PROBABILITY,
                detailedReason
        );

        // Then
        assertThat(segment.getReason()).isEqualTo(detailedReason);
    }

    // ========================================
    // ✅ EQUALITY TESTS
    // ========================================

    @Test
    @DisplayName("Should be equal when all components are the same")
    void shouldBeEqualWhenAllComponentsAreTheSame() {
        // Given
        DetectedSegment segment1 = new DetectedSegment(
                VALID_TEXT,
                VALID_START_INDEX,
                VALID_END_INDEX,
                VALID_AI_PROBABILITY,
                VALID_REASON
        );

        DetectedSegment segment2 = new DetectedSegment(
                VALID_TEXT,
                VALID_START_INDEX,
                VALID_END_INDEX,
                VALID_AI_PROBABILITY,
                VALID_REASON
        );

        // Then
        assertThat(segment1).isEqualTo(segment2);
        assertThat(segment1.hashCode()).isEqualTo(segment2.hashCode());
    }

    @Test
    @DisplayName("Should not be equal when text differs")
    void shouldNotBeEqualWhenTextDiffers() {
        // Given
        DetectedSegment segment1 = new DetectedSegment(
                "Text A",
                VALID_START_INDEX,
                VALID_END_INDEX,
                VALID_AI_PROBABILITY,
                VALID_REASON
        );

        DetectedSegment segment2 = new DetectedSegment(
                "Text B",
                VALID_START_INDEX,
                VALID_END_INDEX,
                VALID_AI_PROBABILITY,
                VALID_REASON
        );

        // Then
        assertThat(segment1).isNotEqualTo(segment2);
    }

    @Test
    @DisplayName("Should not be equal when indices differ")
    void shouldNotBeEqualWhenIndicesDiffer() {
        // Given
        DetectedSegment segment1 = new DetectedSegment(
                VALID_TEXT,
                0,
                10,
                VALID_AI_PROBABILITY,
                VALID_REASON
        );

        DetectedSegment segment2 = new DetectedSegment(
                VALID_TEXT,
                10,
                20,
                VALID_AI_PROBABILITY,
                VALID_REASON
        );

        // Then
        assertThat(segment1).isNotEqualTo(segment2);
    }

    @Test
    @DisplayName("Should not be equal when probability differs")
    void shouldNotBeEqualWhenProbabilityDiffers() {
        // Given
        DetectedSegment segment1 = new DetectedSegment(
                VALID_TEXT,
                VALID_START_INDEX,
                VALID_END_INDEX,
                new BigDecimal("0.85"),
                VALID_REASON
        );

        DetectedSegment segment2 = new DetectedSegment(
                VALID_TEXT,
                VALID_START_INDEX,
                VALID_END_INDEX,
                new BigDecimal("0.75"),
                VALID_REASON
        );

        // Then
        assertThat(segment1).isNotEqualTo(segment2);
    }

    @Test
    @DisplayName("Should be equal regardless of reason")
    void shouldBeEqualRegardlessOfReason() {
        // Given - Note: reason is NOT part of equality components
        DetectedSegment segment1 = new DetectedSegment(
                VALID_TEXT,
                VALID_START_INDEX,
                VALID_END_INDEX,
                VALID_AI_PROBABILITY,
                "Reason A"
        );

        DetectedSegment segment2 = new DetectedSegment(
                VALID_TEXT,
                VALID_START_INDEX,
                VALID_END_INDEX,
                VALID_AI_PROBABILITY,
                "Reason B"
        );

        // Then
        assertThat(segment1).isEqualTo(segment2);
    }

    @Test
    @DisplayName("Should not be equal to null")
    void shouldNotBeEqualToNull() {
        // Given
        DetectedSegment segment = new DetectedSegment(
                VALID_TEXT,
                VALID_START_INDEX,
                VALID_END_INDEX,
                VALID_AI_PROBABILITY,
                VALID_REASON
        );

        // Then
        assertThat(segment).isNotEqualTo(null);
    }

    // ========================================
    // ✅ EDGE CASE TESTS
    // ========================================

    @Test
    @DisplayName("Should handle very long text segment")
    void shouldHandleVeryLongTextSegment() {
        // Given
        String longText = "A".repeat(10000);

        // When
        DetectedSegment segment = new DetectedSegment(
                longText,
                0,
                10000,
                VALID_AI_PROBABILITY,
                VALID_REASON
        );

        // Then
        assertThat(segment.getText()).hasSize(10000);
        assertThat(segment.getEndIndex()).isEqualTo(10000);
    }

    @Test
    @DisplayName("Should handle segment with very large indices")
    void shouldHandleSegmentWithVeryLargeIndices() {
        // Given
        int largeIndex = Integer.MAX_VALUE;

        // When
        DetectedSegment segment = new DetectedSegment(
                VALID_TEXT,
                0,
                largeIndex,
                VALID_AI_PROBABILITY,
                VALID_REASON
        );

        // Then
        assertThat(segment.getEndIndex()).isEqualTo(largeIndex);
    }
}