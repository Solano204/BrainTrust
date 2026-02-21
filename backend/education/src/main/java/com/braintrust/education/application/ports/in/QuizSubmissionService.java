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

    List<QuizSubmissionBasicDTO> getSubmissionsByCourseBasic(CourseId courseId);

    void gradeQuizSubmission(GradeQuizSubmissionCommand command);
    QuizSubmissionId submitQuizWithAnswers(SubmitQuizWithAnswersCommand command);
    QuizSubmissionDetailDTO getSubmissionDetailById(QuizSubmissionId submissionId);
    List<QuizSubmissionDTO> getSubmissionsByCourse(CourseId courseId);
    QuizSubmissionDetailDTO getStudentQuizSubmissionDetail(String quizId, String studentId);

    void deleteSubmission(QuizSubmissionId submissionId);

    List<QuizSubmissionBasicDTO> getSubmissionsByCourseAndUnitBasic(CourseId courseId, UnitId unitId);

    List<QuizSubmissionBasicDTO> getSubmissionsByStudentAndCourseAndUnitBasic(UserId studentId, CourseId courseId, UnitId unitId);

    // Queries
    QuizSubmissionDTO getSubmissionById(QuizSubmissionId submissionId);

    List<QuizSubmissionDTO> getSubmissionsByStudent(UserId studentId);

}