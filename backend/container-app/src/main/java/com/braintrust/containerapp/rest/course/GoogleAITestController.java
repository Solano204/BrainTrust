package com.braintrust.containerapp.rest.course;


import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.util.Map;
import java.util.HashMap;
import java.util.List;

/**
 * Test endpoint for Google AI (Gemini) integration
 * Endpoint: POST /api/ai-test/ask
 */
@Slf4j
@RestController
@RequestMapping("/api/ai-test")
@CrossOrigin(origins = "*")
public class GoogleAITestController {

    @Value("${google.ai.api-key}")
    private String apiKey;

    @Value("${google.ai.model:gemini-2.5-flash}")
    private String model;

    private final RestTemplate restTemplate;

    public GoogleAITestController() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * Test endpoint to ask questions to Google AI
     *
     * POST /api/ai-test/ask
     * Body: { "question": "What is the capital of France?" }
     *
     * Response: { "answer": "...", "model": "gemini-2.5-flash" }
     */
    @PostMapping("/ask")
    public ResponseEntity<Map<String, Object>> askQuestion(
            @RequestBody AskQuestionRequest request) {


        try {
            // Validate request
            if (request.question() == null || request.question().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of(
                                "error", "Question cannot be empty",
                                "success", false
                        ));
            }

            // Build Google AI API request
            String url = String.format(
                    "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s",
                    model, apiKey
            );

            Map<String, Object> requestBody = buildGeminiRequest(request.question());

            // Set headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            // Call Google AI API
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

            // Parse response
            String answer = extractAnswer(response.getBody());


            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "question", request.question(),
                    "answer", answer,
                    "model", model
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "error", "Failed to get response from AI: " + e.getMessage(),
                            "question", request.question()
                    ));
        }
    }

    /**
     * Health check endpoint for Google AI integration
     * GET /api/ai-test/health
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        boolean isConfigured = apiKey != null && !apiKey.isEmpty();

        return ResponseEntity.ok(Map.of(
                "service", "Google AI Test",
                "configured", isConfigured,
                "model", model,
                "status", isConfigured ? "ready" : "not configured"
        ));
    }

    // Helper methods

    private Map<String, Object> buildGeminiRequest(String question) {
        Map<String, Object> request = new HashMap<>();

        Map<String, Object> content = new HashMap<>();
        content.put("parts", List.of(Map.of("text", question)));

        request.put("contents", List.of(content));

        // Optional: Add generation config
        Map<String, Object> generationConfig = new HashMap<>();
        generationConfig.put("temperature", 0.7);
        generationConfig.put("maxOutputTokens", 1000);
        request.put("generationConfig", generationConfig);

        return request;
    }

    @SuppressWarnings("unchecked")
    private String extractAnswer(Map<String, Object> response) {
        try {
            List<Map<String, Object>> candidates =
                    (List<Map<String, Object>>) response.get("candidates");

            if (candidates == null || candidates.isEmpty()) {
                return "No response generated";
            }

            Map<String, Object> firstCandidate = candidates.get(0);
            Map<String, Object> content =
                    (Map<String, Object>) firstCandidate.get("content");
            List<Map<String, Object>> parts =
                    (List<Map<String, Object>>) content.get("parts");

            if (parts == null || parts.isEmpty()) {
                return "Empty response";
            }

            return (String) parts.get(0).get("text");

        } catch (Exception e) {
            return "Error parsing response: " + e.getMessage();
        }
    }

    // Request DTO
    public record AskQuestionRequest(String question) {}
}