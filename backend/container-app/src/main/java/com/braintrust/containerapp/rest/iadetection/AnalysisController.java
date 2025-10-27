package com.braintrust.containerapp.rest.iadetection;

import com.braintrust.aidetectition.application.dtos.commands.AnalyzeSubmissionCommand;
import com.braintrust.aidetectition.application.dtos.commands.AnalyzeSubmissionRequest;
import com.braintrust.aidetectition.application.dtos.dtos.AnalysisResultDTO;
import com.braintrust.aidetectition.application.dtos.dtos.AnalysisStatisticsDTO;
import com.braintrust.aidetectition.application.dtos.dtos.DetectionSummaryDTO;
import com.braintrust.aidetectition.application.ports.in.AnalysisService;
import com.braintrust.aidetectition.domain.model.AnalysisStatus;
import com.braintrust.aidetectition.domain.valueobjects.AnalysisId;
import com.braintrust.education.domain.valueobjects.SubmissionId;
import com.braintrust.shared.application.dtos.dtos.SuccessResponseDTO;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/ai-analysis")
@CrossOrigin(origins = "*")
public class AnalysisController {

    private final AnalysisService analysisService;

    public AnalysisController(AnalysisService analysisService) {
        this.analysisService = analysisService;
    }

    // ========================================
    // ✅ ANALYSIS COMMANDS
    // ========================================

    /**
     * Start AI analysis for a submission
     * POST /api/ai-analysis
     */
    @PostMapping
    public ResponseEntity<SuccessResponseDTO> analyzeSubmission(
            @RequestBody AnalyzeSubmissionRequest request
    ) {
        AnalyzeSubmissionCommand command = new AnalyzeSubmissionCommand(
                request.submissionId(),
                request.content(),
                request.preferredModel()
        );

        AnalysisId analysisId = analysisService.analyzeSubmission(command);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new SuccessResponseDTO(
                        true,
                        "Analysis started successfully",
                        analysisId.getValue()
                ));
    }

    /**
     * Retry a failed analysis
     * POST /api/ai-analysis/{analysisId}/retry
     */
    @PostMapping("/{analysisId}/retry")
    public ResponseEntity<SuccessResponseDTO> retryAnalysis(@PathVariable String analysisId) {
        analysisService.retryAnalysis(AnalysisId.fromString(analysisId));
        return ResponseEntity.ok(
                new SuccessResponseDTO(true, "Analysis retry initiated", null)
        );
    }

    /**
     * Cancel a pending analysis
     * DELETE /api/ai-analysis/{analysisId}
     */
    @DeleteMapping("/{analysisId}")
    public ResponseEntity<SuccessResponseDTO> cancelAnalysis(@PathVariable String analysisId) {
        analysisService.cancelAnalysis(AnalysisId.fromString(analysisId));
        return ResponseEntity.ok(
                new SuccessResponseDTO(true, "Analysis cancelled", null)
        );
    }

    // ========================================
    // ✅ ANALYSIS QUERIES
    // ========================================

    /**
     * Get analysis result by ID
     * GET /api/ai-analysis/{analysisId}
     */
    @GetMapping("/{analysisId}")
    public ResponseEntity<AnalysisResultDTO> getAnalysisResult(@PathVariable String analysisId) {
        AnalysisResultDTO result = analysisService.getAnalysisResult(
                AnalysisId.fromString(analysisId)
        );
        return ResponseEntity.ok(result);
    }

    /**
     * Get analysis by submission ID
     * GET /api/ai-analysis/submission/{submissionId}
     */
    @GetMapping("/submission/{submissionId}")
    public ResponseEntity<AnalysisResultDTO> getAnalysisBySubmission(
            @PathVariable String submissionId
    ) {
        return analysisService.getAnalysisBySubmission(SubmissionId.fromString(submissionId))
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Get analyses by status
     * GET /api/ai-analysis/status/{status}
     * Allowed values: PENDING, COMPLETED, FAILED
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<AnalysisResultDTO>> getAnalysesByStatus(
            @PathVariable String status
    ) {
        AnalysisStatus analysisStatus = AnalysisStatus.valueOf(status.toUpperCase());
        List<AnalysisResultDTO> analyses = analysisService.getAnalysesByStatus(analysisStatus);
        return ResponseEntity.ok(analyses);
    }

    /**
     * Get all pending analyses
     * GET /api/ai-analysis/pending
     */
    @GetMapping("/pending")
    public ResponseEntity<List<AnalysisResultDTO>> getPendingAnalyses() {
        List<AnalysisResultDTO> analyses = analysisService.getPendingAnalyses();
        return ResponseEntity.ok(analyses);
    }

    /**
     * Get all completed analyses
     * GET /api/ai-analysis/completed
     */
    @GetMapping("/completed")
    public ResponseEntity<List<AnalysisResultDTO>> getCompletedAnalyses() {
        List<AnalysisResultDTO> analyses = analysisService.getAnalysesByStatus(
                AnalysisStatus.COMPLETED
        );
        return ResponseEntity.ok(analyses);
    }

    /**
     * Get all failed analyses
     * GET /api/ai-analysis/failed
     */
    @GetMapping("/failed")
    public ResponseEntity<List<AnalysisResultDTO>> getFailedAnalyses() {
        List<AnalysisResultDTO> analyses = analysisService.getAnalysesByStatus(
                AnalysisStatus.FAILED
        );
        return ResponseEntity.ok(analyses);
    }

    /**
     * Get analysis statistics for a date range
     * GET /api/ai-analysis/statistics?start=2025-01-01T00:00:00&end=2025-12-31T23:59:59
     */
    @GetMapping("/statistics")
    public ResponseEntity<AnalysisStatisticsDTO> getAnalysisStatistics(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end
    ) {
        AnalysisStatisticsDTO statistics = analysisService.getAnalysisStatistics(start, end);
        return ResponseEntity.ok(statistics);
    }

    /**
     * Get high-risk submissions (likely AI-generated)
     * GET /api/ai-analysis/high-risk?threshold=0.7
     */
    @GetMapping("/high-risk")
    public ResponseEntity<List<DetectionSummaryDTO>> getHighRiskSubmissions(
            @RequestParam(defaultValue = "0.7") BigDecimal threshold
    ) {
        List<DetectionSummaryDTO> highRisk = analysisService.getHighRiskSubmissions(threshold);
        return ResponseEntity.ok(highRisk);
    }

    /**
     * Get submissions with uncertain AI probability
     * GET /api/ai-analysis/uncertain?minThreshold=0.4&maxThreshold=0.6
     */
    @GetMapping("/uncertain")
    public ResponseEntity<List<DetectionSummaryDTO>> getUncertainSubmissions(
            @RequestParam(defaultValue = "0.4") BigDecimal minThreshold,
            @RequestParam(defaultValue = "0.6") BigDecimal maxThreshold
    ) {
        // Get all high-risk submissions and filter manually
        // In a real app, you'd add this query to the service/repository
        List<DetectionSummaryDTO> uncertain = analysisService
                .getHighRiskSubmissions(minThreshold)
                .stream()
                .filter(dto -> new BigDecimal(dto.probability()).compareTo(maxThreshold) <= 0)
                .toList();

        return ResponseEntity.ok(uncertain);
    }

    /**
     * Get likely human submissions (low AI probability)
     * GET /api/ai-analysis/likely-human?threshold=0.3
     */
    @GetMapping("/likely-human")
    public ResponseEntity<List<DetectionSummaryDTO>> getLikelyHumanSubmissions(
            @RequestParam(defaultValue = "0.3") BigDecimal threshold
    ) {
        // Get submissions below threshold
        List<DetectionSummaryDTO> likelyHuman = analysisService
                .getHighRiskSubmissions(BigDecimal.ZERO)
                .stream()
                .filter(dto -> new BigDecimal(dto.probability()).compareTo(threshold) <= 0)
                .toList();

        return ResponseEntity.ok(likelyHuman);
    }
}