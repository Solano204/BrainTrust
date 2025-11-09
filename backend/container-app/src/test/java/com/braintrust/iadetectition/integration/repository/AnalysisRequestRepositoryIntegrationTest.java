package com.braintrust.iadetectition.integration.repository;

import com.braintrust.aidetectition.domain.model.AnalysisRequest;
import com.braintrust.aidetectition.domain.model.AnalysisStatus;
import com.braintrust.aidetectition.domain.model.DetectedSegment;
import com.braintrust.aidetectition.domain.valueobjects.*;
import com.braintrust.aidetectition.infraestructure.repositoriesPersistence.sql.Mapper.AnalysisEntityMapper;
import com.braintrust.aidetectition.infraestructure.repositoriesPersistence.sql.repositories.AnalysisRequestJpaRepository;
import com.braintrust.aidetectition.infraestructure.repositoriesPersistence.sql.repositories.JpaAnalysisRequestRepositoryAdapter;
import com.braintrust.iadetectition.integration.config.BaseIntegrationTest;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

import static org.assertj.core.api.Assertions.*;

/**
 * Integration tests for AnalysisRequestRepository.
 * Tests real database operations with PostgreSQL Testcontainer.
 */
@Import({
        JpaAnalysisRequestRepositoryAdapter.class,
        AnalysisEntityMapper.class,
        AnalysisRequestRepositoryIntegrationTest.TestConfig.class
})
@DisplayName("AnalysisRequestRepository Integration Tests")
class AnalysisRequestRepositoryIntegrationTest extends BaseIntegrationTest {

    @Autowired
    private JpaAnalysisRequestRepositoryAdapter repository;

    @Autowired
    private AnalysisRequestJpaRepository jpaRepository;

    private SubmissionId testSubmissionId;

    // ✅ Configuración de ObjectMapper para los tests
    @TestConfiguration
    static class TestConfig {
        @Bean
        public ObjectMapper objectMapper() {
            ObjectMapper mapper = new ObjectMapper();
            mapper.registerModule(new JavaTimeModule());
            mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
            return mapper;
        }
    }

    @BeforeEach
    void setUp() {
        // Clean database before each test
        jpaRepository.deleteAll();
        testSubmissionId = SubmissionId.generate();
    }

    // ========================================
    // ✅ SAVE AND FIND BY ID TESTS
    // ========================================

    @Test
    @DisplayName("Should save and retrieve pending analysis by ID")
    void shouldSaveAndRetrievePendingAnalysisById() throws JsonProcessingException {
        // Given
        AnalysisRequest analysis = AnalysisRequest.create(
                testSubmissionId,
                "Sample text for AI detection"
        );

        // When
        AnalysisRequest saved = repository.save(analysis);

        // Then
        assertThat(saved).isNotNull();
        assertThat(saved.getId()).isNotNull();

        // Retrieve and verify
        Optional<AnalysisRequest> retrieved = repository.findById(saved.getId());

        assertThat(retrieved).isPresent();
        assertThat(retrieved.get().getId()).isEqualTo(saved.getId());
        assertThat(retrieved.get().getSubmissionId()).isEqualTo(testSubmissionId);
        assertThat(retrieved.get().getContentToAnalyze()).isEqualTo("Sample text for AI detection");
        assertThat(retrieved.get().getStatus()).isEqualTo(AnalysisStatus.PENDING);
        assertThat(retrieved.get().isPending()).isTrue();
    }

    @Test
    @DisplayName("Should save and retrieve completed analysis with result")
    void shouldSaveAndRetrieveCompletedAnalysisWithResult() throws JsonProcessingException {
        // Given
        AnalysisRequest analysis = AnalysisRequest.create(
                testSubmissionId,
                "AI-generated text for testing"
        );

        DetectionResult result = createDetectionResult();
        analysis.completeAnalysis(result);

        // When
        AnalysisRequest saved = repository.save(analysis);

        // Then
        Optional<AnalysisRequest> retrieved = repository.findById(saved.getId());

        assertThat(retrieved).isPresent();
        assertThat(retrieved.get().getStatus()).isEqualTo(AnalysisStatus.COMPLETED);
        assertThat(retrieved.get().getResult()).isNotNull();
        assertThat(retrieved.get().getResult().getProbability().getValue())
                .isEqualByComparingTo("0.8500");
        assertThat(retrieved.get().getResult().getModelUsed()).isEqualTo(ModelType.ENSEMBLE);
        assertThat(retrieved.get().getResult().getDetectedSegments()).hasSize(2);
        assertThat(retrieved.get().isCompleted()).isTrue();
    }

    @Test
    @DisplayName("Should persist detected segments correctly")
    void shouldPersistDetectedSegmentsCorrectly() throws JsonProcessingException {
        // Given
        List<DetectedSegment> segments = Arrays.asList(
                new DetectedSegment("AI segment 1", 0, 13, new BigDecimal("0.90"), "High confidence"),
                new DetectedSegment("AI segment 2", 20, 33, new BigDecimal("0.85"), "Medium confidence"),
                new DetectedSegment("AI segment 3", 40, 53, new BigDecimal("0.75"), "Low confidence")
        );

        DetectionResult result = new DetectionResult(
                new AIProbability(new BigDecimal("0.83")),
                ModelType.ENSEMBLE,
                "Text with multiple AI segments",
                segments,
                Collections.emptyMap()
        );

        AnalysisRequest analysis = AnalysisRequest.create(
                testSubmissionId,
                "Text with multiple AI segments"
        );
        analysis.completeAnalysis(result);

        // When
        AnalysisRequest saved = repository.save(analysis);

        // Then
        Optional<AnalysisRequest> retrieved = repository.findById(saved.getId());

        assertThat(retrieved).isPresent();
        List<DetectedSegment> retrievedSegments = retrieved.get().getResult().getDetectedSegments();

        assertThat(retrievedSegments).hasSize(3);

        // Verify first segment
        DetectedSegment segment1 = retrievedSegments.get(0);
        assertThat(segment1.getText()).isEqualTo("AI segment 1");
        assertThat(segment1.getStartIndex()).isEqualTo(0);
        assertThat(segment1.getEndIndex()).isEqualTo(13);
        assertThat(segment1.getAiProbability()).isEqualByComparingTo("0.90");
        assertThat(segment1.getReason()).isEqualTo("High confidence");
    }

    @Test
    @DisplayName("Should save failed analysis with error message")
    void shouldSaveFailedAnalysisWithErrorMessage() throws JsonProcessingException {
        // Given
        AnalysisRequest analysis = AnalysisRequest.create(
                testSubmissionId,
                "Text for analysis"
        );
        analysis.markAsFailed("AI service timeout");

        // When
        AnalysisRequest saved = repository.save(analysis);

        // Then
        Optional<AnalysisRequest> retrieved = repository.findById(saved.getId());

        assertThat(retrieved).isPresent();
        assertThat(retrieved.get().getStatus()).isEqualTo(AnalysisStatus.FAILED);
        assertThat(retrieved.get().getErrorMessage()).isEqualTo("AI service timeout");
        assertThat(retrieved.get().getAnalyzedAt()).isNotNull();
    }

    @Test
    @DisplayName("Should update existing analysis")
    void shouldUpdateExistingAnalysis() throws JsonProcessingException {
        // Given
        AnalysisRequest analysis = AnalysisRequest.create(
                testSubmissionId,
                "Text for analysis"
        );
        AnalysisRequest saved = repository.save(analysis);

        // When - Complete the analysis
        DetectionResult result = createDetectionResult();
        saved.completeAnalysis(result);
        repository.save(saved);

        // Then
        Optional<AnalysisRequest> retrieved = repository.findById(saved.getId());

        assertThat(retrieved).isPresent();
        assertThat(retrieved.get().getStatus()).isEqualTo(AnalysisStatus.COMPLETED);
        assertThat(retrieved.get().getResult()).isNotNull();
    }

    @Test
    @DisplayName("Should return empty when analysis not found")
    void shouldReturnEmptyWhenAnalysisNotFound() {
        // Given
        AnalysisId nonExistentId = AnalysisId.generate();

        // When
        Optional<AnalysisRequest> result = repository.findById(nonExistentId);

        // Then
        assertThat(result).isEmpty();
    }

    // ========================================
    // ✅ FIND BY SUBMISSION ID TESTS
    // ========================================

    @Test
    @DisplayName("Should find all analyses by submission ID")
    void shouldFindAllAnalysesBySubmissionId() throws JsonProcessingException {
        // Given
        AnalysisRequest analysis1 = AnalysisRequest.create(testSubmissionId, "Text 1");
        AnalysisRequest analysis2 = AnalysisRequest.create(testSubmissionId, "Text 2");
        AnalysisRequest analysis3 = AnalysisRequest.create(SubmissionId.generate(), "Text 3");

        repository.save(analysis1);
        repository.save(analysis2);
        repository.save(analysis3);

        // When
        List<AnalysisRequest> results = repository.findBySubmissionId(testSubmissionId);

        // Then
        assertThat(results).hasSize(2);
        assertThat(results).extracting(AnalysisRequest::getSubmissionId)
                .containsOnly(testSubmissionId);
    }

    @Test
    @DisplayName("Should return empty list when no analyses found for submission")
    void shouldReturnEmptyListWhenNoAnalysesFoundForSubmission() {
        // Given
        SubmissionId nonExistentId = SubmissionId.generate();

        // When
        List<AnalysisRequest> results = repository.findBySubmissionId(nonExistentId);

        // Then
        assertThat(results).isEmpty();
    }

    // ========================================
    // ✅ FIND BY STATUS TESTS
    // ========================================

    @Test
    @DisplayName("Should find analyses by status")
    void shouldFindAnalysesByStatus() throws JsonProcessingException {
        // Given
        AnalysisRequest pending = AnalysisRequest.create(testSubmissionId, "Pending");
        AnalysisRequest completed = AnalysisRequest.create(testSubmissionId, "Completed");
        completed.completeAnalysis(createDetectionResult());
        AnalysisRequest failed = AnalysisRequest.create(testSubmissionId, "Failed");
        failed.markAsFailed("Error");

        repository.save(pending);
        repository.save(completed);
        repository.save(failed);

        // When
        List<AnalysisRequest> pendingResults = repository.findByStatus(AnalysisStatus.PENDING);
        List<AnalysisRequest> completedResults = repository.findByStatus(AnalysisStatus.COMPLETED);
        List<AnalysisRequest> failedResults = repository.findByStatus(AnalysisStatus.FAILED);

        // Then
        assertThat(pendingResults).hasSize(1);
        assertThat(completedResults).hasSize(1);
        assertThat(failedResults).hasSize(1);
    }

    @Test
    @DisplayName("Should find pending analyses")
    void shouldFindPendingAnalyses() throws JsonProcessingException {
        // Given
        AnalysisRequest pending1 = AnalysisRequest.create(testSubmissionId, "Pending 1");
        AnalysisRequest pending2 = AnalysisRequest.create(testSubmissionId, "Pending 2");
        AnalysisRequest completed = AnalysisRequest.create(testSubmissionId, "Completed");
        completed.completeAnalysis(createDetectionResult());

        repository.save(pending1);
        repository.save(pending2);
        repository.save(completed);

        // When
        List<AnalysisRequest> results = repository.findPendingAnalyses();

        // Then
        assertThat(results).hasSize(2);
        assertThat(results).allMatch(AnalysisRequest::isPending);
    }

    // ========================================
    // ✅ FIND BY DATE RANGE TESTS
    // ========================================

    @Test
    @DisplayName("Should find analyses by date range")
    void shouldFindAnalysesByDateRange() throws JsonProcessingException, InterruptedException {
        // Given
        LocalDateTime start = LocalDateTime.now();

        AnalysisRequest analysis1 = AnalysisRequest.create(testSubmissionId, "Analysis 1");
        repository.save(analysis1);

        Thread.sleep(100); // Small delay

        LocalDateTime middle = LocalDateTime.now();

        Thread.sleep(100);

        AnalysisRequest analysis2 = AnalysisRequest.create(testSubmissionId, "Analysis 2");
        repository.save(analysis2);

        LocalDateTime end = LocalDateTime.now();

        // When
        List<AnalysisRequest> allResults = repository.findByDateRange(start, end);
        List<AnalysisRequest> middleResults = repository.findByDateRange(middle, end);

        // Then
        assertThat(allResults).hasSize(2);
        assertThat(middleResults).hasSize(1);
    }

    // ========================================
    // ✅ FIND BY PROBABILITY TESTS
    // ========================================

    @Test
    @DisplayName("Should find analyses by probability threshold")
    void shouldFindAnalysesByProbabilityThreshold() throws JsonProcessingException {
        // Given
        AnalysisRequest highProb = AnalysisRequest.create(testSubmissionId, "High");
        highProb.completeAnalysis(createDetectionResultWithProbability(new BigDecimal("0.90")));

        AnalysisRequest mediumProb = AnalysisRequest.create(testSubmissionId, "Medium");
        mediumProb.completeAnalysis(createDetectionResultWithProbability(new BigDecimal("0.60")));

        AnalysisRequest lowProb = AnalysisRequest.create(testSubmissionId, "Low");
        lowProb.completeAnalysis(createDetectionResultWithProbability(new BigDecimal("0.30")));

        repository.save(highProb);
        repository.save(mediumProb);
        repository.save(lowProb);

        // When
        List<AnalysisRequest> above70 = repository.findByProbabilityAbove(new BigDecimal("0.70"));
        List<AnalysisRequest> above50 = repository.findByProbabilityAbove(new BigDecimal("0.50"));

        // Then
        assertThat(above70).hasSize(1);
        assertThat(above50).hasSize(2);
    }

    // ========================================
    // ✅ SAVE ALL (BATCH) TESTS
    // ========================================

    @Test
    @DisplayName("Should batch save multiple analyses")
    void shouldBatchSaveMultipleAnalyses() throws JsonProcessingException {
        // Given
        List<AnalysisRequest> analyses = new ArrayList<>();
        for (int i = 0; i < 5; i++) {
            analyses.add(AnalysisRequest.create(testSubmissionId, "Text " + i));
        }

        // When
        List<AnalysisRequest> saved = repository.saveAll(analyses);

        // Then
        assertThat(saved).hasSize(5);
        assertThat(saved).allMatch(a -> a.getId() != null);

        // Verify all are persisted
        List<AnalysisRequest> retrieved = repository.findBySubmissionId(testSubmissionId);
        assertThat(retrieved).hasSize(5);
    }

    @Test
    @DisplayName("Should return empty list when batch saving empty list")
    void shouldReturnEmptyListWhenBatchSavingEmptyList() {
        // When
        List<AnalysisRequest> saved = repository.saveAll(Collections.emptyList());

        // Then
        assertThat(saved).isEmpty();
    }

    // ========================================
    // ✅ DELETE TESTS
    // ========================================

    @Test
    @DisplayName("Should delete analysis")
    void shouldDeleteAnalysis() throws JsonProcessingException {
        // Given
        AnalysisRequest analysis = AnalysisRequest.create(testSubmissionId, "To be deleted");
        AnalysisRequest saved = repository.save(analysis);

        // When
        repository.delete(saved);

        // Then
        Optional<AnalysisRequest> retrieved = repository.findById(saved.getId());
        assertThat(retrieved).isEmpty();
    }

    @Test
    @DisplayName("Should delete analysis with result and segments")
    void shouldDeleteAnalysisWithResultAndSegments() throws JsonProcessingException {
        // Given
        AnalysisRequest analysis = AnalysisRequest.create(testSubmissionId, "To be deleted");
        analysis.completeAnalysis(createDetectionResult());
        AnalysisRequest saved = repository.save(analysis);

        // When
        repository.delete(saved);

        // Then
        Optional<AnalysisRequest> retrieved = repository.findById(saved.getId());
        assertThat(retrieved).isEmpty();
    }

    // ========================================
    // ✅ TRANSACTIONAL BEHAVIOR TESTS
    // ========================================

    @Test
    @DisplayName("Should rollback transaction on error")
    void shouldRollbackTransactionOnError() throws JsonProcessingException {
        // Given
        AnalysisRequest analysis = AnalysisRequest.create(testSubmissionId, "Test");
        repository.save(analysis);

        long countBefore = jpaRepository.count();

        // When - Try to save with null content (should fail validation)
        try {
            AnalysisRequest invalid = AnalysisRequest.create(testSubmissionId, null);
            repository.save(invalid);
            fail("Should have thrown exception");
        } catch (Exception e) {
            // Expected
        }

        // Then - Count should remain the same
        long countAfter = jpaRepository.count();
        assertThat(countAfter).isEqualTo(countBefore);
    }

    // ========================================
    // ✅ METADATA PERSISTENCE TESTS
    // ========================================



    // ========================================
    // ✅ SPECIAL CHARACTERS AND ENCODING TESTS
    // ========================================

    @Test
    @DisplayName("Should handle content with special characters")
    void shouldHandleContentWithSpecialCharacters() throws JsonProcessingException {
        // Given
        String specialContent = "Text with émojis 😀, symbols ©®™, and ñoñó";
        AnalysisRequest analysis = AnalysisRequest.create(testSubmissionId, specialContent);

        // When
        AnalysisRequest saved = repository.save(analysis);

        // Then
        Optional<AnalysisRequest> retrieved = repository.findById(saved.getId());

        assertThat(retrieved).isPresent();
        assertThat(retrieved.get().getContentToAnalyze()).isEqualTo(specialContent);
    }

    @Test
    @DisplayName("Should handle very long content")
    void shouldHandleVeryLongContent() throws JsonProcessingException {
        // Given
        String longContent = "A".repeat(50000);
        AnalysisRequest analysis = AnalysisRequest.create(testSubmissionId, longContent);

        // When
        AnalysisRequest saved = repository.save(analysis);

        // Then
        Optional<AnalysisRequest> retrieved = repository.findById(saved.getId());

        assertThat(retrieved).isPresent();
        assertThat(retrieved.get().getContentToAnalyze()).hasSize(50000);
    }

    // ========================================
    // 🔧 HELPER METHODS
    // ========================================

    private DetectionResult createDetectionResult() {
        List<DetectedSegment> segments = Arrays.asList(
                new DetectedSegment("AI segment 1", 0, 13, new BigDecimal("0.90"), "Pattern A"),
                new DetectedSegment("AI segment 2", 20, 33, new BigDecimal("0.80"), "Pattern B")
        );

        Map<String, Object> metadata = new HashMap<>();
        metadata.put("detected_language", "en");
        metadata.put("analysis_quality", "HIGH");

        return new DetectionResult(
                new AIProbability(new BigDecimal("0.85")),
                ModelType.ENSEMBLE,
                "Sample analyzed content",
                segments,
                metadata
        );
    }

    private DetectionResult createDetectionResultWithProbability(BigDecimal probability) {
        return new DetectionResult(
                new AIProbability(probability),
                ModelType.ENSEMBLE,
                "Content",
                Collections.emptyList(),
                Collections.emptyMap()
        );
    }
}