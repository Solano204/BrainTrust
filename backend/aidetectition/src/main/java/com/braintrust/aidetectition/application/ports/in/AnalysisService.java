package com.braintrust.aidetectition.application.ports.in;

import com.braintrust.aidetectition.application.dtos.commands.AnalyzeSubmissionCommand;
import com.braintrust.aidetectition.application.dtos.dtoResponse.AnalysisResultDTO;
import com.braintrust.aidetectition.domain.valueobjects.AnalysisId;
import com.braintrust.aidetectition.domain.valueobjects.SubmissionId;
import com.fasterxml.jackson.core.JsonProcessingException;

import java.util.List;

// 📍 aidetection/application/ports/in/AnalysisService.java
public interface AnalysisService {

    /**
     * Analyze text submission for AI-generated content
     *
     * @param command Contains submission ID, text content, and preferred model
     * @return Analysis ID for tracking the analysis
     * @throws JsonProcessingException If there's an error processing the request
     */
    AnalysisId analyzeSubmission(AnalyzeSubmissionCommand command) throws JsonProcessingException;

    /**
     * Cancel a pending analysis
     *
     * @param analysisId The ID of the analysis to cancel
     * @throws JsonProcessingException If there's an error processing the request
     */
    void cancelAnalysis(AnalysisId analysisId) throws JsonProcessingException;

    /**
     * Get all analyses for a specific submission
     *
     * @param submissionId The submission ID to query
     * @return List of analysis results
     */
    List<AnalysisResultDTO> getAnalysisBySubmission(String submissionId);

    /**
     * Retry a failed analysis (optional - you can add later)
     */
    // void retryAnalysis(AnalysisId analysisId) throws Exception;
}