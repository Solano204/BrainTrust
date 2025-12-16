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
} from "lucide-react";
import { useQuizMutations, useQuizSubmissionDetail } from "./hooks/quiz-hooks";

interface QuizSubmissionsViewProps {
  submissionId: string;
  onBack: () => void;
}

export function QuizSubmissionsView({
  submissionId,
  onBack,
}: QuizSubmissionsViewProps) {
  const { gradeSubmission } = useQuizMutations();

  const {
    data: submissionDetail,
    isLoading: isSubmissionLoading,
    error: submissionError,
  } = useQuizSubmissionDetail(submissionId);

  const [grades, setGrades] = React.useState<{ [key: string]: number }>({});
  const [feedbacks, setFeedbacks] = React.useState<{ [key: string]: string }>({});
  const [isExpanded, setIsExpanded] = React.useState(true);
  const [overallGrade, setOverallGrade] = React.useState<string>("");

  // Helper function to normalize text for comparison
  const normalizeText = (text: string): string => {
    if (!text) return "";
    return text
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[^\w]/g, "");
  };

  // Initialize grades and feedbacks from submission detail
  React.useEffect(() => {
    if (submissionDetail?.questionResponses) {
      const initialGrades: { [key: string]: number } = {};
      const initialFeedbacks: { [key: string]: string } = {};
      
      submissionDetail.questionResponses.forEach((response) => {
        // Use earnedPoints from backend
        initialGrades[response.questionId] = response.earnedPoints;
        initialFeedbacks[response.questionId] = response.teacherFeedback || '';
      });
      
      setGrades(initialGrades);
      setFeedbacks(initialFeedbacks);
    }

    // Set initial overall grade from submission
    if (submissionDetail?.grade?.value) {
      setOverallGrade(submissionDetail.grade.value);
    }
  }, [submissionDetail]);

  const calculateScore = () => {
    if (!submissionDetail) return 0;

    const totalPoints = submissionDetail.questionResponses.reduce(
      (sum, q) => sum + q.maxPoints,
      0
    );
    const earnedPoints = Object.values(grades).reduce(
      (sum, score) => sum + (score || 0),
      0
    );
    return totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
  };

  const calculateTotalPoints = () => {
    return Object.values(grades).reduce((sum, score) => sum + (score || 0), 0);
  };

  const handleGradeChange = (questionId: string, score: number) => {
    const question = submissionDetail?.questionResponses.find(
      (q) => q.questionId === questionId
    );
    const maxPoints = question?.maxPoints || 0;
    const normalizedScore = Math.max(0, Math.min(score, maxPoints));

    setGrades((prev) => ({
      ...prev,
      [questionId]: normalizedScore,
    }));
  };

  const handleFeedbackChange = (questionId: string, feedback: string) => {
    setFeedbacks((prev) => ({
      ...prev,
      [questionId]: feedback,
    }));
  };

  const handleOverallGradeChange = (value: string) => {
    setOverallGrade(value);
  };

  const handleSubmitGrades = () => {
    if (!submissionDetail) return;

    const gradeUpdates = Object.entries(grades).map(([questionId, score]) => ({
      questionId,
      score: score || 0,
      feedback: feedbacks[questionId] || '',
    }));

    gradeSubmission.mutate(
      {
        submissionId: submissionDetail.id,
        grades: gradeUpdates,
        overallGrade: overallGrade,
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

  const getCurrentScore = (questionId: string): number => {
    return grades[questionId] || 0;
  };

  const getCurrentFeedback = (questionId: string): string => {
    return feedbacks[questionId] || '';
  };

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

  const score = calculateScore();
  const totalPoints = calculateTotalPoints();
  const maxTotalPoints = submissionDetail.questionResponses.reduce(
    (sum, q) => sum + q.maxPoints,
    0
  );
  const passingScore = 70;

  // Check if submission is already graded
  const isGraded = submissionDetail.status === "GRADED";
  const existingGrade = submissionDetail.grade;
  const hasGradeChanged =
    isGraded && existingGrade?.value && overallGrade !== existingGrade.value;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <Button onClick={onBack} variant="outline" className="gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" /> Back to Inventory
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            {submissionDetail.quizTitle} - Student Submission
          </h1>
          <p className="text-muted-foreground mt-2">
            Student: {submissionDetail.studentName} ({submissionDetail.studentId})
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>
                Submitted: {new Date(submissionDetail.submittedAt).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span>
                Score: {score}% ({totalPoints}/{maxTotalPoints} points)
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
      </div>

      {/* Existing Grade Banner */}
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
                  You can modify the grade below. The existing grade will be
                  preserved until you save changes.
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Submission View */}
      <Card className="p-4 border-l-4 border-blue-500">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-semibold text-lg">
              Student {submissionDetail.studentName}
            </h3>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span>
                Submitted: {new Date(submissionDetail.submittedAt).toLocaleString()}
              </span>
              <Badge variant={score >= passingScore ? "default" : "secondary"}>
                Score: {score}% ({totalPoints}/{maxTotalPoints} points)
              </Badge>
              <span>Status: {submissionDetail.status}</span>
              {submissionDetail.autoGraded && (
                <Badge variant="outline">Auto-graded</Badge>
              )}
            </div>
          </div>
          <div className="flex gap-2">
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
        </div>

        {isExpanded && (
          <div className="space-y-4 mt-4 pt-4 border-t">
            {submissionDetail.questionResponses.map((question, index) => {
              const isMultipleChoice = question.questionType === "MULTIPLE_CHOICE";
              const isOpenEnded = question.questionType === "OPEN_ENDED";
              const currentScore = getCurrentScore(question.questionId);
              const currentFeedback = getCurrentFeedback(question.questionId);
              const studentSelectedOptions = question.selectedOptions || [];
              const hasOptions = question.options && question.options.length > 0;

              // For open-ended questions, check if normalized answers match
              const normalizedStudentAnswer = normalizeText(question.textAnswer);
              const normalizedCorrectAnswer = normalizeText(question.correctAnswer);
              const answersMatchNormalized =
                normalizedStudentAnswer &&
                normalizedCorrectAnswer &&
                normalizedStudentAnswer === normalizedCorrectAnswer;

              return (
                <div
                  key={question.questionId}
                  className="p-4 bg-muted/30 rounded-lg"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-medium">
                      Question {index + 1} - {question.maxPoints} points
                    </h4>
                    <div className="flex items-center gap-2">
                      <Badge variant={question.isCorrect ? "default" : "secondary"}>
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

                  {/* Student Answer Section */}
                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-2">
                      <strong className="text-sm">Student's Answer:</strong>
                    </div>

                    {isMultipleChoice && hasOptions ? (
                      <div className="mt-2 space-y-2">
                        {question.options.map((option, optIndex) => {
                          const isSelected = studentSelectedOptions.includes(optIndex);
                          const isCorrectOption = option.correct;
                          const isStudentAnswerCorrect = isSelected && isCorrectOption;
                          const isStudentAnswerIncorrect = isSelected && !isCorrectOption;
                          const isCorrectButNotSelected = !isSelected && isCorrectOption;

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
                                    {String.fromCharCode(65 + optIndex)}. {option.text}
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
                                        {isSelected ? "✓ Correct" : "★ Correct Answer"}
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
                            value={question.textAnswer || "No answer provided"}
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
                            <p className="text-sm text-blue-800">{question.correctAnswer}</p>
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>

                  {/* Grading Section */}
                  <div className="mt-6 pt-4 border-t space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium">Points:</label>
                        <p className="text-xs text-muted-foreground mt-1">
                          Adjust score (0 - {question.maxPoints} points)
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

                    {/* Feedback Section */}
                    <div>
                      <label className="text-sm font-medium block mb-2">
                        Teacher Feedback (Optional):
                      </label>
                      <Textarea
                        value={currentFeedback}
                        onChange={(e) =>
                          handleFeedbackChange(question.questionId, e.target.value)
                        }
                        placeholder="Provide feedback for this question..."
                        className="min-h-[80px]"
                      />
                      {question.teacherFeedback && question.teacherFeedback !== currentFeedback && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Previous feedback: {question.teacherFeedback}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Overall Grade Section */}
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
                    {existingGrade.value} / {existingGrade.maxScore} ({existingGrade.percentage}%)
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-purple-900 block mb-2">
                    {hasGradeChanged ? "New Grade:" : "Overall Grade:"}
                  </label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="text"
                      value={overallGrade}
                      onChange={(e) => handleOverallGradeChange(e.target.value)}
                      placeholder={`Auto-calculated: ${totalPoints}`}
                      className="max-w-xs"
                    />
                    <span className="text-sm text-muted-foreground">
                      / {maxTotalPoints} points
                    </span>
                  </div>
                  <p className="text-xs text-purple-700 mt-2">
                    Leave empty to use auto-calculated score: {totalPoints} points
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
                          Previous: {existingGrade.value} → New: {overallGrade || totalPoints}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Total Score Summary */}
            <Card className="p-4 bg-blue-50 border-blue-200">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-blue-800">
                    Total Score Summary
                  </h4>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-blue-700">
                      Current grade: <strong>{score}%</strong> ({totalPoints}/{maxTotalPoints} points)
                    </p>
                    <p className="text-sm text-blue-700">
                      Passing score: {passingScore}% required
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-800">
                    {totalPoints} / {maxTotalPoints}
                  </div>
                  <Badge
                    variant={score >= passingScore ? "default" : "secondary"}
                    className="mt-2"
                  >
                    {score >= passingScore ? "✓ PASSING" : "✗ NOT PASSING"}
                  </Badge>
                </div>
              </div>
            </Card>

            {/* Action Buttons */}
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