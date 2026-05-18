package com.braintrust.aidetectition.application.ports.out;

import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface TextExtractionProvider {

    String extractTextFromPdf(MultipartFile pdfFile);

    List<String> extractTextFromPdfs(List<MultipartFile> pdfFiles);

    boolean isServiceAvailable();

    Double getServiceHealth();
}