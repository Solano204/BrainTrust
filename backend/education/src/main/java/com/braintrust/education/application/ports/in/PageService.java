package com.braintrust.education.application.ports.in;

import com.braintrust.education.application.dtos.commands.*;
import com.braintrust.education.application.dtos.dtos.PageDTO;
import com.braintrust.education.domain.valueobjects.CourseId;
import com.braintrust.education.domain.valueobjects.PageId;
import com.braintrust.education.domain.valueobjects.UnitId;
import java.util.List;

public interface PageService {

    // Commands
    PageId createPage(CreatePageCommand command);
    void updateContent(UpdatePageContentCommand command);
    public void addLinksToPage(String pageId, List<String> urls);
    public void addAttachmentsToPage(String pageId, List<AddPageAttachmentCommand> attachments);

    /*
    void publishPage(PublishPageCommand command);
    */

    /*
    PageDTO createCompletePage(CreateCompletePageCommand command);
    */

    // Queries
    PageDTO getPageById(PageId pageId);
    List<PageDTO> getPagesByCourse(CourseId courseId);
    List<PageDTO> getPagesByUnit(UnitId unitId);
    List<PageDTO> getPublishedPagesByCourse(CourseId courseId);

    PageDTO createPageWithFileAttachments(CreatePageWithAttachmentsCommand command);

    // NEW: Delete page
    void deletePage(PageId pageId);
}