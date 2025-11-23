package com.braintrust.education.application.ports.in;

import com.braintrust.education.application.dtos.commands.*;
import com.braintrust.education.application.dtos.dtos.*;
import com.braintrust.education.application.dtos.dtos.FinalGradeDTO;
import com.braintrust.education.domain.valueobjects.*;
import com.braintrust.identity.domain.valueobjects.UserId;

import java.math.BigDecimal;
import java.util.List;

public interface GradebookService {

    // Commands
    GradebookId createGradebook(CreateGradebookCommand command);

    // ✅ REMOVED: Weight config methods (no longer needed in simplified version)
    // void updateWeightConfig(UpdateGradeWeightConfigCommand command);

    /**
     * 🎯 CRITICAL: Bidirectional grade update from Gradebook view
     * When teacher edits grade in Gradebook, updates both:
     * 1. Gradebook aggregate
     * 2. Source (Submission/QuizSubmission/UnitGrade)
     */
    void updateGradeFromGradebook(UpdateGradeFromGradebookCommand command);

    // ✅ NEW: Final grade assignment methods
    void assignFinalGrade(CourseId courseId, UserId studentId, BigDecimal finalGrade, String feedback);
    FinalGradeDTO getFinalGrade(CourseId courseId, UserId studentId);

    // 🎯 Called by other services to sync grades INTO gradebook
    void syncAssignmentGrade(CourseId courseId, UserId studentId, AssignmentId assignmentId);
    void syncQuizGrade(CourseId courseId, UserId studentId, QuizId quizId);
    void syncUnitGrade(CourseId courseId, UserId studentId, UnitId unitId);

    // 🎯 Team grading - apply to all members
    void applyTeamGradeToAllMembers(AssignmentId assignmentId, StudentGroupId groupId);

    // Queries
    GradebookDTO getGradebookByStudent(CourseId courseId, UserId studentId);
    List<GradebookDTO> getGradebooksByCourse(CourseId courseId);

    // ✅ REMOVED: Complex calculation methods (no longer needed)
    // GradebookSummaryDTO getGradebookSummary(CourseId courseId, UserId studentId);
    // List<CategoryGradeDTO> getCategoryGrades(GradebookId gradebookId);
    // String getOverallGrade(GradebookId gradebookId);
}