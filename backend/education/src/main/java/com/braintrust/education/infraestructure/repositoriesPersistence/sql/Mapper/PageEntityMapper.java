package com.braintrust.education.infraestructure.repositoriesPersistence.sql.Mapper;

import com.braintrust.education.domain.model.Page;
import com.braintrust.education.domain.valueobjects.*;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities.*;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class PageEntityMapper {

    private static final Logger log =
            LoggerFactory.getLogger(PageEntityMapper.class);

    public PageJpaEntity toEntity(Page page) {
        log.debug("Mapping Page Domain {} to JPA Entity", page.getId().getValue());


        log.debug("Domain values - ID: {}, CourseId: {}, UnitId: {}, Title: {}, Content length: {}, Links: {}, Attachments: {}",
                page.getId().getValue(),
                page.getCourseId().getValue(),
                page.getUnitId().getValue(),
                page.getTitle(),
                page.getContent() != null ? page.getContent().length() : 0,
                page.getExternalLinks() != null ? page.getExternalLinks().size() : 0,
                page.getAttachments() != null ? page.getAttachments().size() : 0);

        PageJpaEntity entity = new PageJpaEntity(
                page.getId().getValue(),
                page.getCourseId().getValue(),
                page.getUnitId().getValue(),
                page.getTitle(),
                page.getContent(),
                page.getCreatedAt(),
                page.getLastModified(),
                page.isPublished()
        );


        if (page.getExternalLinks() != null && !page.getExternalLinks().isEmpty()) {
            log.debug("Mapping {} external links to entity", page.getExternalLinks().size());

            List<String> linksList = new ArrayList<>(page.getExternalLinks());
            entity.setExternalLinks(linksList);
            log.debug("External links set on entity: {}", entity.getExternalLinks());
        } else {
            entity.setExternalLinks(new ArrayList<>());
        }


        if (page.getAttachments() != null && !page.getAttachments().isEmpty()) {
            log.debug("Mapping {} attachments to entity", page.getAttachments().size());
            List<DocumentJpaEntity> documentEntities = page.getAttachments().stream()
                    .map(doc -> {
                        DocumentJpaEntity docEntity = new DocumentJpaEntity();
                        docEntity.setName(doc.getName());
                        docEntity.setStoragePath(doc.getStoragePath());
                        docEntity.setPage(entity);
                        log.debug("Created document entity: name={}, path={}", doc.getName(), doc.getStoragePath());
                        return docEntity;
                    })
                    .collect(Collectors.toList());
            entity.setAttachments(documentEntities);
            log.debug("Attachments set on entity: {}", entity.getAttachments().size());
        } else {
            entity.setAttachments(new ArrayList<>());
        }

        log.debug("✅ Page entity mapped successfully: ID={}, CourseId={}, UnitId={}, Title={}, Content length={}, Links={}, Attachments={}",
                entity.getId(), entity.getCourseId(), entity.getUnitId(),
                entity.getTitle(),
                entity.getContent() != null ? entity.getContent().length() : 0,
                entity.getExternalLinks() != null ? entity.getExternalLinks().size() : 0,
                entity.getAttachments() != null ? entity.getAttachments().size() : 0);

        return entity;
    }

    public Page toDomain(PageJpaEntity entity) {
        log.debug("Mapping Page JPA Entity {} to Domain", entity.getId());

        List<Document> attachments = new ArrayList<>();
        if (entity.getAttachments() != null && !entity.getAttachments().isEmpty()) {
            attachments = entity.getAttachments().stream()
                    .map(doc -> new Document(doc.getName(), doc.getStoragePath()))
                    .collect(Collectors.toList());
            log.debug("Mapped {} attachments from entity", attachments.size());
        }

        List<String> externalLinks = new ArrayList<>();
        if (entity.getExternalLinks() != null && !entity.getExternalLinks().isEmpty()) {
            externalLinks = new ArrayList<>(entity.getExternalLinks());
            log.debug("Mapped {} external links from entity", externalLinks.size());
        }

        log.debug("Creating domain page: ID={}, CourseId={}, UnitId={}, Title={}, Content length={}, Links={}, Attachments={}",
                entity.getId(), entity.getCourseId(), entity.getUnitId(),
                entity.getTitle(),
                entity.getContent() != null ? entity.getContent().length() : 0,
                externalLinks.size(),
                attachments.size());

        return Page.reconstitute(
                PageId.fromString(entity.getId()),
                CourseId.fromString(entity.getCourseId()),
                UnitId.fromString(entity.getUnitId()),
                entity.getTitle(),
                entity.getContent(),
                attachments,
                externalLinks,
                entity.getCreatedAt(),
                entity.getLastModified(),
                entity.isPublished()
        );
    }
}