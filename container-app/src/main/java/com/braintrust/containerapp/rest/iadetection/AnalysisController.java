package com.braintrust.containerapp.rest.iadetection;

// 📍 aidetection/infrastructure/rest/AnalysisController.java
import com.braintrust.aidetectition.application.dtos.commands.AnalyzeSubmissionCommand;
import com.braintrust.aidetectition.application.dtos.dtos.AnalysisResultDTO;
import com.braintrust.aidetectition.application.dtos.dtos.AnalysisStatisticsDTO;
import com.braintrust.aidetectition.application.dtos.dtos.DetectionSummaryDTO;
import com.braintrust.aidetectition.application.ports.in.AnalysisService;
import com.braintrust.aidetectition.domain.model.AnalysisStatus;
import com.braintrust.aidetectition.domain.valueobjects.AnalysisId;
import com.braintrust.education.domain.valueobjects.SubmissionId;
import com.braintrust.shared.application.dtos.*;
import com.braintrust.shared.application.dtos.dtos.SuccessResponseDTO;
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

    // ✅ ANALYSIS COMMANDS

    @PostMapping
    public ResponseEntity<SuccessResponseDTO> analyzeSubmission(@RequestBody AnalyzeSubmissionCommand command) {
        AnalysisId analysisId = analysisService.analyzeSubmission(command);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new SuccessResponseDTO(true, "Analysis started successfully", analysisId.getValue()));
    }

    @PostMapping("/{analysisId}/retry")
    public ResponseEntity<SuccessResponseDTO> retryAnalysis(@PathVariable String analysisId) {
        analysisService.retryAnalysis(AnalysisId.fromString(analysisId));
        return ResponseEntity.ok(new SuccessResponseDTO(true, "Analysis retry initiated", null));
    }

    @DeleteMapping("/{analysisId}")
    public ResponseEntity<SuccessResponseDTO> cancelAnalysis(@PathVariable String analysisId) {
        analysisService.cancelAnalysis(AnalysisId.fromString(analysisId));
        return ResponseEntity.ok(new SuccessResponseDTO(true, "Analysis cancelled", null));
    }

    // ✅ ANALYSIS QUERIES

    @GetMapping("/{analysisId}")
    public ResponseEntity<AnalysisResultDTO> getAnalysisResult(@PathVariable String analysisId) {
        AnalysisResultDTO result = analysisService.getAnalysisResult(AnalysisId.fromString(analysisId));
        return ResponseEntity.ok(result);
    }

    @GetMapping("/submission/{submissionId}")
    public ResponseEntity<AnalysisResultDTO> getAnalysisBySubmission(@PathVariable String submissionId) {
        return analysisService.getAnalysisBySubmission(SubmissionId.fromString(submissionId))
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<AnalysisResultDTO>> getAnalysesByStatus(@PathVariable String status) {
        List<AnalysisResultDTO> analyses = analysisService.getAnalysesByStatus(
                AnalysisStatus.valueOf(status.toUpperCase())
        );
        return ResponseEntity.ok(analyses);
    }

    @GetMapping("/pending")
    public ResponseEntity<List<AnalysisResultDTO>> getPendingAnalyses() {
        List<AnalysisResultDTO> analyses = analysisService.getPendingAnalyses();
        return ResponseEntity.ok(analyses);
    }

    @GetMapping("/statistics")
    public ResponseEntity<AnalysisStatisticsDTO> getAnalysisStatistics(
            @RequestParam String startDate,
            @RequestParam String endDate
    ) {
        AnalysisStatisticsDTO statistics = analysisService.getAnalysisStatistics(
                LocalDateTime.parse(startDate),
                LocalDateTime.parse(endDate)
        );
        return ResponseEntity.ok(statistics);
    }

    @GetMapping("/high-risk")
    public ResponseEntity<List<DetectionSummaryDTO>> getHighRiskSubmissions(
            @RequestParam(defaultValue = "0.7") String threshold
    ) {
        List<DetectionSummaryDTO> highRisk = analysisService.getHighRiskSubmissions(
                new BigDecimal(threshold)
        );
        return ResponseEntity.ok(highRisk);
    }
}