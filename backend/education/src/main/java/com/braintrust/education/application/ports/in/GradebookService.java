package com.braintrust.education.application.ports.in;

import com.braintrust.education.application.dtos.commands.*;
import com.braintrust.education.application.dtos.dtos.*;
import com.braintrust.education.application.dtos.dtos.FinalGradeDTO;
import com.braintrust.education.domain.valueobjects.*;
import com.braintrust.identity.domain.valueobjects.UserId;

import java.math.BigDecimal;
import java.util.List;

public interface GradebookService {

    GradebookId createGradebook(CreateGradebookCommand command);

    void updateGradeFromGradebook(UpdateGradeFromGradebookCommand command);

    void assignFinalGrade(CourseId courseId, UserId studentId, BigDecimal finalGrade, String feedback);
    FinalGradeDTO getFinalGrade(CourseId courseId, UserId studentId);
    void bulkUpdateCourseGrades(BulkUpdateCourseGradesCommand command);

    void syncAssignmentGrade(CourseId courseId, UserId studentId, AssignmentId assignmentId);
    void syncQuizGrade(CourseId courseId, UserId studentId, QuizId quizId);
    void syncUnitGrade(CourseId courseId, UserId studentId, UnitId unitId);

    void applyTeamGradeToAllMembers(AssignmentId assignmentId, StudentGroupId groupId);

    GradebookDTO getGradebookByStudent(CourseId courseId, UserId studentId);
    List<GradebookDTO> getGradebooksByCourse(CourseId courseId);

}