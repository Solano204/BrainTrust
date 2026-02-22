package com.braintrust.education.application.ports.out;


import com.braintrust.education.domain.model.CourseUnit;
import com.braintrust.education.domain.valueobjects.CourseId;
import com.braintrust.education.domain.valueobjects.UnitId;

import java.util.List;
import java.util.Optional;


public interface UnitRepository {

    CourseUnit save(CourseUnit unit);
    void delete(CourseUnit unit);

    Optional<CourseUnit> findById(UnitId unitId);
    List<CourseUnit> findByCourseId(CourseId courseId);
    List<CourseUnit> findByCourseIdOrderByNumber(CourseId courseId);
}