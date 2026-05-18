package com.braintrust.education.domain.model;

import com.braintrust.education.domain.valueobjects.*;
import com.braintrust.identity.domain.valueobjects.UserId;
import com.braintrust.shared.domain.AggregateRoot;
import java.math.BigDecimal;
import java.math.RoundingMode;
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
    private BigDecimal finalGrade;      // ✅ NEW — scaled value (e.g. 68.5 out of 75)
    private boolean canViewResults;     // ✅ NEW — copied from quiz.allowSeeResults at submit time
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
        this.canViewResults = false;
        this.questionGrades = new HashMap<>();
    }

    public static QuizSubmission start(QuizId quizId, UserId studentId, int attemptNumber) {
        QuizSubmissionId id = QuizSubmissionId.generate();
        return new QuizSubmission(id, quizId, studentId, attemptNumber);
    }

    public static QuizSubmission reconstitute(QuizSubmissionId id, QuizId quizId,
                                              UserId studentId, int attemptNumber,
                                              LocalDateTime startedAt, LocalDateTime submittedAt,
                                              QuizSubmissionStatus status, List<QuizAnswer> answers,
                                              Grade grade, BigDecimal finalGrade,  // ✅ NEW
                                              boolean canViewResults,               // ✅ NEW
                                              boolean autoGraded,
                                              Map<QuizQuestionId, QuestionGrade> questionGrades) {
        QuizSubmission submission = new QuizSubmission(id, quizId, studentId, attemptNumber);
        submission.startedAt = startedAt;
        submission.submittedAt = submittedAt;
        submission.status = status;
        submission.grade = grade;
        submission.finalGrade = finalGrade;
        submission.canViewResults = canViewResults;
        submission.autoGraded = autoGraded;
        if (answers != null)       submission.answers.addAll(answers);
        if (questionGrades != null) submission.questionGrades.putAll(questionGrades);
        return submission;
    }

    public void answerQuestion(QuizQuestionId questionId, List<Integer> selectedOptions, String textAnswer) {
        if (status != QuizSubmissionStatus.IN_PROGRESS) {
            throw new IllegalStateException("Cannot answer questions after submission");
        }
        QuizAnswer answer = new QuizAnswer(questionId, selectedOptions, textAnswer);
        answers.removeIf(a -> a.getQuestionId().equals(questionId));
        answers.add(answer);
    }

    public void submit(Quiz quiz) {
        if (status != QuizSubmissionStatus.IN_PROGRESS) {
            throw new IllegalStateException("Quiz already submitted");
        }
        this.submittedAt = LocalDateTime.now();
        this.status = QuizSubmissionStatus.SUBMITTED;
        this.canViewResults = quiz.isAllowSeeResults(); // ✅ snapshot at submit time

        if (canAutoGrade(quiz)) {
            autoGrade(quiz);
        }
    }

    public void manualGrade(Map<QuizQuestionId, QuestionGrade> questionGrades) {
        if (status != QuizSubmissionStatus.SUBMITTED && status != QuizSubmissionStatus.GRADED) {
            throw new IllegalStateException("Can only grade submitted quizzes");
        }

        int totalEarned = questionGrades.values().stream().mapToInt(QuestionGrade::getEarnedPoints).sum();
        int totalMax    = questionGrades.values().stream().mapToInt(QuestionGrade::getMaxPoints).sum();

        this.grade = new Grade(BigDecimal.valueOf(totalEarned), BigDecimal.valueOf(totalMax));
        this.questionGrades.clear();
        this.questionGrades.putAll(questionGrades);
        this.status = QuizSubmissionStatus.GRADED;
        this.autoGraded = false;

        // ✅ finalGrade must be set by caller who knows quiz.totalScore — see service
    }

    public void manualGrade(int earnedPoints, int totalPoints) {
        if (status != QuizSubmissionStatus.SUBMITTED && status != QuizSubmissionStatus.GRADED) {
            throw new IllegalStateException("Can only grade submitted quizzes");
        }
        this.grade = new Grade(BigDecimal.valueOf(earnedPoints), BigDecimal.valueOf(totalPoints));
        this.status = QuizSubmissionStatus.GRADED;
        this.autoGraded = false;
    }

    /**
     * Calculates and stores the final grade scaled to the quiz's totalScore.
     * Example: earned=3, max=5, totalScore=75 → finalGrade=45.00
     */
    public void computeFinalGrade(double quizTotalScore) {
        if (grade == null || grade.getMaxScore().compareTo(BigDecimal.ZERO) == 0) {
            this.finalGrade = BigDecimal.ZERO;
            return;
        }
        // finalGrade = (earned / maxPoints) * totalScore
        this.finalGrade = grade.getValue()
                .divide(grade.getMaxScore(), 10, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(quizTotalScore))
                .setScale(2, RoundingMode.HALF_UP);
    }

    private void autoGrade(Quiz quiz) {
        int earnedPoints = 0;
        int totalPoints  = quiz.getTotalPoints();

        questionGrades.clear();

        for (QuizQuestion question : quiz.getQuestions()) {
            QuizAnswer answer = findAnswer(question.getId());
            int questionEarned = 0;

            if (answer != null && question.isCorrectAnswer(answer.getSelectedOptions())) {
                questionEarned = question.getPoints();
                earnedPoints  += question.getPoints();
            }

            questionGrades.put(question.getId(), new QuestionGrade(
                    question.getId(), questionEarned, question.getPoints(), "Auto-graded", true
            ));
        }

        this.grade = new Grade(BigDecimal.valueOf(earnedPoints), BigDecimal.valueOf(totalPoints));
        this.autoGraded = true;
        this.status = QuizSubmissionStatus.GRADED;

        // ✅ auto-compute finalGrade right away
        computeFinalGrade(quiz.getTotalScore());
    }

    private boolean canAutoGrade(Quiz quiz) {
        return quiz.getQuestions().stream()
                .allMatch(q -> q.getType() == QuestionType.MULTIPLE_CHOICE ||
                        q.getType() == QuestionType.TRUE_FALSE);
    }

    public QuizAnswer getAnswerForQuestion(QuizQuestionId questionId) {
        return answers.stream()
                .filter(a -> a.getQuestionId().equals(questionId))
                .findFirst().orElse(null);
    }

    public QuestionGrade getQuestionGrade(QuizQuestionId questionId) {
        return questionGrades.get(questionId);
    }

    public boolean isTimeExpired(Integer timeLimitMinutes) {
        if (timeLimitMinutes == null || status != QuizSubmissionStatus.IN_PROGRESS) return false;
        return LocalDateTime.now().isAfter(startedAt.plusMinutes(timeLimitMinutes));
    }

    private QuizAnswer findAnswer(QuizQuestionId questionId) {
        return answers.stream()
                .filter(a -> a.getQuestionId().equals(questionId))
                .findFirst().orElse(null);
    }

    // ── Getters ──────────────────────────────────────────────────────────────
    public QuizId getQuizId()                                      { return quizId; }
    public UserId getStudentId()                                   { return studentId; }
    public int getAttemptNumber()                                  { return attemptNumber; }
    public LocalDateTime getStartedAt()                            { return startedAt; }
    public LocalDateTime getSubmittedAt()                          { return submittedAt; }
    public QuizSubmissionStatus getStatus()                        { return status; }
    public List<QuizAnswer> getAnswers()                           { return List.copyOf(answers); }
    public Grade getGrade()                                        { return grade; }
    public BigDecimal getFinalGrade()                              { return finalGrade; }   // ✅ NEW
    public boolean isCanViewResults()                              { return canViewResults; }// ✅ NEW
    public boolean isAutoGraded()                                  { return autoGraded; }
    public Map<QuizQuestionId, QuestionGrade> getQuestionGradesMap() { return Map.copyOf(questionGrades); }
    public Map<QuizQuestionId, QuestionGrade> getQuestionGrades()  { return Map.copyOf(questionGrades); }
}