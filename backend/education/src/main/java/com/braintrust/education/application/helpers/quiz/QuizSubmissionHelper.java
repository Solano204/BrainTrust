package com.braintrust.education.application.helpers.quiz;

import com.braintrust.education.application.dtos.dtos.GradedQuestionResponseDTO;
import com.braintrust.education.application.dtos.commands.QuestionOptionDTO;
import com.braintrust.education.application.dtos.dtos.QuestionResponseDTO;
import com.braintrust.education.domain.model.Quiz;
import com.braintrust.education.domain.model.QuizAnswer;
import com.braintrust.education.domain.valueobjects.QuizQuestionId;
import com.braintrust.education.domain.model.QuizSubmission;
import com.braintrust.education.domain.model.QuestionGrade;
import com.braintrust.education.domain.valueobjects.QuestionOption;
import com.braintrust.education.domain.model.QuestionType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class QuizSubmissionHelper {

    public List<GradedQuestionResponseDTO> mapToGradedQuestionResponses(
            QuizSubmission submission,
            Quiz quiz) {

        Map<QuizQuestionId, QuestionGrade> questionGrades = submission.getQuestionGrades();

        return quiz.getQuestions().stream()
                .map(question -> {
                    QuizAnswer studentAnswer = submission.getAnswerForQuestion(question.getId());
                    QuestionGrade questionGrade = questionGrades.get(question.getId());

                    int earnedPoints = 0;
                    String teacherFeedback = null;
                    boolean isAutoGradedForQuestion = false;

                    if (questionGrade != null) {
                        earnedPoints = questionGrade.getEarnedPoints();
                        teacherFeedback = questionGrade.getFeedback();
                        isAutoGradedForQuestion = questionGrade.isAutoGraded();
                    } else if (submission.isAutoGraded() && studentAnswer != null) {
                        if (question.getType() == QuestionType.MULTIPLE_CHOICE ||
                                question.getType() == QuestionType.TRUE_FALSE) {

                            boolean isCorrect = question.isCorrectAnswer(studentAnswer.getSelectedOptions());
                            earnedPoints = isCorrect ? question.getPoints() : 0;
                            isAutoGradedForQuestion = true;
                        }
                    }

                    boolean isCorrect = determineIfCorrect(question, studentAnswer, earnedPoints);

                    return new GradedQuestionResponseDTO(
                            question.getId().getValue(),
                            question.getQuestionText(),
                            question.getType().name(),
                            question.getPoints(),
                            earnedPoints,
                            teacherFeedback,
                            isAutoGradedForQuestion,
                            mapToOptionDTOs(question.getOptions()),
                            studentAnswer != null ? studentAnswer.getSelectedOptions() : List.of(),
                            studentAnswer != null ? studentAnswer.getTextAnswer() : null,
                            question.getCorrectAnswer(),
                            isCorrect
                    );
                })
                .collect(Collectors.toList());
    }

    public List<QuestionResponseDTO> mapToQuestionResponses(
            QuizSubmission submission,
            Quiz quiz) {

        return quiz.getQuestions().stream()
                .map(question -> {
                    QuizAnswer studentAnswer = submission.getAnswerForQuestion(question.getId());
                    boolean isCorrect = determineIfCorrectForResponse(question, studentAnswer);

                    return new QuestionResponseDTO(
                            question.getId().getValue(),
                            question.getQuestionText(),
                            question.getType().name(),
                            question.getPoints(),
                            mapToOptionDTOs(question.getOptions()),
                            studentAnswer != null ? studentAnswer.getSelectedOptions() : List.of(),
                            studentAnswer != null ? studentAnswer.getTextAnswer() : null,
                            question.getCorrectAnswer(),
                            isCorrect
                    );
                })
                .collect(Collectors.toList());
    }

    public List<QuestionOptionDTO> mapToOptionDTOs(List<QuestionOption> options) {
        return options.stream()
                .map(opt -> new QuestionOptionDTO(opt.getText(), opt.isCorrect()))
                .collect(Collectors.toList());
    }

    private boolean determineIfCorrect(
            com.braintrust.education.domain.model.QuizQuestion question,
            QuizAnswer studentAnswer,
            int earnedPoints) {

        if (studentAnswer == null) return false;

        if (question.getType() == QuestionType.MULTIPLE_CHOICE ||
                question.getType() == QuestionType.TRUE_FALSE) {
            return question.isCorrectAnswer(studentAnswer.getSelectedOptions());
        } else if (question.getType() == QuestionType.OPEN_ENDED) {
            return (earnedPoints == question.getPoints());
        }
        return false;
    }

    private boolean determineIfCorrectForResponse(
            com.braintrust.education.domain.model.QuizQuestion question,
            QuizAnswer studentAnswer) {

        if (studentAnswer == null) return false;

        if (question.getType() == QuestionType.MULTIPLE_CHOICE ||
                question.getType() == QuestionType.TRUE_FALSE) {
            return question.isCorrectAnswer(studentAnswer.getSelectedOptions());
        }
        return false;
    }
}