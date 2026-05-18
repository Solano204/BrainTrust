package com.braintrust.aidetectition.domain.valueobjects;

import com.braintrust.aidetectition.domain.model.DetectedSegment;
import com.braintrust.shared.domain.ValueObject;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class DetectionResult extends ValueObject {
    private final AIProbability probability;
    private final ModelType modelUsed;
    private final String analyzedContent;
    private final List<DetectedSegment> detectedSegments;
    private final Map<String, Object> metadata;

    public DetectionResult(AIProbability probability, ModelType modelUsed,
                           String analyzedContent, List<DetectedSegment> detectedSegments,
                           Map<String, Object> metadata) {
        this.probability = probability;
        this.modelUsed = modelUsed;
        this.analyzedContent = analyzedContent;
        this.detectedSegments = detectedSegments != null ? List.copyOf(detectedSegments) : List.of();
        this.metadata = metadata != null ? Map.copyOf(metadata) : Map.of();
    }

    public AIProbability getProbability() { return probability; }
    public ModelType getModelUsed() { return modelUsed; }
    public String getAnalyzedContent() { return analyzedContent; }
    public List<DetectedSegment> getDetectedSegments() { return List.copyOf(detectedSegments); }
    public Map<String, Object> getMetadata() { return Map.copyOf(metadata); }

    public boolean isLikelyAI() {
        return probability.isLikelyAI();
    }

    public String getConfidenceLevel() {
        if (probability.isLikelyAI()) return "HIGH";
        if (probability.isUncertain()) return "MEDIUM";
        return "LOW";
    }

    public int getHighConfidenceSegmentCount() {
        return (int) detectedSegments.stream()
                .filter(DetectedSegment::isHighConfidence)
                .count();
    }

    @Override
    protected Object[] getEqualityComponents() {
        return new Object[]{probability, modelUsed, analyzedContent, detectedSegments};
    }
}