package com.braintrust.aidetectition.application.ports.in;

import com.braintrust.aidetectition.application.dtos.commands.AnalyzePdfSubmissionCommand;
import com.braintrust.aidetectition.application.dtos.commands.AnalyzeSubmissionCommand;
import com.braintrust.aidetectition.application.dtos.dtoResponse.AnalysisResultDTO;
import com.braintrust.aidetectition.application.dtos.dtoResponse.ModelPerformanceDTO;
import com.braintrust.aidetectition.application.dtos.dtoResponse.AnalysisStatisticsDTO;
import com.braintrust.aidetectition.application.dtos.dtoResponse.DetectionSummaryDTO;
import com.braintrust.aidetectition.domain.model.AnalysisStatus;
import com.braintrust.aidetectition.domain.valueobjects.AnalysisId;
import com.braintrust.aidetectition.domain.valueobjects.SubmissionId;
import com.fasterxml.jackson.core.JsonProcessingException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

// 📍 aidetection/application/ports/in/AnalysisService.java
public interface AnalysisService {

    // Commands
    AnalysisId analyzeSubmission(AnalyzeSubmissionCommand command) throws JsonProcessingException;

    List<AnalysisId> analyzePdfSubmission(AnalyzePdfSubmissionCommand command) throws JsonProcessingException;

    void retryAnalysis(AnalysisId analysisId) throws Exception;

    void cancelAnalysis(AnalysisId analysisId) throws JsonProcessingException;


    List<AnalysisResultDTO> getAnalysisBySubmission(SubmissionId submissionId);


}