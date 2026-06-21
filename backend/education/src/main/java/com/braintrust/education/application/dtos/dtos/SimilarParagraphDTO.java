package com.braintrust.education.application.dtos.dtos;

public record SimilarParagraphDTO(
        int paragraphIndex,
        String originalText,
        String matchedText,
        String similarityPercentage,
        String segmentType
) {
    public SimilarParagraphDTO(int paragraphIndex, String originalText,
                               String matchedText, String similarityPercentage) {
        this(paragraphIndex, originalText, matchedText, similarityPercentage, null);
    }
}
