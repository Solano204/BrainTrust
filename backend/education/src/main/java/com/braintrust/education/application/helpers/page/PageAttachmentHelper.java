package com.braintrust.education.application.helpers.page;

import com.braintrust.aidetectition.application.dtos.commands.FrontendDocumentDTO;
import com.braintrust.education.application.dtos.commands.AddPageAttachmentCommand;
import com.braintrust.education.application.ports.out.PageRepository;
import com.braintrust.education.domain.exceptions.PageNotFoundException;
import com.braintrust.education.domain.model.Page;
import com.braintrust.education.domain.valueobjects.Document;
import com.braintrust.education.domain.valueobjects.PageId;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class PageAttachmentHelper {

    private static final Logger log = LoggerFactory.getLogger(PageAttachmentHelper.class);

    private final PageRepository pageRepository;
    private final PageDocumentProcessor documentProcessor;

    public PageAttachmentHelper(
            PageRepository pageRepository,
            PageDocumentProcessor documentProcessor) {
        this.pageRepository = pageRepository;
        this.documentProcessor = documentProcessor;
    }

    public void addBulkAttachmentsJson(PageId pageId, List<FrontendDocumentDTO> attachments) {
        log.info("Adding {} attachments via JSON to Page ID: {}",
                attachments != null ? attachments.size() : 0, pageId.getValue());

        try {
            Page page = findPageByIdOrThrow(pageId);

            if (attachments != null && !attachments.isEmpty()) {
                int processedCount = documentProcessor.processFrontendDocuments(page, attachments);
                pageRepository.save(page);

                log.info("{} attachments added via JSON to Page {}",
                        processedCount, pageId.getValue());
            }

        } catch (Exception e) {
            log.error("Failed to add bulk attachments via JSON to Page {}: {}",
                    pageId.getValue(), e.getMessage(), e);
            throw e;
        }
    }

    public void addSingleAttachmentJson(PageId pageId, FrontendDocumentDTO attachment) {
        log.info("Adding single attachment via JSON to Page ID: {}", pageId.getValue());

        try {
            if (attachment == null) {
                throw new IllegalArgumentException("Attachment cannot be null");
            }

            Page page = findPageByIdOrThrow(pageId);
            int processedCount = documentProcessor.processFrontendDocuments(page, List.of(attachment));
            pageRepository.save(page);

            if (processedCount > 0) {
                log.info("Single attachment added via JSON to Page {}",
                        pageId.getValue());
            }

        } catch (Exception e) {
            log.error("Failed to add single attachment via JSON to Page {}: {}",
                    pageId.getValue(), e.getMessage(), e);
            throw e;
        }
    }

    public void addAttachmentToPage(PageId pageId, MultipartFile file) {
        log.info("Adding attachment to Page ID: {}", pageId.getValue());

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be null or empty");
        }

        Page page = findPageByIdOrThrow(pageId);

        String originalFilename = file.getOriginalFilename();
        String storagePath = documentProcessor.generatePageDocumentStoragePath(pageId.getValue(), originalFilename);
        String documentName = documentProcessor.generateDocumentName(originalFilename);

        Document document = new Document(documentName, storagePath);
        page.addAttachment(document);
        pageRepository.save(page);

        log.info("Attachment '{}' added successfully to Page ID: {}", documentName, pageId.getValue());
    }

    public void addAttachmentsToPage(String pageId, List<AddPageAttachmentCommand> attachments) {
        PageId pageIdObj = PageId.fromString(pageId);

        if (attachments == null || attachments.isEmpty()) {
            log.warn("Attempted to add empty or null attachments list to page {}", pageId);
            return;
        }

        log.info("Adding {} attachments to page {}", attachments.size(), pageId);

        Page page = findPageByIdOrThrow(pageIdObj);

        attachments.forEach(command -> {
            Document document = new Document(command.documentName(), command.storagePath());
            page.addAttachment(document);
        });

        pageRepository.save(page);

        log.info("Added {} attachments to page {}", attachments.size(), pageId);
    }

    public void removeAttachmentFromPage(PageId pageId, String documentName) {
        log.info("Removing attachment '{}' from Page ID: {}", documentName, pageId.getValue());

        Page page = findPageByIdOrThrow(pageId);

        List<Document> updatedAttachments = page.getAttachments().stream()
                .filter(doc -> !doc.getName().equals(documentName))
                .collect(Collectors.toList());

        List<Document> mutableAttachments = new ArrayList<>(updatedAttachments);

        page.getAttachmentsInternal().clear();
        mutableAttachments.forEach(page::addAttachment);

        pageRepository.save(page);

        log.info("Attachment '{}' removed successfully from Page ID: {}", documentName, pageId.getValue());
    }

    public void removeAttachmentsFromPage(PageId pageId, List<String> documentNames) {
        if (documentNames == null || documentNames.isEmpty()) {
            log.warn("Attempted to remove empty or null attachments list from page {}", pageId.getValue());
            return;
        }

        log.info("Removing {} attachments from Page ID: {}", documentNames.size(), pageId.getValue());

        Page page = findPageByIdOrThrow(pageId);

        List<Document> updatedAttachments = page.getAttachments().stream()
                .filter(doc -> !documentNames.contains(doc.getName()))
                .collect(Collectors.toList());

        page.getAttachments().clear();
        updatedAttachments.forEach(page::addAttachment);
        pageRepository.save(page);

        log.info("Successfully removed {} attachments from Page ID: {}", documentNames.size(), pageId.getValue());
    }

    public void clearAttachmentsFromPage(PageId pageId) {
        log.info("Clearing all attachments from Page ID: {}", pageId.getValue());

        Page page = findPageByIdOrThrow(pageId);

        Page updatedPage = Page.reconstitute(
                page.getId(),
                page.getCourseId(),
                page.getUnitId(),
                page.getTitle(),
                page.getContent(),
                new ArrayList<>(),
                new ArrayList<>(page.getExternalLinks()),
                page.getCreatedAt(),
                LocalDateTime.now(),
                page.isPublished()
        );

        pageRepository.save(updatedPage);

        log.info("All attachments cleared from Page ID: {}", pageId.getValue());
    }

    private Page findPageByIdOrThrow(PageId pageId) {
        return pageRepository.findById(pageId)
                .orElseThrow(() -> new PageNotFoundException("Page not found: " + pageId.getValue()));
    }
}