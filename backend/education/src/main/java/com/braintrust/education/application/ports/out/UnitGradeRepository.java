package com.braintrust.education.application.ports.out;

import com.braintrust.education.domain.model.UnitGrade;
import com.braintrust.education.domain.valueobjects.UnitGradeId;
import com.braintrust.education.domain.valueobjects.UnitId;
import com.braintrust.identity.domain.valueobjects.UserId;
import com.braintrust.education.domain.valueobjects.CourseId;

import java.util.List;
import java.util.Optional;

public interface UnitGradeRepository {

    // Commands
    UnitGrade save(UnitGrade unitGrade);
    void delete(UnitGrade unitGrade);

    // Queries
    List<UnitGrade> findByCourseAndStudent(CourseId courseId, UserId studentId);
    Optional<UnitGrade> findById(UnitGradeId unitGradeId);
    Optional<UnitGrade> findByUnitAndStudent(UnitId unitId, UserId studentId);
    List<UnitGrade> findByUnitId(UnitId unitId);
    List<UnitGrade> findByStudentId(UserId studentId);
}