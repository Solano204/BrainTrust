"use client";

import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, 
  Clock, 
  FileText, 
  Calculator, 
  Download, 
  Paperclip, 
  Link as LinkIcon, 
  Award,
  ArrowLeft,
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  BarChart3,
  Eye,
  EyeOff,
  Lock,
  Unlock
} from "lucide-react";
import type { Quiz, Question } from "@/app/domain/entities/CourseEntities";
import { useAuth } from "@/app/context/AuthContext";

interface QuizViewProps {
  quiz: Quiz;
  onClose: () => void;
}

export function QuizView({ quiz, onClose }: QuizViewProps) {
  const { user } = useAuth();
  const isTeacher = user?.role === 'teacher';
  
  const totalPoints = quiz.questions?.reduce((sum, q) => sum + (q.points || 0), 0) || 0;
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No due date";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCreatedDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTimeRemaining = (dueDate: string | null) => {
    if (!dueDate) return { text: "No due date", color: "gray" };
    
    const now = new Date();
    const due = new Date(dueDate);
    const diffMs = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMs < 0) {
      return { text: "Overdue", color: "destructive" };
    } else if (diffDays === 0) {
      return { text: "Due today", color: "warning" };
    } else if (diffDays === 1) {
      return { text: "Due tomorrow", color: "warning" };
    } else if (diffDays <= 7) {
      return { text: `Due in ${diffDays} days`, color: "warning" };
    } else {
      return { text: `Due in ${diffDays} days`, color: "success" };
    }
  };

  const timeRemaining = getTimeRemaining(quiz.dueDate);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={onClose}
            className="mb-4 gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Resources
          </Button>
          
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                  QUIZ / EXAM
                </Badge>
                {quiz.active === false && (
                  <Badge variant="secondary">Inactive</Badge>
                )}
                {quiz.availableNow && (
                  <Badge variant="default">Available</Badge>
                )}
                {quiz.acceptLateSubmissions && (
                  <Badge variant="outline">Late submissions allowed</Badge>
                )}
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                {quiz.title}
              </h1>
              
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {quiz.timeLimit > 0 ? `${quiz.timeLimit} min` : 'No time limit'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {totalPoints} points total
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {quiz.questions?.length || 0} questions
                  </span>
                </div>
              </div>
            </div>
            
            <div className="text-right space-y-2">
              <div className="text-sm text-muted-foreground">Created on</div>
              <div className="font-medium">{formatCreatedDate(quiz.createdAt)}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="lg:col-span-2 space-y-6">
            {/* Quiz Description */}
            {quiz.description && (
              <Card>
                <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
                  <CardTitle className="flex items-center gap-2 text-purple-800 dark:text-purple-300">
                    <FileText className="h-5 w-5" />
                    Quiz Description
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                      {quiz.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Questions ({quiz.questions?.length || 0})
                  </div>
                  <Badge variant="outline">
                    Total Points: {totalPoints}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {quiz.questions && quiz.questions.length > 0 ? (
                  <div className="space-y-8">
                    {quiz.questions.map((question, index) => (
                      <div key={question.id || index} className="pb-6 border-b last:border-b-0 last:pb-0">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <span className="font-bold text-lg">Question {index + 1}</span>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="gap-1">
                                <Award className="h-3 w-3" />
                                {question.points || 0} points
                              </Badge>
                              <Badge variant="secondary">
                                {question.type === 'multiple-choice' ? 'Multiple Choice' : 'Open Answer'}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="mb-6 p-4 bg-muted/30 rounded-lg border border-border">
                          <p className="text-foreground text-lg whitespace-pre-wrap leading-relaxed">
                            {question.question}
                          </p>
                        </div>

                        {question.type === 'multiple-choice' && question.options && (
                          <div className="space-y-3 ml-4">
                            <h4 className="font-semibold mb-3 text-muted-foreground">Answer Options:</h4>
                            {question.options.map((option, optIndex) => (
                              <div 
                                key={optIndex} 
                                className={`flex items-center gap-3 p-3 rounded-lg border ${
                                  question.correctAnswer === optIndex 
                                    ? 'border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800' 
                                    : 'border-border hover:bg-muted/50'
                                }`}
                              >
                                <div className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold ${
                                  question.correctAnswer === optIndex 
                                    ? 'border-green-500 bg-green-500 text-white' 
                                    : 'border-border text-foreground'
                                }`}>
                                  {String.fromCharCode(65 + optIndex)}
                                </div>
                                <div className="flex-1">
                                  <span className={`text-base ${question.correctAnswer === optIndex ? 'font-semibold text-green-700 dark:text-green-300' : 'text-foreground'}`}>
                                    {option}
                                  </span>
                                </div>
                                {question.correctAnswer === optIndex && (
                                  <Badge className="gap-1 bg-green-100 text-green-700 border-green-300 dark:bg-green-900 dark:text-green-300">
                                    <CheckCircle className="h-3 w-3" />
                                    Correct Answer
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {question.type === 'open-ended' && (
                          <div className="space-y-4 ml-4">
                            {/* Expected Answer (Teacher View) */}
                            {isTeacher && question.expectedAnswer && (
                              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                <div className="flex items-center gap-2 mb-3">
                                  <Badge className="bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900 dark:text-blue-300">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Expected Answer
                                  </Badge>
                                  <span className="text-sm text-blue-600 dark:text-blue-400">(For grading reference)</span>
                                </div>
                                <div className="p-3 bg-white dark:bg-gray-900 rounded border border-blue-100 dark:border-blue-800">
                                  <p className="text-foreground whitespace-pre-wrap">
                                    {question.expectedAnswer}
                                  </p>
                                </div>
                              </div>
                            )}

                            <div className="p-4 bg-muted/30 rounded-lg border border-dashed border-border">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline">
                                  {isTeacher ? "Student Response Area" : "Your Answer"}
                                </Badge>
                              </div>
                              <p className="text-muted-foreground italic">
                                {isTeacher 
                                  ? "Students will write their response in this area" 
                                  : "Type your answer here when taking the quiz"}
                              </p>
                            </div>

                            {isTeacher && !question.expectedAnswer && (
                              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
                                <div className="flex items-center gap-2 mb-1">
                                  <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                                  <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                                    No expected answer provided
                                  </span>
                                </div>
                                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                                  Consider adding an expected answer for grading reference.
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No Questions Added</h3>
                    <p className="text-muted-foreground">
                      This quiz doesn't have any questions yet.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quiz Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    <Clock className="inline h-3 w-3 mr-1" />
                    Time Limit
                  </h4>
                  <p className="font-medium">
                    {quiz.timeLimit > 0 ? `${quiz.timeLimit} minutes` : 'No time limit'}
                  </p>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    <Calendar className="inline h-3 w-3 mr-1" />
                    Due Date & Time
                  </h4>
                  <p className="font-medium">{formatDate(quiz.dueDate)}</p>
                  <div className="mt-2">
                    <Badge variant={timeRemaining.color as "default"}>
                      {timeRemaining.text}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    <Award className="inline h-3 w-3 mr-1" />
                    Points & Grading
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Points:</span>
                      <span className="font-bold text-primary">{totalPoints}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Max Grade:</span>
                      <span>{quiz.maxGrade || 100}%</span>
                    </div>
                   
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">
                    Attempt Settings
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Max Attempts:</span>
                      <Badge variant="outline">
                        {quiz.maxAttempts === 0 || !quiz.maxAttempts ? 'Unlimited' : quiz.maxAttempts}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Shuffle Questions:</span>
                      <Badge variant={quiz.shuffleQuestions ? "default" : "secondary"}>
                        {quiz.shuffleQuestions ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Show Answers:</span>
                      <Badge variant={quiz.showCorrectAnswers ? "default" : "secondary"}>
                        {quiz.showCorrectAnswers ? 'After submission' : 'No'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Availability</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Status</h4>
                  <div className="flex items-center gap-2">
                    <Badge variant={quiz.availableNow ? "default" : "secondary"}>
                      {quiz.availableNow ? (
                        <>
                          <Unlock className="h-3 w-3 mr-1" />
                          Available
                        </>
                      ) : (
                        <>
                          <Lock className="h-3 w-3 mr-1" />
                          Not Available
                        </>
                      )}
                    </Badge>
                  </div>
                </div>

                {quiz.availableFrom && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      Available From
                    </h4>
                    <p className="font-medium">
                      {new Date(quiz.availableFrom).toLocaleString()}
                    </p>
                  </div>
                )}

                {quiz.availableUntil && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      Available Until
                    </h4>
                    <p className="font-medium">
                      {new Date(quiz.availableUntil).toLocaleString()}
                    </p>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    Late Submissions
                  </h4>
                  <Badge variant={quiz.acceptLateSubmissions ? "default" : "secondary"}>
                    {quiz.acceptLateSubmissions ? 'Allowed' : 'Not allowed'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Course Information Card */}
            <Card>
              <CardHeader>
                <CardTitle>Course Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {quiz.courseName && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      Course
                    </h4>
                    <p className="font-medium">{quiz.courseName}</p>
                  </div>
                )}
                
                {quiz.unitName && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      Unit
                    </h4>
                    <p className="font-medium">{quiz.unitName}</p>
                  </div>
                )}
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    Quiz ID
                  </h4>
                  <code className="text-xs font-mono bg-muted px-2 py-1 rounded block truncate">
                    {quiz.id}
                  </code>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions Card */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isTeacher && (
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Export Quiz
                  </Button>
                )}
                
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Print Preview
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Copy Quiz Link
                </Button>
                
                {isTeacher && (
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Analytics
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <p className="text-sm text-muted-foreground">
                Last updated: {formatCreatedDate(quiz.createdAt)}
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              {isTeacher && (
                <Button variant="default">
                  Edit Quiz
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const CardHeader = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`p-6 border-b ${className}`}>
    {children}
  </div>
);

const CardContent = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={className}>
    {children}
  </div>
);