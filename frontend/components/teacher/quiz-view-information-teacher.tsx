"use client";

import { useEffect, useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Calendar, Clock, FileText, Calculator, Loader2, AlertCircle,
  ArrowLeft, CheckCircle, Award, Eye, EyeOff, Check, X, Edit,
  Save, XCircle, Plus, Trash2, GripVertical, Info,
} from "lucide-react";
import type { Question } from "@/app/domain/entities/CourseEntities";
import { useAuth } from "@/app/context/AuthContext";
import { useQuizDetail, useQuizMutations } from "../teacher-student/hooks/quiz-hooks";
import { Quiz } from "@/app/domain/entities/CourseEntities";


interface DatosEdicion {
  title: string;
  description: string;
  timeLimit: string;
  maxGrade: number;
  dueDate: string;
  acceptLateSubmissions: boolean;
  allowSeeResults: boolean;
  totalScore: number;
}

interface PropsVistaQuiz {
  quiz: Quiz;
  onClose: () => void;
}


function calcularRedistribucionPuntos(
  preguntas: Question[],
  nuevaPuntuacionTotal: number
): { id: string; question: string; oldPoints: number; weight: number; newPoints: number }[] {
  const totalActual = preguntas.reduce((s, q) => s + (q.points ?? 0), 0);

  return preguntas.map((q) => {
    const peso = totalActual > 0 ? (q.points ?? 0) / totalActual : 1 / preguntas.length;
    const nuevosPuntos = +(nuevaPuntuacionTotal * peso).toFixed(2);
    return {
      id: q.id,
      question: q.question || "(pregunta vacía)",
      oldPoints: q.points ?? 0,
      weight: +(peso * 100).toFixed(1),
      newPoints: nuevosPuntos,
    };
  });
}



export function VistaQuiz({ quiz: quizInicial, onClose }: PropsVistaQuiz) {
  const { user } = useAuth();
  const tipoUsuario = user?.role === "teacher" ? "teacher" : "student";

  const {
    data: quiz,
    isLoading: cargandoQuiz,
    error: errorQuiz,
    refetch,
  } = useQuizDetail(quizInicial.id);

  const {
    updateQuiz,
    addQuestionsBulk,
    updateQuestionsBulk,
    updateQuestionsPointsBulk,
    updateQuestionsTextBulk,
    updateQuestionsAnswersBulk,
    updateQuestionsOptionsBulk,
    updateQuestionsTypesBulk,
    deleteQuestionsBulk,
  } = useQuizMutations();

  console.log("quiz", quiz);
  const rawQuiz = quiz ?? quizInicial;
  const datosQuiz: Quiz = {
    ...(rawQuiz as any),
    dueDate: (rawQuiz as any).dueDate ?? null,
  } as Quiz;

  const [mostrarRespuestasCorrectas, setMostrarRespuestasCorrectas] = useState(tipoUsuario === "teacher");
  const [modoEdicion, setModoEdicion] = useState(false);
  const [datosEdicion, setDatosEdicion] = useState<DatosEdicion>({
    title: datosQuiz.title,
    description: datosQuiz.description,
    timeLimit: datosQuiz.timeLimit.toString(),
    maxGrade: datosQuiz.maxGrade,
    dueDate: datosQuiz.dueDate ?? "",
    acceptLateSubmissions: datosQuiz.acceptLateSubmissions,
    allowSeeResults: datosQuiz.allowSeeResults,
    totalScore: datosQuiz.maxGrade ?? datosQuiz.maxGrade ?? 100,
  });

  const [preguntasEdicion, setPreguntasEdicion] = useState<Question[]>([]);
  const [idsPreguntasEliminadas, setIdsPreguntasEliminadas] = useState<string[]>([]);
  const [editandoPreguntas, setEditandoPreguntas] = useState(false);
  const [mostrarPrevisualizacionRedistribucion, setMostrarPrevisualizacionRedistribucion] = useState(false);

  useEffect(() => {
  if (quiz) {
    setDatosEdicion({
      title: quiz.title,
      description: quiz.description,
      timeLimit: quiz.timeLimit.toString(),
      maxGrade: quiz.maxGrade,
      dueDate: quiz.dueDate ?? "",
      acceptLateSubmissions: quiz.acceptLateSubmissions,
      allowSeeResults: quiz.allowSeeResults,
      totalScore: quiz.maxGrade ?? quiz.maxGrade ?? 100,
    });
    setPreguntasEdicion(quiz.questions ?? []);
  }
}, [quiz]);

  const puntosTotales = preguntasEdicion.reduce((sum, q) => sum + (q.points ?? 0), 0);
  const cantidadOpcionMultiple = preguntasEdicion.filter((q) => q.type === "multiple-choice").length;
  const cantidadRespuestaAbierta = preguntasEdicion.filter((q) => q.type === "open-ended").length;

  const previsualizacionRedistribucion = useMemo(() => {
    const existentes = preguntasEdicion.filter((q) => !q.id.startsWith("temp_"));
    if (existentes.length === 0) return [];
    return calcularRedistribucionPuntos(existentes, datosEdicion.totalScore);
  }, [preguntasEdicion, datosEdicion.totalScore]);

  const puntuacionTotalCambio =
    datosEdicion.totalScore !== (datosQuiz.maxGrade ?? datosQuiz.maxGrade ?? 100);

  const cargando =
    cargandoQuiz ||
    updateQuiz.isPending ||
    addQuestionsBulk.isPending ||
    updateQuestionsBulk.isPending ||
    updateQuestionsPointsBulk.isPending ||
    updateQuestionsTextBulk.isPending ||
    updateQuestionsAnswersBulk.isPending ||
    updateQuestionsOptionsBulk.isPending ||
    updateQuestionsTypesBulk.isPending ||
    deleteQuestionsBulk.isPending;

  const handleGuardarConfiguracion = async () => {
    try {
      await updateQuiz.mutateAsync({
        quizId: datosQuiz.id,
        quizData: {
          title: datosEdicion.title,
          description: datosEdicion.description,
          timeLimit: parseInt(datosEdicion.timeLimit),
          maxGrade: datosEdicion.maxGrade,
          dueDate: datosEdicion.dueDate || undefined,
          acceptLateSubmissions: datosEdicion.acceptLateSubmissions,
          allowSeeResults: datosEdicion.allowSeeResults,
          totalScore: datosEdicion.totalScore,
        },
      });
      setModoEdicion(false);
      setMostrarPrevisualizacionRedistribucion(false);
      refetch();
    } catch (error) {
      console.error("Error al actualizar el quiz:", error);
    }
  };

  const handleGuardarPreguntas = async () => {
    try {
      await updateQuiz.mutateAsync({
        quizId: datosQuiz.id,
        quizData: {
          title: datosQuiz.title,
          description: datosQuiz.description,
          timeLimit: datosQuiz.timeLimit,
          maxGrade: puntosTotales,
          dueDate: datosQuiz.dueDate || undefined,
          acceptLateSubmissions: datosQuiz.acceptLateSubmissions,
          allowSeeResults: datosQuiz.allowSeeResults,
          totalScore: puntosTotales,
        },
      });

      if (idsPreguntasEliminadas.length > 0) {
        await deleteQuestionsBulk.mutateAsync({ quizId: datosQuiz.id, questionIds: idsPreguntasEliminadas });
      }

      const preguntasNuevas = preguntasEdicion.filter((q) => q.id.startsWith("temp_"));
      const preguntasExistentes = preguntasEdicion.filter((q) => !q.id.startsWith("temp_"));

      if (preguntasNuevas.length > 0) {
        await addQuestionsBulk.mutateAsync({
          quizId: datosQuiz.id,
          questions: preguntasNuevas.map((q) => ({
            question: q.question,
            type: q.type,
            points: q.points,
            options: q.type === "multiple-choice" ? q.options : undefined,
            correctAnswer: q.type === "multiple-choice" ? q.correctAnswer : undefined,
            expectedAnswer: q.type === "open-ended" ? q.expectedAnswer : undefined,
          })) as Omit<Question, "id" | "text" | "maxPoints">[],
        });
      }

      if (preguntasExistentes.length > 0) {
        await updateQuestionsBulk.mutateAsync({
          quizId: datosQuiz.id,
          updates: preguntasExistentes.map((q) => ({
            questionId: q.id,
            questionText: q.question,
            type: q.type,
            points: q.points,
            options: q.type === "multiple-choice" ? q.options : undefined,
            correctAnswer: q.type === "multiple-choice" ? q.correctAnswer : undefined,
            expectedAnswer: q.type === "open-ended" ? q.expectedAnswer : undefined,
            action: "UPDATE_ALL" as const,
          })),
        });
      }

      setEditandoPreguntas(false);
      setIdsPreguntasEliminadas([]);
      await refetch();
    } catch (error) {
      console.error("Error al actualizar las preguntas:", error);
      alert("Error al guardar las preguntas. Por favor, intente de nuevo.");
    }
  };

  const handleCancelarConfiguracion = () => {
    setDatosEdicion({
      title: datosQuiz.title,
      description: datosQuiz.description,
      timeLimit: datosQuiz.timeLimit.toString(),
      maxGrade: datosQuiz.maxGrade,
      dueDate: datosQuiz.dueDate ?? "",
      acceptLateSubmissions: datosQuiz.acceptLateSubmissions,
      allowSeeResults: datosQuiz.allowSeeResults,
      totalScore: datosQuiz.maxGrade ?? 100,
    });
    setModoEdicion(false);
    setMostrarPrevisualizacionRedistribucion(false);
  };

  const handleCancelarPreguntas = () => {
    setPreguntasEdicion(datosQuiz.questions ?? []);
    setIdsPreguntasEliminadas([]);
    setEditandoPreguntas(false);
  };

  const agregarNuevaPregunta = (tipo: "multiple-choice" | "open-ended") => {
    const cantidadPreguntas = preguntasEdicion.length;
    const puntosPorDefecto = cantidadPreguntas > 0
      ? Math.round(puntosTotales / cantidadPreguntas)
      : 10;

    const nuevaPregunta: Question = {
      id: "temp_" + Date.now(),
      type: tipo,
      question: "",
      points: puntosPorDefecto,
      text: "",
      maxPoints: puntosPorDefecto,
      ...(tipo === "multiple-choice" && { options: ["", "", "", ""], correctAnswer: 0 }),
      ...(tipo === "open-ended" && { expectedAnswer: "" }),
    };
    setPreguntasEdicion([...preguntasEdicion, nuevaPregunta]);
  };

  const actualizarPreguntaEdicion = (id: string, actualizaciones: Partial<Question>) =>
    setPreguntasEdicion(preguntasEdicion.map((q) => (q.id === id ? { ...q, ...actualizaciones } : q)));

  const eliminarPreguntaEdicion = (id: string) => {
    setPreguntasEdicion(preguntasEdicion.filter((q) => q.id !== id));
    if (!id.startsWith("temp_")) setIdsPreguntasEliminadas([...idsPreguntasEliminadas, id]);
  };

  const actualizarOpcion = (idPregunta: string, indiceOpcion: number, valor: string) =>
    setPreguntasEdicion(
      preguntasEdicion.map((q) => {
        if (q.id === idPregunta && q.options) {
          const nuevasOpciones = [...q.options];
          nuevasOpciones[indiceOpcion] = valor;
          return { ...q, options: nuevasOpciones };
        }
        return q;
      })
    );

  const agregarOpcion = (idPregunta: string) =>
    setPreguntasEdicion(
      preguntasEdicion.map((q) =>
        q.id === idPregunta && q.options ? { ...q, options: [...q.options, ""] } : q
      )
    );

  const eliminarOpcion = (idPregunta: string, indiceOpcion: number) =>
    setPreguntasEdicion(
      preguntasEdicion.map((q) => {
        if (q.id === idPregunta && q.options && q.options.length > 2) {
          const nuevasOpciones = q.options.filter((_, i) => i !== indiceOpcion);
          const nuevaCorrecta =
            q.correctAnswer === indiceOpcion
              ? 0
              : (q.correctAnswer ?? 0) > indiceOpcion
              ? (q.correctAnswer ?? 0) - 1
              : q.correctAnswer;
          return { ...q, options: nuevasOpciones, correctAnswer: nuevaCorrecta };
        }
        return q;
      })
    );

  const formatearFecha = (d: string | null | undefined) => {
    if (!d) return "Sin fecha establecida";
    return new Date(d).toLocaleDateString("es-ES", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };
  const formatearFechaCreacion = (d: string) =>
    new Date(d).toLocaleDateString("es-ES", {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  const obtenerTiempoRestante = (fechaEntrega: string | null | undefined) => {
    if (!fechaEntrega) return { text: "Sin fecha de entrega", color: "secondary" as const };
    const diffMs = new Date(fechaEntrega).getTime() - Date.now();
    const diffDias = Math.ceil(diffMs / 86_400_000);
    if (diffMs < 0) return { text: "Vencido", color: "destructive" as const };
    if (diffDias === 0) {
      const hrs = Math.ceil(diffMs / 3_600_000);
      return hrs <= 0
        ? { text: "Vence en la próxima hora", color: "destructive" as const }
        : { text: `Vence en ${hrs}h`, color: "default" as const };
    }
    if (diffDias === 1) return { text: "Vence mañana", color: "default" as const };
    return { text: `Vence en ${diffDias} días`, color: diffDias <= 7 ? ("default" as const) : ("secondary" as const) };
  };

  const tiempoRestante = obtenerTiempoRestante(datosQuiz.dueDate);

  if (cargandoQuiz) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span>Cargando detalles del quiz…</span>
        </div>
      </div>
    );
  }

  if (errorQuiz) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="p-6 border-destructive/30 bg-destructive/5">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-6 w-6 text-destructive flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-destructive">
                  Error al Cargar los Detalles del Quiz
                </h3>
                <p className="text-destructive/80">
                  {errorQuiz instanceof Error ? errorQuiz.message : "No se pudo cargar la información del quiz."}
                </p>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => refetch()}>Reintentar</Button>
                  <Button variant="ghost" size="sm" onClick={onClose}>Cerrar</Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
  <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
    <div className="max-w-6xl mx-auto space-y-8">

      <div className="space-y-4">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Volver a Recursos
        </button>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-bold border border-primary/20">
                QUIZ
              </span>
              {datosQuiz.active === false && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-xs font-semibold">
                  <EyeOff className="w-3 h-3" /> Inactivo
                </span>
              )}
              {datosQuiz.availableNow && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-semibold">
                  <Eye className="w-3 h-3" /> Disponible
                </span>
              )}
            </div>

            {modoEdicion ? (
              <input
                value={datosEdicion.title}
                onChange={(e) => setDatosEdicion((p) => ({ ...p, title: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-2xl sm:text-3xl font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all mb-3"
              />
            ) : (
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight mb-3">
                {datosQuiz.title}
              </h1>
            )}

            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              {datosQuiz.timeLimit > 0 && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />{datosQuiz.timeLimit} min
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calculator className="w-3.5 h-3.5" />Puntos Totales: {puntosTotales}
              </span>
              <span className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" />{preguntasEdicion.length} Preguntas
              </span>
            </div>
          </div>

          {tipoUsuario === "teacher" && (
            <div className="flex flex-wrap gap-2 self-start">
              {modoEdicion ? (
                <>
                  <button
                    onClick={handleGuardarConfiguracion}
                    disabled={cargando}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 disabled:opacity-40 transition-all"
                  >
                    {updateQuiz.isPending
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : <Save className="w-3.5 h-3.5" />}
                    Guardar Configuración
                  </button>
                  <button
                    onClick={handleCancelarConfiguracion}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Cancelar
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setModoEdicion(true)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                  >
                    <Edit className="w-3.5 h-3.5" /> Editar Configuración
                  </button>
                  <button
                    onClick={onClose}
                    className="px-3 py-2 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                  >
                    Cerrar
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="lg:col-span-2 space-y-5">

          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="px-5 py-4 sm:px-6 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-primary" />
                </span>
                <h2 className="text-base font-bold text-foreground">Descripción del Quiz</h2>
              </div>
            </div>
            <div className="px-5 py-5 sm:px-6">
              {modoEdicion ? (
                <textarea
                  value={datosEdicion.description}
                  onChange={(e) => setDatosEdicion((p) => ({ ...p, description: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 resize-none transition-all"
                />
              ) : (
                <p className="text-foreground whitespace-pre-wrap leading-relaxed text-sm">
                  {datosQuiz.description}
                </p>
              )}
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="px-5 py-4 sm:px-6 border-b border-border">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-foreground">Preguntas</h2>
                  <span className="px-2 py-0.5 rounded-md border border-border text-xs font-semibold text-muted-foreground">
                    {preguntasEdicion.length} Total
                  </span>
                </div>

                {tipoUsuario === "teacher" && (
                  <div className="flex flex-wrap gap-2">
                    {editandoPreguntas ? (
                      <>
                        <button
                          onClick={handleGuardarPreguntas}
                          disabled={cargando}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 disabled:opacity-40 transition-all"
                        >
                          {cargando ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                          Guardar
                        </button>
                        <button
                          onClick={handleCancelarPreguntas}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Cancelar
                        </button>
                        <button
                          onClick={() => agregarNuevaPregunta("multiple-choice")}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                        >
                          <Plus className="w-3 h-3" /> Opción Múltiple
                        </button>
                        <button
                          onClick={() => agregarNuevaPregunta("open-ended")}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                        >
                          <Plus className="w-3 h-3" /> Respuesta Abierta
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setEditandoPreguntas(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                      >
                        <Edit className="w-3.5 h-3.5" /> Editar Preguntas
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="px-5 py-5 sm:px-6">
              {preguntasEdicion.length > 0 ? (
                <div className="space-y-6">

                  {editandoPreguntas && (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold ${
                      puntosTotales === datosEdicion.totalScore
                        ? 'bg-primary/10 text-primary'
                        : 'bg-accent/10 text-accent-foreground'
                    }`}>
                      <Calculator className="w-3.5 h-3.5" />
                      {puntosTotales} pts total
                    </span>
                  )}

                  {preguntasEdicion.map((pregunta, indice) => (
                    <div key={pregunta.id} className="border-l-4 border-primary pl-4">
                      {editandoPreguntas && tipoUsuario === "teacher" ? (

                        /* ── Modo edición ── */
                        <div className="p-4 bg-muted/20 rounded-2xl border border-border space-y-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <GripVertical className="w-4 h-4 text-muted-foreground cursor-move flex-shrink-0 mt-2.5" />
                              <div className="flex-1 min-w-0 space-y-2">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                                    pregunta.type === "multiple-choice"
                                      ? 'bg-primary/10 text-primary'
                                      : 'bg-muted text-muted-foreground'
                                  }`}>
                                    Pregunta {indice + 1}
                                  </span>
                                  <span className="px-2 py-0.5 rounded-md border border-border text-xs text-muted-foreground">
                                    {pregunta.type === "multiple-choice" ? "Opción Múltiple" : "Respuesta Abierta"}
                                  </span>
                                  {pregunta.id.startsWith("temp_") && (
                                    <span className="px-2 py-0.5 rounded-md bg-accent/20 text-accent-foreground text-xs font-semibold">Nueva</span>
                                  )}
                                </div>
                                <input
                                  value={pregunta.question}
                                  onChange={(e) => actualizarPreguntaEdicion(pregunta.id, { question: e.target.value })}
                                  placeholder="Ingrese su pregunta"
                                  className="input-field"
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <input
                                type="number"
                                value={pregunta.points}
                                onChange={(e) => actualizarPreguntaEdicion(pregunta.id, { points: parseInt(e.target.value) || 0 })}
                                min="1"
                                className="w-16 px-3 py-2 rounded-xl border border-border bg-background text-sm text-right text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all"
                              />
                              <span className="text-xs text-muted-foreground">pts</span>
                              <button
                                onClick={() => eliminarPreguntaEdicion(pregunta.id)}
                                className="p-1.5 rounded-xl text-destructive hover:bg-destructive/10 transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {pregunta.type === "multiple-choice" && pregunta.options && (
                            <div className="space-y-2 sm:ml-7">
                              <div className="flex items-center justify-between">
                                <label className="text-xs font-semibold text-muted-foreground">Opciones de Respuesta</label>
                                <button
                                  onClick={() => agregarOpcion(pregunta.id)}
                                  className="flex items-center gap-1 px-2.5 py-1 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                                >
                                  <Plus className="w-3 h-3" /> Agregar Opción
                                </button>
                              </div>
                              {pregunta.options.map((opcion, indiceOpcion) => (
                                <div key={indiceOpcion} className="flex items-center gap-3">
                                  <input
                                    type="radio"
                                    name={`correct-${pregunta.id}`}
                                    checked={pregunta.correctAnswer === indiceOpcion}
                                    onChange={() => actualizarPreguntaEdicion(pregunta.id, { correctAnswer: indiceOpcion })}
                                    className="w-4 h-4 accent-primary flex-shrink-0"
                                  />
                                  <span className="text-xs font-bold text-muted-foreground w-5 flex-shrink-0">
                                    {String.fromCharCode(65 + indiceOpcion)})
                                  </span>
                                  <input
                                    value={opcion}
                                    onChange={(e) => actualizarOpcion(pregunta.id, indiceOpcion, e.target.value)}
                                    placeholder={`Opción ${indiceOpcion + 1}`}
                                    className="flex-1 px-4 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all"
                                  />
                                  {pregunta.options && pregunta.options.length > 2 && (
                                    <button
                                      onClick={() => eliminarOpcion(pregunta.id, indiceOpcion)}
                                      className="p-1.5 rounded-xl text-destructive hover:bg-destructive/10 transition-all flex-shrink-0"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {pregunta.type === "open-ended" && (
                            <div className="sm:ml-7 space-y-1.5">
                              <label className="text-xs font-semibold text-primary">
                                Respuesta Modelo / Respuesta Esperada
                              </label>
                              <textarea
                                value={pregunta.expectedAnswer ?? ""}
                                onChange={(e) => actualizarPreguntaEdicion(pregunta.id, { expectedAnswer: e.target.value })}
                                placeholder="Ingrese la respuesta esperada…"
                                rows={3}
                                className="w-full px-4 py-2.5 rounded-xl border border-border bg-muted/40 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 resize-none transition-all"
                              />
                            </div>
                          )}
                        </div>

                      ) : (

                        /* ── Modo visualización ── */
                        <>
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0">
                              {indice + 1}
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded-md border border-border text-xs text-muted-foreground">
                                {pregunta.points ?? 0} puntos
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-xs font-semibold">
                                {pregunta.type === "multiple-choice" ? "Opción Múltiple" : "Respuesta Abierta"}
                              </span>
                            </div>
                          </div>

                          <h3 className="text-sm font-semibold text-foreground mb-4 whitespace-pre-wrap">
                            {pregunta.question}
                          </h3>

                          {pregunta.type === "multiple-choice" && pregunta.options && (
                            <div className="space-y-2 sm:ml-4">
                              {pregunta.options.map((opcion, indiceOpcion) => {
                                const esCorrecta = pregunta.correctAnswer === indiceOpcion;
                                const resaltar = tipoUsuario === "teacher" && mostrarRespuestasCorrectas && esCorrecta;
                                return (
                                  <div
                                    key={indiceOpcion}
                                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                                      resaltar
                                        ? 'border-primary/40 bg-primary/8'
                                        : 'border-border hover:bg-muted/30'
                                    }`}
                                  >
                                    <div className={`w-7 h-7 rounded-xl border-2 flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                                      resaltar
                                        ? 'border-primary bg-primary text-primary-foreground'
                                        : 'border-border text-muted-foreground'
                                    }`}>
                                      {String.fromCharCode(65 + indiceOpcion)}
                                    </div>
                                    <span className={`text-sm flex-1 ${resaltar ? 'font-semibold text-primary' : 'text-foreground'}`}>
                                      {opcion}
                                    </span>
                                    {resaltar && <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {pregunta.type === "open-ended" && (
                            <div className="sm:ml-4 space-y-3">
                              <div className="p-4 bg-muted/30 rounded-xl border-2 border-dashed border-border">
                                <span className="px-2 py-0.5 rounded-md border border-border text-xs text-muted-foreground">
                                  Área de Respuesta del Estudiante
                                </span>
                                <p className="text-xs text-muted-foreground italic mt-2">
                                  Los estudiantes escribirán su respuesta aquí
                                </p>
                              </div>
                              {tipoUsuario === "teacher" && pregunta.expectedAnswer && (
                                <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
                                  <span className="px-2 py-0.5 rounded-md border border-primary/20 text-xs text-primary font-semibold">
                                    Respuesta Esperada
                                  </span>
                                  <p className="text-sm text-foreground whitespace-pre-wrap mt-2">
                                    {pregunta.expectedAnswer}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}

                          <div className="mt-5 border-b border-border/50" />
                        </>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                  <FileText className="w-10 h-10 mb-3 opacity-30" />
                  <p className="text-sm">Aún no se han agregado preguntas.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">

          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <h3 className="section-label">
                Detalles del Quiz
              </h3>
            </div>
            <div className="px-4 py-4 space-y-4">

              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Fecha de Entrega
                </p>
                {modoEdicion ? (
                  <input
                    type="datetime-local"
                    value={datosEdicion.dueDate}
                    onChange={(e) => setDatosEdicion((p) => ({ ...p, dueDate: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all"
                  />
                ) : (
                  <>
                    <p className="text-sm font-semibold text-foreground">{formatearFecha(datosQuiz.dueDate)}</p>
                    {datosQuiz.dueDate && (
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-primary/10 text-primary`}>
                        <Clock className="w-3 h-3" /> {tiempoRestante.text}
                      </span>
                    )}
                  </>
                )}
              </div>

              <div className="border-t border-border/50" />

              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Límite de Tiempo
                </p>
                {modoEdicion ? (
                  <input
                    type="number"
                    value={datosEdicion.timeLimit}
                    onChange={(e) => setDatosEdicion((p) => ({ ...p, timeLimit: e.target.value }))}
                    min="0"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all"
                  />
                ) : (
                  <p className="text-sm font-semibold text-foreground">
                    {datosQuiz.timeLimit > 0 ? `${datosQuiz.timeLimit} minutos` : "Sin límite de tiempo"}
                  </p>
                )}
              </div>

              <div className="border-t border-border/50" />

              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                  <Award className="w-3 h-3" /> Puntos y Calificación
                </p>
                {[
                  { label: 'Puntos Totales (suma)', value: <span className="font-bold text-foreground">{puntosTotales}</span> },
                  {
                    label: 'Calificación Máx.',
                    value: modoEdicion ? (
                      <input
                        type="number"
                        value={datosEdicion.maxGrade}
                        onChange={(e) => setDatosEdicion((p) => ({ ...p, maxGrade: parseInt(e.target.value) || 0 }))}
                        min="1"
                        className="w-16 px-2 py-1 rounded-lg border border-border bg-background text-xs text-right text-foreground focus:outline-none focus:ring-1 focus:ring-ring/50"
                      />
                    ) : <span className="text-xs text-foreground">{datosQuiz.maxGrade ?? 100}</span>
                  },
                  { label: 'Opción Múltiple', value: <span className="text-xs text-foreground">{cantidadOpcionMultiple}</span> },
                  { label: 'Respuesta Abierta', value: <span className="text-xs text-foreground">{cantidadRespuestaAbierta}</span> },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground">{label}:</span>
                    {value}
                  </div>
                ))}
              </div>

              <div className="border-t border-border/50" />

              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                  <Award className="w-3 h-3" /> Puntuación Total
                </p>
                {modoEdicion ? (
                  <div className="space-y-1.5">
                    <input
                      type="number"
                      value={datosEdicion.totalScore}
                      onChange={(e) => setDatosEdicion((p) => ({ ...p, totalScore: parseInt(e.target.value) || 0 }))}
                      min="1"
                      className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all"
                    />
                    {preguntasEdicion.filter((q) => !q.id.startsWith("temp_")).length > 0 && (
                      <button
                        type="button"
                        onClick={() => setMostrarPrevisualizacionRedistribucion((v) => !v)}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Info className="w-3 h-3" />
                        {mostrarPrevisualizacionRedistribucion ? "Ocultar" : "Previsualizar"} redistribución de puntos
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="text-sm font-semibold text-foreground">
                    {datosQuiz.maxGrade ?? datosQuiz.maxGrade ?? 100}
                  </p>
                )}
              </div>

              {modoEdicion && mostrarPrevisualizacionRedistribucion && previsualizacionRedistribucion.length > 0 && (
                <div className="rounded-xl border border-border overflow-hidden">
                  <div className="bg-muted/40 px-3 py-2 section-label">
                    Previsualización de Redistribución de Puntos
                  </div>
                  <div className="divide-y divide-border/50">
                    {previsualizacionRedistribucion.map((fila, i) => (
                      <div key={fila.id} className="px-3 py-2 flex items-center gap-2 text-xs">
                        <span className="text-muted-foreground w-5 flex-shrink-0">P{i + 1}</span>
                        <span className="flex-1 truncate text-muted-foreground" title={fila.question}>
                          {fila.question.length > 28 ? fila.question.slice(0, 28) + "…" : fila.question}
                        </span>
                        <span className="text-muted-foreground">{fila.weight}%</span>
                        <span className="text-muted-foreground">=</span>
                        <span className="font-semibold text-foreground tabular-nums">{fila.newPoints} pts</span>
                      </div>
                    ))}
                    <div className="px-3 py-2 flex justify-between text-xs font-bold bg-muted/30 text-foreground">
                      <span>TOTAL</span>
                      <span>{previsualizacionRedistribucion.reduce((s, r) => +(s + r.newPoints).toFixed(2), 0)} pts</span>
                    </div>
                  </div>
                  <p className="px-3 py-2 text-xs text-muted-foreground bg-primary/5">
                    Los puntos se redistribuirán proporcionalmente al guardar.
                  </p>
                </div>
              )}

              <div className="border-t border-border/50" />

              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-muted-foreground">Entregas Tardías</p>
                {modoEdicion ? (
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={datosEdicion.acceptLateSubmissions}
                      onCheckedChange={(checked) => setDatosEdicion((p) => ({ ...p, acceptLateSubmissions: checked }))}
                    />
                    <label className="text-xs text-foreground">Permitir entregas tardías</label>
                  </div>
                ) : (
                  <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-semibold ${
                    datosQuiz.acceptLateSubmissions
                      ? 'bg-primary/10 text-primary'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {datosQuiz.acceptLateSubmissions ? "Permitidas" : "No permitidas"}
                  </span>
                )}
              </div>

              <div className="border-t border-border/50" />

              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-muted-foreground">Visibilidad de Resultados para Estudiantes</p>
                {modoEdicion ? (
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={datosEdicion.allowSeeResults}
                      onCheckedChange={(checked) => setDatosEdicion((p) => ({ ...p, allowSeeResults: checked }))}
                    />
                    <label className="text-xs text-foreground">Permitir que los estudiantes vean los resultados</label>
                  </div>
                ) : (
                  <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-semibold ${
                    datosQuiz.allowSeeResults
                      ? 'bg-primary/10 text-primary'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {datosQuiz.allowSeeResults ? "Resultados visibles" : "Resultados ocultos"}
                  </span>
                )}
              </div>

              <div className="border-t border-border/50" />

              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground">Información de Creación</p>
                {[
                  { label: 'Creado', value: formatearFechaCreacion(datosQuiz.createdAt ?? new Date().toISOString()) },
                  ...(datosQuiz.courseName ? [{ label: 'Curso', value: datosQuiz.courseName }] : []),
                  ...((datosQuiz as any).unitName ? [{ label: 'Unidad', value: (datosQuiz as any).unitName }] : []),
                ].map(({ label, value }) => (
                  <p key={label} className="text-xs text-foreground">
                    <span className="text-muted-foreground">{label}: </span>{value}
                  </p>
                ))}
              </div>

            </div>
          </div>

          {tipoUsuario === "teacher" && !editandoPreguntas && preguntasEdicion.some((q) => q.type === "multiple-choice") && (
            <div className="bg-card rounded-2xl border border-border shadow-sm p-4 space-y-3">
              <h3 className="section-label">
                Visibilidad de Respuestas
              </h3>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground">Mostrar Respuestas Correctas</label>
                <Switch checked={mostrarRespuestasCorrectas} onCheckedChange={setMostrarRespuestasCorrectas} />
              </div>
              <p className="text-xs text-muted-foreground">
                Active para mostrar/ocultar las respuestas correctas en la sección de preguntas
              </p>
            </div>
          )}

        </div>
      </div>

      <div className="pt-6 border-t border-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            Última actualización: {formatearFechaCreacion(datosQuiz.createdAt ?? new Date().toISOString())}
          </p>
          <button
            onClick={onClose}
            className="flex items-center justify-center px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
          >
            Cerrar
          </button>
        </div>
      </div>

    </div>
  </div>
);
}
