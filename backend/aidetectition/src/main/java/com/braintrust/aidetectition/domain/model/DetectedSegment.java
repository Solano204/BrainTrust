package com.braintrust.aidetectition.domain.model;
import com.braintrust.shared.domain.ValueObject;
import java.math.BigDecimal;

// 📍 aidetection/domain/valueobjects/DetectedSegment.java
public class DetectedSegment extends ValueObject {
    private final String text;
    private final int startIndex;
    private final int endIndex;
    private final BigDecimal aiProbability; // 0.0 - 1.0
    private final String reason; // Why this segment was flagged

    public DetectedSegment(String text, int startIndex, int endIndex,
                           BigDecimal aiProbability, String reason) {
        this.text = text;
        this.startIndex = startIndex;
        this.endIndex = endIndex;
        this.aiProbability = aiProbability;
        this.reason = reason;
    }

    public String getText() { return text; }
    public int getStartIndex() { return startIndex; }
    public int getEndIndex() { return endIndex; }
    public BigDecimal getAiProbability() { return aiProbability; }
    public String getReason() { return reason; }

    public boolean isHighConfidence() {
        return aiProbability.compareTo(new BigDecimal("0.7")) >= 0;
    }

    @Override
    protected Object[] getEqualityComponents() {
        return new Object[]{text, startIndex, endIndex, aiProbability};
    }
}