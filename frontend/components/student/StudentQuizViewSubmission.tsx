 "use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  HelpCircle,
  Award,
  AlertCircle,
  Calendar,
  User,
  Target,
  BarChart3,
  BookOpen,
  Timer,
  FileQuestion
} from "lucide-react"
import { useAuth } from "@/app/context/AuthContext"
import { useStudentQuizSubmission } from "../teacher-student/hooks/submission-hooks"
import { useQuizDetail } from "@/app/presentation/hooks/calendar/quiz-hooks"

interface StudentQuizViewProps {
  quiz: {
    id: string
    title: string
    maxGrade: number
    isOverdue: boolean
    submission?: {
      id: string
      status: string
      submittedAt: string
      grade?: { value: number; maxScore: number }
      teacherFeedback?: string
    }
  }
  onExit: () => void
}

const Label = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <label className={`text-sm font-medium leading-none ${className || ''}`}>
    {children}
  </label>
)

export function StudentQuizView({ quiz, onExit }: StudentQuizViewProps) {
  const { user } = useAuth()
  const userType = user?.role === 'student' ? 'student' : 'teacher'

  const {
    data: quizDetail, 
    isLoading: isQuizLoading,
    error: quizError 
  } = useQuizDetail(quiz.id, userType)
  
  const {
    data: quizSubmissionDetail, 
    isLoading: isSubmissionLoading, 
    error: submissionError 
  } = useStudentQuizSubmission(quiz.id, user?.id || null)

  const isLoading = isQuizLoading || isSubmissionLoading
  const error = quizError || submissionError

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
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 dark:from-gray-900 dark:to-green-900 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button onClick={onExit} variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Tasks
            </Button>
          </div>
          <Card className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading quiz results...</p>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 dark:from-gray-900 dark:to-green-900 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button onClick={onExit} variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Tasks
            </Button>
          </div>
          <Card className="p-8 text-center">
            <XCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-semibold mb-2 text-red-600">
              Error Loading Submission
            </h3>
            <p className="text-muted-foreground mb-4">Unable to load quiz details</p>
            <Button onClick={onExit}>Back to Tasks</Button>
          </Card>
        </div>
      </div>
    )
  }

  const submission = quiz.submission
  const detailedSubmission = quizSubmissionDetail

  const finalScore = detailedSubmission?.grade?.value || 0
  const maxScore = submission.grade?.maxScore || quiz.maxGrade
  const percentage = maxScore > 0 ? (finalScore / maxScore) * 100 : 0
  const passed = percentage >= 70

  const quizAnswers = detailedSubmission?.quizData?.answers || []
  const correctAnswers = quizAnswers.filter((a: any) => a.isCorrect === true).length
  const incorrectAnswers = quizAnswers.filter((a: any) => a.isCorrect === false).length
  const pendingReview = quizAnswers.filter((a: any) => a.isCorrect === undefined).length
  const totalQuestions = quizDetail?.questions?.length || quizAnswers.length

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'GRADED': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'SUBMITTED': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'LATE_SUBMITTED': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatStudentAnswer = (question: any, answer: any) => {
    if (!answer?.studentAnswer && answer?.studentAnswer !== 0) {
      return 'No answer provided'
    }
    
    if (question.type === 'multiple-choice') {
      const optionIndex = Number(answer.studentAnswer)
      if (question.options && question.options[optionIndex] !== undefined) {
        return question.options[optionIndex]
      }
      return `Option ${optionIndex + 1}`
    } else {
      return String(answer.studentAnswer || '')
    }
  }

  const formatCorrectAnswer = (question: any, detailedAnswer: any) => {
    if (detailedAnswer?.correctAnswer !== undefined) {
      if (question.type === 'multiple-choice') {
        const correctIndex = Number(detailedAnswer.correctAnswer)
        if (question.options && question.options[correctIndex] !== undefined) {
          return question.options[correctIndex]
        }
        return `Option ${correctIndex + 1}`
      } else {
        return String(detailedAnswer.correctAnswer || '')
      }
    }
    
    if (question.correctAnswer !== undefined) {
      if (question.type === 'multiple-choice') {
        const correctIndex = Number(question.correctAnswer)
        if (question.options && question.options[correctIndex] !== undefined) {
          return question.options[correctIndex]
        }
        return `Option ${correctIndex + 1}`
      } else {
        return String(question.correctAnswer || '')
      }
    }
    
    return 'Not available'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 dark:from-gray-900 dark:to-green-900 p-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Results Header */}
        <div className="mb-6">
          <Button onClick={onExit} variant="outline" size="sm" className="gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Tasks
          </Button>
        </div>

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
            <p className="text-lg text-muted-foreground mb-2">{quiz.title}</p>
            
            <Badge className={getStatusColor(submission.status)}>
              {submission.status === 'GRADED' ? '✓ Graded' : 
               submission.status === 'LATE_SUBMITTED' ? '⏰ Late Submission' : '⏳ Submitted'}
            </Badge>

            <div className="flex items-center justify-center gap-4 mt-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {user?.name || 'Student'}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(submission.submittedAt).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {new Date(submission.submittedAt).toLocaleTimeString()}
              </span>
            </div>

            {submission.teacherFeedback && (
              <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg max-w-2xl mx-auto">
                <div className="flex items-start gap-2">
                  <Award className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-left">
                    <p className="font-semibold mb-2">Teacher Feedback:</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {submission.teacherFeedback}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {quizAnswers.length > 0 && (
          <Card className="shadow-lg mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Performance Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-2xl font-bold">{totalQuestions}</p>
                  <p className="text-sm text-muted-foreground">Total Questions</p>
                </div>
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{correctAnswers}</p>
                  <p className="text-sm text-muted-foreground">Correct</p>
                </div>
                <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">{incorrectAnswers}</p>
                  <p className="text-sm text-muted-foreground">Incorrect</p>
                </div>
              
              </div>
            </CardContent>
          </Card>
        )}

        {/* Questions Review */}
        {quizDetail?.questions && quizDetail.questions.length > 0 && (
          <Card className="shadow-lg mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Question Review
                <Badge variant="outline" className="ml-auto">
                  {correctAnswers} / {totalQuestions} Correct
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {quizDetail.questions.map((question: any, index: number) => {
                const detailedAnswer = quizAnswers.find((a: any) => a.questionId === question.id)
                
                if (!detailedAnswer) return null

                const studentAnswerText = formatStudentAnswer(question, detailedAnswer)
                const correctAnswerText = formatCorrectAnswer(question, detailedAnswer)
                const needsReview = detailedAnswer.isCorrect === undefined
                const isCorrect = detailedAnswer.isCorrect

                return (
                  <div 
                    key={question.id} 
                    className={`border rounded-lg p-6 ${
                      needsReview
                        ? 'border-l-4 border-yellow-500'
                        : isCorrect 
                        ? 'border-l-4 border-green-500' 
                        : 'border-l-4 border-red-500'
                    }`}
                  >
                    {/* Question Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="flex flex-col items-center gap-2 min-w-[70px]">
                          <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold">
                            {index + 1}
                          </div>
                          {needsReview ? (
                            <HelpCircle className="h-5 w-5 text-yellow-500" />
                          ) : isCorrect ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                          <div className="text-center">
                            <div className="text-sm font-bold">
                              {detailedAnswer.points}/{detailedAnswer.maxPoints}
                            </div>
                            <div className="text-xs text-muted-foreground">points</div>
                          </div>
                        </div>

                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2">{question.question}</h3>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline">
                              {question.type === "multiple-choice" ? "Multiple Choice" : "Open Ended"}
                            </Badge>
                            <Badge variant="secondary">
                              {detailedAnswer.maxPoints} {detailedAnswer.maxPoints === 1 ? 'point' : 'points'}
                            </Badge>
                            {needsReview ? (
                              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                                Pending Review
                              </Badge>
                            ) : (
                              <Badge variant={isCorrect ? "default" : "destructive"}>
                                {isCorrect ? "✓ Correct" : "✗ Incorrect"}
                              </Badge>
                            )}
                            {detailedAnswer.feedback && (
                              <Badge variant="outline" className="text-xs">
                                Teacher Reviewed
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 ml-[86px]">
                      {/* Student Answer */}
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                          Your Answer:
                        </Label>
                        <div className={`p-4 rounded-lg border-2 ${
                          needsReview
                            ? 'bg-yellow-50 border-yellow-300 dark:bg-yellow-900/20 dark:border-yellow-700'
                            : isCorrect 
                            ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
                            : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                        }`}>
                          <p className="font-medium whitespace-pre-wrap">{studentAnswerText}</p>
                          {question.type === 'multiple-choice' && detailedAnswer.studentAnswer !== undefined && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Selected option {Number(detailedAnswer.studentAnswer) + 1}
                            </p>
                          )}
                        </div>
                      </div>

                      {needsReview && (
                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-300">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-100">
                                This answer is pending teacher review
                              </p>
                              <p className="text-xs text-yellow-800 dark:text-yellow-200 mt-1">
                                Your answer may be correct but uses different wording. Your teacher will review it and assign the appropriate grade.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {correctAnswerText !== 'Not available' && (
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                            {question.type === "multiple-choice" ? "Correct Answer:" : "Model Answer:"}
                          </Label>
                          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 rounded-lg">
                            <p className="font-medium text-blue-800 dark:text-blue-200">
                              {correctAnswerText}
                            </p>
                            {question.type === 'multiple-choice' && detailedAnswer.correctAnswer !== undefined && (
                              <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                                Option {Number(detailedAnswer.correctAnswer) + 1}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {question.type === 'multiple-choice' && question.options && question.options.length > 0 && (
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                            All Options:
                          </Label>
                          <div className="space-y-2">
                            {question.options.map((option: string, optIndex: number) => {
                              const isStudentChoice = Number(detailedAnswer.studentAnswer) === optIndex
                              const isCorrectAnswer = Number(detailedAnswer.correctAnswer) === optIndex
                              
                              return (
                                <div 
                                  key={optIndex}
                                  className={`p-3 rounded-lg border text-sm ${
                                    isStudentChoice && isCorrectAnswer
                                      ? 'bg-green-100 border-green-300 dark:bg-green-900/30 dark:border-green-700'
                                      : isStudentChoice
                                      ? 'bg-red-100 border-red-300 dark:bg-red-900/30 dark:border-red-700'
                                      : isCorrectAnswer
                                      ? 'bg-blue-100 border-blue-300 dark:bg-blue-900/30 dark:border-blue-700'
                                      : 'bg-gray-100 dark:bg-gray-800 border-gray-200'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                                      {String.fromCharCode(65 + optIndex)}
                                    </span>
                                    <span className="flex-1">{option}</span>
                                    <div className="flex gap-1">
                                      {isStudentChoice && (
                                        <Badge variant="outline" className="text-xs">
                                          Your choice
                                        </Badge>
                                      )}
                                      {isCorrectAnswer && (
                                        <Badge variant="default" className="text-xs">
                                          Correct
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {detailedAnswer.feedback && (
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                            Teacher Feedback:
                          </Label>
                          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 rounded-lg">
                            <p className="text-sm text-purple-800 dark:text-purple-200 whitespace-pre-wrap">
                              {detailedAnswer.feedback}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t">
                        <div className="flex items-center gap-2">
                          {needsReview ? (
                            <div className="flex items-center gap-2 text-yellow-600">
                              <HelpCircle className="h-5 w-5" />
                              <span className="font-semibold">Awaiting Review</span>
                            </div>
                          ) : isCorrect ? (
                            <div className="flex items-center gap-2 text-green-600">
                              <CheckCircle className="h-5 w-5" />
                              <span className="font-semibold">Correct Answer!</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-red-600">
                              <XCircle className="h-5 w-5" />
                              <span className="font-semibold">Incorrect Answer</span>
                            </div>
                          )}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          Earned {detailedAnswer.points} out of {detailedAnswer.maxPoints} points
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        )}

        <Card className="shadow-lg mb-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Award className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-lg text-blue-900 dark:text-blue-100 mb-2">
                  Final Grade
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                  Your final grade for this quiz is <strong>{finalScore} / {maxScore}</strong> ({Math.round(percentage)}%).
                  {pendingReview > 0 && (
                    <> Some answers are pending teacher review and your grade may be updated once reviewed.</>
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

        {/* Back Button */}
        <div className="text-center">
          <Button onClick={onExit} size="lg" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Return to Course
          </Button>
        </div>
      </div>
    </div>
  )
}