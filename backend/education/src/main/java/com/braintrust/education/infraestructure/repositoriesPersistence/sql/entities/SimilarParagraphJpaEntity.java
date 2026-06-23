package com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "plagiarism_similar_paragraphs", indexes = {
        @Index(name = "idx_simpar_check", columnList = "plagiarism_check_id")
})
public class SimilarParagraphJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plagiarism_check_id", nullable = false)
    private PlagiarismCheckJpaEntity plagiarismCheck;

    @Column(name = "paragraph_index", nullable = false)
    private int paragraphIndex;

    @Column(name = "original_text", columnDefinition = "TEXT")
    private String originalText;

    @Column(name = "matched_text", columnDefinition = "TEXT")
    private String matchedText;

    @Column(name = "similarity", precision = 5, scale = 2)
    private BigDecimal similarity;

    public SimilarParagraphJpaEntity() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public PlagiarismCheckJpaEntity getPlagiarismCheck() { return plagiarismCheck; }
    public void setPlagiarismCheck(PlagiarismCheckJpaEntity plagiarismCheck) { this.plagiarismCheck = plagiarismCheck; }

    public int getParagraphIndex() { return paragraphIndex; }
    public void setParagraphIndex(int paragraphIndex) { this.paragraphIndex = paragraphIndex; }

    public String getOriginalText() { return originalText; }
    public void setOriginalText(String originalText) { this.originalText = originalText; }

    public String getMatchedText() { return matchedText; }
    public void setMatchedText(String matchedText) { this.matchedText = matchedText; }

    public BigDecimal getSimilarity() { return similarity; }
    public void setSimilarity(BigDecimal similarity) { this.similarity = similarity; }
}
