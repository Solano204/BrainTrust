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
  EyeOff, 
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
import { QuizSubmission } from "@/app/shared/models/quiz.model";

interface QuizViewProps {
  quiz: Quiz;
  existingSubmission?: QuizSubmission;
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

  console.log("DATOS DEL CUESTIONARIO", quiz)
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
          feedback: "No se proporcionó respuesta",
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
          ? "¡Correcto!"
          : `Incorrecto. La respuesta correcta es la opción ${correctChoice + 1}.`;
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
          feedback = "¡Correcto!";
        } else if (studentText === "") {
          points = 0;
          feedback = "No se proporcionó respuesta";
        } else {
          points = 0;
          feedback = `Incorrecto. Se esperaba: "${question.correctAnswer}"`;
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
        if (!isOpen) { setShowStartDialog(false); onExit?.(); }
        setShowStartDialog(isOpen);
      }}
    >
      <DialogContent
        className="sm:max-w-md bg-card rounded-3xl border border-border shadow-2xl p-0 overflow-hidden"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-4 h-4 text-primary" />
            </span>
            <div>
              <p className="text-base font-bold text-foreground">Iniciar Cuestionario</p>
              <p className="text-xs text-muted-foreground font-normal mt-0.5">
                ¿Estás listo para comenzar &ldquo;{quiz.title}&rdquo;?
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-5 space-y-4">
          <div className="bg-muted/30 rounded-2xl border border-border divide-y divide-border/50">
            {[
              { icon: Timer,        label: 'Duración',   value: `${quiz.timeLimit} minutos` },
              { icon: FileQuestion, label: 'Preguntas',  value: `${quiz.questions.length} preguntas` },
              { icon: Award,        label: 'Puntaje Máx.',  value: `${quiz.maxGrade} puntos` },
              ...(quiz.dueDate ? [{ icon: Calendar, label: 'Fecha Límite', value: new Date(quiz.dueDate).toLocaleDateString() }] : []),
              ...(quiz.availableFrom ? [{ icon: Calendar, label: 'Apertura', value: new Date(quiz.availableFrom).toLocaleDateString() }] : []),
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center justify-between px-4 py-3">
                <span className="text-xs font-semibold text-muted-foreground">{label}</span>
                <span className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-muted/50 border border-border text-xs font-semibold text-foreground">
                  <Icon className="w-3 h-3 text-primary" />
                  {value}
                </span>
              </div>
            ))}
          </div>

          {isStartDisabled && (
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-destructive/10 border border-destructive/20">
              <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-destructive">Cuestionario No Disponible</p>
                <p className="text-xs text-destructive/80 mt-0.5">{getStatusMessage()}</p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-xs font-semibold text-foreground flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-accent-foreground" />
              Instrucciones Importantes
            </p>
            <ul className="space-y-1 pl-1">
              {[
                'El temporizador comenzará inmediatamente al iniciar',
                'Puedes marcar preguntas para revisar',
                'Navega libremente entre las preguntas',
                'Las respuestas se guardan a medida que avanzas',
                'Envía antes de que se acabe el tiempo',
              ].map((item) => (
                <li key={item} className="text-xs text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>{item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border bg-muted/30 flex flex-col-reverse sm:flex-row gap-2">
          <button
            type="button"
            onClick={() => { setShowStartDialog(false); onExit?.(); }}
            className="flex-1 flex items-center justify-center px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
          >
            Salir
          </button>
          <button
            onClick={handleStartQuiz}
            disabled={isStartDisabled}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-40 active:scale-95 transition-all shadow-sm"
          >
            {isStartDisabled ? <Lock className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
            Iniciar Cuestionario
          </button>
        </div>
      </DialogContent>
    </Dialog>

    <div className="min-h-screen bg-background p-4">
      <div className="max-w-5xl mx-auto space-y-5">

        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="border-l-4 border-primary p-5 sm:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                    {quiz.title}
                  </h1>
                  <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-semibold">
                    Vista Estudiante
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{quiz.description}</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <div className={`flex items-center gap-2 px-3 py-2 rounded-xl font-mono text-base font-bold ${
                  timeRemaining < 300
                    ? "bg-destructive/10 text-destructive border border-destructive/20"
                    : "bg-primary/10 text-primary border border-primary/20"
                }`}>
                  <Clock className="w-4 h-4" />
                  {formatTime(timeRemaining)}
                </div>

                <div className="text-center min-w-[8rem]">
                  <p className="text-xs text-muted-foreground mb-1">
                    Pregunta {currentQuestionIndex + 1} de {quiz.questions.length}
                  </p>
                  <Progress value={progress} className="w-32 h-1.5" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {answeredCount} respondidas · {unansweredCount} pendientes
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-border">
              {[
                { label: 'Tiempo Límite', value: `${quiz.timeLimit} min` },
                { label: 'Puntaje Máx.',  value: quiz.maxGrade },
                { label: '',           value: '' },
                { label: 'Fecha Límite',   value: quiz.dueDate ? new Date(quiz.dueDate).toLocaleDateString() : 'Sin fecha límite' },
              ].map(({ label, value }, i) => label ? (
                <div key={i} className="text-center">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-base font-bold text-foreground mt-0.5">{value}</p>
                </div>
              ) : <div key={i} />)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">

          <div className="lg:col-span-1">
            <div className="bg-card rounded-2xl border border-border shadow-sm p-4 sticky top-4">
              <p className="section-label flex items-center gap-2 mb-3">
                <Eye className="w-3.5 h-3.5" />
                Preguntas
              </p>

              <div className="grid grid-cols-4 lg:grid-cols-2 gap-1.5">
                {quiz.questions.map((question, index) => {
                  const answer = answers[question.id];
                  const isAnswered = answer && (
                    answer.questionType === 'multiple-choice'
                      ? answer.studentAnswer !== -1
                      : answer.studentAnswer !== ''
                  );
                  const isCurrent  = currentQuestionIndex === index;
                  const isFlagged  = flaggedQuestions.has(question.id);

                  return (
                    <button
                      key={question.id}
                      onClick={() => setCurrentQuestionIndex(index)}
                      className={`relative h-10 rounded-xl text-xs font-bold transition-all border ${
                        isCurrent
                          ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                          : isAnswered
                          ? 'bg-primary/10 text-primary border-primary/20'
                          : 'bg-muted/30 text-muted-foreground border-border hover:bg-muted/60'
                      } ${isFlagged ? 'border-accent-foreground border-2' : ''}`}
                    >
                      {index + 1}
                      {isFlagged && (
                        <Flag className="w-2.5 h-2.5 absolute -top-1 -right-1 text-accent-foreground fill-accent-foreground" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
                {[
                  { color: 'bg-primary',      label: 'Actual'    },
                  { color: 'bg-primary/10',   label: 'Respondida'   },
                  { color: 'bg-muted/30',     label: 'No respondida' },
                ].map(({ color, label }) => (
                  <div key={label} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded ${color} border border-border`} />
                    <span>{label}</span>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <Flag className="w-3 h-3 text-accent-foreground" />
                  <span>Marcada</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border space-y-2">
                {[
                  { label: 'Respondidas', value: `${answeredCount}/${quiz.questions.length}` },
                  { label: 'Marcadas',  value: flaggedQuestions.size },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-semibold text-foreground">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-4">
            <div className="bg-card rounded-2xl border border-border shadow-sm p-5 sm:p-6">

              <div className="flex items-start justify-between gap-3 mb-6">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-muted/50 border border-border text-xs font-semibold text-muted-foreground">
                      {currentQuestion.type === 'multiple-choice' ? 'Opción Múltiple' : 'Respuesta Abierta'}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-semibold">
                      {currentQuestion.points} punto{currentQuestion.points !== 1 ? 's' : ''}
                    </span>
                    {flaggedQuestions.has(currentQuestion.id) && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-accent/20 border border-accent/30 text-xs font-semibold text-accent-foreground">
                        <Flag className="w-3 h-3" />
                        Marcada
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg font-bold text-foreground">{currentQuestion.question}</h2>
                </div>

                <button
                  onClick={() => toggleFlag(currentQuestion.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all flex-shrink-0 ${
                    flaggedQuestions.has(currentQuestion.id)
                      ? 'bg-accent/20 border-accent/30 text-accent-foreground'
                      : 'border-border text-muted-foreground hover:bg-muted/50'
                  }`}
                >
                  <Flag className={`w-3.5 h-3.5 ${flaggedQuestions.has(currentQuestion.id) ? 'fill-current' : ''}`} />
                  {flaggedQuestions.has(currentQuestion.id) ? 'Desmarcar' : 'Marcar'}
                </button>
              </div>

              {currentQuestion.type === 'multiple-choice' ? (
                <RadioGroup
                  value={answers[currentQuestion.id]?.studentAnswer?.toString() || ''}
                  onValueChange={(value) => handleAnswerChange(currentQuestion.id, parseInt(value))}
                  className="space-y-2.5"
                >
                  {currentQuestion.options?.map((option, index) => {
                    const isSelected = answers[currentQuestion.id]?.studentAnswer === index;
                    return (
                      <div
                        key={index}
                        className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:bg-muted/30'
                        }`}
                      >
                        <RadioGroupItem value={index.toString()} id={`option-${index}`} className="h-4 w-4" />
                        <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-sm">
                          <div className="flex items-start gap-3">
                            <span className="font-mono bg-muted/50 border border-border px-2 py-0.5 rounded-md text-xs font-bold text-muted-foreground flex-shrink-0">
                              {String.fromCharCode(65 + index)}
                            </span>
                            <span className="flex-1 text-foreground">{option}</span>
                          </div>
                        </Label>
                      </div>
                    );
                  })}
                </RadioGroup>
              ) : (
                <div className="space-y-2">
                  <textarea
                    placeholder="Escribe tu respuesta aquí... Sé lo más detallado y específico posible."
                    value={answers[currentQuestion.id]?.studentAnswer?.toString() || ''}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                    rows={10}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-ring/50 resize-none transition-all"
                  />
                  <p className="text-right text-xs text-muted-foreground">
                    {answers[currentQuestion.id]?.studentAnswer?.toString().length || 0} caracteres
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-3">
              <button
                onClick={goToPreviousQuestion}
                disabled={isFirstQuestion}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Anterior
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowExitConfirm(true)}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 disabled:opacity-30 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Salir
                </button>

                {isLastQuestion ? (
                  <button
                    onClick={() => setShowSubmitConfirm(true)}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-40 active:scale-95 transition-all shadow-sm"
                  >
                    {isSubmitting ? (
                      <><div className="w-4 h-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />Enviando...</>
                    ) : (
                      <><Send className="w-4 h-4" />Enviar Cuestionario</>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={goToNextQuestion}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 active:scale-95 transition-all shadow-sm"
                  >
                    Siguiente
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {timeRemaining < 300 && timeRemaining > 0 && (
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 border-l-4 border-l-destructive">
                <Clock className="w-5 h-5 text-destructive animate-pulse flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-destructive">¡El tiempo se está acabando!</p>
                  <p className="text-xs text-destructive/80 mt-0.5">
                    {timeRemaining < 60
                      ? 'Menos de 1 minuto restante'
                      : `${Math.ceil(timeRemaining / 60)} minutos restantes`}
                    {unansweredCount > 0 && ` · ${unansweredCount} preguntas sin responder`}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>

    <AlertDialog open={showExitConfirm} onOpenChange={setShowExitConfirm}>
      <AlertDialogContent className="bg-card rounded-3xl border border-border shadow-2xl p-0 overflow-hidden">
        <AlertDialogHeader className="px-6 pt-6 pb-4">
          <AlertDialogTitle className="flex items-center gap-3 text-base font-bold text-foreground">
            <span className="w-8 h-8 rounded-xl bg-destructive/10 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-4 h-4 text-destructive" />
            </span>
            ¿Salir del Cuestionario?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground mt-2">
            Tu progreso se guardará, pero deberás completar el cuestionario más tarde.
            Has respondido <span className="font-semibold text-foreground">{answeredCount}</span> de{' '}
            <span className="font-semibold text-foreground">{quiz.questions.length}</span> preguntas.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="px-6 py-4 border-t border-border bg-muted/30 flex flex-col-reverse sm:flex-row gap-2">
          <AlertDialogCancel className="flex-1 rounded-xl border-border text-sm font-medium">
            Continuar Cuestionario
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleExitConfirm}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-destructive text-destructive-foreground text-sm font-semibold hover:opacity-90 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Salir del Cuestionario
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <AlertDialog open={showSubmitConfirm} onOpenChange={setShowSubmitConfirm}>
      <AlertDialogContent className="bg-card rounded-3xl border border-border shadow-2xl p-0 overflow-hidden">
        <AlertDialogHeader className="px-6 pt-6 pb-4">
          <AlertDialogTitle className="flex items-center gap-3 text-base font-bold text-foreground">
            <span className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Send className="w-4 h-4 text-primary" />
            </span>
            ¿Enviar Cuestionario?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground mt-2">
            {unansweredCount > 0 ? (
              <>Tienes <strong className="text-foreground">{unansweredCount}</strong> pregunta{unansweredCount !== 1 ? 's' : ''} sin responder. ¿Estás seguro de que deseas enviar?</>
            ) : (
              "¿Estás listo para enviar? No podrás hacer cambios después del envío."
            )}
          </AlertDialogDescription>
          {timeRemaining > 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              Tiempo restante: <span className="font-semibold text-foreground">{formatTime(timeRemaining)}</span>
            </p>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter className="px-6 py-4 border-t border-border bg-muted/30 flex flex-col-reverse sm:flex-row gap-2">
          <AlertDialogCancel className="flex-1 rounded-xl border-border text-sm font-medium">
            Revisar Preguntas
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-40 transition-all"
          >
            {isSubmitting ? (
              <><div className="w-4 h-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />Enviando...</>
            ) : (
              <><Send className="w-4 h-4" />Enviar Cuestionario</>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <Dialog open={showTimeUpDialog} onOpenChange={setShowTimeUpDialog}>
      <DialogContent className="sm:max-w-md bg-card rounded-3xl border border-border shadow-2xl p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-destructive/10 flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4 text-destructive" />
            </span>
            <div>
              <p className="text-base font-bold text-destructive">¡Tiempo Agotado!</p>
              <p className="text-xs text-muted-foreground font-normal mt-0.5">
                Tus respuestas se enviarán automáticamente ahora.
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className="px-6 py-4 border-t border-border bg-muted/30">
          <button
            onClick={handleTimeUpSubmit}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-40 transition-all"
          >
            {isSubmitting ? (
              <><div className="w-4 h-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />Enviando...</>
            ) : (
              'Enviar Ahora'
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  </>
);
}
interface QuizResultsProps {
  quiz: Quiz;
  submission: QuizSubmission;
  userAnswers: QuizAnswers;
  onExit?: () => void;
}

const QuizResults: React.FC<QuizResultsProps> = ({
  quiz,
  submission,
  userAnswers,
  onExit,
}) => {
  const hasDetailedData = !!submission.quizData;
  const quizAnswers = submission.quizData?.answers ?? [];



  const canViewResults: boolean =
    (quiz.allowSeeResults ?? false);

  const totalMaxScore = quiz.questions.reduce((total, q) => total + q.points, 0);

  const calculatedScore = quizAnswers.reduce((total, answer) => {
    if (typeof answer.points === "number") return total + answer.points;
    if (answer.isCorrect) {
      const question = quiz.questions.find((q) => q.id === answer.questionId);
      return total + (question?.points ?? 0);
    }
    return total;
  }, 0);

  const finalScore = submission.grade?.value ?? calculatedScore;
  const percentage = totalMaxScore > 0 ? (finalScore / totalMaxScore) * 100 : 0;
  const passed = percentage >= 70;

  const correctCount = quizAnswers.filter((a) => a.isCorrect === true).length;
  const incorrectCount = quizAnswers.filter((a) => a.isCorrect === false).length;
  const pendingCount = quizAnswers.filter((a) => a.isCorrect === undefined).length;

  const formatStudentAnswer = (question: any, answer: any): string => {
    const raw = answer?.studentAnswer;
    if (raw === undefined || raw === null || raw === "") return "No se proporcionó respuesta";
    if (question.type === "multiple-choice") {
      const idx = Number(raw);
      return question.options?.[idx] ?? `Opción ${idx + 1}`;
    }
    return String(raw);
  };

  const resolveCorrectAnswer = (
    question: any,
    detailedAnswer: any
  ): { text: string; optionIndex?: number } => {
    if (question.type === "multiple-choice") {
      if (detailedAnswer?.correctAnswer !== undefined && detailedAnswer.correctAnswer !== null) {
        const asText = String(detailedAnswer.correctAnswer);
        const asNumber = Number(asText);

        if (!isNaN(asNumber) && question.options?.[asNumber] !== undefined) {
          return { text: question.options[asNumber], optionIndex: asNumber };
        }
        const matchIdx = question.options?.findIndex((o: string) => o === asText) ?? -1;
        if (matchIdx >= 0) return { text: asText, optionIndex: matchIdx };
        return { text: asText };
      }
      if (question.correctAnswer !== undefined) {
        const idx = Number(question.correctAnswer);
        return {
          text: question.options?.[idx] ?? `Opción ${idx + 1}`,
          optionIndex: idx,
        };
      }
      return { text: "No disponible" };
    }

    if (detailedAnswer?.correctAnswer) return { text: detailedAnswer.correctAnswer };
    if (question.expectedAnswer) return { text: question.expectedAnswer };
    if (question.correctAnswer && typeof question.correctAnswer === "string") {
      return { text: question.correctAnswer };
    }
    return { text: "" };
  };
return (
  <div className="min-h-screen bg-background p-4">
    <div className="max-w-4xl mx-auto space-y-5">

      <div className="bg-card rounded-2xl border border-border shadow-sm p-6 sm:p-8 text-center">
        <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
          passed ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
        }`}>
          {passed
            ? <CheckCircle className="w-8 h-8" />
            : <HelpCircle className="w-8 h-8" />}
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight mb-1">
          {passed ? "¡Cuestionario Completado!" : "Cuestionario Finalizado"}
        </h1>
        <p className="text-sm text-muted-foreground mb-5">{quiz.title}</p>

        {!canViewResults && (
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-5 bg-accent/10 border border-accent/30 rounded-xl text-xs font-semibold text-accent-foreground">
            <EyeOff className="w-3.5 h-3.5" />
            Las respuestas correctas no están disponibles para este cuestionario
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg mx-auto">
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-primary">{Math.round(finalScore * 100) / 100}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Tu Puntaje</p>
          </div>
          <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-primary">{totalMaxScore}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Puntaje Máx.</p>
          </div>
          <div className="bg-accent/10 border border-accent/20 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-accent-foreground">{Math.round(percentage)}%</p>
            <p className="text-xs text-muted-foreground mt-0.5">Porcentaje</p>
          </div>
          {hasDetailedData && (
            <div className="bg-muted/50 border border-border rounded-2xl p-4 text-center">
              <p className="text-2xl font-bold text-foreground">
                {Math.round((submission.quizData?.timeSpent ?? 0) / 60)}m
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Tiempo Empleado</p>
            </div>
          )}
        </div>

        {submission.teacherFeedback && (
          <div className="mt-5 p-4 bg-accent/10 border border-accent/30 rounded-2xl max-w-lg mx-auto text-left">
            <p className="text-xs font-semibold text-foreground mb-1">Retroalimentación del Profesor</p>
            <p className="text-sm text-muted-foreground">{submission.teacherFeedback}</p>
          </div>
        )}
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="px-5 py-4 sm:px-6 border-b border-border flex items-center justify-between">
          <h2 className="section-label">
            Revisión de Preguntas
          </h2>
          {!canViewResults && (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <EyeOff className="w-3.5 h-3.5" />
              Respuestas ocultas
            </span>
          )}
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          {quiz.questions.map((question, index) => {
            const detailedAnswer    = quizAnswers.find((a) => a.questionId === question.id);
            const userAnswer        = userAnswers[question.id];
            const sourceAnswer      = userAnswer ?? detailedAnswer;
            const studentAnswerText = formatStudentAnswer(question, sourceAnswer);
            const { text: correctAnswerText, optionIndex: correctOptionIndex } =
              resolveCorrectAnswer(question, detailedAnswer);
            const isOpenEnded  = question.type !== "multiple-choice";
            const needsReview  = detailedAnswer?.isCorrect === undefined || (isOpenEnded && detailedAnswer?.isCorrect === undefined);
            let displayPoints  = detailedAnswer?.points ?? 0;
            if (detailedAnswer?.isCorrect && displayPoints === 0) displayPoints = question.points;

            return (
              <div key={question.id} className="bg-muted/20 rounded-2xl border border-border p-4 sm:p-5 space-y-4">

                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="section-label mb-1">
                      Pregunta {index + 1}
                    </p>
                    <p className="text-sm font-semibold text-foreground">{question.question}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    {detailedAnswer && (
                      <>
                        <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                          displayPoints === question.points
                            ? 'bg-primary/10 text-primary'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {displayPoints}/{question.points}
                        </span>
                        {detailedAnswer.feedback && (
                          <span className="px-2 py-0.5 rounded-md border border-border text-xs text-muted-foreground">
                            Revisado por Profesor
                          </span>
                        )}
                        {needsReview ? (
                          <span className="px-2 py-0.5 rounded-md bg-accent/20 border border-accent/30 text-xs font-semibold text-accent-foreground">
                            Pendiente de Revisión
                          </span>
                        ) : (
                          <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                            detailedAnswer.isCorrect
                              ? 'bg-primary/10 text-primary'
                              : 'bg-destructive/10 text-destructive'
                          }`}>
                            {detailedAnswer.isCorrect ? "Correcta" : "Incorrecta"}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-foreground mb-1.5">Tu respuesta:</p>
                  <div className={`p-3 rounded-xl border text-sm font-medium ${
                    needsReview
                      ? "bg-accent/10 border-accent/30 text-accent-foreground"
                      : detailedAnswer?.isCorrect
                      ? "bg-primary/5 border-primary/20 text-foreground"
                      : "bg-destructive/5 border-destructive/20 text-foreground"
                  }`}>
                    {studentAnswerText}
                    {question.type === "multiple-choice" && sourceAnswer?.studentAnswer !== undefined && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Opción seleccionada {Number(sourceAnswer.studentAnswer) + 1}
                      </p>
                    )}
                  </div>
                </div>

                {needsReview && (
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-accent/10 border border-accent/30">
                    <AlertCircle className="w-4 h-4 text-accent-foreground flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-foreground">Esta respuesta está pendiente de revisión del profesor</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Tu respuesta puede ser correcta pero utiliza una redacción diferente o requiere calificación manual.
                      </p>
                    </div>
                  </div>
                )}

                {!needsReview && canViewResults && (
                  <div>
                    <p className="text-xs font-semibold text-foreground mb-1.5">Respuesta esperada:</p>
                    {isOpenEnded ? (
                      correctAnswerText ? (
                        <div className="p-3 rounded-xl border bg-primary/5 border-primary/20">
                          <p className="text-sm text-primary font-medium">{correctAnswerText}</p>
                        </div>
                      ) : (
                        <div className="p-3 rounded-xl border border-border bg-muted/30">
                          <p className="text-sm text-muted-foreground italic">No se proporcionó respuesta de referencia.</p>
                        </div>
                      )
                    ) : (
                      <div className="p-3 rounded-xl border bg-primary/5 border-primary/20">
                        <p className="text-sm text-primary font-medium">{correctAnswerText}</p>
                        {correctOptionIndex !== undefined && (
                          <p className="text-xs text-primary/70 mt-1">Opción {correctOptionIndex + 1}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {!needsReview && !canViewResults && (
                  <div className="flex items-center gap-2 p-3 rounded-xl border border-border bg-muted/30">
                    <EyeOff className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <p className="text-sm text-muted-foreground italic">La respuesta correcta no está disponible para este cuestionario.</p>
                  </div>
                )}

                {question.type === "multiple-choice" && question.options && question.options.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-foreground mb-1.5">Todas las opciones:</p>
                    <div className="space-y-1.5">
                      {question.options.map((option, optIndex) => {
                        const isStudentChoice = Number(sourceAnswer?.studentAnswer) === optIndex;
                        const isCorrectOption = canViewResults && (correctOptionIndex === optIndex || correctAnswerText === option);

                        return (
                          <div
                            key={optIndex}
                            className={`flex items-center gap-2.5 p-2.5 rounded-xl text-sm border ${
                              isStudentChoice && isCorrectOption
                                ? "bg-primary/5 border-primary/30"
                                : isStudentChoice
                                ? "bg-destructive/5 border-destructive/20"
                                : isCorrectOption
                                ? "bg-primary/5 border-primary/20"
                                : "bg-muted/20 border-border"
                            }`}
                          >
                            <span className="font-mono text-xs bg-muted/50 border border-border px-1.5 py-0.5 rounded-md font-bold text-muted-foreground flex-shrink-0">
                              {String.fromCharCode(65 + optIndex)}
                            </span>
                            <span className="flex-1 text-foreground">{option}</span>
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
                        );
                      })}
                    </div>
                  </div>
                )}

                {detailedAnswer?.feedback && (
                  <div>
                    <p className="text-xs font-semibold text-foreground mb-1.5">Retroalimentación del Profesor:</p>
                    <div className="p-3 rounded-xl border bg-accent/10 border-accent/30">
                      <p className="text-sm text-accent-foreground">{detailedAnswer.feedback}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {hasDetailedData && (
        <div className="bg-card rounded-2xl border border-border shadow-sm p-5 sm:p-6">
          <h2 className="section-label mb-4">
            Resumen de Rendimiento
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Correctas',        value: correctCount,   style: 'bg-primary/5 border-primary/20 text-primary'          },
              { label: 'Incorrectas',      value: incorrectCount, style: 'bg-destructive/5 border-destructive/20 text-destructive' },
              { label: 'Pendientes', value: pendingCount,   style: 'bg-accent/10 border-accent/20 text-accent-foreground'  },
              { label: 'Tiempo Total',     value: `${Math.round((submission.quizData?.timeSpent ?? 0) / 60)}m`, style: 'bg-muted/50 border-border text-foreground' },
            ].map(({ label, value, style }) => (
              <div key={label} className={`rounded-2xl border p-4 text-center ${style}`}>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 sm:p-6 flex items-start gap-4">
        <span className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Award className="w-5 h-5 text-primary" />
        </span>
        <div>
          <h3 className="font-bold text-base text-foreground mb-1">Calificación Final</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Tu calificación actual para este cuestionario es{' '}
            <span className="font-bold text-foreground">
              {Math.round(finalScore * 100) / 100} / {totalMaxScore}
            </span>{' '}
            ({Math.round(percentage)}%).
            {pendingCount > 0 && (
              <span className="block mt-1 text-accent-foreground font-semibold">
                Nota: {pendingCount} pregunta{pendingCount !== 1 ? 's' : ''} pendiente{pendingCount !== 1 ? 's' : ''} de revisión. Tu calificación podría aumentar.
              </span>
            )}
          </p>
          {submission.status === "GRADED" && (
            <span className="px-2.5 py-1 rounded-xl bg-primary text-primary-foreground text-xs font-bold">
              Calificado por el Profesor
            </span>
          )}
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
);
};
