package com.braintrust.education.application.ports.in;

import com.braintrust.education.application.dtos.commands.AddUnitGradeFeedbackCommand;
import com.braintrust.education.application.dtos.commands.BulkUpdateUnitGradesCommand;
import com.braintrust.education.application.dtos.dtos.FinalGradeDTO;
import com.braintrust.education.application.dtos.dtos.UnitGradeDTO;
import com.braintrust.education.domain.valueobjects.*;
import com.braintrust.identity.domain.valueobjects.UserId;

import java.math.BigDecimal;
import java.util.List;

public interface UnitGradeService {

    void addFeedback(AddUnitGradeFeedbackCommand command);
    void bulkUpdateUnitGrades(BulkUpdateUnitGradesCommand command);

    FinalGradeDTO getFinalGrade(UnitId unitId, UserId studentId);
    // com.braintrust.education.application.ports.in.UnitGradeService
    void assignFinalGrade(UnitId unitId, UserId studentId, BigDecimal finalGrade, String feedback, CourseId courseId);
    void recalculateUnitGrade(UnitId unitId, UserId studentId);
    void addAssignmentGradeToUnit(UnitId unitId, UserId studentId, AssignmentId assignmentId, Grade grade);
    void addQuizGradeToUnit(UnitId unitId, UserId studentId, QuizId quizId, Grade grade);

    UnitGradeDTO getUnitGrade(UnitId unitId, UserId studentId);
    List<UnitGradeDTO> getUnitGradesByStudent(UserId studentId);
    List<UnitGradeDTO> getUnitGradesByUnit(UnitId unitId);

    void removeAssignmentGradeFromUnit(UnitId unitId, UserId studentId, AssignmentId assignmentId);
    void removeQuizGradeFromUnit(UnitId unitId, UserId studentId, QuizId quizId);
}