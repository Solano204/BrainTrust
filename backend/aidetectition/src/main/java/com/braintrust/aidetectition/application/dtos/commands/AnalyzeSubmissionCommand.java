package com.braintrust.aidetectition.application.dtos.commands;

public record AnalyzeSubmissionCommand(
        String submissionId,
        String content,
        String preferredModel  // ModelType enum as String
) {}