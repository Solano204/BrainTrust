package com.braintrust.education.application.helpers.page;

import com.braintrust.aidetectition.application.dtos.commands.FrontendDocumentDTO;
import com.braintrust.aidetectition.application.ports.out.DocumentStorageService;
import com.braintrust.aidetectition.domain.model.DocumentMetadata;
import com.braintrust.education.domain.model.Page;
import com.braintrust.education.domain.valueobjects.Document;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.Semaphore;
import java.util.stream.Collectors;

@Component
public class PageDocumentProcessor {

    private static final Logger log = LoggerFactory.getLogger(PageDocumentProcessor.class);
    private static final long MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

    private final DocumentStorageService documentStorageService;
    private final Semaphore storageRateLimiter = new Semaphore(20);

    public PageDocumentProcessor(DocumentStorageService documentStorageService) {
        this.documentStorageService = documentStorageService;
    }

    public int processFrontendDocuments(Page page, List<FrontendDocumentDTO> frontendDocuments) {
        if (frontendDocuments == null || frontendDocuments.isEmpty()) {
            return 0;
        }

        log.info("Processing {} frontend documents for page", frontendDocuments.size());

        try {
            List<DocumentMetadata> metadataList = storeFrontendDocumentsWithRateLimit(
                    page.getId().getValue(),
                    frontendDocuments
            );

            List<Document> documents = metadataList.stream()
                    .map(metadata -> new Document(
                            metadata.getOriginalFilename(),
                            metadata.getStoragePath()
                    ))
                    .collect(Collectors.toList());

            documents.forEach(page::addAttachment);

            log.info("Successfully processed {} frontend documents", documents.size());
            return documents.size();

        } catch (Exception e) {
            log.error("Failed to process frontend documents: {}", e.getMessage(), e);
            throw new RuntimeException("Frontend document processing failed", e);
        }
    }

    public int processFileAttachments(Page page, List<MultipartFile> attachments) {
        if (attachments == null || attachments.isEmpty()) {
            return 0;
        }

        log.info("Dynamically processing {} file attachments for page", attachments.size());

        int successfulUploads = 0;
        int failedUploads = 0;

        for (MultipartFile file : attachments) {
            try {
                if (file == null || file.isEmpty()) {
                    log.warn("Skipping null or empty file");
                    failedUploads++;
                    continue;
                }

                if (file.getSize() > MAX_FILE_SIZE) {
                    log.warn("File too large: {} ({} bytes)",
                            file.getOriginalFilename(), file.getSize());
                    failedUploads++;
                    continue;
                }

                String originalFilename = file.getOriginalFilename();
                String contentType = file.getContentType();
                long fileSize = file.getSize();

                String storagePath = generatePageDocumentStoragePath(page.getId().getValue(), originalFilename);
                String documentName = generateDocumentName(originalFilename);

                Document document = new Document(documentName, storagePath);
                page.addAttachment(document);

                log.debug("Dynamically added document: '{}' (Type: {}, Size: {} bytes)",
                        documentName, contentType, fileSize);

                successfulUploads++;

            } catch (Exception e) {
                log.error("Failed to process file '{}': {}",
                        file != null ? file.getOriginalFilename() : "null", e.getMessage());
                failedUploads++;
            }
        }

        log.info("Dynamic file processing summary: {} successful, {} failed out of {} total files",
                successfulUploads, failedUploads, attachments.size());

        return successfulUploads;
    }

    public String generatePageDocumentStoragePath(String pageId, String originalFilename) {
        String fileExtension = getFileExtension(originalFilename);
        String uniqueFileId = UUID.randomUUID().toString();

        String storagePath = String.format("/pages/%s/documents/%s", pageId, uniqueFileId);

        if (fileExtension != null && !fileExtension.isEmpty()) {
            storagePath += "." + fileExtension;
        }

        log.debug("Generated storage path: {} for file: {}", storagePath, originalFilename);
        return storagePath;
    }

    public String generateDocumentName(String originalFilename) {
        if (originalFilename == null || originalFilename.isBlank()) {
            return "document_" + UUID.randomUUID().toString().substring(0, 8);
        }

        String safeName = originalFilename.replaceAll(".*[/\\\\]", "");
        return safeName.length() > 100 ? safeName.substring(0, 100) : safeName;
    }

    private List<DocumentMetadata> storeFrontendDocumentsWithRateLimit(
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

    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return null;
        }
        return filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
    }
}