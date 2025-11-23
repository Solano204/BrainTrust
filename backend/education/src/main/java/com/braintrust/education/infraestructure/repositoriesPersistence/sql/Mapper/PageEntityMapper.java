package com.braintrust.education.infraestructure.repositoriesPersistence.sql.Mapper;

import com.braintrust.education.domain.model.Page;
import com.braintrust.education.domain.valueobjects.*;
import com.braintrust.education.infraestructure.repositoriesPersistence.sql.entities.*;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import java.util.*;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
// other imports...

@Component
public class PageEntityMapper {

    private static final Logger log =
            LoggerFactory.getLogger(PageEntityMapper.class);

    private final ObjectMapper objectMapper;

    public PageEntityMapper(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public PageJpaEntity toEntity(Page page) {
        log.debug("Mapping Page Domain {} to JPA Entity", page.getId().getValue());

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

        // Map external links
        if (page.getExternalLinks() != null) {
            entity.setExternalLinks(new ArrayList<>(page.getExternalLinks()));
        }

        // Map attachments
        if (page.getAttachments() != null && !page.getAttachments().isEmpty()) {
            List<DocumentJpaEntity> documentEntities = page.getAttachments().stream()
                    .map(this::toDocumentEntity)
                    .collect(Collectors.toList());
            entity.setAttachments(documentEntities);
        }

        return entity;
    }

    public Page toDomain(PageJpaEntity entity) {
        log.debug("Mapping Page JPA Entity {} to Domain", entity.getId());

        PageId id = PageId.fromString(entity.getId());
        CourseId courseId = CourseId.fromString(entity.getCourseId());

        List<Document> attachments = new ArrayList<>();
        if (entity.getAttachments() != null) {
            attachments = entity.getAttachments().stream()
                    .map(this::toDomainDocument)
                    .collect(Collectors.toList());
        }

        List<String> externalLinks = entity.getExternalLinks() != null
                ? new ArrayList<>(entity.getExternalLinks())
                : new ArrayList<>();

        return Page.reconstitute(
                id,
                courseId,
                UnitId.fromString(entity.getUnitId().toString()),
                entity.getTitle(),
                entity.getContent(),
                attachments,
                externalLinks,
                entity.getCreatedAt(),
                entity.getLastModified(),
                entity.isPublished()
        );
    }

    private DocumentJpaEntity toDocumentEntity(Document doc) {
        DocumentJpaEntity entity = new DocumentJpaEntity();
        entity.setName(doc.getName());
        entity.setStoragePath(doc.getStoragePath());
        return entity;
    }

    private Document toDomainDocument(DocumentJpaEntity entity) {
        return new Document(
                entity.getName(),
                entity.getStoragePath()
        );
    }
}