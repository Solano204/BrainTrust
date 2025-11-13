// File: src/app/features/courses/components/StudentQuizView.tsx
"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  HelpCircle,
} from "lucide-react";

interface StudentQuiz {
  id: string;
  title: string;
  description: string;
  timeLimit: number;
  maxGrade: number;
  dueDate?: string;
  isOverdue: boolean;
  questions?: any[];
  submission?: {
    id: string;
    status: string;
    submittedAt: string;
    grade?: { value: number; maxScore: number };
    teacherFeedback?: string;
    quizData?: any;
  };
}

interface StudentQuizViewProps {
  quiz: StudentQuiz;
  onExit: () => void;
}

export function StudentQuizView({ quiz, onExit }: StudentQuizViewProps) {
  console.log("Quiz Submission:", quiz);

  // If no submission exists, show a message
  if (!quiz.submission) {
    return (
      <div className="p-4 md:p-6 lg:p-8 space-y-6">
        <div className="flex items-center gap-4">
          <Button onClick={onExit} variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Tasks
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              {quiz.title}
            </h1>
            <p className="text-muted-foreground">{quiz.description}</p>
          </div>
        </div>

        <Card className="text-center p-8">
          <HelpCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">No Quiz Submission Found</h2>
          <p className="text-muted-foreground mb-4">
            You haven't taken this quiz yet.
          </p>
          <Button onClick={onExit}>
            Back to Tasks
          </Button>
        </Card>
      </div>
    );
  }

  const submission = quiz.submission;

  const formatTimeSpent = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "GRADED":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Graded
          </Badge>
        );
      case "SUBMITTED":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Submitted
          </Badge>
        );
      case "LATE_SUBMITTED":
        return <Badge variant="destructive">Late Submission</Badge>;
      default:
        return <Badge variant="outline">Not Submitted</Badge>;
    }
  };

  const getAnswerIcon = (isCorrect?: boolean) => {
    if (isCorrect === undefined)
      return <HelpCircle className="h-5 w-5 text-yellow-500" />;
    return isCorrect ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    );
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button onClick={onExit} variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Tasks
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Quiz Submission: {quiz.title}
          </h1>
          <p className="text-muted-foreground">
            Submitted on {new Date(submission.submittedAt).toLocaleDateString()} at{" "}
            {new Date(submission.submittedAt).toLocaleTimeString()}
          </p>
        </div>
      </div>

      {/* Quiz Submission Overview */}
      <Card className="p-6 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Status</div>
            <div className="flex items-center gap-2">
              {getStatusBadge(submission.status)}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Score</div>
            <div className="text-2xl font-bold">
              {submission.quizData
                ? `${submission.quizData.totalScore}/${submission.quizData.maxScore}`
                : "N/A"}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Percentage</div>
            <div className="text-2xl font-bold text-primary">
              {submission.grade
                ? `${((submission.grade.value / submission.grade.maxScore) * 100).toFixed(1)}%`
                : "N/A"}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Time Spent</div>
            <div className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {submission.quizData ? formatTimeSpent(submission.quizData.timeSpent) : "N/A"}
            </div>
          </div>
        </div>

        {/* Teacher Feedback */}
        {submission.teacherFeedback && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">
              Teacher Feedback
            </h3>
            <p className="text-blue-800">{submission.teacherFeedback}</p>
          </div>
        )}
      </Card>

      {/* Quiz Questions and Answers */}
      {submission.quizData ? (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-foreground">Question Review</h2>

          {submission.quizData.answers.map((answer: any, index: number) => (
            <Card key={answer.questionId} className="p-6 shadow-md">
              <div className="flex items-start gap-4">
                {/* Question Number and Status */}
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  {getAnswerIcon(answer.isCorrect)}
                  <div className="text-sm font-medium">
                    {answer.points}/{answer.maxPoints}
                  </div>
                </div>

                {/* Question Content */}
                <div className="flex-1 space-y-4">
                  {/* Question Text */}
                  <div>
                    <h3 className="font-semibold text-lg mb-2">
                      {answer.questionText}
                    </h3>
                    <Badge variant="outline" className="mb-3">
                      {answer.questionType === "multiple-choice"
                        ? "Multiple Choice"
                        : "Open Ended"}
                    </Badge>
                  </div>

                  {/* Student Answer */}
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">
                      Your Answer:
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      {typeof answer.studentAnswer === "number"
                        ? `Option ${answer.studentAnswer + 1}`
                        : answer.studentAnswer}
                    </div>
                  </div>

                  {/* Correct Answer (if multiple choice and incorrect) */}
                  {answer.questionType === "multiple-choice" &&
                    answer.correctAnswer !== undefined &&
                    !answer.isCorrect && (
                      <div>
                        <div className="text-sm font-medium text-muted-foreground mb-1">
                          Correct Answer:
                        </div>
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-800">
                          Option {Number(answer.correctAnswer) + 1}
                        </div>
                      </div>
                    )}

                  {/* Feedback */}
                  {answer.feedback && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-1">
                        Feedback:
                      </div>
                      <div
                        className={`p-3 rounded-lg ${
                          answer.isCorrect
                            ? "bg-green-50 border border-green-200 text-green-800"
                            : answer.isCorrect === false
                            ? "bg-red-50 border border-red-200 text-red-800"
                            : "bg-yellow-50 border border-yellow-200 text-yellow-800"
                        }`}
                      >
                        {answer.feedback}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <HelpCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">
            Detailed Results Not Available
          </h3>
          <p className="text-muted-foreground">
            The detailed quiz results are not available at the moment.
          </p>
        </Card>
      )}
    </div>
  );
}