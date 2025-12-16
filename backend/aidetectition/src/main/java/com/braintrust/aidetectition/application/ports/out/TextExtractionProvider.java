package com.braintrust.aidetectition.application.ports.out;

import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface TextExtractionProvider {

    /**
     * Extract text from a PDF file
     */
    String extractTextFromPdf(MultipartFile pdfFile);

    /**
     * Extract text from multiple PDF files in batch
     */
    List<String> extractTextFromPdfs(List<MultipartFile> pdfFiles);

    /**
     * Check if the service is available
     */
    boolean isServiceAvailable();

    /**
     * Get service health status
     */
    Double getServiceHealth();
}