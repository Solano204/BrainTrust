//package com.braintrust.iadetectition.unit.infraestructure.provider;
//
//
//import com.braintrust.aidetectition.domain.valueobjects.DetectionResult;
//import com.braintrust.aidetectition.domain.valueobjects.ModelType;
//import com.braintrust.aidetectition.infraestructure.repositoriesPersistence.sql.repositories.ModelPerformance;
//import com.braintrust.aidetectition.infraestructure.repositoriesPersistence.sql.repositories.PythonAIDetectionProvider;
//import com.fasterxml.jackson.databind.ObjectMapper;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.DisplayName;
//import org.junit.jupiter.api.Test;
//import org.junit.jupiter.api.extension.ExtendWith;
//import org.mockito.ArgumentCaptor;
//import org.mockito.Mock;
//import org.mockito.junit.jupiter.MockitoExtension;
//import org.springframework.http.*;
//import org.springframework.test.util.ReflectionTestUtils;
//import org.springframework.web.client.RestClientException;
//import org.springframework.web.client.RestTemplate;
//import org.springframework.web.multipart.MultipartFile;
//
//import java.math.BigDecimal;
//import java.util.Arrays;
//import java.util.List;
//
//import static org.assertj.core.api.Assertions.*;
//import static org.mockito.ArgumentMatchers.*;
//import static org.mockito.Mockito.*;
//
///**
// * Unit tests for PythonAIDetectionProvider.
// * Tests external API communication with mocked RestTemplate.
// */
//@ExtendWith(MockitoExtension.class)
//@DisplayName("PythonAIDetectionProvider Unit Tests")
//class PythonAIDetectionProviderTest {
//
//    @Mock
//    private RestTemplate restTemplate;
//
//    private PythonAIDetectionProvider provider;
//    private ObjectMapper objectMapper;
//
//    private static final String ANALYZE_URL = "http://localhost:8001/analyze";
//    private static final String EXTRACT_URL = "http://localhost:8000/extract";
//    private static final String HEALTH_URL = "http://localhost:8001/health";
//
//    @BeforeEach
//    void setUp() {
//        objectMapper = new ObjectMapper();
//        provider = new PythonAIDetectionProvider();
//
//        // Inject mocked dependencies using reflection
//        ReflectionTestUtils.setField(provider, "restTemplate", restTemplate);
//        ReflectionTestUtils.setField(provider, "objectMapper", objectMapper);
//        ReflectionTestUtils.setField(provider, "analyzeApiUrl", ANALYZE_URL);
//        ReflectionTestUtils.setField(provider, "extractApiUrl", EXTRACT_URL);
//    }
//
//    // ========================================
//    // ✅ ANALYZE CONTENT TESTS
//    // ========================================
//
//    @Test
//    @DisplayName("Should analyze content successfully and parse response")
//    void shouldAnalyzeContentSuccessfullyAndParseResponse() {
//        // Given
//        String content = "This is sample text to analyze";
//        String mockResponseJson = """
//                {
//                    "ai_percentage": "85.50",
//                    "human_percentage": "14.50",
//                    "verdict": "AI_GENERATED",
//                    "confidence_level": "HIGH",
//                    "detected_language": "en",
//                    "analysis_quality": "HIGH",
//                    "ai_generated_parts": [
//                        {
//                            "text": "sample text",
//                            "ai_score": "0.90",
//                            "reason": "High confidence pattern"
//                        }
//                    ]
//                }
//                """;
//
//        ResponseEntity<String> mockResponse = new ResponseEntity<>(mockResponseJson, HttpStatus.OK);
//
//        when(restTemplate.exchange(
//                eq(ANALYZE_URL),
//                eq(HttpMethod.POST),
//                any(HttpEntity.class),
//                eq(String.class)
//        )).thenReturn(mockResponse);
//
//        // When
//        DetectionResult result = provider.analyzeContent(content, ModelType.ENSEMBLE);
//
//        // Then
//        assertThat(result).isNotNull();
//        assertThat(result.getProbability().getValue()).isEqualByComparingTo("0.8550");
//        assertThat(result.getModelUsed()).isEqualTo(ModelType.ENSEMBLE);
//        assertThat(result.getAnalyzedContent()).isEqualTo(content);
//        assertThat(result.getDetectedSegments()).hasSize(1);
//        assertThat(result.getMetadata()).containsEntry("verdict", "AI_GENERATED");
//        assertThat(result.getMetadata()).containsEntry("detected_language", "en");
//
//        verify(restTemplate).exchange(
//                eq(ANALYZE_URL),
//                eq(HttpMethod.POST),
//                any(HttpEntity.class),
//                eq(String.class)
//        );
//    }
//
//    @Test
//    @DisplayName("Should send correct request body to Python API")
//    void shouldSendCorrectRequestBodyToPythonAPI() {
//        // Given
//        String content = "Test content";
//        String mockResponseJson = """
//                {
//                    "ai_percentage": "50.00",
//                    "human_percentage": "50.00",
//                    "verdict": "UNCERTAIN",
//                    "confidence_level": "MEDIUM",
//                    "detected_language": "en",
//                    "analysis_quality": "HIGH",
//                    "ai_generated_parts": []
//                }
//                """;
//
//        ResponseEntity<String> mockResponse = new ResponseEntity<>(mockResponseJson, HttpStatus.OK);
//
//        ArgumentCaptor<HttpEntity> requestCaptor = ArgumentCaptor.forClass(HttpEntity.class);
//
//        when(restTemplate.exchange(
//                eq(ANALYZE_URL),
//                eq(HttpMethod.POST),
//                requestCaptor.capture(),
//                eq(String.class)
//        )).thenReturn(mockResponse);
//
//        // When
//        provider.analyzeContent(content, ModelType.ENSEMBLE);
//
//        // Then
//        HttpEntity capturedRequest = requestCaptor.getValue();
//        assertThat(capturedRequest.getHeaders().getContentType()).isEqualTo(MediaType.APPLICATION_JSON);
//        // Body would be a Map<String, String> with "text" key
//    }
//
//    @Test
//    @DisplayName("Should handle API error response")
//    void shouldHandleApiErrorResponse() {
//        // Given
//        String content = "Test content";
//
//        ResponseEntity<String> errorResponse = new ResponseEntity<>(
//                "{\"error\": \"Service unavailable\"}",
//                HttpStatus.INTERNAL_SERVER_ERROR
//        );
//
//        when(restTemplate.exchange(
//                eq(ANALYZE_URL),
//                eq(HttpMethod.POST),
//                any(HttpEntity.class),
//                eq(String.class)
//        )).thenReturn(errorResponse);
//
//        // When/Then
//        assertThatThrownBy(() -> provider.analyzeContent(content, ModelType.ENSEMBLE))
//                .isInstanceOf(RuntimeException.class)
//                .hasMessageContaining("Analysis API failed with status");
//    }
//
//    @Test
//    @DisplayName("Should handle RestTemplate exception")
//    void shouldHandleRestTemplateException() {
//        // Given
//        String content = "Test content";
//
//        when(restTemplate.exchange(
//                eq(ANALYZE_URL),
//                eq(HttpMethod.POST),
//                any(HttpEntity.class),
//                eq(String.class)
//        )).thenThrow(new RestClientException("Connection refused"));
//
//        // When/Then
////        assertThatThrownBy(() -> provider.analyzeContent(content, ModelType.ENSEMBLE))
////                .isInstanceOf(RuntimeException.class)
////                .hasMessageContaining("Failed to analyze content");
//    }
//
//    @Test
//    @DisplayName("Should handle malformed JSON response")
//    void shouldHandleMalformedJsonResponse() {
//        // Given
//        String content = "Test content";
//        String malformedJson = "{invalid json}";
//
//        ResponseEntity<String> mockResponse = new ResponseEntity<>(malformedJson, HttpStatus.OK);
//
//        when(restTemplate.exchange(
//                eq(ANALYZE_URL),
//                eq(HttpMethod.POST),
//                any(HttpEntity.class),
//                eq(String.class)
//        )).thenReturn(mockResponse);
//
//        // When/Then
//        assertThatThrownBy(() -> provider.analyzeContent(content, ModelType.ENSEMBLE))
//                .isInstanceOf(RuntimeException.class)
//                .hasMessageContaining("Failed to parse analysis response");
//    }
//
//    @Test
//    @DisplayName("Should parse response with empty segments")
//    void shouldParseResponseWithEmptySegments() {
//        // Given
//        String content = "Test content";
//        String mockResponseJson = """
//                {
//                    "ai_percentage": "30.00",
//                    "human_percentage": "70.00",
//                    "verdict": "HUMAN_WRITTEN",
//                    "confidence_level": "LOW",
//                    "detected_language": "en",
//                    "analysis_quality": "HIGH",
//                    "ai_generated_parts": []
//                }
//                """;
//
//        ResponseEntity<String> mockResponse = new ResponseEntity<>(mockResponseJson, HttpStatus.OK);
//
//        when(restTemplate.exchange(
//                eq(ANALYZE_URL),
//                eq(HttpMethod.POST),
//                any(HttpEntity.class),
//                eq(String.class)
//        )).thenReturn(mockResponse);
//
//        // When
//        DetectionResult result = provider.analyzeContent(content, ModelType.ENSEMBLE);
//
//        // Then
//        assertThat(result.getDetectedSegments()).isEmpty();
//        assertThat(result.getProbability().getValue()).isEqualByComparingTo("0.3000");
//    }
//
//    @Test
//    @DisplayName("Should parse detailed metrics from response")
//    void shouldParseDetailedMetricsFromResponse() {
//        // Given
//        String content = "Test content";
//        String mockResponseJson = """
//                {
//                    "ai_percentage": "85.00",
//                    "human_percentage": "15.00",
//                    "verdict": "AI_GENERATED",
//                    "confidence_level": "HIGH",
//                    "detected_language": "en",
//                    "analysis_quality": "HIGH",
//                    "ai_generated_parts": [],
//                    "detailed_metrics": {
//                        "perplexity": "25.5",
//                        "burstiness": "0.42",
//                        "coherence_score": "0.88"
//                    }
//                }
//                """;
//
//        ResponseEntity<String> mockResponse = new ResponseEntity<>(mockResponseJson, HttpStatus.OK);
//
//        when(restTemplate.exchange(
//                eq(ANALYZE_URL),
//                eq(HttpMethod.POST),
//                any(HttpEntity.class),
//                eq(String.class)
//        )).thenReturn(mockResponse);
//
//        // When
//        DetectionResult result = provider.analyzeContent(content, ModelType.ENSEMBLE);
//
//        // Then
//        assertThat(result.getMetadata()).containsKey("detailed_metrics");
//    }
//
//    // ========================================
//    // ✅ EXTRACT TEXT FROM PDF TESTS
//    // ========================================
//
//    @Test
//    @DisplayName("Should extract text from PDF successfully")
//    void shouldExtractTextFromPdfSuccessfully() throws Exception {
//        // Given
//        MultipartFile mockFile = mock(MultipartFile.class);
//        when(mockFile.getOriginalFilename()).thenReturn("document.pdf");
//        when(mockFile.getBytes()).thenReturn("fake pdf bytes".getBytes());
//
//        String mockResponseJson = """
//                {
//                    "text": "Extracted text from PDF",
//                    "word_count": 150,
//                    "method": "pdfplumber"
//                }
//                """;
//
//        ResponseEntity<String> mockResponse = new ResponseEntity<>(mockResponseJson, HttpStatus.OK);
//
//        when(restTemplate.exchange(
//                eq(EXTRACT_URL),
//                eq(HttpMethod.POST),
//                any(HttpEntity.class),
//                eq(String.class)
//        )).thenReturn(mockResponse);
//
//        // When
//        String extractedText = provider.extractTextFromPdf(mockFile);
//
//        // Then
//        assertThat(extractedText).isEqualTo("Extracted text from PDF");
//
//        verify(restTemplate).exchange(
//                eq(EXTRACT_URL),
//                eq(HttpMethod.POST),
//                any(HttpEntity.class),
//                eq(String.class)
//        );
//    }
//
//    @Test
//    @DisplayName("Should send multipart request for PDF extraction")
//    void shouldSendMultipartRequestForPdfExtraction() throws Exception {
//        // Given
//        MultipartFile mockFile = mock(MultipartFile.class);
//        when(mockFile.getOriginalFilename()).thenReturn("test.pdf");
//        when(mockFile.getBytes()).thenReturn("pdf content".getBytes());
//
//        String mockResponseJson = """
//                {
//                    "text": "Text",
//                    "word_count": 10,
//                    "method": "pdfplumber"
//                }
//                """;
//
//        ResponseEntity<String> mockResponse = new ResponseEntity<>(mockResponseJson, HttpStatus.OK);
//
//        ArgumentCaptor<HttpEntity> requestCaptor = ArgumentCaptor.forClass(HttpEntity.class);
//
//        when(restTemplate.exchange(
//                eq(EXTRACT_URL),
//                eq(HttpMethod.POST),
//                requestCaptor.capture(),
//                eq(String.class)
//        )).thenReturn(mockResponse);
//
//        // When
//        provider.extractTextFromPdf(mockFile);
//
//        // Then
//        HttpEntity capturedRequest = requestCaptor.getValue();
//        assertThat(capturedRequest.getHeaders().getContentType()).isEqualTo(MediaType.MULTIPART_FORM_DATA);
//    }
//
//    @Test
//    @DisplayName("Should handle PDF extraction error")
//    void shouldHandlePdfExtractionError() throws Exception {
//        // Given
//        MultipartFile mockFile = mock(MultipartFile.class);
//        when(mockFile.getOriginalFilename()).thenReturn("document.pdf");
//        when(mockFile.getBytes()).thenReturn("fake pdf".getBytes());
//
//        ResponseEntity<String> errorResponse = new ResponseEntity<>(
//                "{\"error\": \"Corrupted PDF\"}",
//                HttpStatus.BAD_REQUEST
//        );
//
//        when(restTemplate.exchange(
//                eq(EXTRACT_URL),
//                eq(HttpMethod.POST),
//                any(HttpEntity.class),
//                eq(String.class)
//        )).thenReturn(errorResponse);
//
//        // When/Then
//        assertThatThrownBy(() -> provider.extractTextFromPdf(mockFile))
//                .isInstanceOf(RuntimeException.class)
//                .hasMessageContaining("Extract API failed with status");
//    }
//
//    @Test
//    @DisplayName("Should handle exception when reading file bytes")
//    void shouldHandleExceptionWhenReadingFileBytes() throws Exception {
//        // Given
//        MultipartFile mockFile = mock(MultipartFile.class);
//        when(mockFile.getBytes()).thenThrow(new java.io.IOException("Cannot read file"));
//
//        // When/Then
////        assertThatThrownBy(() -> provider.extractTextFromPdf(mockFile))
////                .isInstanceOf(RuntimeException.class)
////                .hasMessageContaining("Failed to extract PDF text");
//    }
//
//    // ========================================
//    // ✅ ANALYZE PDF FILE TESTS
//    // ========================================
//
//    @Test
//    @DisplayName("Should analyze multiple PDF files successfully")
//    void shouldAnalyzeMultiplePdfFilesSuccessfully() throws Exception {
//        // Given
//        MultipartFile mockFile1 = mock(MultipartFile.class);
//        MultipartFile mockFile2 = mock(MultipartFile.class);
//        when(mockFile1.getOriginalFilename()).thenReturn("file1.pdf");
//        when(mockFile2.getOriginalFilename()).thenReturn("file2.pdf");
//        when(mockFile1.getBytes()).thenReturn("pdf1".getBytes());
//        when(mockFile2.getBytes()).thenReturn("pdf2".getBytes());
//        when(mockFile1.isEmpty()).thenReturn(false);
//        when(mockFile2.isEmpty()).thenReturn(false);
//
//        List<MultipartFile> files = Arrays.asList(mockFile1, mockFile2);
//
//        // Mock extraction
//        String extractResponseJson = """
//                {
//                    "text": "Extracted text",
//                    "word_count": 100,
//                    "method": "pdfplumber"
//                }
//                """;
//        ResponseEntity<String> extractResponse = new ResponseEntity<>(extractResponseJson, HttpStatus.OK);
//
//        // Mock analysis
//        String analyzeResponseJson = """
//                {
//                    "ai_percentage": "75.00",
//                    "human_percentage": "25.00",
//                    "verdict": "AI_GENERATED",
//                    "confidence_level": "HIGH",
//                    "detected_language": "en",
//                    "analysis_quality": "HIGH",
//                    "ai_generated_parts": []
//                }
//                """;
//        ResponseEntity<String> analyzeResponse = new ResponseEntity<>(analyzeResponseJson, HttpStatus.OK);
//
//        when(restTemplate.exchange(
//                eq(EXTRACT_URL),
//                eq(HttpMethod.POST),
//                any(HttpEntity.class),
//                eq(String.class)
//        )).thenReturn(extractResponse);
//
//        when(restTemplate.exchange(
//                eq(ANALYZE_URL),
//                eq(HttpMethod.POST),
//                any(HttpEntity.class),
//                eq(String.class)
//        )).thenReturn(analyzeResponse);
//
//        // When
//        List<DetectionResult> results = provider.analyzePdfFile(files, ModelType.ENSEMBLE);
//
//        // Then
//        assertThat(results).hasSize(2);
//        assertThat(results.get(0).getMetadata()).containsEntry("original_file_name", "file1.pdf");
//        assertThat(results.get(1).getMetadata()).containsEntry("original_file_name", "file2.pdf");
//
//        verify(restTemplate, times(2)).exchange(
//                eq(EXTRACT_URL),
//                eq(HttpMethod.POST),
//                any(HttpEntity.class),
//                eq(String.class)
//        );
//
//        verify(restTemplate, times(2)).exchange(
//                eq(ANALYZE_URL),
//                eq(HttpMethod.POST),
//                any(HttpEntity.class),
//                eq(String.class)
//        );
//    }
//
//    @Test
//    @DisplayName("Should skip empty files when analyzing PDFs")
//    void shouldSkipEmptyFilesWhenAnalyzingPdfs() throws Exception {
//        // Given
//        MultipartFile emptyFile = mock(MultipartFile.class);
//        MultipartFile validFile = mock(MultipartFile.class);
//
//        when(emptyFile.isEmpty()).thenReturn(true);
//        when(validFile.isEmpty()).thenReturn(false);
//        when(validFile.getOriginalFilename()).thenReturn("valid.pdf");
//        when(validFile.getBytes()).thenReturn("content".getBytes());
//
//        List<MultipartFile> files = Arrays.asList(emptyFile, validFile);
//
//        // Mock responses for valid file only
//        String extractResponseJson = """
//                {
//                    "text": "Text",
//                    "word_count": 50,
//                    "method": "pdfplumber"
//                }
//                """;
//        ResponseEntity<String> extractResponse = new ResponseEntity<>(extractResponseJson, HttpStatus.OK);
//
//        String analyzeResponseJson = """
//                {
//                    "ai_percentage": "60.00",
//                    "human_percentage": "40.00",
//                    "verdict": "AI_GENERATED",
//                    "confidence_level": "MEDIUM",
//                    "detected_language": "en",
//                    "analysis_quality": "HIGH",
//                    "ai_generated_parts": []
//                }
//                """;
//        ResponseEntity<String> analyzeResponse = new ResponseEntity<>(analyzeResponseJson, HttpStatus.OK);
//
//        when(restTemplate.exchange(anyString(), any(), any(), eq(String.class)))
//                .thenReturn(extractResponse, analyzeResponse);
//
//        // When
//        List<DetectionResult> results = provider.analyzePdfFile(files, ModelType.ENSEMBLE);
//
//        // Then
//        assertThat(results).hasSize(1);
//    }
//
//    @Test
//    @DisplayName("Should continue processing other files when one fails")
//    void shouldContinueProcessingOtherFilesWhenOneFails() throws Exception {
//        // Given
//        MultipartFile failingFile = mock(MultipartFile.class);
//        MultipartFile successFile = mock(MultipartFile.class);
//
//        when(failingFile.isEmpty()).thenReturn(false);
//        when(failingFile.getOriginalFilename()).thenReturn("failing.pdf");
//        when(failingFile.getBytes()).thenThrow(new java.io.IOException("Read error"));
//
//        when(successFile.isEmpty()).thenReturn(false);
//        when(successFile.getOriginalFilename()).thenReturn("success.pdf");
//        when(successFile.getBytes()).thenReturn("content".getBytes());
//
//        List<MultipartFile> files = Arrays.asList(failingFile, successFile);
//
//        // Mock responses for successful file
//        String extractResponseJson = """
//                {
//                    "text": "Text",
//                    "word_count": 50,
//                    "method": "pdfplumber"
//                }
//                """;
//        ResponseEntity<String> extractResponse = new ResponseEntity<>(extractResponseJson, HttpStatus.OK);
//
//        String analyzeResponseJson = """
//                {
//                    "ai_percentage": "70.00",
//                    "human_percentage": "30.00",
//                    "verdict": "AI_GENERATED",
//                    "confidence_level": "HIGH",
//                    "detected_language": "en",
//                    "analysis_quality": "HIGH",
//                    "ai_generated_parts": []
//                }
//                """;
//        ResponseEntity<String> analyzeResponse = new ResponseEntity<>(analyzeResponseJson, HttpStatus.OK);
//
//        when(restTemplate.exchange(anyString(), any(), any(), eq(String.class)))
//                .thenReturn(extractResponse, analyzeResponse);
//
//        // When
//        List<DetectionResult> results = provider.analyzePdfFile(files, ModelType.ENSEMBLE);
//
//        // Then
//        assertThat(results).hasSize(1);
//        assertThat(results.get(0).getMetadata()).containsEntry("original_file_name", "success.pdf");
//    }
//
//    // ========================================
//    // ✅ GET AVAILABLE MODELS TESTS
//    // ========================================
//
//    @Test
//    @DisplayName("Should return all available models")
//    void shouldReturnAllAvailableModels() {
//        // When
//        List<ModelType> models = provider.getAvailableModels();
//
//        // Then
//        assertThat(models).hasSize(3);
//        assertThat(models).contains(ModelType.ENSEMBLE);
//        assertThat(models).contains(ModelType.GPT_DETECTOR);
//        assertThat(models).contains(ModelType.BERT_CLASSIFIER);
//    }
//
//    // ========================================
//    // ✅ GET MODEL PERFORMANCE TESTS
//    // ========================================
//
//    @Test
//    @DisplayName("Should return model performance metrics")
//    void shouldReturnModelPerformanceMetrics() {
//        // When
//        ModelPerformance performance = provider.getModelPerformance(ModelType.ENSEMBLE);
//
//        // Then
//        assertThat(performance).isNotNull();
//        assertThat(performance.getModelType()).isEqualTo(ModelType.ENSEMBLE);
//        assertThat(performance.getVersion()).isEqualTo("1.0");
//        assertThat(performance.getAccuracy()).isEqualByComparingTo("0.89");
//        assertThat(performance.isActive()).isTrue();
//    }
//
//    @Test
//    @DisplayName("Should return performance for all model types")
//    void shouldReturnPerformanceForAllModelTypes() {
//        for (ModelType modelType : ModelType.values()) {
//            // When
//            ModelPerformance performance = provider.getModelPerformance(modelType);
//
//            // Then
//            assertThat(performance).isNotNull();
//            assertThat(performance.getModelType()).isEqualTo(modelType);
//        }
//    }
//
//    // ========================================
//    // ✅ SERVICE AVAILABILITY TESTS
//    // ========================================
//
//    @Test
//    @DisplayName("Should return true when service is available")
//    void shouldReturnTrueWhenServiceIsAvailable() {
//        // Given
//        ResponseEntity<String> mockResponse = new ResponseEntity<>("OK", HttpStatus.OK);
//
//        when(restTemplate.getForEntity(HEALTH_URL, String.class))
//                .thenReturn(mockResponse);
//
//        // When
//        boolean isAvailable = provider.isServiceAvailable();
//
//        // Then
//        assertThat(isAvailable).isTrue();
//    }
//
//    @Test
//    @DisplayName("Should return false when service is unavailable")
//    void shouldReturnFalseWhenServiceIsUnavailable() {
//        // Given
//        when(restTemplate.getForEntity(HEALTH_URL, String.class))
//                .thenThrow(new RestClientException("Connection refused"));
//
//        // When
//        boolean isAvailable = provider.isServiceAvailable();
//
//        // Then
//        assertThat(isAvailable).isFalse();
//    }
//
//    @Test
//    @DisplayName("Should return false when health check returns non-OK status")
//    void shouldReturnFalseWhenHealthCheckReturnsNonOkStatus() {
//        // Given
//        ResponseEntity<String> mockResponse = new ResponseEntity<>(
//                "Service degraded",
//                HttpStatus.SERVICE_UNAVAILABLE
//        );
//
//        when(restTemplate.getForEntity(HEALTH_URL, String.class))
//                .thenReturn(mockResponse);
//
//        // When
//        boolean isAvailable = provider.isServiceAvailable();
//
//        // Then
//        assertThat(isAvailable).isFalse();
//    }
//
//    // ========================================
//    // ✅ SERVICE HEALTH TESTS
//    // ========================================
//
//    @Test
//    @DisplayName("Should return 1.0 health when service is available")
//    void shouldReturn10HealthWhenServiceIsAvailable() {
//        // Given
//        ResponseEntity<String> mockResponse = new ResponseEntity<>("OK", HttpStatus.OK);
//
//        when(restTemplate.getForEntity(HEALTH_URL, String.class))
//                .thenReturn(mockResponse);
//
//        // When
//        BigDecimal health = provider.getServiceHealth();
//
//        // Then
//        assertThat(health).isEqualByComparingTo("1.0");
//    }
//
//    @Test
//    @DisplayName("Should return 0.0 health when service is unavailable")
//    void shouldReturn00HealthWhenServiceIsUnavailable() {
//        // Given
//        when(restTemplate.getForEntity(HEALTH_URL, String.class))
//                .thenThrow(new RestClientException("Connection refused"));
//
//        // When
//        BigDecimal health = provider.getServiceHealth();
//
//        // Then
//        assertThat(health).isEqualByComparingTo("0.0");
//    }
//}