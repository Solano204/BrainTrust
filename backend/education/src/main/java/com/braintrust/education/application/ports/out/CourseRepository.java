package com.braintrust.education.application.ports.out;

import com.braintrust.education.domain.model.Course;
import com.braintrust.education.domain.valueobjects.CourseCode;
import com.braintrust.education.domain.valueobjects.CourseId;
import com.braintrust.education.domain.valueobjects.UnitId;
import com.braintrust.identity.domain.valueobjects.UserId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface CourseRepository {

    // Commands
    Course save(Course course);
    void delete(Course course);

    // Queries
    Optional<Course> findById(CourseId courseId);

    Page<Course> findAll(Pageable pageable);
    Page<Course> findActiveCourses(Pageable pageable);
    Page<Course> findByTeacherId(UserId teacherId, Pageable pageable);
    Page<Course> findByStudentId(UserId studentId, Pageable pageable);

    List<Course> findAll();
    List<Course> findActiveCourses();
    List<Course> findByTeacherId(UserId teacherId);

    List<Course> findByStudentId(UserId studentId);

    boolean existsByCode(CourseCode code);
    Optional<Course> findByUnitId(UnitId unitId);
}