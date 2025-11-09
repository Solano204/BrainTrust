package com.braintrust.iadetectition.unit.domain.valueobjects;


import com.braintrust.aidetectition.domain.model.DetectedSegment;
import com.braintrust.aidetectition.domain.valueobjects.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import java.math.BigDecimal;
import java.util.*;

import static org.assertj.core.api.Assertions.*;

/**
 * Unit tests for DetectionResult value object.
 * Tests all business logic and data integrity.
 */
@DisplayName("DetectionResult Value Object Tests")
class DetectionResultTest {

    private static final String VALID_CONTENT = "Sample text for AI detection analysis";

    // ========================================
    // ✅ CREATION TESTS
    // ========================================

    @Test
    @DisplayName("Should create detection result with all valid data")
    void shouldCreateDetectionResultWithAllValidData() {
        // Given
        AIProbability probability = new AIProbability(new BigDecimal("0.85"));
        ModelType modelType = ModelType.ENSEMBLE;
        List<DetectedSegment> segments = createSampleSegments();
        Map<String, Object> metadata = createSampleMetadata();

        // When
        DetectionResult result = new DetectionResult(
                probability,
                modelType,
                VALID_CONTENT,
                segments,
                metadata
        );

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getProbability()).isEqualTo(probability);
        assertThat(result.getModelUsed()).isEqualTo(modelType);
        assertThat(result.getAnalyzedContent()).isEqualTo(VALID_CONTENT);
        assertThat(result.getDetectedSegments()).hasSize(2);
        assertThat(result.getMetadata()).hasSize(2);
    }

    @Test
    @DisplayName("Should create detection result with empty segments")
    void shouldCreateDetectionResultWithEmptySegments() {
        // Given
        AIProbability probability = new AIProbability(new BigDecimal("0.50"));

        // When
        DetectionResult result = new DetectionResult(
                probability,
                ModelType.GPT_DETECTOR,
                VALID_CONTENT,
                Collections.emptyList(),
                Collections.emptyMap()
        );

        // Then
        assertThat(result.getDetectedSegments()).isEmpty();
    }

    @Test
    @DisplayName("Should create detection result with null segments list")
    void shouldCreateDetectionResultWithNullSegmentsList() {
        // Given
        AIProbability probability = new AIProbability(new BigDecimal("0.50"));

        // When
        DetectionResult result = new DetectionResult(
                probability,
                ModelType.GPT_DETECTOR,
                VALID_CONTENT,
                null,
                Collections.emptyMap()
        );

        // Then
        assertThat(result.getDetectedSegments()).isEmpty();
        assertThat(result.getDetectedSegments()).isNotNull();
    }

    @Test
    @DisplayName("Should create detection result with null metadata")
    void shouldCreateDetectionResultWithNullMetadata() {
        // Given
        AIProbability probability = new AIProbability(new BigDecimal("0.50"));

        // When
        DetectionResult result = new DetectionResult(
                probability,
                ModelType.GPT_DETECTOR,
                VALID_CONTENT,
                Collections.emptyList(),
                null
        );

        // Then
        assertThat(result.getMetadata()).isEmpty();
        assertThat(result.getMetadata()).isNotNull();
    }

    // ========================================
    // ✅ IMMUTABILITY TESTS
    // ========================================

    @Test
    @DisplayName("Should return immutable copy of segments list")
    void shouldReturnImmutableCopyOfSegmentsList() {
        // Given
        List<DetectedSegment> segments = new ArrayList<>(createSampleSegments());
        DetectionResult result = new DetectionResult(
                new AIProbability(new BigDecimal("0.85")),
                ModelType.ENSEMBLE,
                VALID_CONTENT,
                segments,
                Collections.emptyMap()
        );

        // When
        List<DetectedSegment> returnedSegments = result.getDetectedSegments();

        // Then
        assertThatThrownBy(() -> returnedSegments.add(createSingleSegment()))
                .isInstanceOf(UnsupportedOperationException.class);
    }

    @Test
    @DisplayName("Should return immutable copy of metadata map")
    void shouldReturnImmutableCopyOfMetadataMap() {
        // Given
        Map<String, Object> metadata = new HashMap<>(createSampleMetadata());
        DetectionResult result = new DetectionResult(
                new AIProbability(new BigDecimal("0.85")),
                ModelType.ENSEMBLE,
                VALID_CONTENT,
                Collections.emptyList(),
                metadata
        );

        // When
        Map<String, Object> returnedMetadata = result.getMetadata();

        // Then
        assertThatThrownBy(() -> returnedMetadata.put("new_key", "new_value"))
                .isInstanceOf(UnsupportedOperationException.class);
    }

    @Test
    @DisplayName("Should not be affected by external modifications to segments list")
    void shouldNotBeAffectedByExternalModificationsToSegmentsList() {
        // Given
        List<DetectedSegment> segments = new ArrayList<>(createSampleSegments());
        DetectionResult result = new DetectionResult(
                new AIProbability(new BigDecimal("0.85")),
                ModelType.ENSEMBLE,
                VALID_CONTENT,
                segments,
                Collections.emptyMap()
        );

        int originalSize = result.getDetectedSegments().size();

        // When
        segments.add(createSingleSegment());

        // Then
        assertThat(result.getDetectedSegments()).hasSize(originalSize);
    }

    @Test
    @DisplayName("Should not be affected by external modifications to metadata map")
    void shouldNotBeAffectedByExternalModificationsToMetadataMap() {
        // Given
        Map<String, Object> metadata = new HashMap<>(createSampleMetadata());
        DetectionResult result = new DetectionResult(
                new AIProbability(new BigDecimal("0.85")),
                ModelType.ENSEMBLE,
                VALID_CONTENT,
                Collections.emptyList(),
                metadata
        );

        int originalSize = result.getMetadata().size();

        // When
        metadata.put("new_key", "new_value");

        // Then
        assertThat(result.getMetadata()).hasSize(originalSize);
    }

    // ========================================
    // ✅ IS LIKELY AI TESTS
    // ========================================

    @ParameterizedTest
    @CsvSource({
            "0.71, true",
            "0.80, true",
            "0.95, true",
            "1.0, true",
            "0.70, false",
            "0.50, false",
            "0.30, false",
            "0.0, false"
    })
    @DisplayName("Should determine if likely AI correctly")
    void shouldDetermineIfLikelyAICorrectly(String probability, boolean expectedLikelyAI) {
        // Given
        DetectionResult result = new DetectionResult(
                new AIProbability(new BigDecimal(probability)),
                ModelType.ENSEMBLE,
                VALID_CONTENT,
                Collections.emptyList(),
                Collections.emptyMap()
        );

        // Then
        assertThat(result.isLikelyAI()).isEqualTo(expectedLikelyAI);
    }

    // ========================================
    // ✅ CONFIDENCE LEVEL TESTS
    // ========================================

    @ParameterizedTest
    @CsvSource({
            "0.80, HIGH",
            "0.95, HIGH",
            "1.0, HIGH",
            "0.50, MEDIUM",
            "0.60, MEDIUM",
            "0.70, MEDIUM",
            "0.20, LOW",
            "0.30, LOW",
            "0.0, LOW"
    })
    @DisplayName("Should determine confidence level correctly")
    void shouldDetermineConfidenceLevelCorrectly(String probability, String expectedLevel) {
        // Given
        DetectionResult result = new DetectionResult(
                new AIProbability(new BigDecimal(probability)),
                ModelType.ENSEMBLE,
                VALID_CONTENT,
                Collections.emptyList(),
                Collections.emptyMap()
        );

        // Then
        assertThat(result.getConfidenceLevel()).isEqualTo(expectedLevel);
    }

    // ========================================
    // ✅ HIGH CONFIDENCE SEGMENT COUNT TESTS
    // ========================================

    @Test
    @DisplayName("Should count high confidence segments correctly")
    void shouldCountHighConfidenceSegmentsCorrectly() {
        // Given
        List<DetectedSegment> segments = Arrays.asList(
                new DetectedSegment("Text 1", 0, 10, new BigDecimal("0.75"), "High"), // High
                new DetectedSegment("Text 2", 10, 20, new BigDecimal("0.85"), "High"), // High
                new DetectedSegment("Text 3", 20, 30, new BigDecimal("0.60"), "Medium"), // Not high
                new DetectedSegment("Text 4", 30, 40, new BigDecimal("0.90"), "High") // High
        );

        DetectionResult result = new DetectionResult(
                new AIProbability(new BigDecimal("0.80")),
                ModelType.ENSEMBLE,
                VALID_CONTENT,
                segments,
                Collections.emptyMap()
        );

        // Then
        assertThat(result.getHighConfidenceSegmentCount()).isEqualTo(3);
    }

    @Test
    @DisplayName("Should return zero when no segments")
    void shouldReturnZeroWhenNoSegments() {
        // Given
        DetectionResult result = new DetectionResult(
                new AIProbability(new BigDecimal("0.80")),
                ModelType.ENSEMBLE,
                VALID_CONTENT,
                Collections.emptyList(),
                Collections.emptyMap()
        );

        // Then
        assertThat(result.getHighConfidenceSegmentCount()).isZero();
    }

    @Test
    @DisplayName("Should return zero when no high confidence segments")
    void shouldReturnZeroWhenNoHighConfidenceSegments() {
        // Given
        List<DetectedSegment> segments = Arrays.asList(
                new DetectedSegment("Text 1", 0, 10, new BigDecimal("0.60"), "Low"),
                new DetectedSegment("Text 2", 10, 20, new BigDecimal("0.65"), "Low")
        );

        DetectionResult result = new DetectionResult(
                new AIProbability(new BigDecimal("0.80")),
                ModelType.ENSEMBLE,
                VALID_CONTENT,
                segments,
                Collections.emptyMap()
        );

        // Then
        assertThat(result.getHighConfidenceSegmentCount()).isZero();
    }

    // ========================================
    // ✅ METADATA TESTS
    // ========================================

    @Test
    @DisplayName("Should store and retrieve metadata correctly")
    void shouldStoreAndRetrieveMetadataCorrectly() {
        // Given
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("detected_language", "en");
        metadata.put("word_count", 150);
        metadata.put("analysis_duration_ms", 1250L);
        metadata.put("confidence_score", 0.85);

        DetectionResult result = new DetectionResult(
                new AIProbability(new BigDecimal("0.85")),
                ModelType.ENSEMBLE,
                VALID_CONTENT,
                Collections.emptyList(),
                metadata
        );

        // Then
        assertThat(result.getMetadata()).containsEntry("detected_language", "en");
        assertThat(result.getMetadata()).containsEntry("word_count", 150);
        assertThat(result.getMetadata()).containsEntry("analysis_duration_ms", 1250L);
        assertThat(result.getMetadata()).containsEntry("confidence_score", 0.85);
    }

    @Test
    @DisplayName("Should handle complex metadata objects")
    void shouldHandleComplexMetadataObjects() {
        // Given
        Map<String, Object> nestedMap = new HashMap<>();
        nestedMap.put("sub_key", "sub_value");

        Map<String, Object> metadata = new HashMap<>();
        metadata.put("simple_string", "value");
        metadata.put("nested_object", nestedMap);
        metadata.put("list_value", Arrays.asList(1, 2, 3));

        DetectionResult result = new DetectionResult(
                new AIProbability(new BigDecimal("0.85")),
                ModelType.ENSEMBLE,
                VALID_CONTENT,
                Collections.emptyList(),
                metadata
        );

        // Then
        assertThat(result.getMetadata()).containsKey("nested_object");
        assertThat(result.getMetadata()).containsKey("list_value");
    }

    // ========================================
    // ✅ MODEL TYPE TESTS
    // ========================================

    @Test
    @DisplayName("Should store all model types correctly")
    void shouldStoreAllModelTypesCorrectly() {
        for (ModelType modelType : ModelType.values()) {
            // When
            DetectionResult result = new DetectionResult(
                    new AIProbability(new BigDecimal("0.80")),
                    modelType,
                    VALID_CONTENT,
                    Collections.emptyList(),
                    Collections.emptyMap()
            );

            // Then
            assertThat(result.getModelUsed()).isEqualTo(modelType);
        }
    }

    // ========================================
    // ✅ CONTENT TESTS
    // ========================================

    @Test
    @DisplayName("Should preserve analyzed content exactly")
    void shouldPreserveAnalyzedContentExactly() {
        // Given
        String content = "Text with émojis 😀, symbols ©®™, and newlines\n\n";

        // When
        DetectionResult result = new DetectionResult(
                new AIProbability(new BigDecimal("0.80")),
                ModelType.ENSEMBLE,
                content,
                Collections.emptyList(),
                Collections.emptyMap()
        );

        // Then
        assertThat(result.getAnalyzedContent()).isEqualTo(content);
    }

    @Test
    @DisplayName("Should handle empty content")
    void shouldHandleEmptyContent() {
        // When
        DetectionResult result = new DetectionResult(
                new AIProbability(new BigDecimal("0.80")),
                ModelType.ENSEMBLE,
                "",
                Collections.emptyList(),
                Collections.emptyMap()
        );

        // Then
        assertThat(result.getAnalyzedContent()).isEmpty();
    }

    @Test
    @DisplayName("Should handle null content")
    void shouldHandleNullContent() {
        // When
        DetectionResult result = new DetectionResult(
                new AIProbability(new BigDecimal("0.80")),
                ModelType.ENSEMBLE,
                null,
                Collections.emptyList(),
                Collections.emptyMap()
        );

        // Then
        assertThat(result.getAnalyzedContent()).isNull();
    }

    @Test
    @DisplayName("Should handle very long content")
    void shouldHandleVeryLongContent() {
        // Given
        String longContent = "A".repeat(100000);

        // When
        DetectionResult result = new DetectionResult(
                new AIProbability(new BigDecimal("0.80")),
                ModelType.ENSEMBLE,
                longContent,
                Collections.emptyList(),
                Collections.emptyMap()
        );

        // Then
        assertThat(result.getAnalyzedContent()).hasSize(100000);
    }

    // ========================================
    // ✅ EQUALITY TESTS
    // ========================================

    @Test
    @DisplayName("Should be equal when all components are the same")
    void shouldBeEqualWhenAllComponentsAreTheSame() {
        // Given
        AIProbability probability = new AIProbability(new BigDecimal("0.85"));
        List<DetectedSegment> segments = createSampleSegments();

        DetectionResult result1 = new DetectionResult(
                probability,
                ModelType.ENSEMBLE,
                VALID_CONTENT,
                segments,
                Collections.emptyMap()
        );

        DetectionResult result2 = new DetectionResult(
                probability,
                ModelType.ENSEMBLE,
                VALID_CONTENT,
                segments,
                Collections.emptyMap()
        );

        // Then
        assertThat(result1).isEqualTo(result2);
        assertThat(result1.hashCode()).isEqualTo(result2.hashCode());
    }

    @Test
    @DisplayName("Should not be equal when probability differs")
    void shouldNotBeEqualWhenProbabilityDiffers() {
        // Given
        DetectionResult result1 = new DetectionResult(
                new AIProbability(new BigDecimal("0.85")),
                ModelType.ENSEMBLE,
                VALID_CONTENT,
                Collections.emptyList(),
                Collections.emptyMap()
        );

        DetectionResult result2 = new DetectionResult(
                new AIProbability(new BigDecimal("0.75")),
                ModelType.ENSEMBLE,
                VALID_CONTENT,
                Collections.emptyList(),
                Collections.emptyMap()
        );

        // Then
        assertThat(result1).isNotEqualTo(result2);
    }

    @Test
    @DisplayName("Should not be equal when model differs")
    void shouldNotBeEqualWhenModelDiffers() {
        // Given
        DetectionResult result1 = new DetectionResult(
                new AIProbability(new BigDecimal("0.85")),
                ModelType.ENSEMBLE,
                VALID_CONTENT,
                Collections.emptyList(),
                Collections.emptyMap()
        );

        DetectionResult result2 = new DetectionResult(
                new AIProbability(new BigDecimal("0.85")),
                ModelType.GPT_DETECTOR,
                VALID_CONTENT,
                Collections.emptyList(),
                Collections.emptyMap()
        );

        // Then
        assertThat(result1).isNotEqualTo(result2);
    }

    @Test
    @DisplayName("Should not be equal when segments differ")
    void shouldNotBeEqualWhenSegmentsDiffer() {
        // Given
        DetectionResult result1 = new DetectionResult(
                new AIProbability(new BigDecimal("0.85")),
                ModelType.ENSEMBLE,
                VALID_CONTENT,
                createSampleSegments(),
                Collections.emptyMap()
        );

        DetectionResult result2 = new DetectionResult(
                new AIProbability(new BigDecimal("0.85")),
                ModelType.ENSEMBLE,
                VALID_CONTENT,
                Collections.emptyList(),
                Collections.emptyMap()
        );

        // Then
        assertThat(result1).isNotEqualTo(result2);
    }

    @Test
    @DisplayName("Should not be equal to null")
    void shouldNotBeEqualToNull() {
        // Given
        DetectionResult result = new DetectionResult(
                new AIProbability(new BigDecimal("0.85")),
                ModelType.ENSEMBLE,
                VALID_CONTENT,
                Collections.emptyList(),
                Collections.emptyMap()
        );

        // Then
        assertThat(result).isNotEqualTo(null);
    }

    // ========================================
    // 🔧 HELPER METHODS
    // ========================================

    private List<DetectedSegment> createSampleSegments() {
        return Arrays.asList(
                new DetectedSegment(
                        "First detected segment",
                        0,
                        23,
                        new BigDecimal("0.85"),
                        "High confidence pattern"
                ),
                new DetectedSegment(
                        "Second detected segment",
                        50,
                        74,
                        new BigDecimal("0.75"),
                        "Medium confidence pattern"
                )
        );
    }

    private DetectedSegment createSingleSegment() {
        return new DetectedSegment(
                "Additional segment",
                100,
                118,
                new BigDecimal("0.80"),
                "Test segment"
        );
    }

    private Map<String, Object> createSampleMetadata() {
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("detected_language", "en");
        metadata.put("analysis_quality", "HIGH");
        return metadata;
    }
}