
package com.braintrust.aidetectition.application.dtos.commands;

import jakarta.validation.constraints.NotBlank;

public record AnalyzeSubmissionRequest(
        @NotBlank(message = "Submission ID is required")
        String submissionId,

        @NotBlank(message = "Content is required")
        String content,

        String preferredModel  // Optional: GPT_DETECTOR, BERT_CLASSIFIER, ENSEMBLE
) {}
