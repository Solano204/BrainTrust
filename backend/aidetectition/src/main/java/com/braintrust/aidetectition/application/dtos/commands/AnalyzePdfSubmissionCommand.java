package com.braintrust.aidetectition.application.dtos.commands;

import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public record AnalyzePdfSubmissionCommand(
        String submissionId,
        List<MultipartFile> pdfFiles,
        String preferredModel
) {}