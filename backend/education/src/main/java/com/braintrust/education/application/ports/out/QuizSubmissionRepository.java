package com.braintrust.education.application.ports.out;

import com.braintrust.education.domain.model.QuizSubmission;
import com.braintrust.education.domain.model.QuizSubmissionStatus;
import com.braintrust.education.domain.valueobjects.CourseId;
import com.braintrust.education.domain.valueobjects.QuizId;
import com.braintrust.education.domain.valueobjects.QuizSubmissionId;
import com.braintrust.education.domain.valueobjects.UnitId;
import com.braintrust.identity.domain.valueobjects.UserId;
import java.util.List;
import java.util.Optional;

public interface QuizSubmissionRepository {

    // Commands
    QuizSubmission save(QuizSubmission submission);
    void delete(QuizSubmission submission);

    // Queries
    Optional<QuizSubmission> findById(QuizSubmissionId submissionId);

    List<QuizSubmission> findByStudentId(UserId studentId);

    Optional<QuizSubmission> findLatestByQuizAndStudent(QuizId quizId, UserId studentId);

    int countAttempts(QuizId quizId, UserId studentId);

    List<QuizSubmission> findByCourseIdOrderBySubmittedAtDesc(CourseId courseId);

    List<QuizSubmission> findByCourseIdAndUnitIdOrderBySubmittedAtDesc(CourseId courseId, UnitId unitId);

    List<QuizSubmission> findByStudentIdAndCourseIdAndUnitIdOrderBySubmittedAtDesc(UserId studentId, CourseId courseId, UnitId unitId);
}