// components/Student/QuizView.tsx

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

  // Initialize answers from existing submission
  useEffect(() => {
    if (existingSubmission?.quizData?.answers) {
      const initialAnswers: QuizAnswers = {};
      existingSubmission.quizData.answers.forEach(answer => {
        initialAnswers[answer.questionId] = answer;
      });
      setAnswers(initialAnswers);
    }
  }, [existingSubmission]);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = quiz.questions.length - answeredCount;

  // Timer effect
  useEffect(() => {
    if (existingSubmission || timeRemaining <= 0) return;

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
  }, [timeRemaining, existingSubmission]);

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle answer change
  const handleAnswerChange = (questionId: string, answer: string | number) => {
    const question = quiz.questions.find(q => q.id === questionId);
    if (!question) return;

    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        questionId: questionId,
        questionText: question.question,
        questionType: question.type,
        studentAnswer: answer,
        points: 0, // Will be calculated on submission
        maxPoints: question.points,
        isCorrect: undefined,
      },
    }));
  };

  // Toggle flag for review
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

  // Navigation
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

  // Manual submit
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

  // If quiz is already submitted, show results
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
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 dark:from-gray-900 dark:to-green-900 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Quiz Header */}
          <Card className="shadow-lg mb-6 border-l-4 border-blue-500">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="space-y-2">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {quiz.title}
                  </h1>
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
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Questions Navigation Sidebar */}
            <div className="lg:col-span-1">
              <Card className="shadow-lg sticky top-4">
                <CardHeader>
                  <CardTitle className="text-lg">Questions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 lg:grid-cols-2 gap-2">
                    {quiz.questions.map((question, index) => (
                      <Button
                        key={question.id}
                        variant={
                          currentQuestionIndex === index
                            ? "default"
                            : answers[question.id]
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
                    ))}
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
                      <Flag className="h-3 w-3 text-yellow-500" />
                      <span>Flagged</span>
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
                          <Flag className="h-4 w-4 text-yellow-500 fill-yellow-500" />
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
                    >
                      <Flag
                        className={`h-4 w-4 mr-2 ${
                          flaggedQuestions.has(currentQuestion.id)
                            ? "text-yellow-500 fill-yellow-500"
                            : ""
                        }`}
                      />
                      {flaggedQuestions.has(currentQuestion.id)
                        ? "Unflag"
                        : "Flag"}
                    </Button>
                  </div>

                  {/* Question Content */}
                  <div className="space-y-4">
                    {currentQuestion.type === "multiple-choice" ? (
                      <RadioGroup
                        value={
                          answers[currentQuestion.id]?.studentAnswer?.toString() || ""
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
                            className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                          >
                            <RadioGroupItem
                              value={index.toString()}
                              id={`option-${index}`}
                            />
                            <Label
                              htmlFor={`option-${index}`}
                              className="flex-1 cursor-pointer text-sm"
                            >
                              {option}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    ) : (
                      <Textarea
                        placeholder="Type your answer here... Be as detailed and specific as possible."
                        value={
                          answers[currentQuestion.id]?.studentAnswer?.toString() || ""
                        }
                        onChange={(e) =>
                          handleAnswerChange(currentQuestion.id, e.target.value)
                        }
                        rows={8}
                        className="resize-none"
                      />
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
                  >
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
                      Next
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Time Warning */}
              {timeRemaining < 300 && (
                <Card className="border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20">
                  <CardContent className="p-4 flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500" />
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
            <AlertDialogTitle>Exit Quiz?</AlertDialogTitle>
            <AlertDialogDescription>
              Your progress will be saved, but you'll need to complete the quiz
              later. Are you sure you want to exit?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleExitConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Exit Quiz
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitConfirm} onOpenChange={setShowSubmitConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Quiz?</AlertDialogTitle>
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
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Review Questions</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSubmit}
              className="bg-green-600 hover:bg-green-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Submitting...
                </>
              ) : (
                "Submit Quiz"
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

// Quiz Results Component
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
  onExit
}) => {
  const score: number = Number(submission.grade?.value) || 0;
  const maxScore = Number(submission.grade?.maxScore) || quiz.questions.reduce((total, q) => total + q.points, 0);
  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
  const passed = percentage >= quiz.passingScore;

  // Use quizData if available, otherwise fall back to basic data
  const hasDetailedData = submission.quizData;
  const quizAnswers = submission.quizData?.answers || [];

  console.log("QUIZ ANSWERS:", quizAnswers);
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 dark:from-gray-900 dark:to-green-900 p-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Results Header */}
        <Card className="shadow-lg mb-6 text-center">
          <CardContent className="p-8">
            <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
              passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
            }`}>
              {passed ? (
                <CheckCircle className="h-10 w-10" />
              ) : (
                <HelpCircle className="h-10 w-10" />
              )}
            </div>
            
            <h1 className="text-3xl font-bold mb-2">
              {passed ? 'Quiz Completed!' : 'Quiz Finished'}
            </h1>
            <p className="text-lg text-muted-foreground mb-4">{quiz.title}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-md mx-auto">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{score}</p>
                <p className="text-sm text-muted-foreground">Your Score</p>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{maxScore}</p>
                <p className="text-sm text-muted-foreground">Max Score</p>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">{Math.round(percentage)}%</p>
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
                <p className="text-sm text-muted-foreground">{submission.teacherFeedback}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Questions Review */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Question Review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {quiz.questions.map((question, index) => {
              const detailedAnswer = quizAnswers.find(a => a.questionId === question.id);
              const userAnswer = userAnswers[question.id];
              
              return (
                <div key={question.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold">Question {index + 1}</h3>
                    <div className="flex gap-2">
                      <Badge variant="outline">
                        {question.points} point{question.points !== 1 ? 's' : ''}
                      </Badge>
                      {detailedAnswer && (
                        <Badge variant={detailedAnswer.isCorrect ? "default" : "destructive"}>
                          {detailedAnswer.points}/{detailedAnswer.maxPoints}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <p className="mb-4 font-medium">{question.question}</p>
                  
                  <div className="space-y-3">
                    {/* Student Answer */}
                    <div>
                      <strong className="text-sm block mb-1">Your answer:</strong>
                      <div className={`p-3 rounded border ${
                        detailedAnswer?.isCorrect 
                          ? "bg-green-50 border-green-200" 
                          : "bg-red-50 border-red-200"
                      }`}>
                        <p className="text-sm">
                          {userAnswer?.studentAnswer?.toString() || 'No answer provided'}
                        </p>
                      </div>
                    </div>

                    {/* Correct Answer & Feedback */}
                    {detailedAnswer && (
                      <>
                        {detailedAnswer.correctAnswer !== undefined && (
                          <div>
                            <strong className="text-sm block mb-1">Correct answer:</strong>
                            <div className="p-3 rounded border bg-blue-50 border-blue-200">
                              <p className="text-sm text-green-600">
                                {question.type === 'multiple-choice' 
                                  ? question.options?.[detailedAnswer.correctAnswer as number]
                                  : detailedAnswer.correctAnswer
                                }
                              </p>
                            </div>
                          </div>
                        )}
                        
                        {detailedAnswer.feedback && (
                          <div>
                            <strong className="text-sm block mb-1">Feedback:</strong>
                            <div className="p-3 rounded border bg-yellow-50 border-yellow-200">
                              <p className="text-sm">{detailedAnswer.feedback}</p>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* Fallback for non-detailed data */}
                    {!detailedAnswer && question.correctAnswer !== undefined && (
                      <div>
                        <strong className="text-sm block mb-1">Correct answer:</strong>
                        <div className="p-3 rounded border bg-blue-50 border-blue-200">
                          <p className="text-sm text-green-600">
                            {question.options?.[question.correctAnswer]}
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
                    {quizAnswers.filter(a => a.isCorrect).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Correct Answers</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">
                    {quizAnswers.filter(a => a.isCorrect === false).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Incorrect Answers</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {Math.round((quizAnswers.filter(a => a.isCorrect).length / quizAnswers.length) * 100)}%
                  </p>
                  <p className="text-sm text-muted-foreground">Accuracy</p>
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

        {/* Action Button */}
        <div className="text-center mt-6">
          <Button onClick={onExit} size="lg">
            Return to Course
          </Button>
        </div>
      </div>
    </div>
  );
};