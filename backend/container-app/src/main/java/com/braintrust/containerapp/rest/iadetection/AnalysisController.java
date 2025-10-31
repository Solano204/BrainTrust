package com.braintrust.containerapp.rest.iadetection;

import com.braintrust.aidetectition.application.dtos.commands.AnalyzeSubmissionCommand;
import com.braintrust.aidetectition.application.dtos.commands.AnalyzeSubmissionRequest;
import com.braintrust.aidetectition.application.dtos.commands.AnalyzePdfSubmissionCommand;
import com.braintrust.aidetectition.application.dtos.dtosResponse.AnalysisResultDTO;
import com.braintrust.aidetectition.application.dtos.dtosResponse.AnalysisStatisticsDTO;
import com.braintrust.aidetectition.application.dtos.dtosResponse.DetectionSummaryDTO;
import com.braintrust.aidetectition.application.ports.in.AnalysisService;
import com.braintrust.aidetectition.domain.model.AnalysisStatus;
import com.braintrust.aidetectition.domain.valueobjects.AnalysisId;
import com.braintrust.aidetectition.domain.valueobjects.SubmissionId;
import com.braintrust.shared.application.dtos.dtos.SuccessResponseDTO;
import com.fasterxml.jackson.core.JsonProcessingException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/ai-analysis")
@CrossOrigin(origins = "*")
@Slf4j
public class AnalysisController {

    private final AnalysisService analysisService;

    public AnalysisController(AnalysisService analysisService) {
        this.analysisService = analysisService;
    }

    // ========================================
    // ✅ ANALYSIS COMMANDS
    // ========================================

    /**
     * Start AI analysis for a submission (text content)
     * POST /api/ai-analysis
     */
    @PostMapping
    public ResponseEntity<SuccessResponseDTO> analyzeSubmission(
            @RequestBody AnalyzeSubmissionRequest request
    ) throws JsonProcessingException {
        log.info("Request received to start analysis for Submission ID: {}", request.submissionId());

        AnalyzeSubmissionCommand command = new AnalyzeSubmissionCommand(
                request.submissionId(),
                request.content(),
                request.preferredModel()
        );

        AnalysisId analysisId = analysisService.analyzeSubmission(command);

        log.info("Analysis process initiated. Analysis ID: {}", analysisId.getValue());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new SuccessResponseDTO(
                        true,
                        "Analysis started successfully",
                        analysisId.getValue()
                ));
    }

//    /**
//     * Start AI analysis for a PDF submission
//     * POST /api/ai-analysis/pdf
//     */
//    @PostMapping(value = "/pdf", consumes = "multipart/form-data")
//    public ResponseEntity<SuccessResponseDTO> analyzePdfSubmission(
//            @RequestParam("submissionId") String submissionId,
//            @RequestParam("pdfFile") MultipartFile pdfFile,
//            @RequestParam(value = "preferredModel", required = false) String preferredModel
//    ) throws JsonProcessingException {
//        log.info("Request received to analyze PDF for Submission ID: {}", submissionId);
//
//        if (pdfFile.isEmpty()) {
//            log.warn("Empty PDF file received for Submission ID: {}", submissionId);
//            return ResponseEntity.badRequest()
//                    .body(new SuccessResponseDTO(false, "PDF file is empty", null));
//        }
//
//        if (!pdfFile.getContentType().equals("application/pdf")) {
//            log.warn("Invalid file type received: {} for Submission ID: {}",
//                    pdfFile.getContentType(), submissionId);
//            return ResponseEntity.badRequest()
//                    .body(new SuccessResponseDTO(false, "File must be a PDF", null));
//        }
//
//        AnalyzePdfSubmissionCommand command = new AnalyzePdfSubmissionCommand(
//                submissionId,
//                pdfFile,
//                preferredModel
//        );
//
//        AnalysisId analysisId = analysisService.analyzePdfSubmission(command);
//
//        log.info("PDF analysis process initiated. Analysis ID: {}", analysisId.getValue());
//        return ResponseEntity.status(HttpStatus.CREATED)
//                .body(new SuccessResponseDTO(
//                        true,
//                        "PDF analysis started successfully",
//                        analysisId.getValue()
//                ));
//    }

    /**
     * Retry a failed analysis
     * POST /api/ai-analysis/{analysisId}/retry
     */
    @PostMapping("/{analysisId}/retry")
    public ResponseEntity<SuccessResponseDTO> retryAnalysis(@PathVariable String analysisId)
            throws JsonProcessingException {
        log.warn("Request to retry FAILED analysis ID: {}", analysisId);
        analysisService.retryAnalysis(AnalysisId.fromString(analysisId));
        log.info("Analysis ID {} retry process initiated.", analysisId);
        return ResponseEntity.ok(
                new SuccessResponseDTO(true, "Analysis retry initiated", null)
        );
    }

    /**
     * Cancel a pending analysis
     * DELETE /api/ai-analysis/{analysisId}
     */
    @DeleteMapping("/{analysisId}")
    public ResponseEntity<SuccessResponseDTO> cancelAnalysis(@PathVariable String analysisId)
            throws JsonProcessingException {
        log.warn("Request to CANCEL analysis ID: {}", analysisId);
        analysisService.cancelAnalysis(AnalysisId.fromString(analysisId));
        log.info("Analysis ID {} successfully cancelled.", analysisId);
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
        log.debug("Fetching result for Analysis ID: {}", analysisId);
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
    public ResponseEntity<List<AnalysisResultDTO>> getAnalysisBySubmission(
            @PathVariable String submissionId
    ) {
        log.debug("Fetching analysis results for Submission ID: {}", submissionId);

        // ⬅️ CRITICAL FIX 2: Call the service, which now returns a List
        List<AnalysisResultDTO> results = analysisService.getAnalysisBySubmission(
                SubmissionId.fromString(submissionId)
        );

        if (results.isEmpty()) {
            log.info("Analysis results not found (empty list) for Submission ID: {}", submissionId);
            // Returning 404 if the list is empty provides clearer feedback than 200 OK []
            return ResponseEntity.notFound().build();
        }

        // Return 200 OK with the list of results (may be one or many)
        return ResponseEntity.ok(results);
    }

    /**
     * Get analyses by status
     * GET /api/ai-analysis/status/{status}
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<AnalysisResultDTO>> getAnalysesByStatus(
            @PathVariable String status
    ) {
        log.debug("Querying analyses by status: {}", status.toUpperCase());
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
        log.debug("Querying all PENDING analyses.");
        List<AnalysisResultDTO> analyses = analysisService.getPendingAnalyses();
        return ResponseEntity.ok(analyses);
    }

    /**
     * Get all completed analyses
     * GET /api/ai-analysis/completed
     */
    @GetMapping("/completed")
    public ResponseEntity<List<AnalysisResultDTO>> getCompletedAnalyses() {
        log.debug("Querying all COMPLETED analyses.");
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
        log.warn("Querying all FAILED analyses.");
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
        log.debug("Fetching analysis statistics between {} and {}", start, end);
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
        log.info("Querying submissions with AI risk above threshold: {}", threshold);
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
        log.debug("Querying submissions in the uncertain range ({} - {})", minThreshold, maxThreshold);

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
        log.debug("Querying submissions likely to be human (below threshold: {})", threshold);

        List<DetectionSummaryDTO> likelyHuman = analysisService
                .getHighRiskSubmissions(BigDecimal.ZERO)
                .stream()
                .filter(dto -> new BigDecimal(dto.probability()).compareTo(threshold) <= 0)
                .toList();

        return ResponseEntity.ok(likelyHuman);
    }
}