package com.braintrust.education.domain.model;

import com.braintrust.education.domain.valueobjects.*;
import com.braintrust.shared.domain.AggregateRoot;
import java.time.LocalDateTime;
import java.util.*;

public class Page extends AggregateRoot<PageId> {
    private CourseId courseId;
    private UnitId unitId;
    private String title;
    private String content;
    private final List<Document> attachments;
    private final List<String> externalLinks;
    private LocalDateTime createdAt;
    private LocalDateTime lastModified;
    private boolean published;

    private Page(PageId id, CourseId courseId, UnitId unitId, String title) {
        this.id = id;
        this.courseId = courseId;
        this.unitId = unitId;
        this.title = title;
        this.attachments = new ArrayList<>();
        this.externalLinks = new ArrayList<>();
        this.createdAt = LocalDateTime.now();
        this.lastModified = LocalDateTime.now();
        this.published = false;
    }

    public static Page create(CourseId courseId, UnitId unitId, String title, String content) {
        PageId id = PageId.generate();
        Page page = new Page(id, courseId, unitId, title);
        page.content = content;
        return page;
    }



    public static Page reconstitute(PageId id, CourseId courseId, UnitId unitId, String title, String content,
                                    List<Document> attachments, List<String> externalLinks,
                                    LocalDateTime createdAt, LocalDateTime lastModified,
                                    boolean published) {
        Page page = new Page(id, courseId, unitId, title);
        page.content = content;
        page.createdAt = createdAt;
        page.lastModified = lastModified;
        page.published = published;
        if (attachments != null) page.attachments.addAll(attachments);
        if (externalLinks != null) page.externalLinks.addAll(externalLinks);
        return page;
    }


    public void removeLink(String url) {
        // Make sure externalLinks is a mutable list in your domain model
        // If it's currently: private final List<String> externalLinks = new ArrayList<>();
        // Then this will work:
        externalLinks.remove(url);
        this.lastModified = LocalDateTime.now();
    }

    public void updateTitle(String title) {
        if (title == null || title.trim().isEmpty()) {
            throw new IllegalArgumentException("Title cannot be empty");
        }
        this.title = title.trim();
        this.lastModified = LocalDateTime.now();
    }

    public void updateTitleAndContent(String title, String content) {
        if (title == null || title.trim().isEmpty()) {
            throw new IllegalArgumentException("Title cannot be empty");
        }
        this.title = title.trim();
        this.content = content; // content can be null or empty
        this.lastModified = LocalDateTime.now();
    }


    public void removeAttachment(String documentName) {
        attachments.removeIf(doc -> doc.getName().equals(documentName));
        this.lastModified = LocalDateTime.now();
    }

    public void removeAttachments(List<String> documentNames) {
        if (documentNames != null) {
            attachments.removeIf(doc -> documentNames.contains(doc.getName()));
            this.lastModified = LocalDateTime.now();
        }
    }

    public void clearAllLinks() {
        externalLinks.clear();
        this.lastModified = LocalDateTime.now();
    }

    public void clearAllAttachments() {
        attachments.clear();
        this.lastModified = LocalDateTime.now();
    }

    public void updateContent(String content) {
        this.content = content;
        this.lastModified = LocalDateTime.now();
    }

    public List<Document> getAttachmentsInternal() {
        return this.attachments; // returns the mutable list
    }


    public void clearAttachments() {
        attachments.clear();
        this.lastModified = LocalDateTime.now();
    }




    public void publish() {
        this.published = true;
        this.lastModified = LocalDateTime.now();
    }

    public void addLink(String url) {
        externalLinks.add(url);
    }

    public void addAttachment(Document document) {
        attachments.add(document);
    }

    // Getters
    public CourseId getCourseId() { return courseId; }
    public UnitId getUnitId() { return unitId; }
    public String getTitle() { return title; }
    public String getContent() { return content; }
    public List<Document> getAttachments() { return List.copyOf(attachments); }
    public List<String> getExternalLinks() { return List.copyOf(externalLinks); }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getLastModified() { return lastModified; }
    public boolean isPublished() { return published; }
}