package com.braintrust.aidetectition.infraestructure.repositoriesPersistence.sql.repositories;

import com.braintrust.aidetectition.application.ports.out.AIDetectionProvider;
import com.braintrust.aidetectition.domain.model.DetectedSegment;
import com.braintrust.aidetectition.domain.valueobjects.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.concurrent.*;
import java.util.stream.Collectors;

/**
 * ✅ MOCK IMPLEMENTATION for testing without Python service
 *
 * Simulates the behavior of the Python AI detection service
 * Returns realistic mock data for testing
 */
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

// other imports...

@Component("MockPythonAIProvider")
@Primary
public class MockPythonAIDetectionProvider implements AIDetectionProvider {

    private static final Logger log =
            LoggerFactory.getLogger(MockPythonAIDetectionProvider.class);
    private final ObjectMapper objectMapper;
    private final Random random = new Random();

    // Mock performance metrics for different models
    private final Map<ModelType, ModelPerformance> modelPerformanceMap = Map.of(
            ModelType.ENSEMBLE, new ModelPerformance(
                    ModelType.ENSEMBLE, "1.0",
                    new BigDecimal("0.89"), new BigDecimal("0.87"),
                    new BigDecimal("0.88"), new BigDecimal("0.86"), true
            ),
            ModelType.GPT_DETECTOR, new ModelPerformance(
                    ModelType.GPT_DETECTOR, "1.0",
                    new BigDecimal("0.85"), new BigDecimal("0.83"),
                    new BigDecimal("0.84"), new BigDecimal("0.82"), true
            ),
            ModelType.BERT_CLASSIFIER, new ModelPerformance(
                    ModelType.BERT_CLASSIFIER, "1.0",
                    new BigDecimal("0.82"), new BigDecimal("0.80"),
                    new BigDecimal("0.81"), new BigDecimal("0.79"), true
            )
    );

    public MockPythonAIDetectionProvider() {
        this.objectMapper = new ObjectMapper();
        log.info("✅ MockPythonAIDetectionProvider initialized for testing");
    }

    @Override
    public DetectionResult analyzeContent(String content, ModelType modelType) {
        log.info("🧪 MOCK: Analyzing content of length: {} with model: {}", content.length(), modelType);

        // Simulate API call delay
        simulateProcessingDelay(500, 1500);

        try {
            // Generate realistic mock analysis based on content
            BigDecimal aiProbability = generateAIProbability(content);
            AIProbability probability = new AIProbability(aiProbability);

            List<DetectedSegment> detectedSegments = generateDetectedSegments(content, aiProbability);
            Map<String, Object> metadata = generateMockMetadata(content, aiProbability, modelType);

            log.info("🧪 MOCK: Analysis completed. AI Probability: {}%",
                    aiProbability.multiply(new BigDecimal("100")).setScale(2, RoundingMode.HALF_UP));

            return new DetectionResult(
                    probability,
                    modelType,
                    content,
                    detectedSegments,
                    metadata
            );

        } catch (Exception e) {
            log.error("🧪 MOCK: Error in mock analysis", e);
            throw new RuntimeException("Mock analysis failed: " + e.getMessage(), e);
        }
    }

    @Override
    public String extractTextFromPdf(MultipartFile pdfFile) {
        log.info("🧪 MOCK: Extracting text from PDF: {}", pdfFile.getOriginalFilename());

        // Simulate PDF processing delay
        simulateProcessingDelay(1000, 3000);

        // Generate mock extracted text based on file name/size
        String mockText = generateMockPdfText(pdfFile);
        int wordCount = mockText.split("\\s+").length;

        log.info("🧪 MOCK: Text extracted successfully. Words: {}, Method: mock-ocr", wordCount);
        return mockText;
    }

    @Override
    public List<DetectionResult> analyzePdfFile(List<MultipartFile> pdfFiles, ModelType modelType) {
        long startTime = System.currentTimeMillis();
        log.info("🧪 MOCK: Starting PARALLEL analysis for {} PDF files", pdfFiles.size());

        try {
            // Use virtual threads for parallel processing simulation
            ExecutorService virtualExecutor = Executors.newVirtualThreadPerTaskExecutor();

            List<CompletableFuture<DetectionResult>> futures = pdfFiles.stream()
                    .filter(pdfFile -> pdfFile != null && !pdfFile.isEmpty())
                    .map(pdfFile -> CompletableFuture.supplyAsync(() -> {
                        try {
                            log.debug("🧪 MOCK: Processing file: {}", pdfFile.getOriginalFilename());

                            // 1. Extract text
                            String extractedText = extractTextFromPdf(pdfFile);

                            // 2. Analyze content
                            DetectionResult result = analyzeContent(extractedText, modelType);

                            // 3. Add file metadata
                            Map<String, Object> mutableMetadata = new HashMap<>(result.getMetadata());
                            mutableMetadata.put("original_file_name", pdfFile.getOriginalFilename());
                            mutableMetadata.put("file_size", pdfFile.getSize());
                            mutableMetadata.put("content_type", pdfFile.getContentType());

                            return new DetectionResult(
                                    result.getProbability(),
                                    result.getModelUsed(),
                                    result.getAnalyzedContent(),
                                    result.getDetectedSegments(),
                                    mutableMetadata
                            );

                        } catch (Exception e) {
                            log.error("🧪 MOCK: Failed to analyze PDF file: {}", pdfFile.getOriginalFilename(), e);
                            throw new CompletionException(e);
                        }
                    }, virtualExecutor))
                    .collect(Collectors.toList());

            // Wait for all completions
            List<DetectionResult> results = futures.stream()
                    .map(future -> {
                        try {
                            return future.get();
                        } catch (InterruptedException e) {
                            Thread.currentThread().interrupt();
                            log.error("🧪 MOCK: Analysis interrupted", e);
                            return null;
                        } catch (ExecutionException e) {
                            log.error("🧪 MOCK: Analysis failed", e.getCause());
                            return null;
                        }
                    })
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());

            long duration = System.currentTimeMillis() - startTime;
            log.info("🧪 MOCK: PARALLEL analysis completed in {}ms. Processed {} of {} files",
                    duration, results.size(), pdfFiles.size());

            virtualExecutor.shutdown();
            return results;

        } catch (Exception e) {
            log.error("🧪 MOCK: Parallel PDF analysis failed", e);
            throw new RuntimeException("Mock parallel analysis failed", e);
        }
    }

    @Override
    public List<ModelType> getAvailableModels() {
        log.debug("🧪 MOCK: Returning available models");
        return List.of(ModelType.ENSEMBLE, ModelType.GPT_DETECTOR, ModelType.BERT_CLASSIFIER);
    }

    @Override
    public ModelPerformance getModelPerformance(ModelType modelType) {
        log.debug("🧪 MOCK: Getting performance for model: {}", modelType);
        return modelPerformanceMap.getOrDefault(modelType,
                new ModelPerformance(modelType, "1.0",
                        new BigDecimal("0.80"), new BigDecimal("0.78"),
                        new BigDecimal("0.79"), new BigDecimal("0.77"), true));
    }

    @Override
    public boolean isServiceAvailable() {
        log.trace("🧪 MOCK: Checking service availability");
        // Simulate occasional service unavailability for testing
        return random.nextDouble() > 0.1; // 90% available
    }

    @Override
    public BigDecimal getServiceHealth() {
        boolean available = isServiceAvailable();
        BigDecimal health = available ?
                new BigDecimal("0.95").add(new BigDecimal(random.nextDouble() * 0.05)) : // 0.95-1.0
                new BigDecimal("0.0");

        log.debug("🧪 MOCK: Service health: {}", health);
        return health;
    }

    // ========================================
    // PRIVATE HELPER METHODS
    // ========================================

    private void simulateProcessingDelay(int minMs, int maxMs) {
        try {
            int delay = minMs + random.nextInt(maxMs - minMs);
            Thread.sleep(delay);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.warn("🧪 MOCK: Processing delay interrupted");
        }
    }

    private BigDecimal generateAIProbability(String content) {
        // Generate realistic AI probability based on content characteristics
        int length = content.length();
        double baseProbability;

        if (length < 100) {
            // Short content - more uncertain
            baseProbability = 0.3 + random.nextDouble() * 0.4;
        } else if (length > 1000) {
            // Long content - more likely to be human-written
            baseProbability = 0.1 + random.nextDouble() * 0.3;
        } else {
            // Medium content - varied
            baseProbability = 0.2 + random.nextDouble() * 0.6;
        }

        // Add some randomness but keep it realistic
        double variation = (random.nextDouble() - 0.5) * 0.2;
        double finalProbability = Math.max(0.0, Math.min(1.0, baseProbability + variation));

        return new BigDecimal(finalProbability).setScale(4, RoundingMode.HALF_UP);
    }

    private List<DetectedSegment> generateDetectedSegments(String content, BigDecimal aiProbability) {
        List<DetectedSegment> segments = new ArrayList<>();

        if (content.length() < 50) {
            return segments; // No segments for very short content
        }

        // Generate 0-3 segments based on AI probability
        int segmentCount = (int) (aiProbability.doubleValue() * 3);

        for (int i = 0; i < segmentCount; i++) {
            String segmentText = extractSegmentFromContent(content, i, segmentCount);
            if (segmentText != null && !segmentText.trim().isEmpty()) {
                BigDecimal segmentProb = aiProbability.add(
                        new BigDecimal((random.nextDouble() - 0.5) * 0.2)
                ).setScale(4, RoundingMode.HALF_UP);

                segmentProb = segmentProb.max(BigDecimal.ZERO).min(BigDecimal.ONE);

                int startIndex = content.indexOf(segmentText);
                int endIndex = startIndex + segmentText.length();

                String reason = generateAIDetectionReason();

                segments.add(new DetectedSegment(
                        segmentText,
                        startIndex,
                        endIndex,
                        segmentProb,
                        reason
                ));
            }
        }

        return segments;
    }

    private String extractSegmentFromContent(String content, int segmentIndex, int totalSegments) {
        if (content.length() < 100) {
            return content; // Return entire content for short texts
        }

        // Split content into roughly equal segments
        int segmentLength = content.length() / totalSegments;
        int start = segmentIndex * segmentLength;
        int end = Math.min(start + segmentLength, content.length());

        // Adjust to word boundaries
        while (start > 0 && !Character.isWhitespace(content.charAt(start))) {
            start--;
        }
        while (end < content.length() && !Character.isWhitespace(content.charAt(end))) {
            end++;
        }

        return content.substring(start, end).trim();
    }

    private String generateAIDetectionReason() {
        String[] reasons = {
                "Repetitive sentence structure detected",
                "Unusual word combinations",
                "Lack of semantic depth",
                "Pattern matching AI training data",
                "Statistical anomaly in word distribution",
                "Consistent formal tone without variation"
        };
        return reasons[random.nextInt(reasons.length)];
    }

    private Map<String, Object> generateMockMetadata(String content, BigDecimal aiProbability, ModelType modelType) {
        Map<String, Object> metadata = new HashMap<>();
        Map<String, Object> detailedMetrics = new HashMap<>();

        String verdict = aiProbability.compareTo(new BigDecimal("0.7")) > 0 ? "LIKELY_AI_GENERATED" :
                aiProbability.compareTo(new BigDecimal("0.3")) < 0 ? "LIKELY_HUMAN" : "UNCERTAIN";

        BigDecimal humanPercentage = BigDecimal.ONE.subtract(aiProbability);

        metadata.put("verdict", verdict);
        metadata.put("human_percentage", humanPercentage.setScale(4, RoundingMode.HALF_UP).toString());
        metadata.put("ai_percentage", aiProbability.setScale(4, RoundingMode.HALF_UP).toString());
        metadata.put("detected_language", "en");
        metadata.put("analysis_quality", "HIGH");
        metadata.put("word_count", content.split("\\s+").length);
        metadata.put("character_count", content.length());

        // Detailed metrics
        detailedMetrics.put("perplexity", String.format("%.2f", 50 + random.nextDouble() * 100));
        detailedMetrics.put("burstiness", String.format("%.2f", random.nextDouble() * 2));
        detailedMetrics.put("confidence_score", String.format("%.2f", 0.7 + random.nextDouble() * 0.3));
        detailedMetrics.put("model_version", "mock-1.0");

        metadata.put("detailed_metrics", detailedMetrics);

        return metadata;
    }

    private String generateMockPdfText(MultipartFile pdfFile) {
        String fileName = pdfFile.getOriginalFilename().toLowerCase();
        long fileSize = pdfFile.getSize();

        // Generate different content based on file name and size
        StringBuilder text = new StringBuilder();

        if (fileName.contains("academic") || fileName.contains("research")) {
            text.append("Abstract: This research paper examines the impact of artificial intelligence on modern educational systems. ");
            text.append("The study conducted a comprehensive analysis of AI-assisted learning tools across multiple institutions. ");
            text.append("Results indicate a significant improvement in student engagement metrics when appropriate AI tools are implemented. ");
            text.append("However, concerns regarding over-reliance on automated systems were also identified among educators. ");
            text.append("Future work should focus on developing balanced approaches that leverage AI while maintaining human oversight. ");
        } else if (fileName.contains("business") || fileName.contains("report")) {
            text.append("Quarterly Performance Report: The company demonstrated strong growth in Q3 with a 15% increase in revenue. ");
            text.append("Key performance indicators show improvement across all major departments. ");
            text.append("Marketing initiatives resulted in a 25% increase in customer acquisition. ");
            text.append("Operational efficiency improved by 12% through process automation. ");
            text.append("The outlook for Q4 remains positive with projected growth of 10-12%. ");
        } else if (fileName.contains("creative") || fileName.contains("story")) {
            text.append("The old house at the end of the street had stood empty for years, its windows like vacant eyes staring out at the world. ");
            text.append("Children whispered stories about ghosts and hidden treasures, but no one dared to venture inside. ");
            text.append("That is, until the summer of 1998, when the Johnson family decided to make it their home. ");
            text.append("Little did they know that the house held secrets that would change their lives forever. ");
        } else {
            text.append("This document contains important information regarding the subject matter. ");
            text.append("Multiple aspects have been considered in the preparation of this material. ");
            text.append("The content has been reviewed for accuracy and completeness. ");
            text.append("Readers should consider the context and applicability to their specific situation. ");
            text.append("Additional resources may be available for further clarification if needed. ");
        }

        // Add more content based on file size
        int targetWords = (int) (fileSize / 1000) + 50; // Rough word count based on file size
        while (text.toString().split("\\s+").length < targetWords && targetWords < 1000) {
            text.append("Additional content paragraph providing more details and explanations. ");
            text.append("This supplementary information helps to provide comprehensive coverage of the topic. ");
        }

        return text.toString();
    }
}