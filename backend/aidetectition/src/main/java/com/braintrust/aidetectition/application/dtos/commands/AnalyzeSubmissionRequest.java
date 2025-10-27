package com.braintrust.aidetectition.application.dtos.commands;

public record AnalyzeSubmissionRequest(
        String submissionId,
        String content,
        String preferredModel  // Optional: GPT_DETECTOR, BERT_CLASSIFIER, ENSEMBLE
) {}