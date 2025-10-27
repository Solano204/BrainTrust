package com.braintrust.education.application.ports.out;


import com.braintrust.education.domain.model.CourseUnit;
import com.braintrust.education.domain.valueobjects.CourseId;
import com.braintrust.education.domain.valueobjects.UnitId;

import java.util.List;
import java.util.Optional;

// 📍 education/application/ports/out/UnitRepository.java
public interface UnitRepository {

    // Commands
    CourseUnit save(CourseUnit unit);
    void delete(CourseUnit unit);

    // Queries
    Optional<CourseUnit> findById(UnitId unitId);
    List<CourseUnit> findByCourseId(CourseId courseId);
    List<CourseUnit> findByCourseIdOrderByNumber(CourseId courseId);
}