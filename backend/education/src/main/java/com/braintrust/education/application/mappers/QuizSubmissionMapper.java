package com.braintrust.education.application.mappers;

import com.braintrust.education.application.dtos.dtos.*;
import com.braintrust.education.application.helpers.quiz.QuizSubmissionHelper;
import com.braintrust.education.domain.model.Quiz;
import com.braintrust.education.domain.model.QuizSubmission;
import com.braintrust.identity.application.dtos.dtos.MinimalUserInfoDTO;
import com.braintrust.identity.application.ports.in.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class QuizSubmissionMapper {

    private final UserService userService;
    private final QuizSubmissionHelper submissionHelper;

    public QuizSubmissionDTO mapToBasicDTO(
            QuizSubmission submission,
            MinimalQuizDTO minimalQuiz,
            Quiz fullQuiz) {

        try {
            MinimalUserInfoDTO studentInfo = userService.getMinimalUserInfo(submission.getStudentId());

            GradeDTO gradeDTO = null;
            if (submission.getGrade() != null) {
                gradeDTO = new GradeDTO(
                        submission.getGrade().getValue().toString(),
                        submission.getGrade().getMaxScore().toString(),
                        submission.getGrade().getPercentage().toString()
                );
            }

            // Convertir QuestionResponseDTO a QuizAnswerDTO
            List<QuestionResponseDTO> questionResponses = submissionHelper.mapToQuestionResponses(submission, fullQuiz);
            List<QuizAnswerDTO> quizAnswers = mapQuestionResponsesToQuizAnswers(questionResponses);

            return new QuizSubmissionDTO(
                    submission.getId().getValue(),
                    submission.getQuizId().getValue(),
                    minimalQuiz.title(),
                    submission.getStudentId().getValue(),
                    studentInfo.fullName(),
                    submission.getAttemptNumber(),
                    submission.getStartedAt().toString(),
                    submission.getSubmittedAt() != null ? submission.getSubmittedAt().toString() : null,
                    submission.getStatus().name(),
                    gradeDTO,
                    submission.isAutoGraded(),
                    quizAnswers, // List<QuizAnswerDTO>
                    submission.isTimeExpired(fullQuiz.getTimeLimitMinutes()),
                    fullQuiz.getUnitId() != null ? fullQuiz.getUnitId().getValue() : null,
                    "Unit Name" // TODO: Resolver desde unit service
            );
        } catch (Exception e) {
            log.warn("Failed to get real data for submission {}, using fallback: {}",
                    submission.getId().getValue(), e.getMessage());
            return null;
        }
    }

    public QuizSubmissionDTO mapToBasicDTOFallback(
            QuizSubmission submission,
            Quiz quiz) {

        GradeDTO gradeDTO = null;
        if (submission.getGrade() != null) {
            gradeDTO = new GradeDTO(
                    submission.getGrade().getValue().toString(),
                    submission.getGrade().getMaxScore().toString(),
                    submission.getGrade().getPercentage().toString()
            );
        }

        List<QuestionResponseDTO> questionResponses = submissionHelper.mapToQuestionResponses(submission, quiz);
        List<QuizAnswerDTO> quizAnswers = mapQuestionResponsesToQuizAnswers(questionResponses);

        return new QuizSubmissionDTO(
                submission.getId().getValue(),
                submission.getQuizId().getValue(),
                quiz.getTitle(),
                submission.getStudentId().getValue(),
                "Student Name",
                submission.getAttemptNumber(),
                submission.getStartedAt().toString(),
                submission.getSubmittedAt() != null ? submission.getSubmittedAt().toString() : null,
                submission.getStatus().name(),
                gradeDTO,
                submission.isAutoGraded(),
                quizAnswers, // List<QuizAnswerDTO>
                submission.isTimeExpired(quiz.getTimeLimitMinutes()),
                quiz.getUnitId() != null ? quiz.getUnitId().getValue() : null,
                "Unit Name"
        );
    }

    private List<QuizAnswerDTO> mapQuestionResponsesToQuizAnswers(List<QuestionResponseDTO> questionResponses) {
        return questionResponses.stream()
                .map(qr -> new QuizAnswerDTO(
                        qr.questionId(),
                        qr.questionText(),
                        qr.selectedOptions(),
                        qr.textAnswer(),
                        qr.isCorrect(),
                        0 // TODO: Necesitas determinar los puntos ganados - revisa tu lógica
                ))
                .toList();
    }

    public QuizSubmissionDetailDTO mapToDetailDTO(
            QuizSubmission submission,
            Quiz quiz,
            String studentName) {

        GradeDTO gradeDTO = null;
        if (submission.getGrade() != null) {
            gradeDTO = new GradeDTO(
                    submission.getGrade().getValue().toString(),
                    submission.getGrade().getMaxScore().toString(),
                    submission.getGrade().getPercentage().toString()
            );
        }

        List<GradedQuestionResponseDTO> questionResponses =
                submissionHelper.mapToGradedQuestionResponses(submission, quiz);

        return new QuizSubmissionDetailDTO(
                submission.getId().getValue(),
                submission.getQuizId().getValue(),
                quiz.getTitle(),
                submission.getStudentId().getValue(),
                studentName,
                submission.getAttemptNumber(),
                submission.getStartedAt().toString(),
                submission.getSubmittedAt() != null ? submission.getSubmittedAt().toString() : null,
                submission.getStatus().name(),
                gradeDTO,
                submission.isAutoGraded(),
                questionResponses, // Debe coincidir con el tipo en QuizSubmissionDetailDTO
                submission.isTimeExpired(quiz.getTimeLimitMinutes()),
                quiz.getUnitId() != null ? quiz.getUnitId().getValue() : null,
                "Unit Name"
        );
    }

    public QuizSubmissionBasicDTO mapToBasicDTOBasic(QuizSubmission submission) {

        return new QuizSubmissionBasicDTO(
                submission.getId().getValue(),
                submission.getQuizId().getValue(),
                "Quiz Title",
                submission.getStudentId().getValue(),
                "Student Name",
                submission.getStatus().name(),
                submission.getSubmittedAt() != null ? submission.getSubmittedAt().toString() : null,
                submission.getAttemptNumber()
        );
    }

    public QuizSubmissionBasicDTO mapToBasicDTOWithRealData(
            QuizSubmission submission,
            String quizTitle,
            String studentName) {

        return new QuizSubmissionBasicDTO(
                submission.getId().getValue(),
                submission.getQuizId().getValue(),
                quizTitle,
                submission.getStudentId().getValue(),
                studentName,
                submission.getStatus().name(),
                submission.getSubmittedAt() != null ? submission.getSubmittedAt().toString() : null,
                submission.getAttemptNumber()
        );
    }
}