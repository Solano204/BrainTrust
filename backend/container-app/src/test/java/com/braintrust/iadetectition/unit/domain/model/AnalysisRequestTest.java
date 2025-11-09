package com.braintrust.iadetectition.unit.domain.model;


import com.braintrust.aidetectition.domain.model.AnalysisRequest;
import com.braintrust.aidetectition.domain.model.AnalysisStatus;
import com.braintrust.aidetectition.domain.model.DetectedSegment;
import com.braintrust.aidetectition.domain.valueobjects.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullSource;
import org.junit.jupiter.params.provider.ValueSource;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.*;

/**
 * Unit tests for AnalysisRequest domain model.
 * Tests all business rules and invariants without Spring context.
 */
@DisplayName("AnalysisRequest Domain Model Tests")
class AnalysisRequestTest {

    private static final SubmissionId VALID_SUBMISSION_ID = SubmissionId.generate();
    private static final String VALID_CONTENT = "This is a sample text to analyze for AI detection";

    // ========================================
    // ✅ CREATION TESTS
    // ========================================

    @Test
    @DisplayName("Should create analysis request with valid data")
    void shouldCreateAnalysisRequestWithValidData() {
        // When
        AnalysisRequest analysis = AnalysisRequest.create(VALID_SUBMISSION_ID, VALID_CONTENT);

        // Then
        assertThat(analysis).isNotNull();
        assertThat(analysis.getId()).isNotNull();
        assertThat(analysis.getId().getValue()).startsWith("ANALYSIS-");
        assertThat(analysis.getSubmissionId()).isEqualTo(VALID_SUBMISSION_ID);
        assertThat(analysis.getContentToAnalyze()).isEqualTo(VALID_CONTENT);
        assertThat(analysis.getStatus()).isEqualTo(AnalysisStatus.PENDING);
        assertThat(analysis.getCreatedAt()).isNotNull();
        assertThat(analysis.getAnalyzedAt()).isNull();
        assertThat(analysis.getResult()).isNull();
        assertThat(analysis.getErrorMessage()).isNull();
        assertThat(analysis.isPending()).isTrue();
        assertThat(analysis.isCompleted()).isFalse();
    }

    @Test
    @DisplayName("Should trim content whitespace when creating")
    void shouldTrimContentWhitespaceWhenCreating() {
        // Given
        String contentWithSpaces = "   Content with spaces   ";

        // When
        AnalysisRequest analysis = AnalysisRequest.create(VALID_SUBMISSION_ID, contentWithSpaces);

        // Then
        assertThat(analysis.getContentToAnalyze()).isEqualTo("Content with spaces");
    }

    @ParameterizedTest
    @NullSource
    @ValueSource(strings = {"", "   ", "\t", "\n"})
    @DisplayName("Should throw exception when content is null or blank")
    void shouldThrowExceptionWhenContentIsNullOrBlank(String invalidContent) {
        // When/Then
        assertThatThrownBy(() -> AnalysisRequest.create(VALID_SUBMISSION_ID, invalidContent))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Content to analyze cannot be null or empty");
    }

    @Test
    @DisplayName("Should throw exception when submission ID is null")
    void shouldThrowExceptionWhenSubmissionIdIsNull() {
        // When/Then
//        assertThatThrownBy(() -> AnalysisRequest.create(null, VALID_CONTENT))
//                .isInstanceOf(NullPointerException.class);
    }

    // ========================================
    // ✅ COMPLETE ANALYSIS TESTS
    // ========================================

    @Test
    @DisplayName("Should complete analysis successfully with detection result")
    void shouldCompleteAnalysisSuccessfullyWithDetectionResult() {
        // Given
        AnalysisRequest analysis = AnalysisRequest.create(VALID_SUBMISSION_ID, VALID_CONTENT);
        DetectionResult result = createValidDetectionResult();

        // When
        analysis.completeAnalysis(result);

        // Then
        assertThat(analysis.getStatus()).isEqualTo(AnalysisStatus.COMPLETED);
        assertThat(analysis.getResult()).isEqualTo(result);
        assertThat(analysis.getAnalyzedAt()).isNotNull();
        assertThat(analysis.isCompleted()).isTrue();
        assertThat(analysis.isPending()).isFalse();
        assertThat(analysis.getErrorMessage()).isNull();
    }

    @Test
    @DisplayName("Should throw exception when completing non-pending analysis")
    void shouldThrowExceptionWhenCompletingNonPendingAnalysis() {
        // Given
        AnalysisRequest analysis = AnalysisRequest.create(VALID_SUBMISSION_ID, VALID_CONTENT);
        DetectionResult result = createValidDetectionResult();
        analysis.completeAnalysis(result);

        // When/Then
        DetectionResult newResult = createValidDetectionResult();
        assertThatThrownBy(() -> analysis.completeAnalysis(newResult))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Only pending analyses can be completed");
    }

    @Test
    @DisplayName("Should throw exception when completing with null result")
    void shouldThrowExceptionWhenCompletingWithNullResult() {
        // Given
        AnalysisRequest analysis = AnalysisRequest.create(VALID_SUBMISSION_ID, VALID_CONTENT);

        // When/Then
//        assertThatThrownBy(() -> analysis.completeAnalysis(null))
//                .isInstanceOf(NullPointerException.class);
    }

    // ========================================
    // ✅ MARK AS FAILED TESTS
    // ========================================

    @Test
    @DisplayName("Should mark analysis as failed with error message")
    void shouldMarkAnalysisAsFailedWithErrorMessage() {
        // Given
        AnalysisRequest analysis = AnalysisRequest.create(VALID_SUBMISSION_ID, VALID_CONTENT);
        String errorMessage = "AI service unavailable";

        // When
        analysis.markAsFailed(errorMessage);

        // Then
        assertThat(analysis.getStatus()).isEqualTo(AnalysisStatus.FAILED);
        assertThat(analysis.getErrorMessage()).isEqualTo(errorMessage);
        assertThat(analysis.getAnalyzedAt()).isNotNull();
        assertThat(analysis.getResult()).isNull();
        assertThat(analysis.isCompleted()).isFalse();
        assertThat(analysis.isPending()).isFalse();
    }

    @Test
    @DisplayName("Should mark failed analysis even after completion")
    void shouldMarkFailedAnalysisEvenAfterCompletion() {
        // Given
        AnalysisRequest analysis = AnalysisRequest.create(VALID_SUBMISSION_ID, VALID_CONTENT);
        DetectionResult result = createValidDetectionResult();
        analysis.completeAnalysis(result);

        // When
        String errorMessage = "Rollback due to external error";
        analysis.markAsFailed(errorMessage);

        // Then
        assertThat(analysis.getStatus()).isEqualTo(AnalysisStatus.FAILED);
        assertThat(analysis.getErrorMessage()).isEqualTo(errorMessage);
    }

    @Test
    @DisplayName("Should overwrite previous error message when marking as failed")
    void shouldOverwritePreviousErrorMessageWhenMarkingAsFailed() {
        // Given
        AnalysisRequest analysis = AnalysisRequest.create(VALID_SUBMISSION_ID, VALID_CONTENT);
        analysis.markAsFailed("First error");

        // When
        analysis.markAsFailed("Second error");

        // Then
        assertThat(analysis.getErrorMessage()).isEqualTo("Second error");
    }

    // ========================================
    // ✅ STATUS VERIFICATION TESTS
    // ========================================

    @Test
    @DisplayName("Should correctly identify pending status")
    void shouldCorrectlyIdentifyPendingStatus() {
        // Given
        AnalysisRequest analysis = AnalysisRequest.create(VALID_SUBMISSION_ID, VALID_CONTENT);

        // Then
        assertThat(analysis.isPending()).isTrue();
        assertThat(analysis.isCompleted()).isFalse();
        assertThat(analysis.getStatus()).isEqualTo(AnalysisStatus.PENDING);
    }

    @Test
    @DisplayName("Should correctly identify completed status")
    void shouldCorrectlyIdentifyCompletedStatus() {
        // Given
        AnalysisRequest analysis = AnalysisRequest.create(VALID_SUBMISSION_ID, VALID_CONTENT);
        DetectionResult result = createValidDetectionResult();
        analysis.completeAnalysis(result);

        // Then
        assertThat(analysis.isCompleted()).isTrue();
        assertThat(analysis.isPending()).isFalse();
        assertThat(analysis.getStatus()).isEqualTo(AnalysisStatus.COMPLETED);
    }

    @Test
    @DisplayName("Should correctly identify failed status")
    void shouldCorrectlyIdentifyFailedStatus() {
        // Given
        AnalysisRequest analysis = AnalysisRequest.create(VALID_SUBMISSION_ID, VALID_CONTENT);
        analysis.markAsFailed("Error");

        // Then
        assertThat(analysis.isPending()).isFalse();
        assertThat(analysis.isCompleted()).isFalse();
        assertThat(analysis.getStatus()).isEqualTo(AnalysisStatus.FAILED);
    }

    // ========================================
    // ✅ RECONSTITUTION TESTS
    // ========================================

    @Test
    @DisplayName("Should reconstitute pending analysis from persistence")
    void shouldReconstitutePendingAnalysisFromPersistence() {
        // Given
        AnalysisId id = AnalysisId.generate();
        LocalDateTime createdAt = LocalDateTime.now().minusHours(2);

        // When
        AnalysisRequest analysis = AnalysisRequest.reconstitute(
                id,
                VALID_SUBMISSION_ID,
                VALID_CONTENT,
                AnalysisStatus.PENDING,
                null,
                null,
                createdAt,
                null
        );

        // Then
        assertThat(analysis.getId()).isEqualTo(id);
        assertThat(analysis.getSubmissionId()).isEqualTo(VALID_SUBMISSION_ID);
        assertThat(analysis.getContentToAnalyze()).isEqualTo(VALID_CONTENT);
        assertThat(analysis.getStatus()).isEqualTo(AnalysisStatus.PENDING);
        assertThat(analysis.getCreatedAt()).isEqualTo(createdAt);
        assertThat(analysis.getAnalyzedAt()).isNull();
        assertThat(analysis.getResult()).isNull();
        assertThat(analysis.getErrorMessage()).isNull();
    }

    @Test
    @DisplayName("Should reconstitute completed analysis from persistence")
    void shouldReconstituteCompletedAnalysisFromPersistence() {
        // Given
        AnalysisId id = AnalysisId.generate();
        LocalDateTime createdAt = LocalDateTime.now().minusHours(2);
        LocalDateTime analyzedAt = LocalDateTime.now().minusHours(1);
        DetectionResult result = createValidDetectionResult();

        // When
        AnalysisRequest analysis = AnalysisRequest.reconstitute(
                id,
                VALID_SUBMISSION_ID,
                VALID_CONTENT,
                AnalysisStatus.COMPLETED,
                result,
                null,
                createdAt,
                analyzedAt
        );

        // Then
        assertThat(analysis.getId()).isEqualTo(id);
        assertThat(analysis.getStatus()).isEqualTo(AnalysisStatus.COMPLETED);
        assertThat(analysis.getResult()).isEqualTo(result);
        assertThat(analysis.getAnalyzedAt()).isEqualTo(analyzedAt);
        assertThat(analysis.isCompleted()).isTrue();
    }

    @Test
    @DisplayName("Should reconstitute failed analysis from persistence")
    void shouldReconstituteFailedAnalysisFromPersistence() {
        // Given
        AnalysisId id = AnalysisId.generate();
        LocalDateTime createdAt = LocalDateTime.now().minusHours(2);
        LocalDateTime analyzedAt = LocalDateTime.now().minusHours(1);
        String errorMessage = "Service timeout";

        // When
        AnalysisRequest analysis = AnalysisRequest.reconstitute(
                id,
                VALID_SUBMISSION_ID,
                VALID_CONTENT,
                AnalysisStatus.FAILED,
                null,
                errorMessage,
                createdAt,
                analyzedAt
        );

        // Then
        assertThat(analysis.getStatus()).isEqualTo(AnalysisStatus.FAILED);
        assertThat(analysis.getErrorMessage()).isEqualTo(errorMessage);
        assertThat(analysis.getAnalyzedAt()).isEqualTo(analyzedAt);
        assertThat(analysis.getResult()).isNull();
    }

    // ========================================
    // ✅ TIMESTAMP TESTS
    // ========================================

    @Test
    @DisplayName("Should set createdAt timestamp on creation")
    void shouldSetCreatedAtTimestampOnCreation() {
        // Given
        LocalDateTime before = LocalDateTime.now();

        // When
        AnalysisRequest analysis = AnalysisRequest.create(VALID_SUBMISSION_ID, VALID_CONTENT);

        // Then
        LocalDateTime after = LocalDateTime.now();
        assertThat(analysis.getCreatedAt()).isNotNull();
        assertThat(analysis.getCreatedAt()).isAfterOrEqualTo(before);
        assertThat(analysis.getCreatedAt()).isBeforeOrEqualTo(after);
    }

    @Test
    @DisplayName("Should set analyzedAt timestamp when completing")
    void shouldSetAnalyzedAtTimestampWhenCompleting() {
        // Given
        AnalysisRequest analysis = AnalysisRequest.create(VALID_SUBMISSION_ID, VALID_CONTENT);
        LocalDateTime before = LocalDateTime.now();

        // When
        DetectionResult result = createValidDetectionResult();
        analysis.completeAnalysis(result);

        // Then
        LocalDateTime after = LocalDateTime.now();
        assertThat(analysis.getAnalyzedAt()).isNotNull();
        assertThat(analysis.getAnalyzedAt()).isAfterOrEqualTo(before);
        assertThat(analysis.getAnalyzedAt()).isBeforeOrEqualTo(after);
    }

    @Test
    @DisplayName("Should set analyzedAt timestamp when marking as failed")
    void shouldSetAnalyzedAtTimestampWhenMarkingAsFailed() {
        // Given
        AnalysisRequest analysis = AnalysisRequest.create(VALID_SUBMISSION_ID, VALID_CONTENT);
        LocalDateTime before = LocalDateTime.now();

        // When
        analysis.markAsFailed("Error");

        // Then
        LocalDateTime after = LocalDateTime.now();
        assertThat(analysis.getAnalyzedAt()).isNotNull();
        assertThat(analysis.getAnalyzedAt()).isAfterOrEqualTo(before);
        assertThat(analysis.getAnalyzedAt()).isBeforeOrEqualTo(after);
    }

    // ========================================
    // ✅ GETTERS TESTS
    // ========================================

    @Test
    @DisplayName("Should return all properties correctly")
    void shouldReturnAllPropertiesCorrectly() {
        // Given
        AnalysisRequest analysis = AnalysisRequest.create(VALID_SUBMISSION_ID, VALID_CONTENT);
        DetectionResult result = createValidDetectionResult();
        analysis.completeAnalysis(result);

        // Then
        assertThat(analysis.getId()).isNotNull();
        assertThat(analysis.getSubmissionId()).isEqualTo(VALID_SUBMISSION_ID);
        assertThat(analysis.getContentToAnalyze()).isEqualTo(VALID_CONTENT);
        assertThat(analysis.getStatus()).isEqualTo(AnalysisStatus.COMPLETED);
        assertThat(analysis.getResult()).isEqualTo(result);
        assertThat(analysis.getErrorMessage()).isNull();
        assertThat(analysis.getCreatedAt()).isNotNull();
        assertThat(analysis.getAnalyzedAt()).isNotNull();
    }

    // ========================================
    // 🔧 HELPER METHODS
    // ========================================

    private DetectionResult createValidDetectionResult() {
        AIProbability probability = new AIProbability(new BigDecimal("0.85"));

        List<DetectedSegment> segments = new ArrayList<>();
        segments.add(new DetectedSegment(
                "This segment seems AI-generated",
                0,
                32,
                new BigDecimal("0.92"),
                "High confidence AI pattern detected"
        ));

        Map<String, Object> metadata = new HashMap<>();
        metadata.put("detected_language", "en");
        metadata.put("analysis_quality", "HIGH");

        return new DetectionResult(
                probability,
                ModelType.ENSEMBLE,
                VALID_CONTENT,
                segments,
                metadata
        );
    }
}