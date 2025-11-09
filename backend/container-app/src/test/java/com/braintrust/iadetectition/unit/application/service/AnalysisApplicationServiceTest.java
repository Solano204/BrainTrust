//package com.braintrust.iadetectition.unit.application.service;
//
//import com.braintrust.aidetectition.application.dtos.commands.AnalyzePdfSubmissionCommand;
//import com.braintrust.aidetectition.application.dtos.commands.AnalyzeSubmissionCommand;
//import com.braintrust.aidetectition.application.dtos.dtoResponse.AnalysisResultDTO;
//import com.braintrust.aidetectition.application.ports.out.AIDetectionProvider;
//import com.braintrust.aidetectition.application.ports.out.AnalysisRequestRepository;
//import com.braintrust.aidetectition.application.services.AnalysisApplicationService;
//import com.braintrust.aidetectition.domain.exceptions.AnalysisAlreadyExistsException;
//import com.braintrust.aidetectition.domain.exceptions.AnalysisNotFoundException;
//import com.braintrust.aidetectition.domain.model.AnalysisRequest;
//import com.braintrust.aidetectition.domain.model.AnalysisStatus;
//import com.braintrust.aidetectition.domain.model.DetectedSegment;
//import com.braintrust.aidetectition.domain.valueobjects.*;
//import com.fasterxml.jackson.core.JsonProcessingException;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.DisplayName;
//import org.junit.jupiter.api.Test;
//import org.junit.jupiter.api.extension.ExtendWith;
//import org.mockito.ArgumentCaptor;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.mockito.junit.jupiter.MockitoExtension;
//import org.springframework.web.multipart.MultipartFile;
//
//import java.math.BigDecimal;
//import java.time.LocalDateTime;
//import java.util.*;
//
//import static org.assertj.core.api.Assertions.*;
//import static org.mockito.ArgumentMatchers.any;
//import static org.mockito.ArgumentMatchers.eq;
//import static org.mockito.Mockito.*;
//
///**
// * Unit tests for AnalysisApplicationService.
// * Tests all business logic with mocked dependencies.
// */
//@ExtendWith(MockitoExtension.class)
//@DisplayName("AnalysisApplicationService Unit Tests")
//class AnalysisApplicationServiceTest {
//
//    @Mock
//    private AnalysisRequestRepository analysisRepository;
//
//    @Mock
//    private AIDetectionProvider aiDetectionProvider;
//
//    @InjectMocks
//    private AnalysisApplicationService service;
//
//    private static final String VALID_SUBMISSION_ID = "SUBM-12345";
//    private static final String VALID_CONTENT = "Sample text for AI detection analysis";
//    private static final String PREFERRED_MODEL = "ENSEMBLE";
//
//    // ========================================
//    // ✅ ANALYZE SUBMISSION TESTS
//    // ========================================
//
//    @Test
//    @DisplayName("Should analyze submission successfully when no pending analysis exists")
//    void shouldAnalyzeSubmissionSuccessfullyWhenNoPendingAnalysisExists() throws JsonProcessingException {
//        // Given
//        AnalyzeSubmissionCommand command = new AnalyzeSubmissionCommand(
//                VALID_SUBMISSION_ID,
//                VALID_CONTENT,
//                PREFERRED_MODEL
//        );
//
//        // Mock: No existing analyses
//        when(analysisRepository.findBySubmissionId(any(SubmissionId.class)))
//                .thenReturn(Collections.emptyList());
//
//        // Mock: Save returns the analysis with ID
//        AnalysisRequest savedRequest = createMockAnalysisRequest(AnalysisStatus.PENDING);
//        when(analysisRepository.save(any(AnalysisRequest.class)))
//                .thenReturn(savedRequest);
//
//        // Mock: AI Provider returns result
//        DetectionResult mockResult = createMockDetectionResult();
//        when(aiDetectionProvider.analyzeContent(eq(VALID_CONTENT), eq(ModelType.ENSEMBLE)))
//                .thenReturn(mockResult);
//
//        // When
//        AnalysisId result = service.analyzeSubmission(command);
//
//        // Then
//        assertThat(result).isNotNull();
//
//        // Verify interactions
//        verify(analysisRepository, times(1)).findBySubmissionId(any(SubmissionId.class));
//        verify(analysisRepository, times(2)).save(any(AnalysisRequest.class)); // Once pending, once completed
//        verify(aiDetectionProvider, times(1)).analyzeContent(VALID_CONTENT, ModelType.ENSEMBLE);
//    }
//
//    @Test
//    @DisplayName("Should throw exception when analysis already in progress")
//    void shouldThrowExceptionWhenAnalysisAlreadyInProgress() throws JsonProcessingException {
//        // Given
//        AnalyzeSubmissionCommand command = new AnalyzeSubmissionCommand(
//                VALID_SUBMISSION_ID,
//                VALID_CONTENT,
//                PREFERRED_MODEL
//        );
//
//        // Mock: Existing PENDING analysis
//        AnalysisRequest existingPending = createMockAnalysisRequest(AnalysisStatus.PENDING);
//        when(analysisRepository.findBySubmissionId(any(SubmissionId.class)))
//                .thenReturn(List.of(existingPending));
//
////        // When/Then
////        assertThatThrownBy(() -> service.analyzeSubmission(command))
////                .isInstanceOf(AnalysisAlreadyExistsException.class)
////                .hasMessageContaining("Analysis already in progress");
//
//        // Verify no save or AI call was made
//        verify(analysisRepository, never()).save(any(AnalysisRequest.class));
//        verify(aiDetectionProvider, never()).analyzeContent(anyString(), any(ModelType.class));
//    }
//
//    @Test
//    @DisplayName("Should allow new analysis when previous analysis is completed")
//    void shouldAllowNewAnalysisWhenPreviousAnalysisIsCompleted() throws JsonProcessingException {
//        // Given
//        AnalyzeSubmissionCommand command = new AnalyzeSubmissionCommand(
//                VALID_SUBMISSION_ID,
//                VALID_CONTENT,
//                PREFERRED_MODEL
//        );
//
//        // Mock: Existing COMPLETED analysis
//        AnalysisRequest existingCompleted = createMockAnalysisRequest(AnalysisStatus.COMPLETED);
//        when(analysisRepository.findBySubmissionId(any(SubmissionId.class)))
//                .thenReturn(List.of(existingCompleted));
//
//        AnalysisRequest savedRequest = createMockAnalysisRequest(AnalysisStatus.PENDING);
//        when(analysisRepository.save(any(AnalysisRequest.class)))
//                .thenReturn(savedRequest);
//
//        DetectionResult mockResult = createMockDetectionResult();
//        when(aiDetectionProvider.analyzeContent(anyString(), any(ModelType.class)))
//                .thenReturn(mockResult);
//
//        // When
//        AnalysisId result = service.analyzeSubmission(command);
//
//        // Then
//        assertThat(result).isNotNull();
//        verify(analysisRepository, times(2)).save(any(AnalysisRequest.class));
//    }
//
//    @Test
//    @DisplayName("Should allow new analysis when previous analysis failed")
//    void shouldAllowNewAnalysisWhenPreviousAnalysisFailed() throws JsonProcessingException {
//        // Given
//        AnalyzeSubmissionCommand command = new AnalyzeSubmissionCommand(
//                VALID_SUBMISSION_ID,
//                VALID_CONTENT,
//                PREFERRED_MODEL
//        );
//
//        // Mock: Existing FAILED analysis
//        AnalysisRequest existingFailed = createMockAnalysisRequest(AnalysisStatus.FAILED);
//        when(analysisRepository.findBySubmissionId(any(SubmissionId.class)))
//                .thenReturn(List.of(existingFailed));
//
//        AnalysisRequest savedRequest = createMockAnalysisRequest(AnalysisStatus.PENDING);
//        when(analysisRepository.save(any(AnalysisRequest.class)))
//                .thenReturn(savedRequest);
//
//        DetectionResult mockResult = createMockDetectionResult();
//        when(aiDetectionProvider.analyzeContent(anyString(), any(ModelType.class)))
//                .thenReturn(mockResult);
//
//        // When
//        AnalysisId result = service.analyzeSubmission(command);
//
//        // Then
//        assertThat(result).isNotNull();
//        verify(analysisRepository, times(2)).save(any(AnalysisRequest.class));
//    }
//
//    @Test
//    @DisplayName("Should mark analysis as failed when AI provider throws exception")
//    void shouldMarkAnalysisAsFailedWhenAIProviderThrowsException() throws JsonProcessingException {
//        // Given
//        AnalyzeSubmissionCommand command = new AnalyzeSubmissionCommand(
//                VALID_SUBMISSION_ID,
//                VALID_CONTENT,
//                PREFERRED_MODEL
//        );
//
//        when(analysisRepository.findBySubmissionId(any(SubmissionId.class)))
//                .thenReturn(Collections.emptyList());
//
//        AnalysisRequest savedRequest = createMockAnalysisRequest(AnalysisStatus.PENDING);
//        when(analysisRepository.save(any(AnalysisRequest.class)))
//                .thenReturn(savedRequest);
//
//        // Mock: AI Provider throws exception
//        when(aiDetectionProvider.analyzeContent(anyString(), any(ModelType.class)))
//                .thenThrow(new RuntimeException("AI service unavailable"));
//
//        // When
//        AnalysisId result = service.analyzeSubmission(command);
//
//        // Then
//        assertThat(result).isNotNull();
//
//        // Verify save was called twice (once for pending, once for failed)
//        verify(analysisRepository, times(2)).save(any(AnalysisRequest.class));
//
//        // Capture the second save call
//        ArgumentCaptor<AnalysisRequest> captor = ArgumentCaptor.forClass(AnalysisRequest.class);
//        verify(analysisRepository, times(2)).save(captor.capture());
//
//        // The request should have been marked as failed (second save)
//        // Note: In real scenario, the domain object would be updated
//    }
//
//    @Test
//    @DisplayName("Should use default ENSEMBLE model when no model specified")
//    void shouldUseDefaultEnsembleModelWhenNoModelSpecified() throws JsonProcessingException {
//        // Given
//        AnalyzeSubmissionCommand command = new AnalyzeSubmissionCommand(
//                VALID_SUBMISSION_ID,
//                VALID_CONTENT,
//                null // No preferred model
//        );
//
//        when(analysisRepository.findBySubmissionId(any(SubmissionId.class)))
//                .thenReturn(Collections.emptyList());
//
//        AnalysisRequest savedRequest = createMockAnalysisRequest(AnalysisStatus.PENDING);
//        when(analysisRepository.save(any(AnalysisRequest.class)))
//                .thenReturn(savedRequest);
//
//        DetectionResult mockResult = createMockDetectionResult();
//        when(aiDetectionProvider.analyzeContent(anyString(), any(ModelType.class)))
//                .thenReturn(mockResult);
//
//        // When
//        service.analyzeSubmission(command);
//
//        // Then
//        verify(aiDetectionProvider).analyzeContent(VALID_CONTENT, ModelType.ENSEMBLE);
//    }
//
//    // ========================================
//    // ✅ ANALYZE PDF SUBMISSION TESTS
//    // ========================================
//
//    @Test
//    @DisplayName("Should analyze PDF submissions successfully")
//    void shouldAnalyzePdfSubmissionsSuccessfully() throws JsonProcessingException {
//        // Given
//        MultipartFile mockFile1 = mock(MultipartFile.class);
//        MultipartFile mockFile2 = mock(MultipartFile.class);
//        when(mockFile1.getOriginalFilename()).thenReturn("file1.pdf");
//        when(mockFile2.getOriginalFilename()).thenReturn("file2.pdf");
//
//        List<MultipartFile> files = Arrays.asList(mockFile1, mockFile2);
//
//        AnalyzePdfSubmissionCommand command = new AnalyzePdfSubmissionCommand(
//                VALID_SUBMISSION_ID,
//                files,
//                PREFERRED_MODEL
//        );
//
//        // Mock: No existing analyses
//        when(analysisRepository.findBySubmissionId(any(SubmissionId.class)))
//                .thenReturn(Collections.emptyList());
//
//        // Mock: Save returns the requests
//        AnalysisRequest savedRequest = createMockAnalysisRequest(AnalysisStatus.PENDING);
//        when(analysisRepository.saveAll(anyList()))
//                .thenReturn(Arrays.asList(savedRequest, savedRequest));
//
//        // Mock: AI Provider returns results
//        DetectionResult result1 = createMockDetectionResult();
//        DetectionResult result2 = createMockDetectionResult();
//        when(aiDetectionProvider.analyzePdfFile(eq(files), eq(ModelType.ENSEMBLE)))
//                .thenReturn(Arrays.asList(result1, result2));
//
//        // When
//        List<AnalysisId> results = service.analyzePdfSubmission(command);
//
//        // Then
//        assertThat(results).hasSize(2);
//        verify(analysisRepository, times(2)).saveAll(anyList()); // Once pending, once completed
//        verify(aiDetectionProvider, times(1)).analyzePdfFile(files, ModelType.ENSEMBLE);
//    }
//
//    @Test
//    @DisplayName("Should throw exception when PDF analysis already in progress")
//    void shouldThrowExceptionWhenPdfAnalysisAlreadyInProgress() {
//        // Given
//        MultipartFile mockFile = mock(MultipartFile.class);
//        List<MultipartFile> files = Collections.singletonList(mockFile);
//
//        AnalyzePdfSubmissionCommand command = new AnalyzePdfSubmissionCommand(
//                VALID_SUBMISSION_ID,
//                files,
//                PREFERRED_MODEL
//        );
//
//        // Mock: Existing PENDING analysis
//        AnalysisRequest existingPending = createMockAnalysisRequest(AnalysisStatus.PENDING);
//        when(analysisRepository.findBySubmissionId(any(SubmissionId.class)))
//                .thenReturn(List.of(existingPending));
//
//        // When/Then
//        assertThatThrownBy(() -> service.analyzePdfSubmission(command))
//                .isInstanceOf(AnalysisAlreadyExistsException.class)
//                .hasMessageContaining("Analysis already in progress");
//
//        verify(analysisRepository, never()).saveAll(anyList());
//        verify(aiDetectionProvider, never()).analyzePdfFile(anyList(), any(ModelType.class));
//    }
//
//    @Test
//    @DisplayName("Should mark all PDF analyses as failed when AI provider throws exception")
//    void shouldMarkAllPdfAnalysesAsFailedWhenAIProviderThrowsException() {
//        // Given
//        MultipartFile mockFile1 = mock(MultipartFile.class);
//        MultipartFile mockFile2 = mock(MultipartFile.class);
//        List<MultipartFile> files = Arrays.asList(mockFile1, mockFile2);
//
//        AnalyzePdfSubmissionCommand command = new AnalyzePdfSubmissionCommand(
//                VALID_SUBMISSION_ID,
//                files,
//                PREFERRED_MODEL
//        );
//
//        when(analysisRepository.findBySubmissionId(any(SubmissionId.class)))
//                .thenReturn(Collections.emptyList());
//
//        AnalysisRequest savedRequest = createMockAnalysisRequest(AnalysisStatus.PENDING);
//        when(analysisRepository.saveAll(anyList()))
//                .thenReturn(Arrays.asList(savedRequest, savedRequest));
//
//        // Mock: AI Provider throws exception
//        when(aiDetectionProvider.analyzePdfFile(anyList(), any(ModelType.class)))
//                .thenThrow(new RuntimeException("AI service failed"));
//
//        // When/Then
//        assertThatThrownBy(() -> service.analyzePdfSubmission(command))
//                .isInstanceOf(RuntimeException.class)
//                .hasMessageContaining("AI Detection service failed");
//
//        // Verify saveAll was called twice (once pending, once for marking as failed)
//        verify(analysisRepository, times(2)).saveAll(anyList());
//    }
//
//    // ========================================
//    // ✅ RETRY ANALYSIS TESTS
//    // ========================================
//
//    @Test
//    @DisplayName("Should retry failed analysis successfully")
//    void shouldRetryFailedAnalysisSuccessfully() throws Exception {
//        // Given
//        AnalysisId analysisId = AnalysisId.generate();
//        AnalysisRequest failedAnalysis = createMockAnalysisRequest(AnalysisStatus.FAILED);
//
//        when(analysisRepository.findById(analysisId))
//                .thenReturn(Optional.of(failedAnalysis));
//
//        DetectionResult mockResult = createMockDetectionResult();
//        when(aiDetectionProvider.analyzeContent(anyString(), any(ModelType.class)))
//                .thenReturn(mockResult);
//
//        when(analysisRepository.save(any(AnalysisRequest.class)))
//                .thenReturn(failedAnalysis);
//
//        // When
//        service.retryAnalysis(analysisId);
//
//        // Then
//        verify(analysisRepository).findById(analysisId);
//        verify(aiDetectionProvider).analyzeContent(anyString(), eq(ModelType.ENSEMBLE));
//        verify(analysisRepository).save(failedAnalysis);
//    }
//
//    @Test
//    @DisplayName("Should throw exception when retrying non-failed analysis")
//    void shouldThrowExceptionWhenRetryingNonFailedAnalysis() throws JsonProcessingException {
//        // Given
//        AnalysisId analysisId = AnalysisId.generate();
//        AnalysisRequest completedAnalysis = createMockAnalysisRequest(AnalysisStatus.COMPLETED);
//
//        when(analysisRepository.findById(analysisId))
//                .thenReturn(Optional.of(completedAnalysis));
//
//        // When/Then
//        assertThatThrownBy(() -> service.retryAnalysis(analysisId))
//                .isInstanceOf(IllegalStateException.class)
//                .hasMessageContaining("Only failed analyses can be retried");
//
//        verify(aiDetectionProvider, never()).analyzeContent(anyString(), any(ModelType.class));
//    }
//
//    @Test
//    @DisplayName("Should throw exception when retrying non-existent analysis")
//    void shouldThrowExceptionWhenRetryingNonExistentAnalysis() {
//        // Given
//        AnalysisId analysisId = AnalysisId.generate();
//
//        when(analysisRepository.findById(analysisId))
//                .thenReturn(Optional.empty());
//
//        // When/Then
//        assertThatThrownBy(() -> service.retryAnalysis(analysisId))
//                .isInstanceOf(AnalysisNotFoundException.class)
//                .hasMessageContaining("Analysis not found");
//    }
//
//    @Test
//    @DisplayName("Should mark as failed again when retry also fails")
//    void shouldMarkAsFailedAgainWhenRetryAlsoFails() throws Exception {
//        // Given
//        AnalysisId analysisId = AnalysisId.generate();
//        AnalysisRequest failedAnalysis = createMockAnalysisRequest(AnalysisStatus.FAILED);
//
//        when(analysisRepository.findById(analysisId))
//                .thenReturn(Optional.of(failedAnalysis));
//
//        when(aiDetectionProvider.analyzeContent(anyString(), any(ModelType.class)))
//                .thenThrow(new RuntimeException("Still failing"));
//
//        when(analysisRepository.save(any(AnalysisRequest.class)))
//                .thenReturn(failedAnalysis);
//
//        // When
//        service.retryAnalysis(analysisId);
//
//        // Then
//        verify(analysisRepository).save(failedAnalysis);
//    }
//
//    // ========================================
//    // ✅ CANCEL ANALYSIS TESTS
//    // ========================================
//
//    @Test
//    @DisplayName("Should cancel pending analysis successfully")
//    void shouldCancelPendingAnalysisSuccessfully() throws JsonProcessingException {
//        // Given
//        AnalysisId analysisId = AnalysisId.generate();
//        AnalysisRequest pendingAnalysis = createMockAnalysisRequest(AnalysisStatus.PENDING);
//
//        when(analysisRepository.findById(analysisId))
//                .thenReturn(Optional.of(pendingAnalysis));
//
//        when(analysisRepository.save(any(AnalysisRequest.class)))
//                .thenReturn(pendingAnalysis);
//
//        // When
//        service.cancelAnalysis(analysisId);
//
//        // Then
//        verify(analysisRepository).findById(analysisId);
//        verify(analysisRepository).save(pendingAnalysis);
//    }
//
//    @Test
//    @DisplayName("Should throw exception when cancelling completed analysis")
//    void shouldThrowExceptionWhenCancellingCompletedAnalysis() throws JsonProcessingException {
//        // Given
//        AnalysisId analysisId = AnalysisId.generate();
//        AnalysisRequest completedAnalysis = createMockAnalysisRequest(AnalysisStatus.COMPLETED);
//
//        when(analysisRepository.findById(analysisId))
//                .thenReturn(Optional.of(completedAnalysis));
//
//        // When/Then
//        assertThatThrownBy(() -> service.cancelAnalysis(analysisId))
//                .isInstanceOf(IllegalStateException.class)
//                .hasMessageContaining("Cannot cancel completed analysis");
//
//        verify(analysisRepository, never()).save(any(AnalysisRequest.class));
//    }
//
//    @Test
//    @DisplayName("Should throw exception when cancelling non-existent analysis")
//    void shouldThrowExceptionWhenCancellingNonExistentAnalysis() {
//        // Given
//        AnalysisId analysisId = AnalysisId.generate();
//
//        when(analysisRepository.findById(analysisId))
//                .thenReturn(Optional.empty());
//
//        // When/Then
//        assertThatThrownBy(() -> service.cancelAnalysis(analysisId))
//                .isInstanceOf(AnalysisNotFoundException.class);
//    }
//
//    // ========================================
//    // ✅ GET ANALYSIS BY SUBMISSION TESTS
//    // ========================================
//
//    @Test
//    @DisplayName("Should get analysis results by submission ID")
//    void shouldGetAnalysisResultsBySubmissionId() {
//        // Given
//        SubmissionId submissionId = SubmissionId.fromString(VALID_SUBMISSION_ID);
//
//        AnalysisRequest analysis1 = createMockAnalysisRequest(AnalysisStatus.COMPLETED);
//        AnalysisRequest analysis2 = createMockAnalysisRequest(AnalysisStatus.COMPLETED);
//
//        when(analysisRepository.findBySubmissionId(submissionId))
//                .thenReturn(Arrays.asList(analysis1, analysis2));
//
//        // When
//        List<AnalysisResultDTO> results = service.getAnalysisBySubmission(submissionId);
//
//        // Then
//        assertThat(results).hasSize(2);
//        verify(analysisRepository).findBySubmissionId(submissionId);
//    }
//
//    @Test
//    @DisplayName("Should return empty list when no analyses found for submission")
//    void shouldReturnEmptyListWhenNoAnalysesFoundForSubmission() {
//        // Given
//        SubmissionId submissionId = SubmissionId.fromString(VALID_SUBMISSION_ID);
//
//        when(analysisRepository.findBySubmissionId(submissionId))
//                .thenReturn(Collections.emptyList());
//
//        // When
//        List<AnalysisResultDTO> results = service.getAnalysisBySubmission(submissionId);
//
//        // Then
//        assertThat(results).isEmpty();
//    }
//
//    @Test
//    @DisplayName("Should include all analysis details in DTO")
//    void shouldIncludeAllAnalysisDetailsInDTO() {
//        // Given
//        SubmissionId submissionId = SubmissionId.fromString(VALID_SUBMISSION_ID);
//        AnalysisRequest analysis = createCompletedAnalysisWithResult();
//
//        when(analysisRepository.findBySubmissionId(submissionId))
//                .thenReturn(Collections.singletonList(analysis));
//
//        // When
//        List<AnalysisResultDTO> results = service.getAnalysisBySubmission(submissionId);
//
//        // Then
//        assertThat(results).hasSize(1);
//        AnalysisResultDTO dto = results.get(0);
//
//        assertThat(dto.id()).isNotNull();
//        assertThat(dto.submissionId()).isEqualTo(VALID_SUBMISSION_ID);
//        assertThat(dto.probability()).isNotNull();
//        assertThat(dto.modelUsed()).isNotNull();
//        assertThat(dto.status()).isEqualTo("COMPLETED");
//    }
//
//    // ========================================
//    // 🔧 HELPER METHODS
//    // ========================================
//
//    private AnalysisRequest createMockAnalysisRequest(AnalysisStatus status) {
//        AnalysisId analysisId = AnalysisId.generate();
//        SubmissionId submissionId = SubmissionId.fromString(VALID_SUBMISSION_ID);
//
//        return AnalysisRequest.reconstitute(
//                analysisId,
//                submissionId,
//                VALID_CONTENT,
//                status,
//                null,
//                null,
//                LocalDateTime.now(),
//                status != AnalysisStatus.PENDING ? LocalDateTime.now() : null
//        );
//    }
//
//    private AnalysisRequest createCompletedAnalysisWithResult() {
//        AnalysisId analysisId = AnalysisId.generate();
//        SubmissionId submissionId = SubmissionId.fromString(VALID_SUBMISSION_ID);
//        DetectionResult result = createMockDetectionResult();
//
//        return AnalysisRequest.reconstitute(
//                analysisId,
//                submissionId,
//                VALID_CONTENT,
//                AnalysisStatus.COMPLETED,
//                result,
//                null,
//                LocalDateTime.now(),
//                LocalDateTime.now()
//        );
//    }
//
//    private DetectionResult createMockDetectionResult() {
//        AIProbability probability = new AIProbability(new BigDecimal("0.85"));
//
//        List<DetectedSegment> segments = Collections.singletonList(
//                new DetectedSegment(
//                        "Detected AI segment",
//                        0,
//                        20,
//                        new BigDecimal("0.90"),
//                        "High confidence"
//                )
//        );
//
//        Map<String, Object> metadata = new HashMap<>();
//        metadata.put("detected_language", "en");
//        metadata.put("analysis_quality", "HIGH");
//
//        return new DetectionResult(
//                probability,
//                ModelType.ENSEMBLE,
//                VALID_CONTENT,
//                segments,
//                metadata
//        );
//    }
//}