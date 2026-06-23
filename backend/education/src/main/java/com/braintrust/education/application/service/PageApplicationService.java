package com.braintrust.education.application.service;

import com.braintrust.aidetectition.application.dtos.commands.FrontendDocumentDTO;
import com.braintrust.education.application.dtos.commands.*;
import com.braintrust.education.application.dtos.dtos.PageDTO;
import com.braintrust.education.application.helpers.page.*;
import com.braintrust.education.application.ports.in.PageService;
import com.braintrust.education.application.ports.out.PageRepository;
import com.braintrust.education.domain.exceptions.PageNotFoundException;
import com.braintrust.education.domain.model.Page;
import com.braintrust.education.domain.valueobjects.CourseId;
import com.braintrust.education.domain.valueobjects.PageId;
import com.braintrust.education.domain.valueobjects.UnitId;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@Transactional
public class PageApplicationService implements PageService {

    private static final Logger log = LoggerFactory.getLogger(PageApplicationService.class);

    private final PageRepository pageRepository;

    private final PageDtoMapper dtoMapper;
    private final PageDocumentProcessor documentProcessor;
    private final PageAttachmentHelper attachmentHelper;
    private final PageLinkHelper linkHelper;

    public PageApplicationService(
            PageRepository pageRepository,
            PageDtoMapper dtoMapper,
            PageDocumentProcessor documentProcessor,
            PageAttachmentHelper attachmentHelper,
            PageLinkHelper linkHelper) {
        this.pageRepository = pageRepository;
        this.dtoMapper = dtoMapper;
        this.documentProcessor = documentProcessor;
        this.attachmentHelper = attachmentHelper;
        this.linkHelper = linkHelper;
        log.info("PageApplicationService initialized with refactored helpers");
    }

    @Override
    public PageId createPage(CreatePageCommand command) {
        CourseId courseId = CourseId.fromString(command.courseId());
        UnitId unitId = UnitId.fromString(command.unitId());
        log.info("Creating page '{}' for course {} and unit {}", command.title(), courseId.getValue(), unitId.getValue());

        Page page = Page.create(courseId, unitId, command.title(), command.content());
        Page saved = pageRepository.save(page);

        log.info("Page created: {}", saved.getId().getValue());
        return saved.getId();
    }

    @Override
    public PageDTO createPageFrontend(CreatePageFrontendDTO command) {
        CourseId courseId = CourseId.fromString(command.courseId());
        UnitId unitId = UnitId.fromString(command.unitId());
        long startTime = System.currentTimeMillis();

        log.info("Creating page with frontend extraction: '{}' for course {} and unit {}",
                command.title(), courseId.getValue(), unitId.getValue());

        try {
            log.info("Frontend extraction - Attachments: {}, Links: {}, Publish: {}",
                    command.attachments() != null ? command.attachments().size() : 0,
                    command.externalLinks() != null ? command.externalLinks().size() : 0,
                    command.publishImmediately());

            Page page = Page.create(courseId, unitId, command.title(), command.content());

            int filesProcessed = 0;
            int linksAdded = 0;

            if (command.attachments() != null && !command.attachments().isEmpty()) {
                filesProcessed = documentProcessor.processFrontendDocuments(page, command.attachments());
                log.debug("Processed {} frontend documents", filesProcessed);
            }

            if (command.externalLinks() != null && !command.externalLinks().isEmpty()) {
                linksAdded = linkHelper.addExternalLinksToPage(page, command.externalLinks());
                log.debug("Added {} external links", linksAdded);
            }

            if (command.publishImmediately()) {
                page.publish();
                log.debug("Page set to published status");
            }

            Page savedPage = pageRepository.save(page);

            PageDTO result = dtoMapper.toCompleteDTO(savedPage);

            long duration = System.currentTimeMillis() - startTime;
            log.info("Frontend extraction page created in {}ms. Page ID: {}, Published: {}, Files: {}, Links: {}",
                    duration, savedPage.getId().getValue(), savedPage.isPublished(),
                    filesProcessed, linksAdded);

            return result;

        } catch (Exception e) {
            log.error("Failed to create page with frontend extraction '{}': {}",
                    command.title(), e.getMessage(), e);
            throw new RuntimeException("Failed to create page with frontend extraction", e);
        }
    }

    @Override
    public PageDTO createPageWithFileAttachments(CreatePageWithAttachmentsCommand command) {
        log.info("DIAGNOSTIC - Command received:");
        log.info("courseId: {}", command.courseId());
        log.info("unitId: {}", command.unitId());
        log.info("title: '{}'", command.title());
        log.info("content: '{}'", command.content() != null ?
                (command.content().length() > 50 ? command.content().substring(0, 50) + "..." : command.content())
                : "null");
        log.info("publishImmediately: {}", command.publishImmediately());

        CourseId courseId = CourseId.fromString(command.courseId());
        UnitId unitId = UnitId.fromString(command.unitId());
        long startTime = System.currentTimeMillis();

        log.info("Creating page dynamically: '{}' for course {} and unit {} - Links: {}, Files: {}, Publish: {}",
                command.title(), courseId.getValue(), unitId.getValue(),
                command.externalLinks() != null ? command.externalLinks().size() : 0,
                command.attachments() != null ? command.attachments().size() : 0,
                command.publishImmediately());

        try {
            Page page = Page.create(courseId, unitId, command.title(), command.content());

            int linksAdded = 0;
            int filesProcessed = 0;

            if (command.externalLinks() != null && !command.externalLinks().isEmpty()) {
                linksAdded = linkHelper.addExternalLinksToPage(page, command.externalLinks());
                log.debug("Dynamically added {} external links to page", linksAdded);
            } else {
                log.debug("No external links provided - skipping link addition");
            }

            if (command.attachments() != null && !command.attachments().isEmpty()) {
                filesProcessed = documentProcessor.processFileAttachments(page, command.attachments());
                log.debug("Dynamically processed {} file attachments", filesProcessed);
            } else {
                log.debug("No file attachments provided - skipping file processing");
            }

            if (command.publishImmediately()) {
                page.publish();
                log.debug("Page set to published status");
            }

            Page savedPage = pageRepository.save(page);

            PageDTO result = dtoMapper.toCompleteDTO(savedPage);

            long duration = System.currentTimeMillis() - startTime;
            log.info("Dynamic page creation completed in {}ms. Page ID: {}, Published: {}, Links: {}, Files: {}",
                    duration, savedPage.getId().getValue(), savedPage.isPublished(),
                    linksAdded, filesProcessed);

            return result;

        } catch (Exception e) {
            log.error("Failed to create page dynamically '{}': {}",
                    command.title(), e.getMessage(), e);
            throw new RuntimeException("Failed to create page with dynamic content", e);
        }
    }

    @Override
    public void updatePage(UpdatePageCommand command) {
        PageId pageId = PageId.fromString(command.pageId());
        log.info("Updating page {} with title: '{}'", pageId.getValue(), command.title());

        Page page = findPageByIdOrThrow(pageId);

        page.updateTitleAndContent(command.title(), command.content());
        pageRepository.save(page);

        log.info("Page updated successfully: ID={}, Title='{}'", pageId.getValue(), command.title());
    }

    @Override
    public void updateContent(UpdatePageContentCommand command) {
        PageId pageId = PageId.fromString(command.pageId());
        log.info("Updating content for page {}", pageId.getValue());

        Page page = findPageByIdOrThrow(pageId);
        page.updateContent(command.content());
        pageRepository.save(page);

        log.info("Page content updated");
    }

    @Override
    public void deletePage(PageId pageId) {
        log.info("Deleting page: {}", pageId.getValue());
        Page page = findPageByIdOrThrow(pageId);
        pageRepository.delete(page);
        log.info("Page deleted successfully: {}", pageId.getValue());
    }

    @Override
    public void addBulkAttachmentsJson(PageId pageId, List<FrontendDocumentDTO> attachments) {
        attachmentHelper.addBulkAttachmentsJson(pageId, attachments);
    }

    @Override
    public void addSingleAttachmentJson(PageId pageId, FrontendDocumentDTO attachment) {
        attachmentHelper.addSingleAttachmentJson(pageId, attachment);
    }

    @Override
    public void addAttachmentToPage(PageId pageId, MultipartFile file) {
        attachmentHelper.addAttachmentToPage(pageId, file);
    }

    @Override
    public void addAttachmentsToPage(String pageId, List<AddPageAttachmentCommand> attachments) {
        attachmentHelper.addAttachmentsToPage(pageId, attachments);
    }

    @Override
    public void removeAttachmentFromPage(PageId pageId, String documentName) {
        attachmentHelper.removeAttachmentFromPage(pageId, documentName);
    }

    @Override
    public void removeAttachmentsFromPage(PageId pageId, List<String> documentNames) {
        attachmentHelper.removeAttachmentsFromPage(pageId, documentNames);
    }

    @Override
    public void clearAttachmentsFromPage(PageId pageId) {
        attachmentHelper.clearAttachmentsFromPage(pageId);
    }

    @Override
    public void addLinkToPage(PageId pageId, String linkUrl) {
        linkHelper.addLinkToPage(pageId, linkUrl);
    }

    @Override
    public void addLinksToPage(String pageId, List<String> urls) {
        linkHelper.addLinksToPage(pageId, urls);
    }

    @Override
    public void removeLinkFromPage(PageId pageId, String linkUrl) {
        linkHelper.removeLinkFromPage(pageId, linkUrl);
    }

    @Override
    public void removeLinksFromPage(PageId pageId, List<String> links) {
        linkHelper.removeLinksFromPage(pageId, links);
    }

    @Override
    public void clearLinksFromPage(PageId pageId) {
        linkHelper.clearLinksFromPage(pageId);
    }

    @Override
    @Transactional(readOnly = true)
    public PageDTO getPageById(PageId pageId) {
        Page page = findPageByIdOrThrow(pageId);
        return dtoMapper.toDTO(page);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PageDTO> getPagesByCourse(CourseId courseId) {
        return dtoMapper.toDTOList(pageRepository.findByCourseId(courseId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<PageDTO> getPagesByUnit(UnitId unitId) {
        return dtoMapper.toDTOList(pageRepository.findByUnitId(unitId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<PageDTO> getPublishedPagesByCourse(CourseId courseId) {
        return dtoMapper.toDTOList(pageRepository.findPublishedByCourseId(courseId));
    }

    private Page findPageByIdOrThrow(PageId pageId) {
        return pageRepository.findById(pageId)
                .orElseThrow(() -> new PageNotFoundException("Page not found: " + pageId.getValue()));
    }
}