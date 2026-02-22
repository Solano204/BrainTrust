package com.braintrust.education.application.ports.in;

import com.braintrust.aidetectition.application.dtos.commands.FrontendDocumentDTO;
import com.braintrust.education.application.dtos.commands.*;
import com.braintrust.education.application.dtos.dtos.PageDTO;
import com.braintrust.education.domain.valueobjects.CourseId;
import com.braintrust.education.domain.valueobjects.PageId;
import com.braintrust.education.domain.valueobjects.UnitId;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface PageService {

    PageId createPage(CreatePageCommand command);
    void updateContent(UpdatePageContentCommand command);
    public void addLinksToPage(String pageId, List<String> urls);
    public void addAttachmentsToPage(String pageId, List<AddPageAttachmentCommand> attachments);


    void addBulkAttachmentsJson(PageId pageId, List<FrontendDocumentDTO> attachments);

    void addSingleAttachmentJson(PageId pageId, FrontendDocumentDTO attachment);
    void updatePage(UpdatePageCommand command);


    void addLinkToPage(PageId pageId, String linkUrl);
    void removeLinkFromPage(PageId pageId, String linkUrl);
    void removeLinksFromPage(PageId pageId, List<String> links);
    void clearLinksFromPage(PageId pageId);

    void addAttachmentToPage(PageId pageId, MultipartFile file);
    void removeAttachmentFromPage(PageId pageId, String documentName);
    void removeAttachmentsFromPage(PageId pageId, List<String> documentNames);
    void clearAttachmentsFromPage(PageId pageId);

    PageDTO getPageById(PageId pageId);
    List<PageDTO> getPagesByCourse(CourseId courseId);
    List<PageDTO> getPagesByUnit(UnitId unitId);
    List<PageDTO> getPublishedPagesByCourse(CourseId courseId);

    PageDTO createPageFrontend(CreatePageFrontendDTO command);

    PageDTO createPageWithFileAttachments(CreatePageWithAttachmentsCommand command);

    void deletePage(PageId pageId);
}