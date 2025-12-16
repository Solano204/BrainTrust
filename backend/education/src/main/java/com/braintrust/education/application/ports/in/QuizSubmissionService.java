package com.braintrust.education.application.ports.in;

import com.braintrust.education.application.dtos.commands.*;
import com.braintrust.education.application.dtos.dtos.*;
import com.braintrust.education.domain.model.QuizSubmissionStatus;
import com.braintrust.education.domain.valueobjects.CourseId;
import com.braintrust.education.domain.valueobjects.QuizId;
import com.braintrust.education.domain.valueobjects.QuizSubmissionId;
import com.braintrust.education.domain.valueobjects.UnitId;
import com.braintrust.identity.domain.valueobjects.UserId;
import java.util.List;

public interface QuizSubmissionService {

    // Commands
    /*
    QuizSubmissionId startQuiz(StartQuizCommand command);
    */

    /*
    void answerQuestion(AnswerQuestionCommand command);
    */

    /*
    void submitQuiz(SubmitQuizCommand command);
    */
    List<QuizSubmissionBasicDTO> getSubmissionsByCourseBasic(CourseId courseId);

    void gradeQuizSubmission(GradeQuizSubmissionCommand command);
    QuizSubmissionId submitQuizWithAnswers(SubmitQuizWithAnswersCommand command);
    QuizSubmissionDetailDTO getSubmissionDetailById(QuizSubmissionId submissionId);
    List<QuizSubmissionDTO> getSubmissionsByCourse(CourseId courseId);
    QuizSubmissionDetailDTO getStudentQuizSubmissionDetail(String quizId, String studentId);

    // NEW: Delete submission
    void deleteSubmission(QuizSubmissionId submissionId);

    // NEW: Get submissions by course and unit
    List<QuizSubmissionBasicDTO> getSubmissionsByCourseAndUnitBasic(CourseId courseId, UnitId unitId);

    // NEW: Get submissions by student, course and unit
    List<QuizSubmissionBasicDTO> getSubmissionsByStudentAndCourseAndUnitBasic(UserId studentId, CourseId courseId, UnitId unitId);

    // Queries
    QuizSubmissionDTO getSubmissionById(QuizSubmissionId submissionId);

    /*
    List<QuizSubmissionDTO> getSubmissionsByQuiz(QuizId quizId);
    */

    List<QuizSubmissionDTO> getSubmissionsByStudent(UserId studentId);

    /*
    List<QuizSubmissionDTO> getSubmissionsByQuizAndStudent(QuizId quizId, UserId studentId);
    */

    /*
    List<QuizSubmissionDTO> getSubmissionsByStatus(QuizSubmissionStatus status);
    */

    /*
    QuizSubmissionDTO getLatestSubmission(QuizId quizId, UserId studentId);
    */

    /*
    int getAttemptCount(QuizId quizId, UserId studentId);
    */

    /*
    boolean hasPassedTimeLimit(QuizSubmissionId submissionId);
    */

    /*
    QuizSubmissionAnalyticsDTO getQuizAnalytics(QuizId quizId);
    */
}