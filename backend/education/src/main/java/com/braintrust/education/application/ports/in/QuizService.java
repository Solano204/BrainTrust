package com.braintrust.education.application.ports.in;

import com.braintrust.education.application.dtos.commands.*;
import com.braintrust.education.application.dtos.dtos.*;
import com.braintrust.education.domain.valueobjects.CourseId;
import com.braintrust.education.domain.valueobjects.QuizId;
import com.braintrust.education.domain.valueobjects.UnitId;
import com.braintrust.identity.domain.valueobjects.UserId;

import java.util.List;

public interface QuizService {

    // Commands
    QuizId createQuiz(CreateQuizCommand command);
    void addQuestion(AddQuizQuestionCommand command);
    void updateQuiz(UpdateQuizCommand command);
    void activateQuiz(ActivateQuizCommand command);
    void deactivateQuiz(DeactivateQuizCommand command);
    QuizId createQuizWithQuestions(CreateQuizWithQuestionsCommand command);
    List<QuizDTO> getBasicQuizzesByCourse(CourseId courseId);
    MinimalQuizDTO getMinimalQuizById(QuizId quizId);

    // NEW: Delete quiz
    void deleteQuiz(QuizId quizId);
    void addQuestionsBulk(AddQuizQuestionsBulkCommand command);
    void deleteQuestionsBulk(DeleteQuizQuestionsBulkCommand command);
    void updateQuestionsBulk(UpdateQuizQuestionsBulkCommand command);
    // NEW: Get submissions

    List<QuizDTO> getQuizzesByCourseAndUnit(CourseId courseId, UnitId unitId);

    // Add this method to your QuizService interface
    CompleteQuizDTO getCompleteQuiz(QuizId quizId);

    // Queries
    QuizDTO getQuizById(QuizId quizId);
    List<QuizDTO> getQuizzesByCourse(CourseId courseId);
    List<QuizDTO> getAvailableQuizzesByCourse(CourseId courseId);
    List<QuizQuestionDTO> getQuizQuestions(QuizId quizId);
    boolean isQuizAvailable(QuizId quizId);
    int getTotalPoints(QuizId quizId);

    // NEW: Calendar methods
    List<QuizDTO> getQuizzesForStudentMonth(UserId studentId, String monthStart);
    List<QuizDTO> getQuizzesForTeacherMonth(UserId teacherId, String monthStart);
    List<QuizDTO> getQuizzesForStudentWeek(UserId studentId, String weekStart);
    List<QuizDTO> getQuizzesForTeacherWeek(UserId teacherId, String weekStart);
}