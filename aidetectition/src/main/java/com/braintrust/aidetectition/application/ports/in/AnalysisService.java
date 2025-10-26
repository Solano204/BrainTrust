package com.braintrust.aidetectition.application.ports.in;

import com.braintrust.aidetectition.application.dtos.commands.AnalyzeSubmissionCommand;
import com.braintrust.aidetectition.application.dtos.dtos.AnalysisResultDTO;
import com.braintrust.aidetectition.application.dtos.dtos.AnalysisStatisticsDTO;
import com.braintrust.aidetectition.application.dtos.dtos.DetectionSummaryDTO;
import com.braintrust.aidetectition.domain.model.AnalysisStatus;
import com.braintrust.aidetectition.domain.valueobjects.AnalysisId;
import com.braintrust.education.domain.valueobjects.SubmissionId;
import com.fasterxml.jackson.core.JsonProcessingException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

// 📍 aidetection/application/ports/in/AnalysisService.java
public interface AnalysisService {

    // Commands
    AnalysisId analyzeSubmission(AnalyzeSubmissionCommand command) throws JsonProcessingException;
    void retryAnalysis(AnalysisId analysisId) throws JsonProcessingException;
    void cancelAnalysis(AnalysisId analysisId) throws JsonProcessingException;

    // Queries
    AnalysisResultDTO getAnalysisResult(AnalysisId analysisId);
    Optional<AnalysisResultDTO> getAnalysisBySubmission(SubmissionId submissionId);
    List<AnalysisResultDTO> getAnalysesByStatus(AnalysisStatus status);
    List<AnalysisResultDTO> getPendingAnalyses();
    AnalysisStatisticsDTO getAnalysisStatistics(LocalDateTime start, LocalDateTime end);
    List<DetectionSummaryDTO> getHighRiskSubmissions(BigDecimal threshold);
}