package com.braintrust.education.domain.valueobjects;

import com.braintrust.shared.domain.ValueObject;

import java.math.BigDecimal;

public class SimilarParagraph extends ValueObject {

    private final int paragraphIndex;
    private final String originalText;
    private final String matchedText;
    private final BigDecimal similarity;

    public SimilarParagraph(int paragraphIndex, String originalText, String matchedText, BigDecimal similarity) {
        this.paragraphIndex = paragraphIndex;
        this.originalText = originalText;
        this.matchedText = matchedText;
        this.similarity = similarity;
    }

    public int getParagraphIndex() { return paragraphIndex; }
    public String getOriginalText() { return originalText; }
    public String getMatchedText() { return matchedText; }
    public BigDecimal getSimilarity() { return similarity; }

    @Override
    protected Object[] getEqualityComponents() {
        return new Object[]{paragraphIndex, originalText, matchedText, similarity};
    }
}
