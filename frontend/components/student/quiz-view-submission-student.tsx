"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import {
  Clock,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  Flag,
  Send,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Award,
  Calendar,
  Timer,
  Eye,
  FileQuestion,
  Lock, 
} from "lucide-react";
import { Quiz, QuizAnswer, SubmissionQuiz } from "@/app/domain/entities/CourseEntities";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface QuizViewProps {
  quiz: Quiz;
  existingSubmission?: SubmissionQuiz;
  onSubmit: (answers: Record<string, QuizAnswer>) => Promise<void>;
  onExit?: () => void;
}

interface QuizAnswers {
  [questionId: string]: QuizAnswer;
}

export const QuizView: React.FC<QuizViewProps> = ({
  quiz,
  existingSubmission,
  onSubmit,
  onExit,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [timeRemaining, setTimeRemaining] = useState<number>(
    quiz.timeLimit * 60
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(
    new Set()
  );
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showTimeUpDialog, setShowTimeUpDialog] = useState(false);
  const [showStartDialog, setShowStartDialog] = useState(false);

  useEffect(() => {
    if (existingSubmission?.quizData?.answers) {
      const initialAnswers: QuizAnswers = {};
      existingSubmission.quizData.answers.forEach((answer) => {
        initialAnswers[answer.questionId] = answer;
      });
      setAnswers(initialAnswers);
    } else {
      setShowStartDialog(true);

      const initialAnswers: QuizAnswers = {};
      quiz.questions.forEach((question) => {
        initialAnswers[question.id] = {
          questionId: question.id,
          questionText: question.question,
          questionType: question.type,
          studentAnswer: question.type === "multiple-choice" ? -1 : "",
          points: 0,
          maxPoints: question.points,
          isCorrect: undefined,
        };
      });
      setAnswers(initialAnswers);
    }
  }, [existingSubmission, quiz.questions]);

  function gradeQuizAnswers(
    questions: any[],
    studentAnswers: Record<string, any>
  ): QuizAnswer[] {
    const gradedAnswers: QuizAnswer[] = [];

    for (const question of questions) {
      const studentAnswer = studentAnswers[question.id];

      if (!studentAnswer) {
        gradedAnswers.push({
          questionId: question.id,
          questionText: question.question,
          questionType: question.type,
          studentAnswer: question.type === "multiple_choice" ? -1 : "",
          correctAnswer: question.correctAnswer,
          points: 0,
          maxPoints: question.points,
          isCorrect: false,
          feedback: "No answer provided",
        });
        continue;
      }

      let isCorrect = false;
      let points = 0;
      let feedback = "";

      if (question.type === "multiple_choice") {
        const studentChoice = Number(studentAnswer.studentAnswer);
        const correctChoice = Number(question.correctAnswer);

        isCorrect = studentChoice === correctChoice;
        points = isCorrect ? question.points : 0;
        feedback = isCorrect
          ? "Correct!"
          : `Incorrect. The correct answer is option ${correctChoice + 1}.`;
      } else if (question.type === "open_ended") {
        const studentText = String(studentAnswer.studentAnswer || "")
          .trim()
          .toLowerCase();
        const correctText = String(question.correctAnswer || "")
          .trim()
          .toLowerCase();

        isCorrect = studentText === correctText;

        if (isCorrect) {
          points = question.points;
          feedback = "Correct!";
        } else if (studentText === "") {
          points = 0;
          feedback = "No answer provided";
        } else {
          points = 0;
          feedback = `Incorrect. Expected: "${question.correctAnswer}"`;
        }
      }

      gradedAnswers.push({
        questionId: question.id,
        questionText: question.question,
        questionType: question.type,
        studentAnswer: studentAnswer.studentAnswer,
        correctAnswer: question.correctAnswer,
        points,
        maxPoints: question.points,
        isCorrect,
        feedback,
      });
    }

    return gradedAnswers;
  }


  useEffect(() => {
    if (existingSubmission || timeRemaining <= 0) return;

    if (showStartDialog) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setShowTimeUpDialog(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, existingSubmission, showStartDialog]);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  
  const answeredCount = Object.keys(answers).filter((key) => {
    const answer = answers[key];
    if (answer.questionType === "multiple-choice") {
      return answer.studentAnswer !== -1;
    } else {
      return answer.studentAnswer !== "";
    }
  }).length;
  
  const unansweredCount = quiz.questions.length - answeredCount;

  const now = new Date();
  const startDate = quiz.availableFrom ? new Date(quiz.availableFrom) : null;
  const endDate = quiz.dueDate ? new Date(quiz.dueDate) : null;

  const isTooEarly = startDate ? now < startDate : false;
  const isTooLate = endDate ? now > endDate : false;
  const isStartDisabled = isTooEarly || isTooLate;

  const getStatusMessage = () => {
    if (isTooEarly)
      return `El examen se habilitará el: ${startDate?.toLocaleString()}`;
    if (isTooLate)
      return `El examen finalizó el: ${endDate?.toLocaleString()}`;
    return null;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnswerChange = (questionId: string, answer: string | number) => {
    const question = quiz.questions.find((q) => q.id === questionId);
    if (!question) return;

    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        questionId: questionId,
        questionText: question.question,
        questionType: question.type,
        studentAnswer: answer,
        points: 0,
        maxPoints: question.points,
        isCorrect: undefined,
      },
    }));
  };

  const toggleFlag = (questionId: string) => {
    setFlaggedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const goToNextQuestion = () => {
    if (!isLastQuestion) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (!isFirstQuestion) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleStartQuiz = () => {
    if (isStartDisabled) return;
    setShowStartDialog(false);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await onSubmit(answers);
    setIsSubmitting(false);
    setShowSubmitConfirm(false);
  };

  const handleExitConfirm = () => {
    setShowExitConfirm(false);
    onExit?.();
  };

  const handleTimeUpSubmit = async () => {
    setShowTimeUpDialog(false);
    setIsSubmitting(true);
    await onSubmit(answers);
    setIsSubmitting(false);
  };

  if (existingSubmission) {
    return (
      <QuizResults
        quiz={quiz}
        submission={existingSubmission}
        userAnswers={answers}
        onExit={onExit}
      />
    );
  }

  return (
    <>

      <Dialog 
        open={showStartDialog} 
        onOpenChange={(isOpen) => {
          if (!isOpen) {
             setShowStartDialog(false);
             onExit?.(); 
          }
          setShowStartDialog(isOpen);
        }}
      >
        <DialogContent 
          className="sm:max-w-md"
          onInteractOutside={(e) => {
            e.preventDefault();
          }}
          // onEscapeKeyDown={(e) => e.preventDefault()}
        >

          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-blue-500" />
              Start Quiz
            </DialogTitle>
            <DialogDescription>
              Are you ready to begin "{quiz.title}"?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Quiz Details */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Duration:</span>
                  <Badge variant="outline" className="gap-1">
                    <Timer className="h-3 w-3" />
                    {quiz.timeLimit} minutes
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Questions:</span>
                  <Badge variant="outline" className="gap-1">
                    <FileQuestion className="h-3 w-3" />
                    {quiz.questions.length} questions
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Max Score:</span>
                  <Badge variant="outline" className="gap-1">
                    <Award className="h-3 w-3" />
                    {quiz.maxGrade} points
                  </Badge>
                </div>
                {quiz.dueDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Due Date:</span>
                    <Badge variant="outline" className="gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(quiz.dueDate).toLocaleDateString()}
                    </Badge>
                  </div>
                )}
                {quiz.availableFrom && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Opens:</span>
                    <Badge variant="outline" className="gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(quiz.availableFrom).toLocaleDateString()}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {isStartDisabled && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-red-800">
                    Quiz Unavailable
                  </h4>
                  <p className="text-sm text-red-700 mt-1">
                    {getStatusMessage()}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                Important Instructions:
              </h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Timer will start immediately when you begin</li>
                <li>• You can flag questions for review</li>
                <li>• Navigate freely between questions</li>
                <li>• Answers are saved as you go</li>
                <li>• Submit before time runs out</li>
              </ul>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowStartDialog(false);
                onExit?.(); 
              }}
            >
              Exit
            </Button>
            
            <Button 
              onClick={handleStartQuiz} 
              className="gap-2"
              disabled={isStartDisabled}
            >
              {isStartDisabled ? (
                <Lock className="h-4 w-4" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              Start Quiz
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Main Quiz Interface */}
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 dark:from-gray-900 dark:to-green-900 p-4">
        <div className="max-w-5xl mx-auto">
          {/* Quiz Header */}
          <Card className="shadow-lg mb-6 border-l-4 border-blue-500">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {quiz.title}
                    </h1>
                    <Badge variant="secondary">Student View</Badge>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">
                    {quiz.description}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  {/* Timer */}
                  <div
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg font-mono text-lg font-bold ${
                      timeRemaining < 300
                        ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                        : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                    }`}
                  >
                    <Clock className="h-5 w-5" />
                    {formatTime(timeRemaining)}
                  </div>

                  {/* Progress */}
                  <div className="text-center">
                    <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                      Question {currentQuestionIndex + 1} of{" "}
                      {quiz.questions.length}
                    </div>
                    <Progress value={progress} className="w-32" />
                    <div className="text-xs text-muted-foreground mt-1">
                      {answeredCount} answered • {unansweredCount} unanswered
                    </div>
                  </div>
                </div>
              </div>

              {/* Quiz Info Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t">
                <div className="text-center">
                  <div className="text-sm font-medium">Time Limit</div>
                  <div className="text-lg font-semibold">
                    {quiz.timeLimit} min
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium">Max Score</div>
                  <div className="text-lg font-semibold">{quiz.maxGrade}</div>
                </div>
                <div className="text-center">
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium">Due Date</div>
                  <div className="text-lg font-semibold">
                    {quiz.dueDate
                      ? new Date(quiz.dueDate).toLocaleDateString()
                      : "No due date"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <Card className="shadow-lg sticky top-4">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Questions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 lg:grid-cols-2 gap-2">
                    {quiz.questions.map((question, index) => {
                      const answer = answers[question.id];
                      const isAnswered =
                        answer &&
                        (answer.questionType === "multiple-choice"
                          ? answer.studentAnswer !== -1
                          : answer.studentAnswer !== "");

                      return (
                        <Button
                          key={question.id}
                          variant={
                            currentQuestionIndex === index
                              ? "default"
                              : isAnswered
                              ? "secondary"
                              : "outline"
                          }
                          size="sm"
                          className={`relative h-12 ${
                            flaggedQuestions.has(question.id)
                              ? "border-yellow-400 border-2"
                              : ""
                          }`}
                          onClick={() => setCurrentQuestionIndex(index)}
                        >
                          {index + 1}
                          {flaggedQuestions.has(question.id) && (
                            <Flag className="h-3 w-3 absolute -top-1 -right-1 text-yellow-500 fill-yellow-500" />
                          )}
                        </Button>
                      );
                    })}
                  </div>

                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-primary rounded"></div>
                      <span>Current</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-secondary rounded"></div>
                      <span>Answered</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gray-200 rounded border"></div>
                      <span>Unanswered</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Flag className="h-3 w-3 text-yellow-500" />
                      <span>Flagged</span>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="mt-4 pt-4 border-t space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Answered:</span>
                      <span className="font-medium">
                        {answeredCount}/{quiz.questions.length}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Flagged:</span>
                      <span className="font-medium">
                        {flaggedQuestions.size}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Question Content */}
            <div className="lg:col-span-3 space-y-6">
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  {/* Question Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-sm">
                          {currentQuestion.type === "multiple-choice"
                            ? "Multiple Choice"
                            : "Open Ended"}
                        </Badge>
                        <Badge variant="secondary" className="text-sm">
                          {currentQuestion.points} point
                          {currentQuestion.points !== 1 ? "s" : ""}
                        </Badge>
                        {flaggedQuestions.has(currentQuestion.id) && (
                          <Badge variant="outline" className="text-sm gap-1">
                            <Flag className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                            Flagged
                          </Badge>
                        )}
                      </div>
                      <h2 className="text-xl font-semibold">
                        {currentQuestion.question}
                      </h2>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleFlag(currentQuestion.id)}
                      className="gap-2"
                    >
                      <Flag
                        className={`h-4 w-4 ${
                          flaggedQuestions.has(currentQuestion.id)
                            ? "text-yellow-500 fill-yellow-500"
                            : ""
                        }`}
                      />
                      {flaggedQuestions.has(currentQuestion.id)
                        ? "Unflag"
                        : "Flag for Review"}
                    </Button>
                  </div>

                  {/* Question Content */}
                  <div className="space-y-4">
                    {currentQuestion.type === "multiple-choice" ? (
                      <RadioGroup
                        value={
                          answers[currentQuestion.id]?.studentAnswer?.toString() ||
                          ""
                        }
                        onValueChange={(value) =>
                          handleAnswerChange(
                            currentQuestion.id,
                            parseInt(value)
                          )
                        }
                        className="space-y-3"
                      >
                        {currentQuestion.options?.map((option, index) => (
                          <div
                            key={index}
                            className={`flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors ${
                              answers[currentQuestion.id]?.studentAnswer ===
                              index
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                : ""
                            }`}
                          >
                            <RadioGroupItem
                              value={index.toString()}
                              id={`option-${index}`}
                              className="h-5 w-5"
                            />
                            <Label
                              htmlFor={`option-${index}`}
                              className="flex-1 cursor-pointer text-sm"
                            >
                              <div className="flex items-start gap-3">
                                <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                                  {String.fromCharCode(65 + index)}
                                </span>
                                <span className="flex-1">{option}</span>
                              </div>
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    ) : (
                      <div className="space-y-3">
                        <Textarea
                          placeholder="Type your answer here... Be as detailed and specific as possible. You can include formulas, explanations, or any relevant information."
                          value={
                            answers[currentQuestion.id]?.studentAnswer?.toString() ||
                            ""
                          }
                          onChange={(e) =>
                            handleAnswerChange(
                              currentQuestion.id,
                              e.target.value
                            )
                          }
                          rows={10}
                          className="resize-none font-mono text-sm"
                        />
                        <div className="text-right text-xs text-muted-foreground">
                          Character count:{" "}
                          {answers[currentQuestion.id]?.studentAnswer?.toString()
                            .length || 0}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={goToPreviousQuestion}
                  disabled={isFirstQuestion}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </Button>

                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowExitConfirm(true)}
                    disabled={isSubmitting}
                    className="gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Exit Quiz
                  </Button>

                  {isLastQuestion ? (
                    <Button
                      onClick={() => setShowSubmitConfirm(true)}
                      disabled={isSubmitting}
                      className="gap-2 bg-green-600 hover:bg-green-700"
                      size="lg"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Submit Quiz
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      onClick={goToNextQuestion}
                      className="gap-2"
                      size="lg"
                    >
                      Next Question
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Time Warning */}
              {timeRemaining < 300 && timeRemaining > 0 && (
                <Card className="border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20">
                  <CardContent className="p-4 flex items-center gap-3">
                    <Clock className="h-5 w-5 text-red-500 animate-pulse" />
                    <div>
                      <p className="font-medium text-red-700 dark:text-red-300">
                        Time is running out!
                      </p>
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {timeRemaining < 60
                          ? "Less than 1 minute remaining"
                          : `${Math.ceil(
                              timeRemaining / 60
                            )} minutes remaining`}
                        {unansweredCount > 0 &&
                          ` • ${unansweredCount} unanswered questions`}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Exit Confirmation Dialog */}
      <AlertDialog open={showExitConfirm} onOpenChange={setShowExitConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Exit Quiz?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Your progress will be saved, but you'll need to complete the quiz
              later. You have answered {answeredCount} out of{" "}
              {quiz.questions.length} questions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Quiz</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleExitConfirm}
              className="bg-red-600 hover:bg-red-700 gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Exit Quiz
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Submit Confirmation Dialog */}
      <AlertDialog
        open={showSubmitConfirm}
        onOpenChange={setShowSubmitConfirm}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-green-500" />
              Submit Quiz?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {unansweredCount > 0 ? (
                <>
                  You have <strong>{unansweredCount}</strong> unanswered
                  question{unansweredCount !== 1 ? "s" : ""}. Are you sure you
                  want to submit your quiz?
                </>
              ) : (
                "Are you ready to submit your quiz? You won't be able to make changes after submission."
              )}
            </AlertDialogDescription>
            {timeRemaining > 0 && (
              <div className="mt-2 text-sm">
                <p>Time remaining: {formatTime(timeRemaining)}</p>
              </div>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Review Questions</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSubmit}
              className="bg-green-600 hover:bg-green-700 gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit Quiz
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Time Up Dialog */}
      <Dialog open={showTimeUpDialog} onOpenChange={setShowTimeUpDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Clock className="h-6 w-6" />
              Time's Up!
            </DialogTitle>
            <DialogDescription>
              The quiz time has ended. Your answers will be automatically
              submitted now.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex sm:justify-between gap-2">
            <Button
              variant="outline"
              onClick={handleTimeUpSubmit}
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2" />
                  Submitting...
                </>
              ) : (
                "Submit Now"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

interface QuizResultsProps {
  quiz: Quiz;
  submission: SubmissionQuiz;
  userAnswers: QuizAnswers;
  onExit?: () => void;
}

const QuizResults: React.FC<QuizResultsProps> = ({
  quiz,
  submission,
  userAnswers,
  onExit,
}) => {
  const hasDetailedData = submission.quizData;
  const quizAnswers = submission.quizData?.answers || [];

  const totalMaxScore = quiz.questions.reduce((total, q) => total + q.points, 0);

  const calculatedScore = quizAnswers.reduce((total, answer) => {
    if (typeof answer.points === 'number') {
      return total + answer.points;
    }

    if (answer.isCorrect) {
       const question = quiz.questions.find(q => q.id === answer.questionId);
       return total + (question?.points || 0);
    }
    return total;
  }, 0);

  const finalScore = submission.grade?.value || calculatedScore;

  const percentage = totalMaxScore > 0 ? (finalScore / totalMaxScore) * 100 : 0;

  const passed = percentage >= 70;

  const correctCount = quizAnswers.filter(a => a.isCorrect === true).length;
  const incorrectCount = quizAnswers.filter(a => a.isCorrect === false).length;
  const pendingCount = quizAnswers.filter(a => a.isCorrect === undefined).length;

  const formatStudentAnswer = (question: any, answer: any) => {
    if (!answer?.studentAnswer && answer?.studentAnswer !== 0) {
      return "No answer provided";
    }

    if (question.type === "multiple-choice") {
      const optionIndex = Number(answer.studentAnswer);
      if (question.options && question.options[optionIndex] !== undefined) {
        return question.options[optionIndex];
      }
      return `Option ${optionIndex + 1}`;
    } else {
      return String(answer.studentAnswer || "");
    }
  };

  const formatCorrectAnswer = (question: any, detailedAnswer: any) => {
    if (question.type !== "multiple-choice") {
        if (question.correctAnswer) return question.correctAnswer;
        return "Requires teacher grading";
    }

    if (detailedAnswer?.correctAnswer !== undefined) {
      const correctIndex = Number(detailedAnswer.correctAnswer);
      if (question.options && question.options[correctIndex] !== undefined) {
        return question.options[correctIndex];
      }
      return `Option ${correctIndex + 1}`;
    }

    if (question.correctAnswer !== undefined) {
      const correctIndex = Number(question.correctAnswer);
      if (question.options && question.options[correctIndex] !== undefined) {
        return question.options[correctIndex];
      }
      return `Option ${correctIndex + 1}`;
    }

    return "Not available";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 dark:from-gray-900 dark:to-green-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Results Header */}
        <Card className="shadow-lg mb-6 text-center">
          <CardContent className="p-8">
            <div
              className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
                passed ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
              }`}
            >
              {passed ? (
                <CheckCircle className="h-10 w-10" />
              ) : (
                <HelpCircle className="h-10 w-10" />
              )}
            </div>

            <h1 className="text-3xl font-bold mb-2">
              {passed ? "Quiz Completed!" : "Quiz Finished"}
            </h1>
            <p className="text-lg text-muted-foreground mb-4">{quiz.title}</p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-md mx-auto">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{Math.round(finalScore * 100) / 100}</p>
                <p className="text-sm text-muted-foreground">Your Score</p>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{totalMaxScore}</p>
                <p className="text-sm text-muted-foreground">Max Score</p>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">
                  {Math.round(percentage)}%
                </p>
                <p className="text-sm text-muted-foreground">Percentage</p>
              </div>
              {hasDetailedData && (
                <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">
                    {Math.round((submission.quizData?.timeSpent || 0) / 60)}m
                  </p>
                  <p className="text-sm text-muted-foreground">Time Spent</p>
                </div>
              )}
            </div>

            {submission.teacherFeedback && (
              <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg max-w-md mx-auto">
                <p className="font-semibold mb-2">Teacher Feedback:</p>
                <p className="text-sm text-muted-foreground">
                  {submission.teacherFeedback}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Question Review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {quiz.questions.map((question, index) => {
              const detailedAnswer = quizAnswers.find(
                (a) => a.questionId === question.id
              );
              const userAnswer = userAnswers[question.id];

              const studentAnswerText = formatStudentAnswer(
                question,
                userAnswer || detailedAnswer
              );
              const correctAnswerText = formatCorrectAnswer(
                question,
                detailedAnswer
              );

              const isOpenEnded = question.type !== 'multiple-choice';
              
              let needsReview = detailedAnswer && detailedAnswer.isCorrect === undefined;
              if (isOpenEnded && detailedAnswer) {
                 if (detailedAnswer.isCorrect === undefined && detailedAnswer.points === 0) {
                     needsReview = true;
                 }
              }

              let displayPoints = detailedAnswer?.points || 0;
              if (detailedAnswer?.isCorrect && displayPoints === 0) {
                  displayPoints = question.points;
              }

              return (
                <div key={question.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">Question {index + 1}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {question.question}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-col items-end">
                      {detailedAnswer && (
                        <>
                          {/* Show individual question score */}
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                displayPoints === question.points
                                  ? "default"
                                  : "secondary"
                              }
                              className="text-sm"
                            >
                              Score: {displayPoints}/{question.points}
                            </Badge>
                          </div>

                          {detailedAnswer.feedback && (
                            <Badge variant="outline" className="text-xs">
                              Teacher Reviewed
                            </Badge>
                          )}

                          {needsReview ? (
                            <Badge
                              variant="secondary"
                              className="bg-yellow-100 text-yellow-800 border-yellow-300"
                            >
                              Pending Review
                            </Badge>
                          ) : (
                            <Badge
                              variant={
                                detailedAnswer.isCorrect
                                  ? "default"
                                  : "destructive"
                              }
                              className="text-xs"
                            >
                              {detailedAnswer.isCorrect
                                ? "Correct"
                                : "Incorrect"}
                            </Badge>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Student Answer */}
                    <div>
                      <strong className="text-sm block mb-1">
                        Your answer:
                      </strong>
                      <div
                        className={`p-3 rounded border ${
                          needsReview
                            ? "bg-yellow-50 border-yellow-300 dark:bg-yellow-900/20 dark:border-yellow-700"
                            : detailedAnswer?.isCorrect
                            ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
                            : "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
                        }`}
                      >
                        <p className="text-sm font-medium">
                          {studentAnswerText}
                        </p>
                        {question.type === "multiple-choice" &&
                          userAnswer?.studentAnswer !== undefined && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Selected option{" "}
                              {Number(userAnswer.studentAnswer) + 1}
                            </p>
                          )}
                      </div>
                    </div>

                    {/* Needs Review Notice */}
                    {needsReview && (
                      <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-300">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-100">
                              This answer is pending teacher review
                            </p>
                            <p className="text-xs text-yellow-800 dark:text-yellow-200 mt-1">
                              Your answer may be correct but uses different
                              wording or requires manual grading. Your teacher will review it.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {!needsReview && (
                        <div>
                        <strong className="text-sm block mb-1">
                            Expected answer:
                        </strong>
                        <div className="p-3 rounded border bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
                            <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                            {correctAnswerText}
                            </p>
                            {question.type === "multiple-choice" &&
                            detailedAnswer?.correctAnswer !== undefined && (
                                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                Option {Number(detailedAnswer.correctAnswer) + 1}
                                </p>
                            )}
                        </div>
                        </div>
                    )}

                    {question.type === "multiple-choice" &&
                      question.options &&
                      question.options.length > 0 && (
                        <div>
                          <strong className="text-sm block mb-1">
                            All options:
                          </strong>
                          <div className="space-y-1">
                            {question.options.map((option, optIndex) => {
                              const isStudentChoice =
                                userAnswer?.studentAnswer === optIndex;
                              const isCorrectAnswer =
                                detailedAnswer?.correctAnswer ===
                                  optIndex.toString() ||
                                Number(detailedAnswer?.correctAnswer) ===
                                  optIndex;

                              return (
                                <div
                                  key={optIndex}
                                  className={`p-2 rounded text-sm ${
                                    isStudentChoice && isCorrectAnswer
                                      ? "bg-green-100 border border-green-300 dark:bg-green-900/30 dark:border-green-700"
                                      : isStudentChoice
                                      ? "bg-red-100 border border-red-300 dark:bg-red-900/30 dark:border-red-700"
                                      : isCorrectAnswer
                                      ? "bg-blue-100 border border-blue-300 dark:bg-blue-900/30 dark:border-blue-700"
                                      : "bg-gray-100 dark:bg-gray-800"
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                                      {String.fromCharCode(65 + optIndex)}
                                    </span>
                                    <span className="flex-1">{option}</span>
                                    <div className="flex gap-1">
                                      {isStudentChoice && (
                                        <Badge
                                          variant="outline"
                                          className="text-xs"
                                        >
                                          Your choice
                                        </Badge>
                                      )}
                                      {isCorrectAnswer && (
                                        <Badge
                                          variant="default"
                                          className="text-xs"
                                        >
                                          Correct
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                    {/* Teacher Feedback for this question */}
                    {detailedAnswer?.feedback && (
                      <div>
                        <strong className="text-sm block mb-1">
                          Teacher Feedback:
                        </strong>
                        <div className="p-3 rounded border bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800">
                          <p className="text-sm text-purple-800 dark:text-purple-200">
                            {detailedAnswer.feedback}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Performance Summary */}
        {hasDetailedData && (
          <Card className="shadow-lg mt-6">
            <CardHeader>
              <CardTitle>Performance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {correctCount}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Correct Answers
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">
                    {incorrectCount}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Incorrect Answers
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">
                    {pendingCount}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Pending Review
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {Math.round((submission.quizData?.timeSpent || 0) / 60)}m
                  </p>
                  <p className="text-sm text-muted-foreground">Total Time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Final Grade Notice */}
        <Card className="shadow-lg mt-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Award className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-lg text-blue-900 dark:text-blue-100 mb-2">
                  Final Grade
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                  Your current grade for this quiz is{" "}
                  <strong>
                    {Math.round(finalScore * 100) / 100} / {totalMaxScore}
                  </strong>{" "}
                  ({Math.round(percentage)}%).
                  {pendingCount > 0 && (
                    <>
                      <br/>
                      <span className="text-yellow-600 font-semibold">
                        Note: There are {pendingCount} questions pending review. Your final grade may increase once the teacher grades them.
                      </span>
                    </>
                  )}
                </p>
                {submission.status === "GRADED" && (
                  <Badge variant="default" className="bg-blue-600">
                    Graded by Teacher
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Button */}
        <div className="text-center mt-6">
          <Button onClick={onExit} size="lg" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Return to Course
          </Button>
        </div>
      </div>
    </div>
  );
};