package com.braintrust.education.application.helpers.page;

import com.braintrust.education.application.ports.out.PageRepository;
import com.braintrust.education.domain.exceptions.PageNotFoundException;
import com.braintrust.education.domain.model.Page;
import com.braintrust.education.domain.valueobjects.PageId;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class PageLinkHelper {

    private static final Logger log = LoggerFactory.getLogger(PageLinkHelper.class);

    private final PageRepository pageRepository;

    public PageLinkHelper(PageRepository pageRepository) {
        this.pageRepository = pageRepository;
    }

    public void addLinkToPage(PageId pageId, String linkUrl) {
        log.info("Adding link to Page ID: {}", pageId.getValue());

        Page page = findPageByIdOrThrow(pageId);
        page.addLink(linkUrl);
        pageRepository.save(page);

        log.info("Link added successfully to Page ID: {}", pageId.getValue());
    }

    public void addLinksToPage(String pageId, List<String> urls) {
        PageId pageIdObj = PageId.fromString(pageId);

        if (urls == null || urls.isEmpty()) {
            log.warn("Attempted to add empty or null URLs list to page {}", pageId);
            return;
        }

        log.info("Adding {} links to page {}", urls.size(), pageId);

        Page page = findPageByIdOrThrow(pageIdObj);
        urls.forEach(page::addLink);
        pageRepository.save(page);

        log.info("Added {} links to page {}", urls.size(), pageId);
    }

    public int addExternalLinksToPage(Page page, List<String> externalLinks) {
        if (externalLinks == null || externalLinks.isEmpty()) {
            return 0;
        }

        int validLinksAdded = 0;

        for (String link : externalLinks) {
            try {
                if (link != null && !link.trim().isEmpty()) {
                    page.addLink(link.trim());
                    validLinksAdded++;
                    log.debug("Added external link: {}", link);
                }
            } catch (Exception e) {
                log.warn("⚠️ Failed to add external link '{}': {}", link, e.getMessage());
            }
        }

        return validLinksAdded;
    }

    public void removeLinkFromPage(PageId pageId, String linkUrl) {
        log.info("Removing link from Page ID: {}", pageId.getValue());

        Page page = findPageByIdOrThrow(pageId);

        List<String> updatedLinks = page.getExternalLinks().stream()
                .filter(link -> !link.equals(linkUrl))
                .collect(Collectors.toList());

        Page updatedPage = Page.reconstitute(
                page.getId(),
                page.getCourseId(),
                page.getUnitId(),
                page.getTitle(),
                page.getContent(),
                new ArrayList<>(page.getAttachments()),
                updatedLinks,
                page.getCreatedAt(),
                LocalDateTime.now(),
                page.isPublished()
        );

        pageRepository.save(updatedPage);

        log.info("Link removed successfully from Page ID: {}", pageId.getValue());
    }

    public void removeLinksFromPage(PageId pageId, List<String> links) {
        if (links == null || links.isEmpty()) {
            log.warn("Attempted to remove empty or null links list from page {}", pageId.getValue());
            return;
        }

        log.info("Removing {} links from Page ID: {}", links.size(), pageId.getValue());

        Page page = findPageByIdOrThrow(pageId);
        List<String> currentLinks = new ArrayList<>(page.getExternalLinks());
        currentLinks.removeAll(links);

        Page updatedPage = Page.reconstitute(
                page.getId(),
                page.getCourseId(),
                page.getUnitId(),
                page.getTitle(),
                page.getContent(),
                new ArrayList<>(page.getAttachments()),
                currentLinks,
                page.getCreatedAt(),
                LocalDateTime.now(),
                page.isPublished()
        );

        pageRepository.save(updatedPage);

        log.info("Successfully removed {} links from Page ID: {}", links.size(), pageId.getValue());
    }

    public void clearLinksFromPage(PageId pageId) {
        log.info("Clearing all links from Page ID: {}", pageId.getValue());

        Page page = findPageByIdOrThrow(pageId);

        Page updatedPage = Page.reconstitute(
                page.getId(),
                page.getCourseId(),
                page.getUnitId(),
                page.getTitle(),
                page.getContent(),
                new ArrayList<>(page.getAttachments()),
                new ArrayList<>(),
                page.getCreatedAt(),
                LocalDateTime.now(),
                page.isPublished()
        );

        pageRepository.save(updatedPage);

        log.info("All links cleared from Page ID: {}", pageId.getValue());
    }

    private Page findPageByIdOrThrow(PageId pageId) {
        return pageRepository.findById(pageId)
                .orElseThrow(() -> new PageNotFoundException("Page not found: " + pageId.getValue()));
    }
}