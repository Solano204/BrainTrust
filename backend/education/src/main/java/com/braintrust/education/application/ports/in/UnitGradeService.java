package com.braintrust.education.application.ports.in;

import com.braintrust.education.application.dtos.commands.AddUnitGradeFeedbackCommand;
import com.braintrust.education.application.dtos.dtos.FinalGradeDTO;
import com.braintrust.education.application.dtos.dtos.UnitGradeDTO;
import com.braintrust.education.domain.valueobjects.AssignmentId;
import com.braintrust.education.domain.valueobjects.Grade;
import com.braintrust.education.domain.valueobjects.QuizId;
import com.braintrust.education.domain.valueobjects.UnitId;
import com.braintrust.identity.domain.valueobjects.UserId;

import java.math.BigDecimal;
import java.util.List;

public interface UnitGradeService {

    // Commands
    void addFeedback(AddUnitGradeFeedbackCommand command);

    // ✅ NEW: Final grade assignment methods
    void assignFinalGrade(UnitId unitId, UserId studentId, BigDecimal finalGrade, String feedback);
    FinalGradeDTO getFinalGrade(UnitId unitId, UserId studentId);

    // 🎯 Called automatically when activities are graded
    void recalculateUnitGrade(UnitId unitId, UserId studentId);
    void addAssignmentGradeToUnit(UnitId unitId, UserId studentId, AssignmentId assignmentId, Grade grade);
    void addQuizGradeToUnit(UnitId unitId, UserId studentId, QuizId quizId, Grade grade);
    // Queries
    UnitGradeDTO getUnitGrade(UnitId unitId, UserId studentId);
    List<UnitGradeDTO> getUnitGradesByStudent(UserId studentId);
    List<UnitGradeDTO> getUnitGradesByUnit(UnitId unitId);
    // ✅ NEW: Deletion methods
    void removeAssignmentGradeFromUnit(UnitId unitId, UserId studentId, AssignmentId assignmentId);
    void removeQuizGradeFromUnit(UnitId unitId, UserId studentId, QuizId quizId);
}