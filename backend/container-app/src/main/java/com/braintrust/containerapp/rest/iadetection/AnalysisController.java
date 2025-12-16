package com.braintrust.containerapp.rest.iadetection;

import com.braintrust.aidetectition.application.dtos.commands.AnalyzeSubmissionCommand;
import com.braintrust.aidetectition.application.dtos.commands.AnalyzeSubmissionRequest;
import com.braintrust.aidetectition.application.dtos.commands.AnalyzePdfSubmissionCommand;
import com.braintrust.aidetectition.application.dtos.dtoResponse.AnalysisResultDTO;
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

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
// other imports...

@RestController
@RequestMapping("/api/ai-analysis")
@CrossOrigin(origins = "*")
public class AnalysisController {

    private static final Logger log =
            LoggerFactory.getLogger(AnalysisController.class);

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
//    @PostMapping("/{analysisId}/retry")
//    public ResponseEntity<SuccessResponseDTO> retryAnalysis(@PathVariable String analysisId)
//            throws JsonProcessingException {
//        log.warn("Request to retry FAILED analysis ID: {}", analysisId);
//        analysisService.retryAnalysis(AnalysisId.fromString(analysisId));
//        log.info("Analysis ID {} retry process initiated.", analysisId);
//        return ResponseEntity.ok(
//                new SuccessResponseDTO(true, "Analysis retry initiated", null)
//        );
//    }

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
                submissionId
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
     * Get high-risk submissions (likely AI-generated)
     * GET /api/ai-analysis/high-risk?threshold=0.7
     */
}