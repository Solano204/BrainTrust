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

  const canViewResults: boolean =
    (quizDetail?.allowSeeResults ?? false) &&
    (quizSubmissionDetail?.canViewResults ?? false)

  if (!quiz.submission) {
    return (
      <div className="p-4 md:p-6 lg:p-8 space-y-6">
        <div className="flex items-center gap-4">
          <Button onClick={onExit} variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver a Tareas
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{quiz.title}</h1>
          </div>
        </div>
        <Card className="text-center p-8">
          <HelpCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">No se encontró envío del cuestionario</h2>
          <p className="text-muted-foreground mb-4">Aún no has realizado este cuestionario.</p>
          <Button onClick={onExit}>Volver a Tareas</Button>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 dark:from-gray-900 dark:to-green-900 p-4">
        <div className="max-w-4xl mx-auto">
          <Button onClick={onExit} variant="ghost" size="sm" className="gap-2 mb-6">
            <ArrowLeft className="h-4 w-4" />Volver a Tareas
          </Button>
          <Card className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-muted-foreground">Cargando resultados del cuestionario...</p>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 dark:from-gray-900 dark:to-green-900 p-4">
        <div className="max-w-4xl mx-auto">
          <Button onClick={onExit} variant="ghost" size="sm" className="gap-2 mb-6">
            <ArrowLeft className="h-4 w-4" />Volver a Tareas
          </Button>
          <Card className="p-8 text-center">
            <XCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-semibold mb-2 text-red-600">Error al cargar el envío</h3>
            <p className="text-muted-foreground mb-4">No se pudieron cargar los detalles del cuestionario</p>
            <Button onClick={onExit}>Volver a Tareas</Button>
          </Card>
        </div>
      </div>
    )
  }

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

  const formatStudentAnswer = (question: any, answer: any): string => {
    const raw = answer?.studentAnswer
    if (raw === undefined || raw === null || raw === '') return 'No se proporcionó respuesta'
    if (question.type === 'multiple-choice') {
      const idx = Number(raw)
      return question.options?.[idx] ?? `Opción ${idx + 1}`
    }
    return String(raw)
  }

  const resolveCorrectAnswer = (
    question: any,
    detailedAnswer: any
  ): { text: string; optionIndex?: number } => {
    if (question.type === 'multiple-choice') {
      if (detailedAnswer?.correctAnswer !== undefined && detailedAnswer.correctAnswer !== null) {
        const asText = String(detailedAnswer.correctAnswer)
        const asNumber = Number(asText)
        if (!isNaN(asNumber) && question.options?.[asNumber] !== undefined) {
          return { text: question.options[asNumber], optionIndex: asNumber }
        }
        const matchIdx = question.options?.findIndex((o: string) => o === asText) ?? -1
        if (matchIdx >= 0) return { text: asText, optionIndex: matchIdx }
        return { text: asText }
      }
      if (question.correctAnswer !== undefined) {
        const idx = Number(question.correctAnswer)
        return { text: question.options?.[idx] ?? `Opción ${idx + 1}`, optionIndex: idx }
      }
      return { text: '' }
    }

    if (detailedAnswer?.correctAnswer) return { text: detailedAnswer.correctAnswer }
    if (question.expectedAnswer) return { text: question.expectedAnswer }
    if (question.correctAnswer && typeof question.correctAnswer === 'string') {
      return { text: question.correctAnswer }
    }
    return { text: '' }
  }

  return (
  <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
    <div className="max-w-4xl mx-auto space-y-5">

      <button
        onClick={onExit}
        className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Volver a Tareas
      </button>

      <div className="bg-card rounded-2xl border border-border shadow-sm p-6 sm:p-8 text-center space-y-4">
        <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center ${
          passed ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'
        }`}>
          {passed
            ? <CheckCircle className="w-8 h-8" />
            : <HelpCircle className="w-8 h-8" />}
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            {passed ? '¡Cuestionario Completado!' : 'Cuestionario Finalizado'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{quiz.title}</p>
        </div>

        <span className={`inline-flex px-3 py-1 rounded-xl text-xs font-bold ${
          submission.status === 'GRADED'
            ? 'bg-primary/10 text-primary'
            : submission.status === 'LATE_SUBMITTED'
            ? 'bg-accent/20 text-accent-foreground'
            : 'bg-muted text-muted-foreground'
        }`}>
          {submission.status === 'GRADED' ? '✓ Calificado' :
           submission.status === 'LATE_SUBMITTED' ? '⏰ Envío Tardío' : '⏳ Enviado'}
        </span>

        {!canViewResults && (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/30 rounded-xl text-xs font-semibold text-accent-foreground">
            <EyeOff className="w-3.5 h-3.5" />
            Las respuestas correctas no están disponibles para este cuestionario
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <User className="w-3.5 h-3.5" />{user?.name || 'Estudiante'}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(submission.submittedAt).toLocaleDateString()}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {new Date(submission.submittedAt).toLocaleTimeString()}
          </span>
        </div>

        {submission.teacherFeedback && (
          <div className="p-4 bg-accent/10 border border-accent/30 rounded-2xl max-w-2xl mx-auto text-left">
            <div className="flex items-start gap-2">
              <Award className="w-4 h-4 text-accent-foreground flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-foreground mb-1">Retroalimentación del Profesor:</p>
                <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                  {submission.teacherFeedback}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {quizAnswers.length > 0 && (
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="px-5 py-4 sm:px-6 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <BarChart3 className="w-4 h-4 text-primary" />
              </span>
              <h2 className="text-base font-bold text-foreground">Resumen de Rendimiento</h2>
            </div>
          </div>
          <div className="px-5 py-5 sm:px-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-muted/30 rounded-xl border border-border p-3 text-center">
                <p className="text-2xl font-bold text-foreground">{totalQuestions}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Total Preguntas</p>
              </div>
              <div className="bg-primary/5 rounded-xl border border-primary/20 p-3 text-center">
                <p className="text-2xl font-bold text-primary">{correctAnswers}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Correctas</p>
              </div>
              <div className="bg-destructive/5 rounded-xl border border-destructive/20 p-3 text-center">
                <p className="text-2xl font-bold text-destructive">{incorrectAnswers}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Incorrectas</p>
              </div>
              <div className="bg-accent/10 rounded-xl border border-accent/20 p-3 text-center">
                <p className="text-2xl font-bold text-accent-foreground">{pendingReview}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Pendientes de Revisión</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {quizDetail?.questions && quizDetail.questions.length > 0 && (
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="px-5 py-4 sm:px-6 border-b border-border">
            <div className="flex flex-wrap items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Target className="w-4 h-4 text-primary" />
              </span>
              <h2 className="text-base font-bold text-foreground">Revisión de Preguntas</h2>
              <span className="ml-auto px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-bold">
                {correctAnswers} / {totalQuestions} Correctas
              </span>
              {!canViewResults && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <EyeOff className="w-3.5 h-3.5" />Respuestas ocultas
                </span>
              )}
            </div>
          </div>

          <div className="px-5 py-5 sm:px-6 space-y-5">
            {quizDetail.questions.map((question: any, index: number) => {
              const detailedAnswer = quizAnswers.find((a: any) => a.questionId === question.id)
              if (!detailedAnswer) return null

              const studentAnswerText = formatStudentAnswer(question, detailedAnswer)
              const { text: correctAnswerText, optionIndex: correctOptionIndex } =
                resolveCorrectAnswer(question, detailedAnswer)

              const isOpenEnded  = question.type !== 'multiple-choice'
              const needsReview  = detailedAnswer.isCorrect === undefined
              const isCorrect    = detailedAnswer.isCorrect

              return (
                <div
                  key={question.id}
                  className={`rounded-2xl border-l-4 border-t border-r border-b border-border p-5 ${
                    needsReview ? 'border-l-accent'      :
                    isCorrect   ? 'border-l-primary'     :
                    'border-l-destructive'
                  }`}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="flex flex-col items-center gap-1.5 flex-shrink-0 min-w-[56px]">
                      <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      {needsReview
                        ? <HelpCircle className="w-4 h-4 text-accent-foreground" />
                        : isCorrect
                        ? <CheckCircle className="w-4 h-4 text-primary" />
                        : <XCircle className="w-4 h-4 text-destructive" />}
                      <div className="text-center">
                        <p className="text-xs font-bold text-foreground tabular-nums">
                          {detailedAnswer.points}/{detailedAnswer.maxPoints}
                        </p>
                        <p className="text-xs text-muted-foreground">pts</p>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-foreground mb-2">{question.question}</h3>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md border border-border text-xs text-muted-foreground">
                          {question.type === 'multiple-choice' ? 'Opción Múltiple' : 'Respuesta Abierta'}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-xs font-semibold">
                          {detailedAnswer.maxPoints} {detailedAnswer.maxPoints === 1 ? 'punto' : 'puntos'}
                        </span>
                        {needsReview ? (
                          <span className="px-2 py-0.5 rounded-md bg-accent/20 text-accent-foreground text-xs font-semibold">
                            Pendiente de Revisión
                          </span>
                        ) : (
                          <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
                            isCorrect
                              ? 'bg-primary/10 text-primary'
                              : 'bg-destructive/10 text-destructive'
                          }`}>
                            {isCorrect ? '✓ Correcta' : '✗ Incorrecta'}
                          </span>
                        )}
                        {detailedAnswer.feedback && (
                          <span className="px-2 py-0.5 rounded-md border border-border text-xs text-muted-foreground">
                            Revisado por Profesor
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 sm:ml-16">

                    <div className="space-y-1.5">
                      <p className="section-label">
                        Tu Respuesta:
                      </p>
                      <div className={`p-4 rounded-xl border-2 ${
                        needsReview
                          ? 'bg-accent/10 border-accent/30'
                          : isCorrect
                          ? 'bg-primary/5 border-primary/30'
                          : 'bg-destructive/5 border-destructive/20'
                      }`}>
                        <p className="text-sm font-medium text-foreground whitespace-pre-wrap">
                          {studentAnswerText}
                        </p>
                        {question.type === 'multiple-choice' && detailedAnswer.studentAnswer !== undefined && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Opción seleccionada {Number(detailedAnswer.studentAnswer) + 1}
                          </p>
                        )}
                      </div>
                    </div>

                    {needsReview && (
                      <div className="p-3 bg-accent/10 border border-accent/30 rounded-xl flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-accent-foreground flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-foreground">
                            Esta respuesta está pendiente de revisión del profesor
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Tu respuesta puede ser correcta pero utiliza una redacción diferente. Tu profesor la revisará y asignará la calificación correspondiente.
                          </p>
                        </div>
                      </div>
                    )}

                    {!needsReview && canViewResults && (
                      <div className="space-y-1.5">
                        <p className="section-label">
                          {question.type === 'multiple-choice' ? 'Respuesta Correcta:' : 'Respuesta Modelo:'}
                        </p>
                        {isOpenEnded ? (
                          correctAnswerText ? (
                            <div className="p-4 bg-primary/5 border-2 border-primary/30 rounded-xl">
                              <p className="text-sm font-medium text-foreground whitespace-pre-wrap">
                                {correctAnswerText}
                              </p>
                            </div>
                          ) : (
                            <div className="p-4 bg-muted/30 border-2 border-border rounded-xl">
                              <p className="text-xs text-muted-foreground italic">
                                No se proporcionó respuesta de referencia para esta pregunta.
                              </p>
                            </div>
                          )
                        ) : (
                          <div className="p-4 bg-primary/5 border-2 border-primary/30 rounded-xl">
                            <p className="text-sm font-medium text-foreground">{correctAnswerText}</p>
                            {correctOptionIndex !== undefined && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Opción {correctOptionIndex + 1}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {!needsReview && !canViewResults && (
                      <div className="p-3 bg-muted/30 border-2 border-border rounded-xl flex items-center gap-2">
                        <EyeOff className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <p className="text-xs text-muted-foreground italic">
                          La respuesta correcta no está disponible para este cuestionario.
                        </p>
                      </div>
                    )}

                    {question.type === 'multiple-choice' && question.options?.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="section-label">
                          Todas las Opciones:
                        </p>
                        <div className="space-y-1.5">
                          {question.options.map((option: string, optIndex: number) => {
                            const isStudentChoice = Number(detailedAnswer.studentAnswer) === optIndex
                            const isCorrectOption =
                              canViewResults &&
                              (correctOptionIndex === optIndex || correctAnswerText === option)

                            return (
                              <div
                                key={optIndex}
                                className={`p-3 rounded-xl border text-sm ${
                                  isStudentChoice && isCorrectOption
                                    ? 'bg-primary/10 border-primary/30'
                                    : isStudentChoice
                                    ? 'bg-destructive/10 border-destructive/20'
                                    : isCorrectOption
                                    ? 'bg-primary/5 border-primary/20'
                                    : 'bg-muted/20 border-border'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded-md text-foreground flex-shrink-0">
                                    {String.fromCharCode(65 + optIndex)}
                                  </span>
                                  <span className="flex-1 text-sm text-foreground">{option}</span>
                                  <div className="flex gap-1 flex-shrink-0">
                                    {isStudentChoice && (
                                      <span className="px-1.5 py-0.5 rounded-md border border-border text-xs text-muted-foreground">
                                        Tu elección
                                      </span>
                                    )}
                                    {isCorrectOption && (
                                      <span className="px-1.5 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-semibold">
                                        Correcta
                                      </span>
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
                      <div className="space-y-1.5">
                        <p className="section-label">
                          Retroalimentación del Profesor:
                        </p>
                        <div className="p-4 bg-accent/10 border-2 border-accent/30 rounded-xl">
                          <p className="text-xs text-foreground whitespace-pre-wrap">
                            {detailedAnswer.feedback}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <div className={`flex items-center gap-1.5 text-xs font-semibold ${
                        needsReview ? 'text-accent-foreground' :
                        isCorrect   ? 'text-primary'           :
                        'text-destructive'
                      }`}>
                        {needsReview
                          ? <><HelpCircle className="w-4 h-4" />Esperando Revisión</>
                          : isCorrect
                          ? <><CheckCircle className="w-4 h-4" />¡Respuesta Correcta!</>
                          : <><XCircle className="w-4 h-4" />Respuesta Incorrecta</>}
                      </div>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        Obtuviste <span className="font-semibold text-foreground">{detailedAnswer.points}</span> de{' '}
                        <span className="font-semibold text-foreground">{detailedAnswer.maxPoints}</span> pts
                      </span>
                    </div>

                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="bg-primary/5 rounded-2xl border border-primary/20 shadow-sm p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Award className="w-4 h-4 text-primary" />
          </span>
          <div className="space-y-1">
            <h3 className="font-bold text-base text-foreground">Calificación Final</h3>
            <p className="text-sm text-muted-foreground">
              Tu calificación final para este cuestionario es{' '}
              <span className="font-bold text-foreground">{finalScore} / {maxScore}</span>
              {' '}({Math.round(percentage)}%).
              {pendingReview > 0 && (
                <> Algunas respuestas están pendientes de revisión del profesor y tu calificación podría actualizarse una vez revisadas.</>
              )}
            </p>
            {submission.status === 'GRADED' && (
              <span className="inline-flex px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-bold">
                ✓ Calificado por el Profesor
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="text-center pb-4">
        <button
          onClick={onExit}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 active:scale-95 transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Regresar al Curso
        </button>
      </div>

    </div>
  </div>
)
};
