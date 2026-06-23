package com.braintrust.education.application.helpers.plagiarism;

import com.braintrust.education.domain.valueobjects.SimilarParagraph;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Component
public class TextSimilarityEngine {

    private static final Logger log = LoggerFactory.getLogger(TextSimilarityEngine.class);

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${google.ai.api-key}")
    private String apiKey;

    @Value("${google.ai.ai-detection-model:gemini-2.5-flash}")
    private String model;

    @Value("${plagiarism.similarity-threshold:40.0}")
    private double similarityThreshold;

    public record PlagiarismAnalysis(BigDecimal overallSimilarity, List<SimilarParagraph> similarParagraphs) {}

    public PlagiarismAnalysis analyze(String sourceText, String comparedText) {
        if (sourceText == null || comparedText == null
                || sourceText.isBlank() || comparedText.isBlank()) {
            return new PlagiarismAnalysis(BigDecimal.ZERO, List.of());
        }

        try {
            String prompt = buildSemanticComparisonPrompt(sourceText, comparedText);
            String response = callGemini(prompt);
            String cleaned = cleanJson(response);
            Map<String, Object> json = objectMapper.readValue(cleaned, new TypeReference<>() {});

            BigDecimal overall = BigDecimal.ZERO;
            Object overallObj = json.get("overall_similarity");
            if (overallObj instanceof Number n) {
                double val = Math.max(0, Math.min(100, n.doubleValue()));
                overall = BigDecimal.valueOf(val).setScale(2, RoundingMode.HALF_UP);
            }

            List<SimilarParagraph> paragraphs = parseSimilarPairs(json);
            return new PlagiarismAnalysis(overall, paragraphs);

        } catch (Exception e) {
            log.warn("Gemini similarity analysis failed, falling back to Jaccard: {}", e.getMessage());
            double score = jaccardSimilarity(normalize(sourceText), normalize(comparedText));
            return new PlagiarismAnalysis(
                    BigDecimal.valueOf(score * 100).setScale(2, RoundingMode.HALF_UP),
                    fallbackJaccard(sourceText, comparedText)
            );
        }
    }

    // ── Gemini prompt ────────────────────────────────────────────────────────

    private String buildSemanticComparisonPrompt(String source, String compared) {
        return String.format("""
            You are an academic plagiarism detection expert specializing in SEMANTIC similarity.
            Your task is to find paragraph pairs that express the SAME idea, argument, or information, even when they use different words, synonyms, or sentence structure.

            This includes:
            - Paraphrasing (different words, same meaning)
            - Synonym substitution
            - Sentence restructuring
            - Translation of the same idea

            SOURCE SUBMISSION:
            ---
            %s
            ---

            COMPARED SUBMISSION:
            ---
            %s
            ---

            Find ALL paragraph pairs where the MEANING is similar, regardless of exact wording.
            For each similar pair, extract the EXACT text from each submission.

            RESPONSE FORMAT (strict JSON, no markdown, no extra text):
            {
                "overall_similarity": 65.5,
                "similar_pairs": [
                    {
                        "source_paragraph": "exact text from SOURCE SUBMISSION",
                        "compared_paragraph": "exact text from COMPARED SUBMISSION",
                        "semantic_similarity": 85.0,
                        "reason": "Both paragraphs explain the same concept using different vocabulary"
                    }
                ]
            }

            If no semantically similar pairs are found, return:
            {"overall_similarity": 0.0, "similar_pairs": []}

            RULES:
            - Do NOT match paragraphs just because they share common words.
            - Only match when the CORE MEANING or ARGUMENT is the same.
            - semantic_similarity is 0-100.
            - Return ONLY valid JSON.
            """, source, compared);
    }

    @SuppressWarnings("unchecked")
    private List<SimilarParagraph> parseSimilarPairs(Map<String, Object> json) {
        try {
            Object pairsObj = json.get("similar_pairs");
            if (!(pairsObj instanceof List)) return List.of();

            List<Map<String, Object>> pairs = (List<Map<String, Object>>) pairsObj;
            List<SimilarParagraph> results = new ArrayList<>();

            for (int i = 0; i < pairs.size(); i++) {
                Map<String, Object> pair = pairs.get(i);
                String src = (String) pair.get("source_paragraph");
                String cmp = (String) pair.get("compared_paragraph");
                Object simObj = pair.get("semantic_similarity");
                String reason = (String) pair.getOrDefault("reason", "Semantic similarity detected");

                if (src == null || cmp == null || simObj == null) continue;

                double sim = ((Number) simObj).doubleValue();
                if (sim < similarityThreshold) continue;

                results.add(new SimilarParagraph(
                        i,
                        truncate(src, 500),
                        truncate(cmp, 500),
                        BigDecimal.valueOf(sim).setScale(2, RoundingMode.HALF_UP)
                ));
            }

            return results;

        } catch (Exception e) {
            log.error("Failed to parse Gemini semantic response: {}", e.getMessage());
            return List.of();
        }
    }

    // ── Gemini HTTP call ─────────────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    private String callGemini(String prompt) {
        String url = String.format(
                "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s",
                model, apiKey);

        Map<String, Object> body = new HashMap<>();
        body.put("contents", List.of(Map.of("parts", List.of(Map.of("text", prompt)))));
        body.put("generationConfig", Map.of(
                "temperature", 0.1,
                "maxOutputTokens", 16384,
                "topP", 0.8
        ));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        ResponseEntity<Map> resp = restTemplate.postForEntity(
                url, new HttpEntity<>(body, headers), Map.class);

        List<Map<String, Object>> candidates =
                (List<Map<String, Object>>) resp.getBody().get("candidates");
        if (candidates == null || candidates.isEmpty()) return "{}";

        Map<String, Object> candidate = candidates.get(0);
        String finishReason = (String) candidate.get("finishReason");
        if ("MAX_TOKENS".equals(finishReason)) {
            log.warn("Gemini response truncated (MAX_TOKENS), falling back to Jaccard");
            return "{}";
        }

        Map<String, Object> content = (Map<String, Object>) candidate.get("content");
        if (content == null) return "{}";

        List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
        if (parts == null || parts.isEmpty()) return "{}";

        String text = (String) parts.get(0).get("text");
        return text != null ? text.trim() : "{}";
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private String cleanJson(String raw) {
        String s = raw.trim();
        if (s.startsWith("```json")) s = s.substring(7);
        else if (s.startsWith("```")) s = s.substring(3);
        if (s.endsWith("```")) s = s.substring(0, s.length() - 3);
        return s.trim();
    }

    private String truncate(String text, int max) {
        return text.length() <= max ? text : text.substring(0, max - 3) + "...";
    }

    private String normalize(String text) {
        return text.toLowerCase()
                .replaceAll("[^a-z0-9áéíóúüñ\\s]", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }

    private double jaccardSimilarity(String a, String b) {
        Set<String> setA = new HashSet<>(Arrays.asList(a.split("\\s+")));
        Set<String> setB = new HashSet<>(Arrays.asList(b.split("\\s+")));
        if (setA.isEmpty() && setB.isEmpty()) return 1.0;
        if (setA.isEmpty() || setB.isEmpty()) return 0.0;
        Set<String> intersection = new HashSet<>(setA);
        intersection.retainAll(setB);
        Set<String> union = new HashSet<>(setA);
        union.addAll(setB);
        return (double) intersection.size() / union.size();
    }

    private List<SimilarParagraph> fallbackJaccard(String sourceText, String comparedText) {
        List<String> srcParagraphs = splitIntoParagraphs(sourceText);
        List<String> cmpParagraphs = splitIntoParagraphs(comparedText);
        List<SimilarParagraph> results = new ArrayList<>();

        for (int i = 0; i < srcParagraphs.size(); i++) {
            String src = srcParagraphs.get(i);
            if (src.length() < 80) continue;
            double best = 0;
            String bestMatch = null;
            for (String cmp : cmpParagraphs) {
                if (cmp.length() < 80) continue;
                double score = jaccardSimilarity(normalize(src), normalize(cmp));
                if (score > best) { best = score; bestMatch = cmp; }
            }
            if (best * 100 >= similarityThreshold && bestMatch != null) {
                results.add(new SimilarParagraph(
                        i, truncate(src, 500), truncate(bestMatch, 500),
                        BigDecimal.valueOf(best * 100).setScale(2, RoundingMode.HALF_UP)));
            }
        }
        return results;
    }

    private List<String> splitIntoParagraphs(String text) {
        return Arrays.stream(text.split("\\n{2,}|(?<=\\.\\s{2,})"))
                .map(String::trim)
                .filter(p -> !p.isBlank())
                .collect(Collectors.toList());
    }
}
