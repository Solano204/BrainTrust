// File: src/app/features/courses/components/QuizSubmissionsView.tsx
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
  HelpCircle,
  BarChart3,
  Users,
  Clock,
  Download,
  FileText,
  ChevronDown,
  ChevronUp,
  Calculator,
} from "lucide-react";
import { useQuizMutations } from "@/components/teacher/hooks/quiz-hooks";
import {
  Question,
  SubmissionQuiz,
  Quiz,
} from "@/app/domain/entities/CourseEntities";
import { UserId } from "@/app/domain/valueObjects";

interface QuizSubmissionsViewProps {
  quizId: string;
  courseId: string;
  submission: SubmissionQuiz; // SINGLE submission passed from parent
  quiz?: Quiz; // Quiz data passed from parent
  onBack: () => void;
}

interface StudentAnswer {
  questionId: string;
  answer: string | number;
  isCorrect?: boolean;
  score?: number;
}

export function QuizSubmissionsView({
  quizId,
  courseId,
  submission, // Now single submission
  quiz,
  onBack,
}: QuizSubmissionsViewProps) {
  const { gradeSubmission } = useQuizMutations();

  // Initialize grades state from submission data
  const [grades, setGrades] = React.useState<{ [key: string]: number }>({});
  const [isExpanded, setIsExpanded] = React.useState(true);
  const [currentSubmission, setCurrentSubmission] =
    React.useState<SubmissionQuiz>(submission);

  // Initialize grades from submission data when component mounts or submission changes
  React.useEffect(() => {
    if (currentSubmission.quizData?.answers) {
      const initialGrades: { [key: string]: number } = {};
      currentSubmission.quizData.answers.forEach((answer) => {
        initialGrades[answer.questionId] = answer.points;
      });
      setGrades(initialGrades);
    }
  }, [currentSubmission]);

  console.log("SINGLE submission:", currentSubmission);
  console.log("Current grades state:", grades);

  // Parse student answers from submission quizData
  const getStudentAnswers = (submission: SubmissionQuiz): StudentAnswer[] => {
    if (!submission.quizData?.answers) return [];

    return submission.quizData.answers.map((answer) => ({
      questionId: answer.questionId,
      answer: answer.studentAnswer,
      isCorrect: answer.isCorrect,
      score: answer.points,
    }));
  };

  // Calculate score for the student based on current grades
  const calculateScore = () => {
    const totalPoints =
      quiz?.questions?.reduce((sum, q) => sum + q.points, 0) || 0;
    const earnedPoints = Object.values(grades).reduce(
      (sum, score) => sum + (score || 0),
      0
    );
    return totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
  };

  // Calculate current total points
  const calculateTotalPoints = () => {
    return Object.values(grades).reduce((sum, score) => sum + (score || 0), 0);
  };

  // Auto-grade multiple choice questions
  // In your QuizSubmissionsView component
  // Auto-grade multiple choice questions
  const handleAutoGrade = (submission: SubmissionQuiz) => {
    autoGrade.mutate(submission, {
      // Pass the full submission object
      onSuccess: (updatedSubmission) => {
        setCurrentSubmission(updatedSubmission);
        // Update grades state with the auto-graded scores
        if (updatedSubmission.quizData?.answers) {
          const updatedGrades: { [key: string]: number } = {};
          updatedSubmission.quizData.answers.forEach((answer) => {
            updatedGrades[answer.questionId] = answer.points;
          });
          setGrades(updatedGrades);
        }
      },
    });
  };

  // Manual grading - update the grades state
  const handleGradeChange = (questionId: string, score: number) => {
    const maxPoints =
      quiz?.questions.find((q) => q.id === questionId)?.points || 0;
    const normalizedScore = Math.max(0, Math.min(score, maxPoints));

    setGrades((prev) => ({
      ...prev,
      [questionId]: normalizedScore,
    }));
  };

  const handleSubmitGrades = (submission: SubmissionQuiz) => {
    const gradeUpdates = Object.entries(grades).map(([questionId, score]) => ({
      questionId,
      score: score || 0, // Ensure we don't send undefined
    }));

    console.log("Submitting grades:", gradeUpdates);
    console.log("Submission object:", submission);

    gradeSubmission.mutate(
      {
        submission, // Pass the full submission object
        grades: gradeUpdates,
      },
      {
        onSuccess: (updatedSubmission) => {
          setCurrentSubmission(updatedSubmission);
        },
      }
    );
  };

  // Get correct answer text for multiple choice
  const getCorrectAnswerText = (question: Question): string => {
    if (
      question.type === "multiple-choice" &&
      question.options &&
      question.correctAnswer !== undefined
    ) {
      return question.options[question.correctAnswer];
    }
    return question.expectedAnswer || "No expected answer provided";
  };

  // Check if answer is correct
  const isAnswerCorrect = (
    question: Question,
    studentAnswer: StudentAnswer
  ): boolean => {
    if (question.type === "multiple-choice") {
      return studentAnswer.answer === question.correctAnswer;
    }
    return false;
  };

  // Get current score for a specific question
  const getCurrentScore = (questionId: string): number => {
    return grades[questionId] || 0;
  };

  if (!quiz) {
    return (
      <div className="p-8 text-center text-destructive">
        <p>Quiz not found</p>
        <Button onClick={onBack} className="mt-4">
          Back to Inventory
        </Button>
      </div>
    );
  }

  const answers = getStudentAnswers(currentSubmission);
  const score = calculateScore();
  const totalPoints = calculateTotalPoints();
  const maxTotalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <Button onClick={onBack} variant="outline" className="gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" /> Back to Inventory
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            {quiz.title} - Student Submission
          </h1>
          <p className="text-muted-foreground mt-2">
            Student: {currentSubmission.studentName} (
            {currentSubmission.studentId})
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>
                Submitted:{" "}
                {new Date(currentSubmission.submittedAt).toLocaleString()}
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
              <span>Status: {currentSubmission.status}</span>
            </div>
          </div>
        </div>
      </div>

      {/* SINGLE SUBMISSION VIEW */}
      <Card className="p-4 border-l-4 border-blue-500">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-semibold text-lg">
              Student {currentSubmission.studentName}
            </h3>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span>
                Submitted:{" "}
                {new Date(currentSubmission.submittedAt).toLocaleString()}
              </span>
              <Badge
                variant={score >= quiz.passingScore ? "default" : "secondary"}
              >
                Score: {score}% ({totalPoints}/{maxTotalPoints} points)
              </Badge>
              <span>Status: {currentSubmission.status}</span>
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
            <Button
              onClick={() => handleAutoGrade(currentSubmission)}
              disabled={autoGrade.isPending}
              variant="outline"
              size="sm"
            >
              {autoGrade.isPending ? "Grading..." : "Auto-Grade"}
            </Button>
          </div>
        </div>

        {isExpanded && (
          <div className="space-y-4 mt-4 pt-4 border-t">
            {quiz.questions.map((question, index) => {
              const studentAnswer = answers.find(
                (a) => a.questionId === question.id
              );
              const isMultipleChoice = question.type === "multiple-choice";
              const isCorrect = studentAnswer
                ? isAnswerCorrect(question, studentAnswer)
                : false;
              const currentScore = getCurrentScore(question.id);

              return (
                <div key={question.id} className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-medium">
                      Question {index + 1} - {question.points} points
                    </h4>
                    <Badge variant={isCorrect ? "default" : "secondary"}>
                      {question.type}
                    </Badge>
                  </div>

                  <p className="mb-3 font-medium">{question.text}</p>

                  {/* Student Answer */}
                  <div className="mb-3">
                    <strong className="text-sm">Student's Answer:</strong>
                    {isMultipleChoice ? (
                      <div className="mt-2 space-y-2">
                        {question.options?.map((option, optIndex) => (
                          <div
                            key={optIndex}
                            className={`p-2 rounded border ${
                              studentAnswer?.answer === optIndex
                                ? isCorrect
                                  ? "bg-green-100 border-green-500"
                                  : "bg-red-100 border-red-500"
                                : "bg-gray-50"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {studentAnswer?.answer === optIndex &&
                                (isCorrect ? (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-red-600" />
                                ))}
                              {option}
                              {optIndex === question.correctAnswer && (
                                <Badge variant="outline" className="ml-auto">
                                  Correct Answer
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-2">
                        <Textarea
                          value={
                            studentAnswer?.answer?.toString() ||
                            "No answer provided"
                          }
                          readOnly
                          className="min-h-[100px] bg-white"
                        />
                        {question.expectedAnswer && (
                          <div className="mt-2 p-2 bg-blue-50 rounded border">
                            <strong className="text-sm">
                              Expected Answer:
                            </strong>
                            <p className="text-sm mt-1">
                              {question.expectedAnswer}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Current Score */}
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium">Score:</label>
                    <Input
                      type="number"
                      min="0"
                      max={question.points}
                      value={currentScore}
                      onChange={(e) =>
                        handleGradeChange(
                          question.id,
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-20"
                    />
                    <span className="text-sm text-muted-foreground">
                      / {question.points}
                    </span>
                    {currentScore > question.points && (
                      <span className="text-xs text-red-500">
                        Max is {question.points}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Total Score Summary */}
            <Card className="p-4 bg-blue-50 border-blue-200">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-semibold">Total Score</h4>
                  <p className="text-sm text-muted-foreground">
                    Current grade: {score}% ({totalPoints}/{maxTotalPoints}{" "}
                    points)
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">
                    {totalPoints} / {maxTotalPoints}
                  </p>
                  <Badge
                    variant={
                      score >= quiz.passingScore ? "default" : "secondary"
                    }
                  >
                    {score >= quiz.passingScore ? "Passing" : "Not Passing"}
                  </Badge>
                </div>
              </div>
            </Card>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                onClick={() => handleSubmitGrades(currentSubmission)}
                disabled={gradeSubmission.isPending}
                size="sm"
              >
                {gradeSubmission.isPending ? "Saving..." : "Save Grades"}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
