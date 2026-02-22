package com.braintrust.education.application.helpers.assignment;

import com.braintrust.aidetectition.application.dtos.commands.FrontendDocumentDTO;
import com.braintrust.aidetectition.application.ports.out.DocumentStorageService;
import com.braintrust.aidetectition.domain.model.DocumentMetadata;
import com.braintrust.education.domain.valueobjects.Document;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.concurrent.Semaphore;
import java.util.stream.Collectors;

@Component
public class DocumentStorageHelper {

    private static final Logger log = LoggerFactory.getLogger(DocumentStorageHelper.class);
    private final DocumentStorageService documentStorageService;
    private final Semaphore storageRateLimiter = new Semaphore(60);

    public DocumentStorageHelper(DocumentStorageService documentStorageService) {
        this.documentStorageService = documentStorageService;
    }

    public List<DocumentMetadata> storeDocumentsWithRateLimit(
            String targetId,
            List<MultipartFile> files) {

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

    public List<DocumentMetadata> storeFrontendDocumentsWithRateLimit(
            String targetId,
            List<FrontendDocumentDTO> frontendDocuments) {

        try {
            storageRateLimiter.acquire();
            try {
                return documentStorageService.storeDocumentFromFrontend(targetId, frontendDocuments);
            } finally {
                storageRateLimiter.release();
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Document storage interrupted", e);
        }
    }

    public List<Document> convertToDocuments(List<DocumentMetadata> metadataList) {
        return metadataList.stream()
                .map(metadata -> new Document(
                        metadata.getOriginalFilename(),
                        metadata.getStoragePath()
                ))
                .collect(Collectors.toList());
    }
}