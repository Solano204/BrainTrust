package com.braintrust.aidetectition.application.ports.in;

import com.braintrust.aidetectition.application.dtos.commands.AnalyzeSubmissionCommand;
import com.braintrust.aidetectition.application.dtos.dtoResponse.AnalysisResultDTO;
import com.braintrust.aidetectition.domain.valueobjects.AnalysisId;
import com.braintrust.aidetectition.domain.valueobjects.SubmissionId;
import com.fasterxml.jackson.core.JsonProcessingException;

import java.util.List;

public interface AnalysisService {

    AnalysisId analyzeSubmission(AnalyzeSubmissionCommand command) throws JsonProcessingException;

    void cancelAnalysis(AnalysisId analysisId) throws JsonProcessingException;

    List<AnalysisResultDTO> getAnalysisBySubmission(String submissionId);

}