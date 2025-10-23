package com.braintrust.aidetectition.domain.valueobjects;

import com.braintrust.shared.domain.ValueObject;

import java.time.LocalDateTime;
import java.util.Map;

// 📍 aidetection/domain/model/DetectionResult.java - VALUE OBJECT
public class DetectionResult extends ValueObject {
    private final AIProbability probability;
    private final ModelType modelUsed;
    private final String analyzedContent;
    private final Map<String, Object> metadata;

    public DetectionResult(AIProbability probability, ModelType modelUsed,
                           String analyzedContent, Map<String, Object> metadata) {
        this.probability = probability;
        this.modelUsed = modelUsed;
        this.analyzedContent = analyzedContent;
        this.metadata = metadata != null ? Map.copyOf(metadata) : Map.of();
    }

    // Getters
    public AIProbability getProbability() { return probability; }
    public ModelType getModelUsed() { return modelUsed; }
    public String getAnalyzedContent() { return analyzedContent; }
    public Map<String, Object> getMetadata() { return Map.copyOf(metadata); }

    public boolean isLikelyAI() {
        return probability.isLikelyAI();
    }

    public String getConfidenceLevel() {
        if (probability.isLikelyAI()) return "HIGH";
        if (probability.isUncertain()) return "MEDIUM";
        return "LOW";
    }

    @Override
    protected Object[] getEqualityComponents() {
        return new Object[]{probability, modelUsed, analyzedContent};
    }
}