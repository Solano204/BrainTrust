package com.braintrust.education.application.ports.out;

import com.braintrust.education.domain.model.QuizSubmission;
import com.braintrust.education.domain.model.QuizSubmissionStatus;
import com.braintrust.education.domain.valueobjects.CourseId;
import com.braintrust.education.domain.valueobjects.QuizId;
import com.braintrust.education.domain.valueobjects.QuizSubmissionId;
import com.braintrust.identity.domain.valueobjects.UserId;
import java.util.List;
import java.util.Optional;

public interface QuizSubmissionRepository {

    // Commands
    QuizSubmission save(QuizSubmission submission);
    void delete(QuizSubmission submission);

    // Queries
    Optional<QuizSubmission> findById(QuizSubmissionId submissionId);

    /*
    List<QuizSubmission> findByQuizId(QuizId quizId);
    */

    List<QuizSubmission> findByStudentId(UserId studentId);

    /*
    List<QuizSubmission> findByQuizAndStudent(QuizId quizId, UserId studentId);
    */

    Optional<QuizSubmission> findLatestByQuizAndStudent(QuizId quizId, UserId studentId);

    /*
    List<QuizSubmission> findByStatus(QuizSubmissionStatus status);
    */

    int countAttempts(QuizId quizId, UserId studentId);

    /*
    List<QuizSubmission> findInProgressSubmissions(UserId studentId);
    */

    /*
    List<QuizSubmission> findByCourseAndStudent(CourseId courseId, UserId studentId);
    */

    // NEW: Find submissions by course ordered by date
    List<QuizSubmission> findByCourseIdOrderBySubmittedAtDesc(CourseId courseId);
}