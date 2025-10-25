package com.braintrust.aidetectition.infraestructure.repositoriesPersistence.sql.repositories;
// 📍 aidetection/infrastructure/ai/MockAIDetectionProvider.java

import com.braintrust.aidetectition.application.ports.out.AIDetectionProvider;
import com.braintrust.aidetectition.domain.valueobjects.AIProbability;
import com.braintrust.aidetectition.domain.valueobjects.DetectionResult;
import com.braintrust.aidetectition.domain.valueobjects.ModelType;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Component
public class MockAIDetectionProvider implements AIDetectionProvider {

    private final Random random = new Random();

    @Override
    public DetectionResult analyzeContent(String content, ModelType modelType) {
        // Mock implementation - simulates AI detection
        try {
            // Simulate processing delay
            Thread.sleep(1000);

            // Generate mock probability based on content length and keywords
            BigDecimal probability = calculateMockProbability(content);
            AIProbability aiProbability = new AIProbability(probability);

            Map<String, Object> metadata = new HashMap<>();
            metadata.put("contentLength", content.length());
            metadata.put("wordCount", content.split("\\s+").length);
            metadata.put("processingTimeMs", 1000);
            metadata.put("version", modelType.getVersion());

            return new DetectionResult(aiProbability, modelType, content, metadata);

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Analysis interrupted", e);
        }
    }

    @Override
    public List<ModelType> getAvailableModels() {
        return List.of(ModelType.values());
    }

    @Override
    public ModelPerformance getModelPerformance(ModelType modelType) {
        return new ModelPerformance(
                modelType,
                "1.0",
                new BigDecimal("0.92"),
                new BigDecimal("0.89"),
                new BigDecimal("0.91"),
                new BigDecimal("0.90"),
                true
        );
    }



    @Override
    public boolean isServiceAvailable() {
        return true;
    }

    @Override
    public BigDecimal getServiceHealth() {
        return new BigDecimal("0.99");
    }

    private BigDecimal calculateMockProbability(String content) {
        // Simple heuristic: longer, more formal content = higher AI probability
        int length = content.length();
        int wordCount = content.split("\\s+").length;

        double baseProbability = 0.5;

        // Adjust based on length
        if (length > 1000) baseProbability += 0.2;
        else if (length < 200) baseProbability -= 0.2;

        // Adjust based on AI-like patterns (just examples)
        if (content.contains("furthermore") || content.contains("moreover")) {
            baseProbability += 0.1;
        }
        if (content.contains("in conclusion") || content.contains("to summarize")) {
            baseProbability += 0.1;
        }

        // Add some randomness
        baseProbability += (random.nextDouble() - 0.5) * 0.2;

        // Clamp between 0 and 1
        baseProbability = Math.max(0.0, Math.min(1.0, baseProbability));

        return new BigDecimal(baseProbability).setScale(4, RoundingMode.HALF_UP);
    }
}