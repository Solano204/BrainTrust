package com.braintrust.education.application.ports.out;
import com.braintrust.education.domain.model.Gradebook;
import com.braintrust.education.domain.valueobjects.CourseId;
import com.braintrust.education.domain.valueobjects.GradebookId;
import com.braintrust.identity.domain.valueobjects.UserId;
import java.util.List;
import java.util.Optional;

public interface GradebookRepository {

    // Commands
    Gradebook save(Gradebook gradebook);
    void delete(Gradebook gradebook);

    // Queries
    Optional<Gradebook> findById(GradebookId gradebookId);
    Optional<Gradebook> findByCourseAndStudent(CourseId courseId, UserId studentId);
    List<Gradebook> findByCourseId(CourseId courseId);
    boolean existsByCourseAndStudent(CourseId courseId, UserId studentId);
}