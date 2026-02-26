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
  EyeOff,
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

  // ── canViewResults gate ────────────────────────────────────────────────────
  // quizDetail.allowSeeResults  → teacher's setting on the quiz
  // quizSubmissionDetail.canViewResults → backend runtime decision per submission
  // Both must be true for the student to see correct answers
  const canViewResults: boolean =
    (quizDetail?.allowSeeResults ?? false) &&
    (quizSubmissionDetail?.canViewResults ?? false)

  // ── No submission yet ──────────────────────────────────────────────────────
  if (!quiz.submission) {
    return (
      <div className="p-4 md:p-6 lg:p-8 space-y-6">
        <div className="flex items-center gap-4">
          <Button onClick={onExit} variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Tasks
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{quiz.title}</h1>
          </div>
        </div>
        <Card className="text-center p-8">
          <HelpCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">No Quiz Submission Found</h2>
          <p className="text-muted-foreground mb-4">You haven't taken this quiz yet.</p>
          <Button onClick={onExit}>Back to Tasks</Button>
        </Card>
      </div>
    )
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 dark:from-gray-900 dark:to-green-900 p-4">
        <div className="max-w-4xl mx-auto">
          <Button onClick={onExit} variant="ghost" size="sm" className="gap-2 mb-6">
            <ArrowLeft className="h-4 w-4" />Back to Tasks
          </Button>
          <Card className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-muted-foreground">Loading quiz results...</p>
          </Card>
        </div>
      </div>
    )
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 dark:from-gray-900 dark:to-green-900 p-4">
        <div className="max-w-4xl mx-auto">
          <Button onClick={onExit} variant="ghost" size="sm" className="gap-2 mb-6">
            <ArrowLeft className="h-4 w-4" />Back to Tasks
          </Button>
          <Card className="p-8 text-center">
            <XCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-semibold mb-2 text-red-600">Error Loading Submission</h3>
            <p className="text-muted-foreground mb-4">Unable to load quiz details</p>
            <Button onClick={onExit}>Back to Tasks</Button>
          </Card>
        </div>
      </div>
    )
  }

  // ── Data ───────────────────────────────────────────────────────────────────
  const submission = quiz.submission
  const finalScore = quizSubmissionDetail?.grade?.value ?? 0
  const maxScore = submission.grade?.maxScore ?? quiz.maxGrade
  const percentage = maxScore > 0 ? (finalScore / maxScore) * 100 : 0
  const passed = percentage >= 70

  const quizAnswers = quizSubmissionDetail?.quizData?.answers ?? []
  const correctAnswers = quizAnswers.filter((a: any) => a.isCorrect === true).length
  const incorrectAnswers = quizAnswers.filter((a: any) => a.isCorrect === false).length
  const pendingReview = quizAnswers.filter((a: any) => a.isCorrect === undefined).length
  const totalQuestions = quizDetail?.questions?.length ?? quizAnswers.length

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'GRADED': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'SUBMITTED': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'LATE_SUBMITTED': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // ── Student answer display ─────────────────────────────────────────────────
  const formatStudentAnswer = (question: any, answer: any): string => {
    const raw = answer?.studentAnswer
    if (raw === undefined || raw === null || raw === '') return 'No answer provided'
    if (question.type === 'multiple-choice') {
      const idx = Number(raw)
      return question.options?.[idx] ?? `Option ${idx + 1}`
    }
    return String(raw)
  }

  // ── Correct answer resolution ──────────────────────────────────────────────
  // For MULTIPLE CHOICE:
  //   detailedAnswer.correctAnswer may be the option TEXT (from backend
  //   GradedQuestionResponseDTO) or a numeric index string. We try both.
  //
  // For OPEN ENDED:
  //   detailedAnswer.correctAnswer is the expected answer text from the backend.
  //   fetchQuizDetail strips expectedAnswer for students, so the submission
  //   response is the only reliable source.
  //
  // Returns { text, optionIndex? }
  const resolveCorrectAnswer = (
    question: any,
    detailedAnswer: any
  ): { text: string; optionIndex?: number } => {
    if (question.type === 'multiple-choice') {
      if (detailedAnswer?.correctAnswer !== undefined && detailedAnswer.correctAnswer !== null) {
        const asText = String(detailedAnswer.correctAnswer)
        const asNumber = Number(asText)
        // Try as numeric index
        if (!isNaN(asNumber) && question.options?.[asNumber] !== undefined) {
          return { text: question.options[asNumber], optionIndex: asNumber }
        }
        // Try as option text match
        const matchIdx = question.options?.findIndex((o: string) => o === asText) ?? -1
        if (matchIdx >= 0) return { text: asText, optionIndex: matchIdx }
        return { text: asText }
      }
      // Fall back to quiz question correctAnswer (numeric index)
      if (question.correctAnswer !== undefined) {
        const idx = Number(question.correctAnswer)
        return { text: question.options?.[idx] ?? `Option ${idx + 1}`, optionIndex: idx }
      }
      return { text: '' }
    }

    // Open-ended ─────────────────────────────────────────────────────────────
    if (detailedAnswer?.correctAnswer) return { text: detailedAnswer.correctAnswer }
    if (question.expectedAnswer) return { text: question.expectedAnswer }
    if (question.correctAnswer && typeof question.correctAnswer === 'string') {
      return { text: question.correctAnswer }
    }
    return { text: '' }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 dark:from-gray-900 dark:to-green-900 p-4">
      <div className="max-w-4xl mx-auto">

        <div className="mb-6">
          <Button onClick={onExit} variant="outline" size="sm" className="gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" />Back to Tasks
          </Button>
        </div>

        {/* ── Results Header ── */}
        <Card className="shadow-lg mb-6 text-center">
          <CardContent className="p-8">
            <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
              passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
            }`}>
              {passed ? <CheckCircle className="h-10 w-10" /> : <HelpCircle className="h-10 w-10" />}
            </div>

            <h1 className="text-3xl font-bold mb-2">{passed ? 'Quiz Completed!' : 'Quiz Finished'}</h1>
            <p className="text-lg text-muted-foreground mb-2">{quiz.title}</p>

            <Badge className={getStatusColor(submission.status)}>
              {submission.status === 'GRADED' ? '✓ Graded' :
               submission.status === 'LATE_SUBMITTED' ? '⏰ Late Submission' : '⏳ Submitted'}
            </Badge>

            {/* canViewResults indicator */}
            {!canViewResults && (
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-full text-sm text-amber-800">
                <EyeOff className="h-4 w-4" />
                Correct answers are not available for this quiz
              </div>
            )}

            <div className="flex items-center justify-center gap-4 mt-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" />{user?.name || 'Student'}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />{new Date(submission.submittedAt).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />{new Date(submission.submittedAt).toLocaleTimeString()}
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

        {/* ── Performance Summary ── */}
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
                <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">{pendingReview}</p>
                  <p className="text-sm text-muted-foreground">Pending Review</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Question Review ── */}
        {quizDetail?.questions && quizDetail.questions.length > 0 && (
          <Card className="shadow-lg mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Question Review
                <Badge variant="outline" className="ml-auto">
                  {correctAnswers} / {totalQuestions} Correct
                </Badge>
                {!canViewResults && (
                  <span className="text-sm font-normal text-muted-foreground flex items-center gap-1">
                    <EyeOff className="h-4 w-4" />
                    Answers hidden
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {quizDetail.questions.map((question: any, index: number) => {
                const detailedAnswer = quizAnswers.find((a: any) => a.questionId === question.id)
                if (!detailedAnswer) return null

                const studentAnswerText = formatStudentAnswer(question, detailedAnswer)
                const { text: correctAnswerText, optionIndex: correctOptionIndex } =
                  resolveCorrectAnswer(question, detailedAnswer)

                const isOpenEnded = question.type !== 'multiple-choice'
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
                    {/* Question header */}
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
                              {question.type === 'multiple-choice' ? 'Multiple Choice' : 'Open Ended'}
                            </Badge>
                            <Badge variant="secondary">
                              {detailedAnswer.maxPoints} {detailedAnswer.maxPoints === 1 ? 'point' : 'points'}
                            </Badge>
                            {needsReview ? (
                              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                                Pending Review
                              </Badge>
                            ) : (
                              <Badge variant={isCorrect ? 'default' : 'destructive'}>
                                {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                              </Badge>
                            )}
                            {detailedAnswer.feedback && (
                              <Badge variant="outline" className="text-xs">Teacher Reviewed</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 ml-[86px]">
                      {/* ── Student's answer ── */}
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

                      {/* ── Pending review notice ── */}
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

                      {/* ── Expected answer — only when canViewResults=true ── */}
                      {!needsReview && canViewResults && (
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                            {question.type === 'multiple-choice' ? 'Correct Answer:' : 'Model Answer:'}
                          </Label>
                          {isOpenEnded ? (
                            correctAnswerText ? (
                              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 rounded-lg">
                                <p className="font-medium text-blue-800 dark:text-blue-200 whitespace-pre-wrap">
                                  {correctAnswerText}
                                </p>
                              </div>
                            ) : (
                              <div className="p-4 bg-gray-50 border-2 border-gray-200 rounded-lg">
                                <p className="text-sm text-muted-foreground italic">
                                  No reference answer provided for this question.
                                </p>
                              </div>
                            )
                          ) : (
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 rounded-lg">
                              <p className="font-medium text-blue-800 dark:text-blue-200">
                                {correctAnswerText}
                              </p>
                              {correctOptionIndex !== undefined && (
                                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                                  Option {correctOptionIndex + 1}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* ── Answers hidden message — when canViewResults=false ── */}
                      {!needsReview && !canViewResults && (
                        <div className="p-4 rounded-lg border-2 border-gray-200 bg-gray-50 flex items-center gap-2">
                          <EyeOff className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <p className="text-sm text-muted-foreground italic">
                            Correct answer is not available for this quiz.
                          </p>
                        </div>
                      )}

                      {/* ── Multiple choice: all options ── */}
                      {question.type === 'multiple-choice' && question.options && question.options.length > 0 && (
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                            All Options:
                          </Label>
                          <div className="space-y-2">
                            {question.options.map((option: string, optIndex: number) => {
                              const isStudentChoice = Number(detailedAnswer.studentAnswer) === optIndex
                              // Only highlight correct option when canViewResults=true
                              const isCorrectOption =
                                canViewResults &&
                                (correctOptionIndex === optIndex || correctAnswerText === option)

                              return (
                                <div
                                  key={optIndex}
                                  className={`p-3 rounded-lg border text-sm ${
                                    isStudentChoice && isCorrectOption
                                      ? 'bg-green-100 border-green-300 dark:bg-green-900/30 dark:border-green-700'
                                      : isStudentChoice
                                      ? 'bg-red-100 border-red-300 dark:bg-red-900/30 dark:border-red-700'
                                      : isCorrectOption
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
                                        <Badge variant="outline" className="text-xs">Your choice</Badge>
                                      )}
                                      {isCorrectOption && (
                                        <Badge variant="default" className="text-xs">Correct</Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {/* ── Teacher feedback ── */}
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

                      {/* ── Bottom status row ── */}
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

        {/* ── Final Grade ── */}
        <Card className="shadow-lg mb-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Award className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-lg text-blue-900 dark:text-blue-100 mb-2">
                  Final Grade
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                  Your final grade for this quiz is{' '}
                  <strong>{finalScore} / {maxScore}</strong> ({Math.round(percentage)}%).
                  {pendingReview > 0 && (
                    <> Some answers are pending teacher review and your grade may be updated once reviewed.</>
                  )}
                </p>
                {submission.status === 'GRADED' && (
                  <Badge variant="default" className="bg-blue-600">Graded by Teacher</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

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