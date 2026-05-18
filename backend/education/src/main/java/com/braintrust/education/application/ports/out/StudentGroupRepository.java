package com.braintrust.education.application.ports.out;

import com.braintrust.education.domain.model.StudentGroup;
import com.braintrust.education.domain.valueobjects.CourseId;
import com.braintrust.education.domain.valueobjects.StudentGroupId;
import com.braintrust.identity.domain.valueobjects.UserId;
import java.util.List;
import java.util.Optional;

public interface StudentGroupRepository {

    // Commands
    StudentGroup save(StudentGroup group);
    void delete(StudentGroup group);

    // Queries
    Optional<StudentGroup> findById(StudentGroupId groupId);
    List<StudentGroup> findByCourseId(CourseId courseId);
    List<StudentGroup> findActiveByCourseId(CourseId courseId);
    List<StudentGroup> findByMember(UserId studentId);
    boolean existsByNameAndCourse(String name, CourseId courseId);
}