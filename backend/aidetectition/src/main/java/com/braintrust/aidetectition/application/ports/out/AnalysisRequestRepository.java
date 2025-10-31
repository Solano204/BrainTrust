package com.braintrust.aidetectition.application.ports.out;

import com.braintrust.aidetectition.domain.model.AnalysisRequest;
import com.braintrust.aidetectition.domain.model.AnalysisStatus;
import com.braintrust.aidetectition.domain.valueobjects.AnalysisId;
import com.braintrust.aidetectition.domain.valueobjects.SubmissionId;
import com.fasterxml.jackson.core.JsonProcessingException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

// 📍 aidetection/application/ports/out/AnalysisRequestRepository.java
public interface AnalysisRequestRepository {

    // Commands
    AnalysisRequest save(AnalysisRequest analysisRequest) throws JsonProcessingException;
    void delete(AnalysisRequest analysisRequest);
    List<AnalysisRequest> saveAll(List<AnalysisRequest> analysisRequests) ; // NEW

    // Queries
    Optional<AnalysisRequest> findById(AnalysisId analysisId);
    List<AnalysisRequest> findBySubmissionId(SubmissionId submissionId);
    List<AnalysisRequest> findByStatus(AnalysisStatus status);
    List<AnalysisRequest> findPendingAnalyses();
    List<AnalysisRequest> findByDateRange(LocalDateTime start, LocalDateTime end);
    List<AnalysisRequest> findByProbabilityAbove(BigDecimal threshold);
}
