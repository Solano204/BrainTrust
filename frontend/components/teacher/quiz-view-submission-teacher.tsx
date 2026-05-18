"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  BarChart3,
  Users,
  Clock,
  ChevronDown,
  ChevronUp,
  Circle,
  AlertCircle,
  Scale,
  Info,
} from "lucide-react";
import { useQuizMutations, useQuizSubmissionDetail } from "./hooks/quiz-hooks";

interface QuizSubmissionsViewProps {
  submissionId: string;
  onBack: () => void;
  /** The quiz's totalScore (e.g. 22). Used for weight-based grading.
   *  If not provided, falls back to sum of question maxPoints. */
  quizTotalScore?: number;
}

// ─── Weight helpers ───────────────────────────────────────────────────────────

/**
 * Given the list of question responses, compute each question's weight (%)
 * as its proportion of the total maxPoints sum.
 * e.g. Q1 has 10pts out of 40 total → weight = 25%
 */
function computeWeights(
  questionResponses: { questionId: string; maxPoints: number }[]
): Record<string, number> {
  const totalMaxPoints = questionResponses.reduce((s, q) => s + q.maxPoints, 0);
  if (totalMaxPoints === 0) return {};
  const weights: Record<string, number> = {};
  questionResponses.forEach((q) => {
    weights[q.questionId] =
      Math.round((q.maxPoints / totalMaxPoints) * 10000) / 100; // 2 decimal %
  });
  return weights;
}

/**
 * Compute the weighted final grade scaled to quizTotalScore.
 * Formula: Σ (earnedPoints_i / maxPoints_i) * weight_i * quizTotalScore
 */
function computeWeightedFinalGrade(
  grades: Record<string, number>,
  questionResponses: { questionId: string; maxPoints: number }[],
  weights: Record<string, number>,
  quizTotalScore: number
): number {
  let weightedSum = 0;
  questionResponses.forEach((q) => {
    const earned = grades[q.questionId] ?? 0;
    const max = q.maxPoints;
    const weight = (weights[q.questionId] ?? 0) / 100; // convert % to decimal
    if (max > 0) {
      weightedSum += (earned / max) * weight;
    }
  });
  return Math.round(weightedSum * quizTotalScore * 100) / 100;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function QuizSubmissionsView({
  submissionId,
  onBack,
  quizTotalScore,
}: QuizSubmissionsViewProps) {
  const { gradeSubmission } = useQuizMutations();

  const {
    data: submissionDetail,
    isLoading: isSubmissionLoading,
    error: submissionError,
  } = useQuizSubmissionDetail(submissionId);

  const [grades, setGrades] = React.useState<Record<string, number>>({});
  const [feedbacks, setFeedbacks] = React.useState<Record<string, string>>({});
  const [isExpanded, setIsExpanded] = React.useState(true);
  const [overallGrade, setOverallGrade] = React.useState<string>("");
  const [showWeightTable, setShowWeightTable] = React.useState(false);

  // ── Derived values ──────────────────────────────────────────────────────────

  const questionResponses = submissionDetail?.questionResponses ?? [];

  /** Total quiz score (either passed as prop or sum of maxPoints) */
  const resolvedTotalScore = React.useMemo(() => {
    if (quizTotalScore && quizTotalScore > 0) return quizTotalScore;
    return questionResponses.reduce((s, q) => s + q.maxPoints, 0);
  }, [quizTotalScore, questionResponses]);

  /** Weight (%) per question */
  const weights = React.useMemo(
    () => computeWeights(questionResponses),
    [questionResponses]
  );

  /** Weighted point value per question = weight% × resolvedTotalScore */
  const weightedPointValues = React.useMemo(() => {
    const result: Record<string, number> = {};
    questionResponses.forEach((q) => {
      const weight = (weights[q.questionId] ?? 0) / 100;
      result[q.questionId] =
        Math.round(weight * resolvedTotalScore * 100) / 100;
    });
    return result;
  }, [weights, resolvedTotalScore, questionResponses]);

  /** Weighted final grade (scaled to resolvedTotalScore) */
  const weightedFinalGrade = React.useMemo(
    () =>
      computeWeightedFinalGrade(
        grades,
        questionResponses,
        weights,
        resolvedTotalScore
      ),
    [grades, questionResponses, weights, resolvedTotalScore]
  );

  /** Percentage score */
  const scorePercentage = resolvedTotalScore > 0
    ? Math.round((weightedFinalGrade / resolvedTotalScore) * 100)
    : 0;

  // ── Effects ─────────────────────────────────────────────────────────────────

  React.useEffect(() => {
    if (submissionDetail?.questionResponses) {
      const initialGrades: Record<string, number> = {};
      const initialFeedbacks: Record<string, string> = {};
      submissionDetail.questionResponses.forEach((response) => {
        initialGrades[response.questionId] = response.earnedPoints;
        initialFeedbacks[response.questionId] = response.teacherFeedback ?? "";
      });
      setGrades(initialGrades);
      setFeedbacks(initialFeedbacks);
    }
    if (submissionDetail?.grade?.value) {
      setOverallGrade(submissionDetail.grade.value);
    }
  }, [submissionDetail]);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const normalizeText = (text: string): string => {
    if (!text) return "";
    return text.toLowerCase().replace(/\s+/g, "").replace(/[^\w]/g, "");
  };

  const handleGradeChange = (questionId: string, score: number) => {
    const question = questionResponses.find((q) => q.questionId === questionId);
    const maxPoints = question?.maxPoints ?? 0;
    const normalizedScore = Math.max(0, Math.min(score, maxPoints));
    setGrades((prev) => ({ ...prev, [questionId]: normalizedScore }));
  };

  const handleFeedbackChange = (questionId: string, feedback: string) => {
    setFeedbacks((prev) => ({ ...prev, [questionId]: feedback }));
  };

  const handleSubmitGrades = () => {
    if (!submissionDetail) return;

    const gradeUpdates = questionResponses.map((q) => ({
      questionId: q.questionId,
      earnedPoints: grades[q.questionId] ?? 0,
      maxPoints: q.maxPoints,
      feedback: feedbacks[q.questionId] ?? "",
    }));

    gradeSubmission.mutate(
      {
        submissionId: submissionDetail.id,
        grades: gradeUpdates,
        // Pass weighted final grade scaled to resolvedTotalScore
        overallGrade: {
          earnedPoints: weightedFinalGrade,
          totalPoints: resolvedTotalScore,
        },
      },
      {
        onSuccess: (updatedSubmission) => {
          console.log("Grades saved successfully:", updatedSubmission);
        },
        onError: (error) => {
          console.error("Error saving grades:", error);
        },
      }
    );
  };

  // ── Loading / Error states ────────────────────────────────────────────────

  if (isSubmissionLoading) {
    return (
      <div className="p-8 text-center">
        <p>Loading submission data...</p>
      </div>
    );
  }

  if (submissionError || !submissionDetail) {
    return (
      <div className="p-8 text-center text-destructive">
        <p>Error loading submission data</p>
        <Button onClick={onBack} className="mt-4">
          Back to Inventory
        </Button>
      </div>
    );
  }

  const passingScore = 70;
  const isGraded = submissionDetail.status === "GRADED";
  const existingGrade = submissionDetail.grade;
  const hasGradeChanged =
    isGraded &&
    existingGrade?.value &&
    String(weightedFinalGrade) !== existingGrade.value;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <Button onClick={onBack} variant="outline" className="gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" /> Back to Inventory
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            {submissionDetail.quizTitle} — Student Submission
          </h1>
          <p className="text-muted-foreground mt-2">
            Student: {submissionDetail.studentName} ({submissionDetail.studentId})
          </p>
        </div>

        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>
              Submitted:{" "}
              {new Date(submissionDetail.submittedAt).toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span>
              Score: {scorePercentage}% ({weightedFinalGrade}/
              {resolvedTotalScore} pts)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Status: {submissionDetail.status}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Attempt: {submissionDetail.attemptNumber}</span>
          </div>
        </div>
      </div>

      {/* ── Already graded warning ── */}
      {isGraded && existingGrade?.value && (
        <Card className="p-4 bg-amber-50 border-amber-300 border-2">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900 text-lg">
                This submission has already been graded
              </h3>
              <div className="mt-2 space-y-1">
                <p className="text-sm text-amber-800">
                  <strong>Current Grade:</strong> {existingGrade.value} /{" "}
                  {existingGrade.maxScore} ({existingGrade.percentage}%)
                </p>
                <p className="text-xs text-amber-700 mt-2">
                  You can modify grades below. The existing grade will be
                  preserved until you save changes.
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* ── Weight Table Toggle ── */}
      <Card className="p-4 border-purple-200 bg-purple-50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-purple-700" />
            <h3 className="font-semibold text-purple-900">
              Question Weight Distribution
            </h3>
            <span className="text-xs text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">
              Total Score: {resolvedTotalScore} pts
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowWeightTable((v) => !v)}
            className="gap-2 border-purple-300 text-purple-800 hover:bg-purple-100"
          >
            <Info className="h-4 w-4" />
            {showWeightTable ? "Hide" : "Show"} Weight Table
          </Button>
        </div>

        {showWeightTable && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-purple-100">
                  <th className="text-left p-3 border border-purple-200 text-purple-900 font-semibold">
                    Question
                  </th>
                  <th className="text-left p-3 border border-purple-200 text-purple-900 font-semibold">
                    Raw Points
                  </th>
                  <th className="text-left p-3 border border-purple-200 text-purple-900 font-semibold">
                    Weight (%)
                  </th>
                  <th className="text-left p-3 border border-purple-200 text-purple-900 font-semibold">
                    Calculation
                  </th>
                  <th className="text-left p-3 border border-purple-200 text-purple-900 font-semibold">
                    Weighted Value
                  </th>
                  <th className="text-left p-3 border border-purple-200 text-purple-900 font-semibold">
                    Earned (Weighted)
                  </th>
                </tr>
              </thead>
              <tbody>
                {questionResponses.map((q, idx) => {
                  const weight = weights[q.questionId] ?? 0;
                  const wpv = weightedPointValues[q.questionId] ?? 0;
                  const earned = grades[q.questionId] ?? 0;
                  const weightedEarned =
                    q.maxPoints > 0
                      ? Math.round(
                          (earned / q.maxPoints) * wpv * 100
                        ) / 100
                      : 0;

                  return (
                    <tr
                      key={q.questionId}
                      className={idx % 2 === 0 ? "bg-white" : "bg-purple-50/40"}
                    >
                      <td className="p-3 border border-purple-200 font-medium">
                        Question #{idx + 1}
                      </td>
                      <td className="p-3 border border-purple-200">
                        {earned} / {q.maxPoints}
                      </td>
                      <td className="p-3 border border-purple-200">
                        <span className="font-semibold text-purple-700">
                          {weight}%
                        </span>
                      </td>
                      <td className="p-3 border border-purple-200 text-muted-foreground font-mono text-xs">
                        {resolvedTotalScore} × {(weight / 100).toFixed(2)} ×
                        ({earned}/{q.maxPoints})
                      </td>
                      <td className="p-3 border border-purple-200 text-purple-800 font-semibold">
                        {wpv} pts
                      </td>
                      <td className="p-3 border border-purple-200">
                        <span
                          className={
                            weightedEarned >= wpv * 0.7
                              ? "text-green-700 font-semibold"
                              : "text-red-700 font-semibold"
                          }
                        >
                          {weightedEarned} pts
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-purple-200 font-bold">
                  <td className="p-3 border border-purple-300">TOTAL</td>
                  <td className="p-3 border border-purple-300">—</td>
                  <td className="p-3 border border-purple-300">100%</td>
                  <td className="p-3 border border-purple-300">—</td>
                  <td className="p-3 border border-purple-300 text-purple-900">
                    {resolvedTotalScore} pts
                  </td>
                  <td className="p-3 border border-purple-300 text-purple-900">
                    {weightedFinalGrade} pts
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </Card>

      {/* ── Submission Card ── */}
      <Card className="p-4 border-l-4 border-blue-500">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-semibold text-lg">
              Student {submissionDetail.studentName}
            </h3>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
              <span>
                Submitted:{" "}
                {new Date(submissionDetail.submittedAt).toLocaleString()}
              </span>
              <Badge
                variant={scorePercentage >= passingScore ? "default" : "secondary"}
              >
                {scorePercentage}% ({weightedFinalGrade}/{resolvedTotalScore} pts)
              </Badge>
              <span>Status: {submissionDetail.status}</span>
              {submissionDetail.autoGraded && (
                <Badge variant="outline">Auto-graded</Badge>
              )}
            </div>
          </div>
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
            {isExpanded ? "Collapse" : "Expand"}
          </Button>
        </div>

        {isExpanded && (
          <div className="space-y-4 mt-4 pt-4 border-t">
            {/* ── Questions ── */}
            {questionResponses.map((question, index) => {
              const isMultipleChoice =
                question.questionType === "MULTIPLE_CHOICE";
              const isOpenEnded = question.questionType === "OPEN_ENDED";
              const currentScore = grades[question.questionId] ?? 0;
              const currentFeedback = feedbacks[question.questionId] ?? "";
              const studentSelectedOptions = question.selectedOptions ?? [];
              const hasOptions =
                question.options && question.options.length > 0;

              const normalizedStudentAnswer = normalizeText(
                question.textAnswer
              );
              const normalizedCorrectAnswer = normalizeText(
                question.correctAnswer
              );
              const answersMatchNormalized =
                normalizedStudentAnswer &&
                normalizedCorrectAnswer &&
                normalizedStudentAnswer === normalizedCorrectAnswer;

              // Weight info for this question
              const qWeight = weights[question.questionId] ?? 0;
              const qWPV = weightedPointValues[question.questionId] ?? 0;
              const qWeightedEarned =
                question.maxPoints > 0
                  ? Math.round(
                      (currentScore / question.maxPoints) * qWPV * 100
                    ) / 100
                  : 0;

              return (
                <div
                  key={question.questionId}
                  className="p-4 bg-muted/30 rounded-lg"
                >
                  {/* Question header */}
                  <div className="flex justify-between items-start mb-3 flex-wrap gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-medium">Question {index + 1}</h4>
                      {/* Weight badge */}
                      <span className="text-xs bg-purple-100 text-purple-800 border border-purple-200 rounded-full px-2 py-0.5 font-semibold">
                        Weight: {qWeight}%
                      </span>
                      {/* Weighted point value badge */}
                      <span className="text-xs bg-blue-100 text-blue-800 border border-blue-200 rounded-full px-2 py-0.5 font-semibold">
                        Value: {qWPV} / {resolvedTotalScore} pts
                      </span>
                      {/* Raw points */}
                      <span className="text-xs text-muted-foreground">
                        (Raw: {question.maxPoints} pts)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={question.isCorrect ? "default" : "secondary"}
                      >
                        {question.questionType.replace("_", " ")}
                      </Badge>
                      {question.isAutoGraded && (
                        <Badge variant="outline" className="text-xs">
                          Auto-graded
                        </Badge>
                      )}
                      {isOpenEnded && !answersMatchNormalized ? (
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                      ) : question.isCorrect ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                  </div>

                  <p className="mb-3 font-medium">{question.questionText}</p>

                  {/* ── Student Answer ── */}
                  <div className="mb-3">
                    <strong className="text-sm">Student's Answer:</strong>

                    {isMultipleChoice && hasOptions ? (
                      <div className="mt-2 space-y-2">
                        {question.options.map((option, optIndex) => {
                          const isSelected =
                            studentSelectedOptions.includes(optIndex);
                          const isCorrectOption = option.correct;
                          const isStudentAnswerCorrect =
                            isSelected && isCorrectOption;
                          const isStudentAnswerIncorrect =
                            isSelected && !isCorrectOption;
                          const isCorrectButNotSelected =
                            !isSelected && isCorrectOption;

                          return (
                            <div
                              key={optIndex}
                              className={`p-3 rounded-lg border-2 ${
                                isStudentAnswerCorrect
                                  ? "bg-green-50 border-green-500"
                                  : isStudentAnswerIncorrect
                                  ? "bg-red-50 border-red-500"
                                  : isCorrectButNotSelected
                                  ? "bg-yellow-50 border-yellow-500"
                                  : "bg-gray-50 border-gray-300"
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 mt-0.5">
                                  {isStudentAnswerCorrect ? (
                                    <CheckCircle className="h-6 w-6 text-green-600" />
                                  ) : isStudentAnswerIncorrect ? (
                                    <XCircle className="h-6 w-6 text-red-600" />
                                  ) : isCorrectButNotSelected ? (
                                    <AlertCircle className="h-6 w-6 text-yellow-600" />
                                  ) : (
                                    <Circle className="h-6 w-6 text-gray-400" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <span className="font-medium text-base">
                                    {String.fromCharCode(65 + optIndex)}.{" "}
                                    {option.text}
                                  </span>
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {isSelected && (
                                      <Badge
                                        variant="outline"
                                        className={
                                          isCorrectOption
                                            ? "border-green-600 text-green-800 bg-green-100"
                                            : "border-red-600 text-red-800 bg-red-100"
                                        }
                                      >
                                        ✓ Student Selected
                                      </Badge>
                                    )}
                                    {isCorrectOption && (
                                      <Badge
                                        className={
                                          isSelected
                                            ? "bg-green-600 text-white"
                                            : "bg-yellow-600 text-white"
                                        }
                                      >
                                        {isSelected
                                          ? "✓ Correct"
                                          : "★ Correct Answer"}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : isOpenEnded ? (
                      <div className="mt-2 space-y-4">
                        <div>
                          <label className="text-xs text-muted-foreground block mb-1">
                            Student's Response:
                          </label>
                          <Textarea
                            value={
                              question.textAnswer || "No answer provided"
                            }
                            readOnly
                            className={`min-h-[100px] ${
                              answersMatchNormalized
                                ? "bg-green-50 border-green-500"
                                : "bg-white"
                            }`}
                          />
                        </div>
                        {question.correctAnswer && (
                          <div className="p-3 bg-blue-50 rounded-lg border-2 border-blue-400">
                            <label className="text-sm text-blue-800 font-semibold block mb-1">
                              Expected Answer:
                            </label>
                            <p className="text-sm text-blue-800">
                              {question.correctAnswer}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>

                  {/* ── Grading Section ── */}
                  <div className="mt-6 pt-4 border-t space-y-4">
                    {/* Weighted score preview */}
                    <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg flex flex-wrap items-center gap-4 text-sm">
                      <div className="flex items-center gap-1.5">
                        <Scale className="h-4 w-4 text-purple-600" />
                        <span className="text-purple-800 font-semibold">
                          Weighted Score:
                        </span>
                        <span className="font-bold text-purple-900">
                          {qWeightedEarned} / {qWPV} pts
                        </span>
                      </div>
                      <span className="text-purple-600 text-xs">
                        ({currentScore}/{question.maxPoints} raw × {qWeight}%
                        weight × {resolvedTotalScore} total)
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium">
                          Raw Points:
                        </label>
                        <p className="text-xs text-muted-foreground mt-1">
                          Adjust score (0 – {question.maxPoints} points)
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          max={question.maxPoints}
                          value={currentScore}
                          onChange={(e) =>
                            handleGradeChange(
                              question.questionId,
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="w-24"
                        />
                        <span className="text-sm text-muted-foreground">
                          / {question.maxPoints}
                        </span>
                      </div>
                    </div>

                    {/* Feedback */}
                    <div>
                      <label className="text-sm font-medium block mb-2">
                        Teacher Feedback (Optional):
                      </label>
                      <Textarea
                        value={currentFeedback}
                        onChange={(e) =>
                          handleFeedbackChange(
                            question.questionId,
                            e.target.value
                          )
                        }
                        placeholder="Provide feedback for this question..."
                        className="min-h-[80px]"
                      />
                      {question.teacherFeedback &&
                        question.teacherFeedback !== currentFeedback && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Previous feedback: {question.teacherFeedback}
                          </p>
                        )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* ── Overall Grade Management ── */}
            <Card className="p-4 bg-purple-50 border-purple-200">
              <h4 className="font-semibold text-purple-800 mb-3">
                Overall Grade Management
              </h4>

              {isGraded && existingGrade?.value && (
                <div className="mb-4 p-3 bg-white rounded-lg border border-purple-300">
                  <p className="text-sm font-semibold text-purple-900 mb-1">
                    Current Grade:
                  </p>
                  <p className="text-lg font-bold text-purple-700">
                    {existingGrade.value} / {existingGrade.maxScore} (
                    {existingGrade.percentage}%)
                  </p>
                </div>
              )}

              {/* Auto-calculated weighted grade display */}
              <div className="p-3 bg-white rounded-lg border border-purple-300 mb-4">
                <p className="text-sm font-semibold text-purple-900 mb-1">
                  Auto-Calculated Weighted Grade:
                </p>
                <p className="text-lg font-bold text-purple-700">
                  {weightedFinalGrade} / {resolvedTotalScore} pts (
                  {scorePercentage}%)
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Calculated from question weights × raw scores
                </p>
              </div>

              {hasGradeChanged && (
                <div className="p-3 bg-amber-100 rounded-lg border border-amber-400">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-700 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-amber-900 font-semibold">
                        Grade will be updated
                      </p>
                      <p className="text-xs text-amber-800 mt-1">
                        Previous: {existingGrade?.value} → New:{" "}
                        {weightedFinalGrade}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {/* ── Score Summary ── */}
            <Card className="p-4 bg-blue-50 border-blue-200">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-blue-800">
                    Total Score Summary
                  </h4>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-blue-700">
                      Weighted grade:{" "}
                      <strong>
                        {weightedFinalGrade} / {resolvedTotalScore} pts (
                        {scorePercentage}%)
                      </strong>
                    </p>
                    <p className="text-sm text-blue-700">
                      Passing score: {passingScore}% required
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-800">
                    {weightedFinalGrade} / {resolvedTotalScore}
                  </div>
                  <Badge
                    variant={
                      scorePercentage >= passingScore ? "default" : "secondary"
                    }
                    className="mt-2"
                  >
                    {scorePercentage >= passingScore
                      ? "✓ PASSING"
                      : "✗ NOT PASSING"}
                  </Badge>
                </div>
              </div>
            </Card>

            {/* ── Save Button ── */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                onClick={handleSubmitGrades}
                disabled={gradeSubmission.isPending}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                {gradeSubmission.isPending ? "Saving..." : "Save All Grades"}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}