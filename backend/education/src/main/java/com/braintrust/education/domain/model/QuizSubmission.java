package com.braintrust.education.domain.model;

import com.braintrust.education.domain.valueobjects.*;
import com.braintrust.identity.domain.valueobjects.UserId;
import com.braintrust.shared.domain.AggregateRoot;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

public class QuizSubmission extends AggregateRoot<QuizSubmissionId> {
    private QuizId quizId;
    private UserId studentId;
    private int attemptNumber;
    private LocalDateTime startedAt;
    private LocalDateTime submittedAt;
    private QuizSubmissionStatus status;
    private final List<QuizAnswer> answers;
    private Grade grade;
    private boolean autoGraded;
    private final Map<QuizQuestionId, QuestionGrade> questionGrades;

    private QuizSubmission(QuizSubmissionId id, QuizId quizId, UserId studentId, int attemptNumber) {
        this.id = id;
        this.quizId = quizId;
        this.studentId = studentId;
        this.attemptNumber = attemptNumber;
        this.startedAt = LocalDateTime.now();
        this.status = QuizSubmissionStatus.IN_PROGRESS;
        this.answers = new ArrayList<>();
        this.autoGraded = false;
        this.questionGrades = new HashMap<>();
    }

    // Factory Method
    public static QuizSubmission start(QuizId quizId, UserId studentId, int attemptNumber) {
        QuizSubmissionId id = QuizSubmissionId.generate();
        return new QuizSubmission(id, quizId, studentId, attemptNumber);
    }

    // Reconstitute
    public static QuizSubmission reconstitute(QuizSubmissionId id, QuizId quizId,
                                              UserId studentId, int attemptNumber,
                                              LocalDateTime startedAt, LocalDateTime submittedAt,
                                              QuizSubmissionStatus status, List<QuizAnswer> answers,
                                              Grade grade, boolean autoGraded,
                                              Map<QuizQuestionId, QuestionGrade> questionGrades) {
        QuizSubmission submission = new QuizSubmission(id, quizId, studentId, attemptNumber);
        submission.startedAt = startedAt;
        submission.submittedAt = submittedAt;
        submission.status = status;
        submission.grade = grade;
        submission.autoGraded = autoGraded;
        if (answers != null) {
            submission.answers.addAll(answers);
        }
        if (questionGrades != null) {
            submission.questionGrades.putAll(questionGrades);
        }
        return submission;
    }

    // Domain Behavior
    public void answerQuestion(QuizQuestionId questionId, List<Integer> selectedOptions, String textAnswer) {
        if (status != QuizSubmissionStatus.IN_PROGRESS) {
            throw new IllegalStateException("Cannot answer questions after submission");
        }

        QuizAnswer answer = new QuizAnswer(questionId, selectedOptions, textAnswer);

        // Remove previous answer if exists
        answers.removeIf(a -> a.getQuestionId().equals(questionId));
        answers.add(answer);
    }

    public void submit(Quiz quiz) {
        if (status != QuizSubmissionStatus.IN_PROGRESS) {
            throw new IllegalStateException("Quiz already submitted");
        }

        this.submittedAt = LocalDateTime.now();
        this.status = QuizSubmissionStatus.SUBMITTED;

        // Auto-grade multiple choice questions
        if (canAutoGrade(quiz)) {
            autoGrade(quiz);
        }
    }

    // ✅ NEW: Method for manual grading WITH individual question grades
    public void manualGrade(Map<QuizQuestionId, QuestionGrade> questionGrades) {
        if (status != QuizSubmissionStatus.SUBMITTED && status != QuizSubmissionStatus.GRADED) {
            throw new IllegalStateException("Can only grade submitted quizzes");
        }

        // Calculate totals from question grades
        int totalEarned = questionGrades.values().stream()
                .mapToInt(QuestionGrade::getEarnedPoints)
                .sum();
        int totalMax = questionGrades.values().stream()
                .mapToInt(QuestionGrade::getMaxPoints)
                .sum();

        this.grade = new Grade(
                BigDecimal.valueOf(totalEarned),
                BigDecimal.valueOf(totalMax)
        );

        // Store individual question grades
        this.questionGrades.clear();
        this.questionGrades.putAll(questionGrades);

        this.status = QuizSubmissionStatus.GRADED;
        this.autoGraded = false;
    }

    // ✅ Keep existing method for backward compatibility
    public void manualGrade(int earnedPoints, int totalPoints) {
        if (status != QuizSubmissionStatus.SUBMITTED && status != QuizSubmissionStatus.GRADED) {
            throw new IllegalStateException("Can only grade submitted quizzes");
        }

        this.grade = new Grade(
                BigDecimal.valueOf(earnedPoints),
                BigDecimal.valueOf(totalPoints)
        );
        this.status = QuizSubmissionStatus.GRADED;
        this.autoGraded = false;
    }

    private void autoGrade(Quiz quiz) {
        int earnedPoints = 0;
        int totalPoints = quiz.getTotalPoints();

        // Clear existing question grades
        questionGrades.clear();

        for (QuizQuestion question : quiz.getQuestions()) {
            QuizAnswer answer = findAnswer(question.getId());
            int questionEarnedPoints = 0;

            if (answer != null && question.isCorrectAnswer(answer.getSelectedOptions())) {
                questionEarnedPoints = question.getPoints();
                earnedPoints += question.getPoints();
            }

            // Store individual question grade for auto-graded questions
            QuestionGrade qGrade = new QuestionGrade(
                    question.getId(),
                    questionEarnedPoints,
                    question.getPoints(),
                    "Auto-graded",
                    true
            );
            questionGrades.put(question.getId(), qGrade);
        }

        this.grade = new Grade(
                BigDecimal.valueOf(earnedPoints),
                BigDecimal.valueOf(totalPoints)
        );
        this.autoGraded = true;
        this.status = QuizSubmissionStatus.GRADED;
    }

    private boolean canAutoGrade(Quiz quiz) {
        return quiz.getQuestions().stream()
                .allMatch(q -> q.getType() == QuestionType.MULTIPLE_CHOICE ||
                        q.getType() == QuestionType.TRUE_FALSE);
    }

    public QuizAnswer getAnswerForQuestion(QuizQuestionId questionId) {
        return answers.stream()
                .filter(answer -> answer.getQuestionId().equals(questionId))
                .findFirst()
                .orElse(null);
    }

    public QuestionGrade getQuestionGrade(QuizQuestionId questionId) {
        return questionGrades.get(questionId);
    }

    public Map<QuizQuestionId, QuestionGrade> getQuestionGrades() {
        return Map.copyOf(questionGrades);
    }

    public boolean isTimeExpired(Integer timeLimitMinutes) {
        if (timeLimitMinutes == null || status != QuizSubmissionStatus.IN_PROGRESS) {
            return false;
        }
        LocalDateTime deadline = startedAt.plusMinutes(timeLimitMinutes);
        return LocalDateTime.now().isAfter(deadline);
    }

    private QuizAnswer findAnswer(QuizQuestionId questionId) {
        return answers.stream()
                .filter(a -> a.getQuestionId().equals(questionId))
                .findFirst()
                .orElse(null);
    }

    // Getters
    public QuizId getQuizId() { return quizId; }
    public UserId getStudentId() { return studentId; }
    public int getAttemptNumber() { return attemptNumber; }
    public LocalDateTime getStartedAt() { return startedAt; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public QuizSubmissionStatus getStatus() { return status; }
    public List<QuizAnswer> getAnswers() { return List.copyOf(answers); }
    public Grade getGrade() { return grade; }
    public boolean isAutoGraded() { return autoGraded; }
    public Map<QuizQuestionId, QuestionGrade> getQuestionGradesMap() { // ✅ Renamed for clarity
        return Map.copyOf(questionGrades);
    }

}