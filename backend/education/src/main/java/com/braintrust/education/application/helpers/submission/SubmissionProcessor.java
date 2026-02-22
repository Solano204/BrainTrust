package com.braintrust.education.application.helpers.submission;

import com.braintrust.aidetectition.application.dtos.commands.FrontendDocumentDTOSub;
import com.braintrust.aidetectition.application.ports.out.DocumentStorageService;
import com.braintrust.aidetectition.application.ports.out.TextExtractionProvider;
import com.braintrust.aidetectition.domain.model.DocumentMetadata;
import com.braintrust.education.domain.valueobjects.Document;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Semaphore;
import java.util.stream.Collectors;

@Component
public class SubmissionProcessor {

    private static final Logger log = LoggerFactory.getLogger(SubmissionProcessor.class);

    private final DocumentStorageService documentStorageService;
    private final TextExtractionProvider textExtractionProvider;

    @Value("${submission.content.empty-placeholder:Submitted with attachments}")
    private String emptyContentPlaceholder;

    private final Semaphore storageRateLimiter = new Semaphore(20);
    private final Semaphore extractionRateLimiter = new Semaphore(10);

    public SubmissionProcessor(
            DocumentStorageService documentStorageService,
            TextExtractionProvider textExtractionProvider) {
        this.documentStorageService = documentStorageService;
        this.textExtractionProvider = textExtractionProvider;
    }

    public List<DocumentMetadata> storeDocumentsWithRateLimit(String targetId, List<MultipartFile> files) {
        try {
            storageRateLimiter.acquire();
            try {
                return documentStorageService.storeDocument(targetId, files);
            } finally {
                storageRateLimiter.release();
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Document storage interrupted", e);
        }
    }

    public List<Document> storeFrontendDocuments(String targetId, List<FrontendDocumentDTOSub> frontendDocuments) {
        List<Document> documents = new ArrayList<>();

        if (frontendDocuments != null && !frontendDocuments.isEmpty()) {
            try {
                storageRateLimiter.acquire();
                try {
                    List<DocumentMetadata> metadataList = documentStorageService.storeDocumentFromFrontendSub(
                            targetId,
                            frontendDocuments
                    );

                    documents = metadataList.stream()
                            .map(metadata -> new Document(
                                    metadata.getOriginalFilename(),
                                    metadata.getStoragePath()
                            ))
                            .collect(Collectors.toList());

                    log.info("📁 {} frontend documents stored for submission {}", documents.size(), targetId);

                } finally {
                    storageRateLimiter.release();
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new RuntimeException("Document storage interrupted", e);
            }
        }

        return documents;
    }

    public List<Document> convertToDocuments(List<DocumentMetadata> metadataList) {
        return metadataList.stream()
                .map(metadata -> new Document(
                        metadata.getOriginalFilename(),
                        metadata.getStoragePath()
                ))
                .collect(Collectors.toList());
    }

    public String extractTextFromFirstPdf(List<MultipartFile> attachments) {
        if (attachments == null || attachments.isEmpty()) {
            return "";
        }

        MultipartFile pdfFile = attachments.stream()
                .filter(file -> file.getContentType() != null &&
                        file.getContentType().equals("application/pdf"))
                .findFirst()
                .orElse(null);

        if (pdfFile == null) {
            return "";
        }

        log.info("📄 Extracting text from PDF: {} (size: {} bytes)",
                pdfFile.getOriginalFilename(), pdfFile.getSize());

        try {
            extractionRateLimiter.acquire();
            try {
                long startTime = System.currentTimeMillis();
                String extractedText = textExtractionProvider.extractTextFromPdf(pdfFile);
                long duration = System.currentTimeMillis() - startTime;

                int wordCount = extractedText.split("\\s+").length;
                log.info("✅ Text extraction completed in {}ms. Words: {}", duration, wordCount);

                return extractedText.trim();

            } finally {
                extractionRateLimiter.release();
            }
        } catch (Exception e) {
            log.error("❌ Failed to extract text from PDF: {}", e.getMessage());
            return "";
        }
    }

    public String combineExtractedTexts(List<FrontendDocumentDTOSub> frontendDocuments) {
        if (frontendDocuments == null || frontendDocuments.isEmpty()) {
            return "";
        }

        StringBuilder combinedText = new StringBuilder();

        for (FrontendDocumentDTOSub document : frontendDocuments) {
            if (document.extractedText() != null && !document.extractedText().trim().isEmpty()) {
                if (combinedText.length() > 0) {
                    combinedText.append("\n\n--- Document: ")
                            .append(document.originalFilename())
                            .append(" ---\n\n");
                } else {
                    combinedText.append("--- Document: ")
                            .append(document.originalFilename())
                            .append(" ---\n\n");
                }
                combinedText.append(document.extractedText().trim());
            }
        }

        String result = combinedText.toString().trim();
        log.info("📝 Combined {} documents into {} characters of text",
                frontendDocuments.size(), result.length());

        return result;
    }

    public String getSubmissionContent(String content) {
        return content != null && !content.trim().isEmpty()
                ? content.trim()
                : emptyContentPlaceholder;
    }

    public String getEmptyContentPlaceholder() {
        return emptyContentPlaceholder;
    }
}