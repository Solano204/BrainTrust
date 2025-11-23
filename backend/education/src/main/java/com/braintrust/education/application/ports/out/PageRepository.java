package com.braintrust.education.application.ports.out;

import com.braintrust.education.domain.model.Page;
import com.braintrust.education.domain.valueobjects.CourseId;
import com.braintrust.education.domain.valueobjects.PageId;
import com.braintrust.education.domain.valueobjects.UnitId;

import java.util.List;
import java.util.Optional;

public interface PageRepository {

    // Commands
    Page save(Page page);
    void delete(Page page);
    // Queries
    public List<Page> findByUnitId(UnitId unitId);
    Optional<Page> findById(PageId pageId);
    List<Page> findByCourseId(CourseId courseId);
    List<Page> findPublishedByCourseId(CourseId courseId);
}