package com.braintrust.education.application.ports.out;

import com.braintrust.education.domain.model.Course;
import com.braintrust.education.domain.valueobjects.CourseCode;
import com.braintrust.education.domain.valueobjects.CourseId;
import com.braintrust.identity.domain.valueobjects.UserId;

import java.util.List;
import java.util.Optional;

// 📍 education/application/ports/out/CourseRepository.java
public interface CourseRepository {

    // Commands
    Course save(Course course);
    void delete(Course course);

    // Queries
    Optional<Course> findById(CourseId courseId);
    Optional<Course> findByCode(CourseCode code);
    List<Course> findByTeacherId(UserId teacherId);
    List<Course> findActiveCourses();
    List<Course> findByGradeAndGroup(String grade, String group);
    boolean existsByCode(CourseCode code);
}