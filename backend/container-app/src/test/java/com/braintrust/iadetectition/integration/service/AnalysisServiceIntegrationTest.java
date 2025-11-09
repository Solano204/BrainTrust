//package com.braintrust.iadetectition.integration.service;
//
//
//import com.braintrust.aidetectition.application.dtos.commands.AnalyzePdfSubmissionCommand;
//import com.braintrust.aidetectition.application.dtos.commands.AnalyzeSubmissionCommand;
//import com.braintrust.aidetectition.application.dtos.dtoResponse.AnalysisResultDTO;
//import com.braintrust.aidetectition.application.ports.in.AnalysisService;
//import com.braintrust.aidetectition.application.ports.out.AIDetectionProvider;
//import com.braintrust.aidetectition.application.ports.out.AnalysisRequestRepository;
//import com.braintrust.aidetectition.domain.exceptions.AnalysisAlreadyExistsException;
//import com.braintrust.aidetectition.domain.exceptions.AnalysisNotFoundException;
//import com.braintrust.aidetectition.domain.model.AnalysisStatus;
//import com.braintrust.aidetectition.domain.model.DetectedSegment;
//import com.braintrust.aidetectition.domain.valueobjects.*;
//import com.braintrust.iadetectition.integration.config.BaseIntegrationTest;
//import com.fasterxml.jackson.core.JsonProcessingException;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.DisplayName;
//import org.junit.jupiter.api.Test;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.test.context.SpringBootTest;
//import org.springframework.mock.web.MockMultipartFile;
//import org.springframework.test.context.ActiveProfiles;
//import org.springframework.test.context.bean.override.mockito.MockitoBean;
//import org.springframework.transaction.annotation.Transactional;
//import org.springframework.web.multipart.MultipartFile;
//
//import java.math.BigDecimal;
//import java.util.*;
//
//import static org.assertj.core.api.Assertions.*;
//import static org.mockito.ArgumentMatchers.*;
//import static org.mockito.Mockito.*;
//
///**
// * End-to-end integration tests for AnalysisService.
// * Tests complete flow from command to database with real Spring context.
// */
//@SpringBootTest
//@ActiveProfiles("test")
//@Transactional
//@DisplayName("AnalysisService Integration Tests")
//class AnalysisServiceIntegrationTest extends BaseIntegrationTest {
//
//    @Autowired
//    private AnalysisService analysisService;
//
//    @Autowired
//    private AnalysisRequestRepository repository;
//
//    @MockitoBean
//    private AIDetectionProvider aiDetectionProvider;
//
//    private static final String VALID_SUBMISSION_ID = "SUBM-TEST-12345";
//    private static final String VALID_CONTENT = "This is sample text for AI detection analysis";
//
//    @BeforeEach
//    void setUp() {
//        // Clear any existing data
//        repository.findByStatus(AnalysisStatus.PENDING)
//                .forEach(repository::delete);
//        repository.findByStatus(AnalysisStatus.COMPLETED)
//                .forEach(repository::delete);
//        repository.findByStatus(AnalysisStatus.FAILED)
//                .forEach(repository::delete);
//    }
//
//    // ========================================
//    // ✅ ANALYZE SUBMISSION - FULL FLOW TESTS
//    // ========================================
//
//    @Test
//    @DisplayName("Should complete full analysis workflow successfully")
//    void shouldCompleteFullAnalysisWorkflowSuccessfully() throws JsonProcessingException {
//        // Given
//        AnalyzeSubmissionCommand command = new AnalyzeSubmissionCommand(
//                VALID_SUBMISSION_ID,
//                VALID_CONTENT,
//                "ENSEMBLE"
//        );
//
//        DetectionResult mockResult = createMockDetectionResult();
//        when(aiDetectionProvider.analyzeContent(eq(VALID_CONTENT), eq(ModelType.ENSEMBLE)))
//                .thenReturn(mockResult);
//
//        // When
//        AnalysisId analysisId = analysisService.analyzeSubmission(command);
//
//        // Then
//        assertThat(analysisId).isNotNull();
//
//        // Verify analysis was saved with COMPLETED status
//        List<AnalysisResultDTO> results = analysisService.getAnalysisBySubmission(
//                SubmissionId.fromString(VALID_SUBMISSION_ID)
//        );
//
//        assertThat(results).hasSize(1);
//        AnalysisResultDTO result = results.get(0);
//
//        assertThat(result.id()).isEqualTo(analysisId.getValue());
//        assertThat(result.submissionId()).isEqualTo(VALID_SUBMISSION_ID);
//        assertThat(result.status()).isEqualTo("COMPLETED");
//        assertThat(result.probability()).isNotNull();
//        assertThat(result.modelUsed()).isEqualTo("ENSEMBLE");
//        assertThat(result.isLikelyAI()).isTrue();
//        assertThat(result.detectedSegments()).hasSize(2);
//
//        verify(aiDetectionProvider, times(1))
//                .analyzeContent(VALID_CONTENT, ModelType.ENSEMBLE);
//    }
//
//    @Test
//    @DisplayName("Should prevent duplicate analysis for same submission")
//    void shouldPreventDuplicateAnalysisForSameSubmission() throws JsonProcessingException {
//        // Given
//        AnalyzeSubmissionCommand command = new AnalyzeSubmissionCommand(
//                VALID_SUBMISSION_ID,
//                VALID_CONTENT,
//                "ENSEMBLE"
//        );
//
//        // Mock: First analysis is pending
//        DetectionResult mockResult = createMockDetectionResult();
//        when(aiDetectionProvider.analyzeContent(anyString(), any(ModelType.class)))
//                .thenAnswer(invocation -> {
//                    Thread.sleep(100); // Simulate processing time
//                    return mockResult;
//                });
//
//        // When - First analysis
//        analysisService.analyzeSubmission(command);
//
//        // Try second analysis while first is still pending
//        // When/Then
//        assertThatThrownBy(() -> analysisService.analyzeSubmission(command))
//                .isInstanceOf(AnalysisAlreadyExistsException.class)
//                .hasMessageContaining("Analysis already in progress");
//    }
//
//    @Test
//    @DisplayName("Should allow retry after completed analysis")
//    void shouldAllowRetryAfterCompletedAnalysis() throws JsonProcessingException {
//        // Given
//        AnalyzeSubmissionCommand command = new AnalyzeSubmissionCommand(
//                VALID_SUBMISSION_ID,
//                VALID_CONTENT,
//                "ENSEMBLE"
//        );
//
//        DetectionResult mockResult = createMockDetectionResult();
//        when(aiDetectionProvider.analyzeContent(anyString(), any(ModelType.class)))
//                .thenReturn(mockResult);
//
//        // When - First analysis
//        AnalysisId firstAnalysisId = analysisService.analyzeSubmission(command);
//
//        // Second analysis (should be allowed since first is completed)
//        AnalysisId secondAnalysisId = analysisService.analyzeSubmission(command);
//
//        // Then
//        assertThat(secondAnalysisId).isNotEqualTo(firstAnalysisId);
//
//        // Verify both analyses exist
//        List<AnalysisResultDTO> results = analysisService.getAnalysisBySubmission(
//                SubmissionId.fromString(VALID_SUBMISSION_ID)
//        );
//
//        assertThat(results).hasSize(2);
//        assertThat(results).allMatch(r -> r.status().equals("COMPLETED"));
//    }
//
//    @Test
//    @DisplayName("Should mark analysis as failed when AI provider throws exception")
//    void shouldMarkAnalysisAsFailedWhenAIProviderThrowsException() throws JsonProcessingException {
//        // Given
//        AnalyzeSubmissionCommand command = new AnalyzeSubmissionCommand(
//                VALID_SUBMISSION_ID,
//                VALID_CONTENT,
//                "ENSEMBLE"
//        );
//
//        when(aiDetectionProvider.analyzeContent(anyString(), any(ModelType.class)))
//                .thenThrow(new RuntimeException("AI service unavailable"));
//
//        // When
//        AnalysisId analysisId = analysisService.analyzeSubmission(command);
//
//        // Then
//        List<AnalysisResultDTO> results = analysisService.getAnalysisBySubmission(
//                SubmissionId.fromString(VALID_SUBMISSION_ID)
//        );
//
//        assertThat(results).hasSize(1);
//        assertThat(results.get(0).status()).isEqualTo("FAILED");
//        assertThat(results.get(0).errorMessage()).contains("Analysis failed");
//    }
//
//    // ========================================
//    // ✅ ANALYZE PDF SUBMISSION - BATCH TESTS
//    // ========================================
//
//    @Test
//    @DisplayName("Should analyze multiple PDF files successfully")
//    void shouldAnalyzeMultiplePdfFilesSuccessfully() throws JsonProcessingException {
//        // Given
//        MultipartFile file1 = new MockMultipartFile(
//                "file1",
//                "document1.pdf",
//                "application/pdf",
//                "Content 1".getBytes()
//        );
//
//        MultipartFile file2 = new MockMultipartFile(
//                "file2",
//                "document2.pdf",
//                "application/pdf",
//                "Content 2".getBytes()
//        );
//
//        List<MultipartFile> files = Arrays.asList(file1, file2);
//
//        AnalyzePdfSubmissionCommand command = new AnalyzePdfSubmissionCommand(
//                VALID_SUBMISSION_ID,
//                files,
//                "ENSEMBLE"
//        );
//
//        DetectionResult result1 = createMockDetectionResult();
//        DetectionResult result2 = createMockDetectionResult();
//
//        when(aiDetectionProvider.analyzePdfFile(eq(files), eq(ModelType.ENSEMBLE)))
//                .thenReturn(Arrays.asList(result1, result2));
//
//        // When
//        List<AnalysisId> analysisIds = analysisService.analyzePdfSubmission(command);
//
//        // Then
//        assertThat(analysisIds).hasSize(2);
//
//        List<AnalysisResultDTO> results = analysisService.getAnalysisBySubmission(
//                SubmissionId.fromString(VALID_SUBMISSION_ID)
//        );
//
//        assertThat(results).hasSize(2);
//        assertThat(results).allMatch(r -> r.status().equals("COMPLETED"));
//
//        verify(aiDetectionProvider, times(1))
//                .analyzePdfFile(files, ModelType.ENSEMBLE);
//    }
//
//    @Test
//    @DisplayName("Should mark all PDF analyses as failed when provider fails")
//    void shouldMarkAllPdfAnalysesAsFailedWhenProviderFails() {
//        // Given
//        MultipartFile file1 = new MockMultipartFile(
//                "file1",
//                "document1.pdf",
//                "application/pdf",
//                "Content 1".getBytes()
//        );
//
//        List<MultipartFile> files = Collections.singletonList(file1);
//
//        AnalyzePdfSubmissionCommand command = new AnalyzePdfSubmissionCommand(
//                VALID_SUBMISSION_ID,
//                files,
//                "ENSEMBLE"
//        );
//
//        when(aiDetectionProvider.analyzePdfFile(anyList(), any(ModelType.class)))
//                .thenThrow(new RuntimeException("PDF processing failed"));
//
//        // When/Then
//        assertThatThrownBy(() -> analysisService.analyzePdfSubmission(command))
//                .isInstanceOf(RuntimeException.class)
//                .hasMessageContaining("AI Detection service failed");
//
//        // Verify analyses are marked as failed
//        List<AnalysisResultDTO> results = analysisService.getAnalysisBySubmission(
//                SubmissionId.fromString(VALID_SUBMISSION_ID)
//        );
//
//        assertThat(results).hasSize(1);
//        assertThat(results.get(0).status()).isEqualTo("FAILED");
//    }
//
//    // ========================================
//    // ✅ RETRY ANALYSIS TESTS
//    // ========================================
//
//    @Test
//    @DisplayName("Should retry failed analysis successfully")
//    void shouldRetryFailedAnalysisSuccessfully() throws Exception {
//        // Given - Create a failed analysis
//        AnalyzeSubmissionCommand command = new AnalyzeSubmissionCommand(
//                VALID_SUBMISSION_ID,
//                VALID_CONTENT,
//                "ENSEMBLE"
//        );
//
//        when(aiDetectionProvider.analyzeContent(anyString(), any(ModelType.class)))
//                .thenThrow(new RuntimeException("First failure"))
//                .thenReturn(createMockDetectionResult());
//
//        AnalysisId analysisId = analysisService.analyzeSubmission(command);
//
//        // Verify it failed
//        List<AnalysisResultDTO> beforeRetry = analysisService.getAnalysisBySubmission(
//                SubmissionId.fromString(VALID_SUBMISSION_ID)
//        );
//        assertThat(beforeRetry.get(0).status()).isEqualTo("FAILED");
//
//        // When - Retry
//        analysisService.retryAnalysis(analysisId);
//
//        // Then
//        List<AnalysisResultDTO> afterRetry = analysisService.getAnalysisBySubmission(
//                SubmissionId.fromString(VALID_SUBMISSION_ID)
//        );
//
//        assertThat(afterRetry.get(0).status()).isEqualTo("COMPLETED");
//        assertThat(afterRetry.get(0).errorMessage()).isNull();
//    }
//
//    @Test
//    @DisplayName("Should throw exception when retrying completed analysis")
//    void shouldThrowExceptionWhenRetryingCompletedAnalysis() throws JsonProcessingException {
//        // Given
//        AnalyzeSubmissionCommand command = new AnalyzeSubmissionCommand(
//                VALID_SUBMISSION_ID,
//                VALID_CONTENT,
//                "ENSEMBLE"
//        );
//
//        when(aiDetectionProvider.analyzeContent(anyString(), any(ModelType.class)))
//                .thenReturn(createMockDetectionResult());
//
//        AnalysisId analysisId = analysisService.analyzeSubmission(command);
//
//        // When/Then
//        assertThatThrownBy(() -> analysisService.retryAnalysis(analysisId))
//                .isInstanceOf(IllegalStateException.class)
//                .hasMessageContaining("Only failed analyses can be retried");
//    }
//
//    @Test
//    @DisplayName("Should throw exception when retrying non-existent analysis")
//    void shouldThrowExceptionWhenRetryingNonExistentAnalysis() {
//        // Given
//        AnalysisId nonExistentId = AnalysisId.generate();
//
//        // When/Then
//        assertThatThrownBy(() -> analysisService.retryAnalysis(nonExistentId))
//                .isInstanceOf(AnalysisNotFoundException.class)
//                .hasMessageContaining("Analysis not found");
//    }
//
//    // ========================================
//    // ✅ CANCEL ANALYSIS TESTS
//    // ========================================
//
//    @Test
//    @DisplayName("Should cancel pending analysis successfully")
//    void shouldCancelPendingAnalysisSuccessfully() throws JsonProcessingException, InterruptedException {
//        // Given - Create a pending analysis (mock slow processing)
//        AnalyzeSubmissionCommand command = new AnalyzeSubmissionCommand(
//                VALID_SUBMISSION_ID,
//                VALID_CONTENT,
//                "ENSEMBLE"
//        );
//
//        when(aiDetectionProvider.analyzeContent(anyString(), any(ModelType.class)))
//                .thenAnswer(invocation -> {
//                    Thread.sleep(5000); // Long processing
//                    return createMockDetectionResult();
//                });
//
//        // Start analysis in separate thread
//        AnalysisId[] analysisIdHolder = new AnalysisId[1];
//        Thread analysisThread = new Thread(() -> {
//            try {
//                analysisIdHolder[0] = analysisService.analyzeSubmission(command);
//            } catch (Exception e) {
//                // Expected if cancelled
//            }
//        });
//        analysisThread.start();
//
//        Thread.sleep(100); // Wait for analysis to start
//
//        // When - Cancel it
//        if (analysisIdHolder[0] != null) {
//            analysisService.cancelAnalysis(analysisIdHolder[0]);
//        }
//
//        analysisThread.join();
//
//        // Note: Due to async nature, this test might need adjustment
//        // based on actual implementation
//    }
//
//    @Test
//    @DisplayName("Should throw exception when cancelling completed analysis")
//    void shouldThrowExceptionWhenCancellingCompletedAnalysis() throws JsonProcessingException {
//        // Given
//        AnalyzeSubmissionCommand command = new AnalyzeSubmissionCommand(
//                VALID_SUBMISSION_ID,
//                VALID_CONTENT,
//                "ENSEMBLE"
//        );
//
//        when(aiDetectionProvider.analyzeContent(anyString(), any(ModelType.class)))
//                .thenReturn(createMockDetectionResult());
//
//        AnalysisId analysisId = analysisService.analyzeSubmission(command);
//
//        // When/Then
//        assertThatThrownBy(() -> analysisService.cancelAnalysis(analysisId))
//                .isInstanceOf(IllegalStateException.class)
//                .hasMessageContaining("Cannot cancel completed analysis");
//    }
//
//    // ========================================
//    // ✅ GET ANALYSIS TESTS
//    // ========================================
//
//    @Test
//    @DisplayName("Should retrieve all analyses for submission")
//    void shouldRetrieveAllAnalysesForSubmission() throws JsonProcessingException {
//        // Given
//        when(aiDetectionProvider.analyzeContent(anyString(), any(ModelType.class)))
//                .thenReturn(createMockDetectionResult());
//
//        // Create multiple analyses
//        for (int i = 0; i < 3; i++) {
//            AnalyzeSubmissionCommand command = new AnalyzeSubmissionCommand(
//                    VALID_SUBMISSION_ID,
//                    "Content " + i,
//                    "ENSEMBLE"
//            );
//            analysisService.analyzeSubmission(command);
//        }
//
//        // When
//        List<AnalysisResultDTO> results = analysisService.getAnalysisBySubmission(
//                SubmissionId.fromString(VALID_SUBMISSION_ID)
//        );
//
//        // Then
//        assertThat(results).hasSize(3);
//        assertThat(results).allMatch(r -> r.submissionId().equals(VALID_SUBMISSION_ID));
//    }
//
//    @Test
//    @DisplayName("Should return empty list when no analyses found")
//    void shouldReturnEmptyListWhenNoAnalysesFound() {
//        // Given
//        SubmissionId nonExistentId = SubmissionId.generate();
//
//        // When
//        List<AnalysisResultDTO> results = analysisService.getAnalysisBySubmission(nonExistentId);
//
//        // Then
//        assertThat(results).isEmpty();
//    }
//
//    // ========================================
//    // ✅ MODEL TYPE TESTS
//    // ========================================
//
//    @Test
//    @DisplayName("Should use specified model type")
//    void shouldUseSpecifiedModelType() throws JsonProcessingException {
//        // Given
//        AnalyzeSubmissionCommand command = new AnalyzeSubmissionCommand(
//                VALID_SUBMISSION_ID,
//                VALID_CONTENT,
//                "GPT_DETECTOR"
//        );
//
//        DetectionResult mockResult = createMockDetectionResult();
//        when(aiDetectionProvider.analyzeContent(eq(VALID_CONTENT), eq(ModelType.GPT_DETECTOR)))
//                .thenReturn(mockResult);
//
//        // When
//        analysisService.analyzeSubmission(command);
//
//        // Then
//        verify(aiDetectionProvider).analyzeContent(VALID_CONTENT, ModelType.GPT_DETECTOR);
//    }
//
//    @Test
//    @DisplayName("Should default to ENSEMBLE when no model specified")
//    void shouldDefaultToEnsembleWhenNoModelSpecified() throws JsonProcessingException {
//        // Given
//        AnalyzeSubmissionCommand command = new AnalyzeSubmissionCommand(
//                VALID_SUBMISSION_ID,
//                VALID_CONTENT,
//                null
//        );
//
//        DetectionResult mockResult = createMockDetectionResult();
//        when(aiDetectionProvider.analyzeContent(eq(VALID_CONTENT), eq(ModelType.ENSEMBLE)))
//                .thenReturn(mockResult);
//
//        // When
//        analysisService.analyzeSubmission(command);
//
//        // Then
//        verify(aiDetectionProvider).analyzeContent(VALID_CONTENT, ModelType.ENSEMBLE);
//    }
//
//    // ========================================
//    // 🔧 HELPER METHODS
//    // ========================================
//
//    private DetectionResult createMockDetectionResult() {
//        List<DetectedSegment> segments = Arrays.asList(
//                new DetectedSegment(
//                        "AI-generated segment",
//                        0,
//                        20,
//                        new BigDecimal("0.92"),
//                        "High confidence AI pattern"
//                ),
//                new DetectedSegment(
//                        "Another AI segment",
//                        30,
//                        49,
//                        new BigDecimal("0.85"),
//                        "Medium confidence pattern"
//                )
//        );
//
//        Map<String, Object> metadata = new HashMap<>();
//        metadata.put("detected_language", "en");
//        metadata.put("analysis_quality", "HIGH");
//        metadata.put("word_count", 100);
//
//        return new DetectionResult(
//                new AIProbability(new BigDecimal("0.85")),
//                ModelType.ENSEMBLE,
//                VALID_CONTENT,
//                segments,
//                metadata
//        );
//    }
//}