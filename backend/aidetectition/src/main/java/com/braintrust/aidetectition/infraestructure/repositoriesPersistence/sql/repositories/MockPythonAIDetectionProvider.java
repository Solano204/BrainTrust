package com.braintrust.aidetectition.infraestructure.repositoriesPersistence.sql.repositories;

import com.braintrust.aidetectition.application.ports.out.AIDetectionProvider;
import com.braintrust.aidetectition.domain.model.DetectedSegment;
import com.braintrust.aidetectition.domain.valueobjects.*;
import com.braintrust.aidetectition.infraestructure.repositoriesPersistence.sql.repositories.ModelPerformance;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;


@Component("MockPythonAIProvider")
@Primary
@Profile("!prod")
public class MockPythonAIDetectionProvider implements AIDetectionProvider {

    private static final Logger log = LoggerFactory.getLogger(MockPythonAIDetectionProvider.class);
    private final ObjectMapper objectMapper;
    private final Random random = new Random();

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
        log.info("MockPythonAIDetectionProvider initialized for testing (TEXT ONLY)");
    }

    @Override
    public DetectionResult analyzeContent(String content, ModelType modelType) {
        log.info("MOCK: Analyzing text content (length: {}) with model: {}", content.length(), modelType);

        simulateProcessingDelay(500, 1500);

        try {
            BigDecimal aiProbability = generateAIProbability(content);
            AIProbability probability = new AIProbability(aiProbability);

            List<DetectedSegment> detectedSegments = generateDetectedSegments(content, aiProbability);
            Map<String, Object> metadata = generateMockMetadata(content, aiProbability, modelType);

            log.info("MOCK: Analysis completed. AI Probability: {}%",
                    aiProbability.multiply(new BigDecimal("100")).setScale(2, RoundingMode.HALF_UP));

            return new DetectionResult(
                    probability,
                    modelType,
                    content,
                    detectedSegments,
                    metadata
            );

        } catch (Exception e) {
            log.error("MOCK: Error in mock analysis", e);
            throw new RuntimeException("Mock analysis failed: " + e.getMessage(), e);
        }
    }

    @Override
    public List<ModelType> getAvailableModels() {
        log.debug("MOCK: Returning available models");
        return List.of(ModelType.ENSEMBLE, ModelType.GPT_DETECTOR, ModelType.BERT_CLASSIFIER);
    }

    @Override
    public ModelPerformance getModelPerformance(ModelType modelType) {
        log.debug("MOCK: Getting performance for model: {}", modelType);
        return modelPerformanceMap.getOrDefault(modelType,
                new ModelPerformance(modelType, "1.0",
                        new BigDecimal("0.80"), new BigDecimal("0.78"),
                        new BigDecimal("0.79"), new BigDecimal("0.77"), true));
    }

    @Override
    public boolean isServiceAvailable() {
        log.trace("MOCK: Checking service availability");
        return random.nextDouble() > 0.1;
    }

    @Override
    public BigDecimal getServiceHealth() {
        boolean available = isServiceAvailable();
        BigDecimal health = available ?
                new BigDecimal("0.95").add(new BigDecimal(random.nextDouble() * 0.05)) : // 0.95-1.0
                new BigDecimal("0.0");

        log.debug("MOCK: Service health: {}", health);
        return health;
    }

    private void simulateProcessingDelay(int minMs, int maxMs) {
        try {
            int delay = minMs + random.nextInt(maxMs - minMs);
            Thread.sleep(delay);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.warn("MOCK: Processing delay interrupted");
        }
    }

    private BigDecimal generateAIProbability(String content) {
        int length = content.length();
        double baseProbability;

        if (length < 100) {
            baseProbability = 0.3 + random.nextDouble() * 0.4;
        } else if (length > 1000) {
            baseProbability = 0.1 + random.nextDouble() * 0.3;
        } else {
            baseProbability = 0.2 + random.nextDouble() * 0.6;
        }

        double variation = (random.nextDouble() - 0.5) * 0.2;
        double finalProbability = Math.max(0.0, Math.min(1.0, baseProbability + variation));

        return new BigDecimal(finalProbability).setScale(4, RoundingMode.HALF_UP);
    }

    private List<DetectedSegment> generateDetectedSegments(String content, BigDecimal aiProbability) {
        List<DetectedSegment> segments = new ArrayList<>();

        if (content.length() < 50) {
            return segments;
        }

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
            return content;
        }

        int segmentLength = content.length() / totalSegments;
        int start = segmentIndex * segmentLength;
        int end = Math.min(start + segmentLength, content.length());

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
        metadata.put("provider", "Mock AI Detector");

        detailedMetrics.put("perplexity", String.format("%.2f", 50 + random.nextDouble() * 100));
        detailedMetrics.put("burstiness", String.format("%.2f", random.nextDouble() * 2));
        detailedMetrics.put("confidence_score", String.format("%.2f", 0.7 + random.nextDouble() * 0.3));
        detailedMetrics.put("model_version", "mock-1.0");
        detailedMetrics.put("analysis_timestamp", new Date().toString());

        metadata.put("detailed_metrics", detailedMetrics);

        return metadata;
    }
}