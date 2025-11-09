package com.braintrust.iadetectition.unit.application.mapper;


import com.braintrust.aidetectition.domain.model.AnalysisRequest;
import com.braintrust.aidetectition.domain.model.AnalysisStatus;
import com.braintrust.aidetectition.domain.model.DetectedSegment;
import com.braintrust.aidetectition.domain.valueobjects.*;
import com.braintrust.aidetectition.infraestructure.repositoriesPersistence.sql.Mapper.AnalysisEntityMapper;
import com.braintrust.aidetectition.infraestructure.repositoriesPersistence.sql.entities.AnalysisRequestJpaEntity;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * Unit tests for AnalysisEntityMapper.
 * Tests bidirectional mapping between domain and persistence models.
 */
@DisplayName("AnalysisEntityMapper Tests")
class AnalysisEntityMapperTest {

    private AnalysisEntityMapper mapper;
    private ObjectMapper objectMapper;

    private static final String VALID_ANALYSIS_ID = "ANALYSIS-12345";
    private static final String VALID_SUBMISSION_ID = "SUBM-67890";
    private static final String VALID_CONTENT = "Sample text for analysis";

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        mapper = new AnalysisEntityMapper(objectMapper);
    }

    // ========================================
    // ✅ TO ENTITY TESTS (Domain → JPA)
    // ========================================

    @Test
    @DisplayName("Should map pending analysis to entity correctly")
    void shouldMapPendingAnalysisToEntityCorrectly() throws JsonProcessingException {
        // Given
        AnalysisRequest domain = AnalysisRequest.create(
                SubmissionId.fromString(VALID_SUBMISSION_ID),
                VALID_CONTENT
        );

        // When
        AnalysisRequestJpaEntity entity = mapper.toEntity(domain);

        // Then
        assertThat(entity).isNotNull();
        assertThat(entity.getId()).isNotNull();
        assertThat(entity.getSubmissionId()).isEqualTo(VALID_SUBMISSION_ID);
        assertThat(entity.getContentToAnalyze()).isEqualTo(VALID_CONTENT);
        assertThat(entity.getStatus()).isEqualTo("PENDING");
        assertThat(entity.getProbability()).isNull();
        assertThat(entity.getModelUsed()).isNull();
        assertThat(entity.getConfidenceLevel()).isNull();
        assertThat(entity.getDetectedSegmentsJson()).isNull();
        assertThat(entity.getErrorMessage()).isNull();
        assertThat(entity.getCreatedAt()).isNotNull();
        assertThat(entity.getAnalyzedAt()).isNull();
    }

    @Test
    @DisplayName("Should map completed analysis with result to entity correctly")
    void shouldMapCompletedAnalysisWithResultToEntityCorrectly() throws JsonProcessingException {
        // Given
        AnalysisRequest domain = AnalysisRequest.create(
                SubmissionId.fromString(VALID_SUBMISSION_ID),
                VALID_CONTENT
        );

        DetectionResult result = createDetectionResult();
        domain.completeAnalysis(result);

        // When
        AnalysisRequestJpaEntity entity = mapper.toEntity(domain);

        // Then
        assertThat(entity).isNotNull();
        assertThat(entity.getStatus()).isEqualTo("COMPLETED");
        assertThat(entity.getProbability()).isEqualByComparingTo("0.8500");
        assertThat(entity.getModelUsed()).isEqualTo("ENSEMBLE");
        assertThat(entity.getConfidenceLevel()).isEqualTo("HIGH");
        assertThat(entity.getDetectedSegmentsJson()).isNotNull();
        assertThat(entity.getAnalyzedAt()).isNotNull();
    }

    @Test
    @DisplayName("Should serialize detected segments to JSON correctly")
    void shouldSerializeDetectedSegmentsToJsonCorrectly() throws JsonProcessingException {
        // Given
        List<DetectedSegment> segments = Arrays.asList(
                new DetectedSegment("Text 1", 0, 10, new BigDecimal("0.85"), "Reason 1"),
                new DetectedSegment("Text 2", 10, 20, new BigDecimal("0.75"), "Reason 2")
        );

        DetectionResult result = new DetectionResult(
                new AIProbability(new BigDecimal("0.80")),
                ModelType.ENSEMBLE,
                VALID_CONTENT,
                segments,
                Collections.emptyMap()
        );

        AnalysisRequest domain = AnalysisRequest.create(
                SubmissionId.fromString(VALID_SUBMISSION_ID),
                VALID_CONTENT
        );
        domain.completeAnalysis(result);

        // When
        AnalysisRequestJpaEntity entity = mapper.toEntity(domain);

        // Then
        assertThat(entity.getDetectedSegmentsJson()).isNotNull();
        assertThat(entity.getDetectedSegmentsJson()).contains("Text 1");
        assertThat(entity.getDetectedSegmentsJson()).contains("Text 2");
        assertThat(entity.getDetectedSegmentsJson()).contains("0.85");
        assertThat(entity.getDetectedSegmentsJson()).contains("Reason 1");
    }

    @Test
    @DisplayName("Should map failed analysis to entity correctly")
    void shouldMapFailedAnalysisToEntityCorrectly() throws JsonProcessingException {
        // Given
        AnalysisRequest domain = AnalysisRequest.create(
                SubmissionId.fromString(VALID_SUBMISSION_ID),
                VALID_CONTENT
        );
        domain.markAsFailed("Service unavailable");

        // When
        AnalysisRequestJpaEntity entity = mapper.toEntity(domain);

        // Then
        assertThat(entity.getStatus()).isEqualTo("FAILED");
        assertThat(entity.getErrorMessage()).isEqualTo("Service unavailable");
        assertThat(entity.getAnalyzedAt()).isNotNull();
        assertThat(entity.getProbability()).isNull();
    }

    @Test
    @DisplayName("Should handle empty segments list")
    void shouldHandleEmptySegmentsList() throws JsonProcessingException {
        // Given
        DetectionResult result = new DetectionResult(
                new AIProbability(new BigDecimal("0.50")),
                ModelType.GPT_DETECTOR,
                VALID_CONTENT,
                Collections.emptyList(),
                Collections.emptyMap()
        );

        AnalysisRequest domain = AnalysisRequest.create(
                SubmissionId.fromString(VALID_SUBMISSION_ID),
                VALID_CONTENT
        );
        domain.completeAnalysis(result);

        // When
        AnalysisRequestJpaEntity entity = mapper.toEntity(domain);

        // Then
        assertThat(entity.getDetectedSegmentsJson()).isNull();
    }

    @Test
    @DisplayName("Should throw exception when serialization fails")
    void shouldThrowExceptionWhenSerializationFails() {
        // Given - Create a mapper with a broken ObjectMapper
        ObjectMapper brokenMapper = mock(ObjectMapper.class);
        AnalysisEntityMapper mapperWithBrokenJson = new AnalysisEntityMapper(brokenMapper);

        AnalysisRequest domain = AnalysisRequest.create(
                SubmissionId.fromString(VALID_SUBMISSION_ID),
                VALID_CONTENT
        );

        DetectionResult result = createDetectionResult();
        domain.completeAnalysis(result);

        try {
            when(brokenMapper.writeValueAsString(any()))
                    .thenThrow(new JsonProcessingException("Serialization error") {});
        } catch (JsonProcessingException e) {
            // Expected during mock setup
        }

        // When/Then
        assertThatThrownBy(() -> mapperWithBrokenJson.toEntity(domain))
                .isInstanceOf(JsonProcessingException.class);
    }

    // ========================================
    // ✅ TO DOMAIN TESTS (JPA → Domain)
    // ========================================

    @Test
    @DisplayName("Should map pending entity to domain correctly")
    void shouldMapPendingEntityToDomainCorrectly() {
        // Given
        AnalysisRequestJpaEntity entity = new AnalysisRequestJpaEntity(
                VALID_ANALYSIS_ID,
                VALID_SUBMISSION_ID,
                VALID_CONTENT,
                "PENDING",
                null,
                null,
                null,
                null,
                null,
                LocalDateTime.now(),
                null
        );

        // When
        AnalysisRequest domain = mapper.toDomain(entity);

        // Then
        assertThat(domain).isNotNull();
        assertThat(domain.getId().getValue()).isEqualTo(VALID_ANALYSIS_ID);
        assertThat(domain.getSubmissionId().getValue()).isEqualTo(VALID_SUBMISSION_ID);
        assertThat(domain.getContentToAnalyze()).isEqualTo(VALID_CONTENT);
        assertThat(domain.getStatus()).isEqualTo(AnalysisStatus.PENDING);
        assertThat(domain.getResult()).isNull();
        assertThat(domain.getErrorMessage()).isNull();
        assertThat(domain.isPending()).isTrue();
    }

    @Test
    @DisplayName("Should map completed entity with result to domain correctly")
    void shouldMapCompletedEntityWithResultToDomainCorrectly() {
        // Given
        String segmentsJson = "[{\"text\":\"AI text\",\"startIndex\":0,\"endIndex\":10," +
                "\"aiProbability\":\"0.85\",\"reason\":\"High confidence\"}]";

        AnalysisRequestJpaEntity entity = new AnalysisRequestJpaEntity(
                VALID_ANALYSIS_ID,
                VALID_SUBMISSION_ID,
                VALID_CONTENT,
                "COMPLETED",
                new BigDecimal("0.85"),
                "ENSEMBLE",
                "HIGH",
                segmentsJson,
                null,
                LocalDateTime.now().minusHours(1),
                LocalDateTime.now()
        );

        // When
        AnalysisRequest domain = mapper.toDomain(entity);

        // Then
        assertThat(domain).isNotNull();
        assertThat(domain.getStatus()).isEqualTo(AnalysisStatus.COMPLETED);
        assertThat(domain.getResult()).isNotNull();
        assertThat(domain.getResult().getProbability().getValue()).isEqualByComparingTo("0.85");
        assertThat(domain.getResult().getModelUsed()).isEqualTo(ModelType.ENSEMBLE);
        assertThat(domain.getResult().getDetectedSegments()).hasSize(1);
        assertThat(domain.isCompleted()).isTrue();
    }

    @Test
    @DisplayName("Should deserialize detected segments from JSON correctly")
    void shouldDeserializeDetectedSegmentsFromJsonCorrectly() {
        // Given
        String segmentsJson = "[" +
                "{\"text\":\"Segment 1\",\"startIndex\":0,\"endIndex\":10," +
                "\"aiProbability\":\"0.85\",\"reason\":\"Reason 1\"}," +
                "{\"text\":\"Segment 2\",\"startIndex\":10,\"endIndex\":20," +
                "\"aiProbability\":\"0.75\",\"reason\":\"Reason 2\"}" +
                "]";

        AnalysisRequestJpaEntity entity = new AnalysisRequestJpaEntity(
                VALID_ANALYSIS_ID,
                VALID_SUBMISSION_ID,
                VALID_CONTENT,
                "COMPLETED",
                new BigDecimal("0.80"),
                "ENSEMBLE",
                "HIGH",
                segmentsJson,
                null,
                LocalDateTime.now(),
                LocalDateTime.now()
        );

        // When
        AnalysisRequest domain = mapper.toDomain(entity);

        // Then
        List<DetectedSegment> segments = domain.getResult().getDetectedSegments();
        assertThat(segments).hasSize(2);

        DetectedSegment segment1 = segments.get(0);
        assertThat(segment1.getText()).isEqualTo("Segment 1");
        assertThat(segment1.getStartIndex()).isEqualTo(0);
        assertThat(segment1.getEndIndex()).isEqualTo(10);
        assertThat(segment1.getAiProbability()).isEqualByComparingTo("0.85");
        assertThat(segment1.getReason()).isEqualTo("Reason 1");
    }

    @Test
    @DisplayName("Should map failed entity to domain correctly")
    void shouldMapFailedEntityToDomainCorrectly() {
        // Given
        AnalysisRequestJpaEntity entity = new AnalysisRequestJpaEntity(
                VALID_ANALYSIS_ID,
                VALID_SUBMISSION_ID,
                VALID_CONTENT,
                "FAILED",
                null,
                null,
                null,
                null,
                "Service timeout",
                LocalDateTime.now().minusHours(1),
                LocalDateTime.now()
        );

        // When
        AnalysisRequest domain = mapper.toDomain(entity);

        // Then
        assertThat(domain.getStatus()).isEqualTo(AnalysisStatus.FAILED);
        assertThat(domain.getErrorMessage()).isEqualTo("Service timeout");
        assertThat(domain.getResult()).isNull();
    }

    @Test
    @DisplayName("Should handle null segments JSON")
    void shouldHandleNullSegmentsJson() {
        // Given
        AnalysisRequestJpaEntity entity = new AnalysisRequestJpaEntity(
                VALID_ANALYSIS_ID,
                VALID_SUBMISSION_ID,
                VALID_CONTENT,
                "COMPLETED",
                new BigDecimal("0.50"),
                "GPT_DETECTOR",
                "MEDIUM",
                null, // No segments JSON
                null,
                LocalDateTime.now(),
                LocalDateTime.now()
        );

        // When
        AnalysisRequest domain = mapper.toDomain(entity);

        // Then
        assertThat(domain.getResult()).isNotNull();
        assertThat(domain.getResult().getDetectedSegments()).isEmpty();
    }

    @Test
    @DisplayName("Should handle empty segments JSON string")
    void shouldHandleEmptySegmentsJsonString() {
        // Given
        AnalysisRequestJpaEntity entity = new AnalysisRequestJpaEntity(
                VALID_ANALYSIS_ID,
                VALID_SUBMISSION_ID,
                VALID_CONTENT,
                "COMPLETED",
                new BigDecimal("0.50"),
                "GPT_DETECTOR",
                "MEDIUM",
                "", // Empty string
                null,
                LocalDateTime.now(),
                LocalDateTime.now()
        );

        // When
        AnalysisRequest domain = mapper.toDomain(entity);

        // Then
        assertThat(domain.getResult()).isNotNull();
        assertThat(domain.getResult().getDetectedSegments()).isEmpty();
    }

    @Test
    @DisplayName("Should throw exception when deserialization fails")
    void shouldThrowExceptionWhenDeserializationFails() {
        // Given
        AnalysisRequestJpaEntity entity = new AnalysisRequestJpaEntity(
                VALID_ANALYSIS_ID,
                VALID_SUBMISSION_ID,
                VALID_CONTENT,
                "COMPLETED",
                new BigDecimal("0.85"),
                "ENSEMBLE",
                "HIGH",
                "INVALID_JSON{{{", // Invalid JSON
                null,
                LocalDateTime.now(),
                LocalDateTime.now()
        );

        // When/Then
        assertThatThrownBy(() -> mapper.toDomain(entity))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Failed to deserialize detected segments");
    }

    // ========================================
    // ✅ BIDIRECTIONAL MAPPING TESTS
    // ========================================

    @Test
    @DisplayName("Should preserve data through bidirectional mapping")
    void shouldPreserveDataThroughBidirectionalMapping() throws JsonProcessingException {
        // Given
        AnalysisRequest originalDomain = AnalysisRequest.create(
                SubmissionId.fromString(VALID_SUBMISSION_ID),
                VALID_CONTENT
        );

        DetectionResult result = createDetectionResult();
        originalDomain.completeAnalysis(result);

        // When
        AnalysisRequestJpaEntity entity = mapper.toEntity(originalDomain);
        AnalysisRequest reconstructedDomain = mapper.toDomain(entity);

        // Then
        assertThat(reconstructedDomain.getSubmissionId().getValue())
                .isEqualTo(originalDomain.getSubmissionId().getValue());
        assertThat(reconstructedDomain.getContentToAnalyze())
                .isEqualTo(originalDomain.getContentToAnalyze());
        assertThat(reconstructedDomain.getStatus())
                .isEqualTo(originalDomain.getStatus());
        assertThat(reconstructedDomain.getResult().getProbability().getValue())
                .isEqualByComparingTo(originalDomain.getResult().getProbability().getValue());
        assertThat(reconstructedDomain.getResult().getModelUsed())
                .isEqualTo(originalDomain.getResult().getModelUsed());
    }

    @Test
    @DisplayName("Should preserve segments through bidirectional mapping")
    void shouldPreserveSegmentsThroughBidirectionalMapping() throws JsonProcessingException {
        // Given
        List<DetectedSegment> originalSegments = Arrays.asList(
                new DetectedSegment("Text 1", 0, 10, new BigDecimal("0.85"), "Reason 1"),
                new DetectedSegment("Text 2", 10, 20, new BigDecimal("0.75"), "Reason 2")
        );

        DetectionResult result = new DetectionResult(
                new AIProbability(new BigDecimal("0.80")),
                ModelType.ENSEMBLE,
                VALID_CONTENT,
                originalSegments,
                Collections.emptyMap()
        );

        AnalysisRequest originalDomain = AnalysisRequest.create(
                SubmissionId.fromString(VALID_SUBMISSION_ID),
                VALID_CONTENT
        );
        originalDomain.completeAnalysis(result);

        // When
        AnalysisRequestJpaEntity entity = mapper.toEntity(originalDomain);
        AnalysisRequest reconstructedDomain = mapper.toDomain(entity);

        // Then
        List<DetectedSegment> reconstructedSegments =
                reconstructedDomain.getResult().getDetectedSegments();

        assertThat(reconstructedSegments).hasSize(originalSegments.size());

        for (int i = 0; i < originalSegments.size(); i++) {
            DetectedSegment original = originalSegments.get(i);
            DetectedSegment reconstructed = reconstructedSegments.get(i);

            assertThat(reconstructed.getText()).isEqualTo(original.getText());
            assertThat(reconstructed.getStartIndex()).isEqualTo(original.getStartIndex());
            assertThat(reconstructed.getEndIndex()).isEqualTo(original.getEndIndex());
            assertThat(reconstructed.getAiProbability()).isEqualByComparingTo(original.getAiProbability());
            assertThat(reconstructed.getReason()).isEqualTo(original.getReason());
        }
    }

    // ========================================
    // ✅ EDGE CASE TESTS
    // ========================================

    @Test
    @DisplayName("Should handle very long content")
    void shouldHandleVeryLongContent() throws JsonProcessingException {
        // Given
        String longContent = "A".repeat(10000);
        AnalysisRequest domain = AnalysisRequest.create(
                SubmissionId.fromString(VALID_SUBMISSION_ID),
                longContent
        );

        // When
        AnalysisRequestJpaEntity entity = mapper.toEntity(domain);
        AnalysisRequest reconstructed = mapper.toDomain(entity);

        // Then
        assertThat(reconstructed.getContentToAnalyze()).isEqualTo(longContent);
        assertThat(reconstructed.getContentToAnalyze()).hasSize(10000);
    }

    @Test
    @DisplayName("Should handle special characters in content")
    void shouldHandleSpecialCharactersInContent() throws JsonProcessingException {
        // Given
        String specialContent = "Text with émojis 😀, symbols ©®™, and ñoñó";
        AnalysisRequest domain = AnalysisRequest.create(
                SubmissionId.fromString(VALID_SUBMISSION_ID),
                specialContent
        );

        // When
        AnalysisRequestJpaEntity entity = mapper.toEntity(domain);
        AnalysisRequest reconstructed = mapper.toDomain(entity);

        // Then
        assertThat(reconstructed.getContentToAnalyze()).isEqualTo(specialContent);
    }

    @Test
    @DisplayName("Should handle all model types correctly")
    void shouldHandleAllModelTypesCorrectly() throws JsonProcessingException {
        for (ModelType modelType : ModelType.values()) {
            // Given
            DetectionResult result = new DetectionResult(
                    new AIProbability(new BigDecimal("0.80")),
                    modelType,
                    VALID_CONTENT,
                    Collections.emptyList(),
                    Collections.emptyMap()
            );

            AnalysisRequest domain = AnalysisRequest.create(
                    SubmissionId.fromString(VALID_SUBMISSION_ID),
                    VALID_CONTENT
            );
            domain.completeAnalysis(result);

            // When
            AnalysisRequestJpaEntity entity = mapper.toEntity(domain);
            AnalysisRequest reconstructed = mapper.toDomain(entity);

            // Then
            assertThat(reconstructed.getResult().getModelUsed()).isEqualTo(modelType);
        }
    }

    // ========================================
    // 🔧 HELPER METHODS
    // ========================================

    private DetectionResult createDetectionResult() {
        List<DetectedSegment> segments = Collections.singletonList(
                new DetectedSegment(
                        "AI-generated text",
                        0,
                        20,
                        new BigDecimal("0.90"),
                        "High confidence pattern"
                )
        );

        return new DetectionResult(
                new AIProbability(new BigDecimal("0.85")),
                ModelType.ENSEMBLE,
                VALID_CONTENT,
                segments,
                Collections.emptyMap()
        );
    }
}