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

    @GetMapping("/submission/{submissionId}")
    public ResponseEntity<List<AnalysisResultDTO>> getAnalysisBySubmission(
            @PathVariable String submissionId
    ) {
        log.debug("Fetching analysis results for Submission ID: {}", submissionId);


        List<AnalysisResultDTO> results = analysisService.getAnalysisBySubmission(
                submissionId
        );

        if (results.isEmpty()) {
            log.info("Analysis results not found (empty list) for Submission ID: {}", submissionId);
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(results);
    }

}