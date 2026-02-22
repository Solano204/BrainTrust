package com.braintrust.education.application.helpers.page;

import com.braintrust.education.application.dtos.dtos.DocumentDTO;
import com.braintrust.education.application.dtos.dtos.PageDTO;
import com.braintrust.education.domain.model.Page;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;


@Component
public class PageDtoMapper {

    public PageDTO toDTO(Page page) {
        List<DocumentDTO> attachments = page.getAttachments().stream()
                .map(doc -> new DocumentDTO(doc.getName(), doc.getStoragePath()))
                .collect(Collectors.toList());

        return new PageDTO(
                page.getId().getValue(),
                page.getCourseId().getValue(),
                page.getUnitId().getValue(),
                "Course Name", // TODO: Resolve from CourseService
                "Unit Name",   // TODO: Resolve from UnitService
                page.getTitle(),
                page.getContent(),
                attachments,
                page.getExternalLinks(),
                page.getCreatedAt().toString(),
                page.getLastModified().toString(),
                page.isPublished()
        );
    }

    public PageDTO toCompleteDTO(Page page) {
        return toDTO(page);
    }

    public List<PageDTO> toDTOList(List<Page> pages) {
        return pages.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
}