package com.braintrust.aidetectition.infraestructure.repositoriesPersistence.sql.repositories;

import com.braintrust.aidetectition.application.ports.out.AIDetectionProvider;
import com.braintrust.aidetectition.domain.model.DetectedSegment;
import com.braintrust.aidetectition.domain.valueobjects.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Component("pythonAIProvider")
@Slf4j
@Primary
public class PythonAIDetectionProvider implements AIDetectionProvider {

    @Value("${ai.python.analyze.url:http://localhost:8001/analyze}")
    private String analyzeApiUrl;

    @Value("${ai.python.extract.url:http://localhost:8000/extract}")
    private String extractApiUrl;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public PythonAIDetectionProvider() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    // ------------------------------------------------------------------
    // ✅ CORE ANALYSIS (Text Input)
    // ------------------------------------------------------------------

    @Override
    public DetectionResult analyzeContent(String content, ModelType modelType) {
        log.info("Starting Python AI analysis for content of length: {}", content.length());

        try {
            // Prepare request body
            Map<String, String> requestBody = new HashMap<>();
            requestBody.put("text", content);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, String>> request = new HttpEntity<>(requestBody, headers);

            // Call Python analyze API
            log.debug("Calling Python API at: {}", analyzeApiUrl);
            ResponseEntity<String> response = restTemplate.exchange(
                    analyzeApiUrl,
                    HttpMethod.POST,
                    request,
                    String.class
            );

            if (response.getStatusCode() == HttpStatus.OK) {
                return parseAnalysisResponse(response.getBody(), content, modelType);
            } else {
                log.error("Python API returned non-OK status: {}", response.getStatusCode());
                throw new RuntimeException("Analysis API failed with status: " + response.getStatusCode());
            }

        } catch (Exception e) {
            log.error("Error calling Python AI detection API", e);
            throw new RuntimeException("Failed to analyze content: " + e.getMessage(), e);
        }
    }

    // ------------------------------------------------------------------
    // ✅ FILE EXTRACTION (Single File)
    // ------------------------------------------------------------------

    @Override
    public String extractTextFromPdf(MultipartFile pdfFile) {
        log.info("Extracting text from PDF file: {}", pdfFile.getOriginalFilename());

        try {
            // Prepare multipart request
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", new ByteArrayResource(pdfFile.getBytes()) {
                @Override
                public String getFilename() {
                    return pdfFile.getOriginalFilename();
                }
            });

            HttpEntity<MultiValueMap<String, Object>> request = new HttpEntity<>(body, headers);

            // Call Python extract API
            log.debug("Calling Python extract API at: {}", extractApiUrl);
            ResponseEntity<String> response = restTemplate.exchange(
                    extractApiUrl,
                    HttpMethod.POST,
                    request,
                    String.class
            );

            if (response.getStatusCode() == HttpStatus.OK) {
                JsonNode jsonNode = objectMapper.readTree(response.getBody());

                String extractedText = jsonNode.get("text").asText();

                int wordCount = jsonNode.get("word_count").asInt();

                String method = jsonNode.get("method").asText();



                log.info("Text extracted successfully. Words: {}, Method: {}", wordCount, method);

                return extractedText;
            } else {
                log.error("Python extract API returned non-OK status: {}", response.getStatusCode());
                throw new RuntimeException("Extract API failed with status: " + response.getStatusCode());
            }

        } catch (Exception e) {
            log.error("Error extracting text from PDF", e);
            throw new RuntimeException("Failed to extract PDF text: " + e.getMessage(), e);
        }
    }

    // ------------------------------------------------------------------
    // ✅ FILE ANALYSIS (Multiple Files - NEW LOGIC)
    // ------------------------------------------------------------------

    /**
     * Analyzes a list of PDF files by extracting text and then analyzing content.
     */
    @Override
    public List<DetectionResult> analyzePdfFile(List<MultipartFile> pdfFiles, ModelType modelType) {
        List<DetectionResult> combinedResults = new ArrayList<>();
        log.info("Starting analysis for {} attached PDF files.", pdfFiles.size());

        for (MultipartFile pdfFile : pdfFiles) {
            try {
                if (pdfFile == null || pdfFile.isEmpty()) {
                    log.warn("Skipping empty or null file in the list.");
                    continue;
                }

                log.debug("Processing file: {}", pdfFile.getOriginalFilename());


                // 1. Extract text from the current PDF
                String extractedText = extractTextFromPdf(pdfFile);
                DetectionResult result = analyzeContent(extractedText, modelType);
                // 2. Analyze the extracted text
                // 3. FIX: Create a MUTABLE copy of the existing metadata map
                Map<String, Object> mutableMetadata = new HashMap<>(result.getMetadata());

// 4. Modify the mutable copy
                mutableMetadata.put("original_file_name", pdfFile.getOriginalFilename());

// 5. CRITICAL: Replace the existing immutable result object with a NEW one
// We must create a new DetectionResult instance with the new metadata.
                result = new DetectionResult(
                        result.getProbability(),
                        result.getModelUsed(),
                        result.getAnalyzedContent(),
                        result.getDetectedSegments(),
                        mutableMetadata // ⬅️ Pass the new, modified map
                );

                combinedResults.add(result);

            } catch (Exception e) {
                log.error("Failed to analyze PDF file {}. Skipping analysis for this file.",
                        pdfFile != null ? pdfFile.getOriginalFilename() : "Unknown", e);
                // Optionally: Add a failed/empty result for tracking
            }
        }

        log.info("Analysis complete. Processed {} files.", combinedResults.size());
        return combinedResults;
    }

    // ------------------------------------------------------------------
    // ✅ MISC METHODS
    // ------------------------------------------------------------------

    @Override
    public List<ModelType> getAvailableModels() {
        log.debug("Returning available models (Python-based)");
        return List.of(ModelType.ENSEMBLE, ModelType.GPT_DETECTOR, ModelType.BERT_CLASSIFIER);
    }

    @Override
    public ModelPerformance getModelPerformance(ModelType modelType) {
        log.debug("Getting performance metrics for model: {}", modelType);

        return new ModelPerformance(
                modelType,
                "1.0",
                new BigDecimal("0.89"),
                new BigDecimal("0.87"),
                new BigDecimal("0.88"),
                new BigDecimal("0.86"),
                true
        );
    }

    @Override
    public boolean isServiceAvailable() {
        try {
            log.trace("Checking Python AI service availability");
            ResponseEntity<String> response = restTemplate.getForEntity(
                    analyzeApiUrl.replace("/analyze", "/health"),
                    String.class
            );
            return response.getStatusCode() == HttpStatus.OK;
        } catch (Exception e) {
            log.warn("Python AI service is not available: {}", e.getMessage());
            return false;
        }
    }

    @Override
    public BigDecimal getServiceHealth() {
        if (isServiceAvailable()) {
            log.trace("Service health check: HEALTHY");
            return new BigDecimal("1.0");
        } else {
            log.trace("Service health check: UNHEALTHY");
            return BigDecimal.ZERO;
        }
    }

    // ------------------------------------------------------------------
    // ✅ PRIVATE HELPER METHODS (Unchanged)
    // ------------------------------------------------------------------

    private DetectionResult parseAnalysisResponse(String responseBody, String content, ModelType modelType) {
        // ... (Parsing logic remains the same) ...
        try {
            JsonNode jsonNode = objectMapper.readTree(responseBody);

            BigDecimal aiPercentage = new BigDecimal(jsonNode.get("ai_percentage").asText())
                    .divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP);
            AIProbability probability = new AIProbability(aiPercentage);

            String confidenceStr = jsonNode.get("confidence_level").asText();
            String confidenceLevel = mapConfidenceLevel(confidenceStr);

            List<DetectedSegment> detectedSegments = new ArrayList<>();
            if (jsonNode.has("ai_generated_parts") && jsonNode.get("ai_generated_parts").isArray()) {
                for (JsonNode partNode : jsonNode.get("ai_generated_parts")) {
                    String text = partNode.get("text").asText();
                    BigDecimal segmentProbability = new BigDecimal(partNode.get("ai_score").asText());
                    String reason = partNode.has("reason") ? partNode.get("reason").asText() : "AI pattern detected";

                    int startIndex = content.indexOf(text);
                    int endIndex = startIndex > -1 ? startIndex + text.length() : -1;

                    if (startIndex > -1) {
                        detectedSegments.add(new DetectedSegment(
                                text,
                                startIndex,
                                endIndex,
                                segmentProbability,
                                reason
                        ));
                    }
                }
            }

            Map<String, Object> metadata = new HashMap<>();
            metadata.put("verdict", jsonNode.get("verdict").asText());
            metadata.put("human_percentage", jsonNode.get("human_percentage").asText());
            metadata.put("detected_language", jsonNode.get("detected_language").asText());
            metadata.put("analysis_quality", jsonNode.get("analysis_quality").asText());

            if (jsonNode.has("detailed_metrics")) {
                JsonNode metricsNode = jsonNode.get("detailed_metrics");
                Map<String, Object> detailedMetrics = new HashMap<>();
                metricsNode.fields().forEachRemaining(entry -> {
                    if (!entry.getValue().isNull()) {
                        detailedMetrics.put(entry.getKey(), entry.getValue().asText());
                    }
                });
                metadata.put("detailed_metrics", detailedMetrics);
            }

            log.info("Analysis parsed successfully. AI Probability: {}%, Verdict: {}",
                    aiPercentage.multiply(new BigDecimal("100")), metadata.get("verdict"));

            return new DetectionResult(
                    probability,
                    modelType,
                    content,
                    detectedSegments,
                    metadata
            );

        } catch (Exception e) {
            log.error("Error parsing Python API response", e);
            throw new RuntimeException("Failed to parse analysis response: " + e.getMessage(), e);
        }
    }

    private String mapConfidenceLevel(String pythonConfidence) {
        return switch (pythonConfidence.toUpperCase()) {
            case "VERY_HIGH" -> "VERY_HIGH";
            case "HIGH" -> "HIGH";
            case "MEDIUM" -> "MEDIUN";
            case "LOW" -> "LOW";
            default -> "MEDIUM";
        };
    }
}