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
  BarChart3,
  Users,
  Clock,
  ChevronDown,
  ChevronUp,
  Circle,
  AlertCircle,
  Scale,
  Info,
} from "lucide-react";
import { useQuizMutations, useQuizSubmissionDetail } from "./hooks/quiz-hooks";

interface PropsVistaEntregasQuiz {
  submissionId: string;
  onBack: () => void;
  /** Puntuación total del quiz (ej. 22). Se usa para la calificación basada en pesos.
   *  Si no se proporciona, se usa la suma de los puntos máximos de las preguntas. */
  puntuacionTotalQuiz?: number;
}

// ─── Ayudantes de pesos ───────────────────────────────────────────────────────────

/**
 * Dada la lista de respuestas de preguntas, calcula el peso (%) de cada pregunta
 * como su proporción de la suma total de puntos máximos.
 * ej. P1 tiene 10pts de 40 totales → peso = 25%
 */
function calcularPesos(
  respuestasPreguntas: { questionId: string; maxPoints: number }[]
): Record<string, number> {
  const totalPuntosMaximos = respuestasPreguntas.reduce((s, q) => s + q.maxPoints, 0);
  if (totalPuntosMaximos === 0) return {};
  const pesos: Record<string, number> = {};
  respuestasPreguntas.forEach((q) => {
    pesos[q.questionId] =
      Math.round((q.maxPoints / totalPuntosMaximos) * 10000) / 100; // % con 2 decimales
  });
  return pesos;
}

/**
 * Calcula la calificación final ponderada escalada a puntuacionTotalQuiz.
 * Fórmula: Σ (puntosObtenidos_i / puntosMaximos_i) * peso_i * puntuacionTotalQuiz
 */
function calcularCalificacionFinalPonderada(
  calificaciones: Record<string, number>,
  respuestasPreguntas: { questionId: string; maxPoints: number }[],
  pesos: Record<string, number>,
  puntuacionTotalQuiz: number
): number {
  let sumaPonderada = 0;
  respuestasPreguntas.forEach((q) => {
    const obtenido = calificaciones[q.questionId] ?? 0;
    const maximo = q.maxPoints;
    const peso = (pesos[q.questionId] ?? 0) / 100; // convertir % a decimal
    if (maximo > 0) {
      sumaPonderada += (obtenido / maximo) * peso;
    }
  });
  return Math.round(sumaPonderada * puntuacionTotalQuiz * 100) / 100;
}

// ─── Componente ────────────────────────────────────────────────────────────────

export function QuizSubmissionsView({
  submissionId,
  onBack,
  puntuacionTotalQuiz,
}: PropsVistaEntregasQuiz) {
  const { gradeSubmission } = useQuizMutations();

  const {
    data: detalleEntrega,
    isLoading: cargandoEntrega,
    error: errorEntrega,
  } = useQuizSubmissionDetail(submissionId);

  const [calificaciones, setCalificaciones] = React.useState<Record<string, number>>({});
  const [retroalimentaciones, setRetroalimentaciones] = React.useState<Record<string, string>>({});
  const [expandido, setExpandido] = React.useState(true);
  const [calificacionGeneral, setCalificacionGeneral] = React.useState<string>("");
  const [mostrarTablaPesos, setMostrarTablaPesos] = React.useState(false);

  // ── Valores derivados ──────────────────────────────────────────────────────────

  const respuestasPreguntas = detalleEntrega?.questionResponses ?? [];

  /** Puntuación total del quiz (ya sea la propuesta o la suma de puntos máximos) */
  const puntuacionTotalResuelta = React.useMemo(() => {
    if (puntuacionTotalQuiz && puntuacionTotalQuiz > 0) return puntuacionTotalQuiz;
    return respuestasPreguntas.reduce((s, q) => s + q.maxPoints, 0);
  }, [puntuacionTotalQuiz, respuestasPreguntas]);

  /** Peso (%) por pregunta */
  const pesos = React.useMemo(
    () => calcularPesos(respuestasPreguntas),
    [respuestasPreguntas]
  );

  /** Valor de punto ponderado por pregunta = peso% × puntuacionTotalResuelta */
  const valoresPuntosPonderados = React.useMemo(() => {
    const resultado: Record<string, number> = {};
    respuestasPreguntas.forEach((q) => {
      const peso = (pesos[q.questionId] ?? 0) / 100;
      resultado[q.questionId] =
        Math.round(peso * puntuacionTotalResuelta * 100) / 100;
    });
    return resultado;
  }, [pesos, puntuacionTotalResuelta, respuestasPreguntas]);

  /** Calificación final ponderada (escalada a puntuacionTotalResuelta) */
  const calificacionFinalPonderada = React.useMemo(
    () =>
      calcularCalificacionFinalPonderada(
        calificaciones,
        respuestasPreguntas,
        pesos,
        puntuacionTotalResuelta
      ),
    [calificaciones, respuestasPreguntas, pesos, puntuacionTotalResuelta]
  );

  /** Porcentaje de puntuación */
  const porcentajePuntuacion = puntuacionTotalResuelta > 0
    ? Math.round((calificacionFinalPonderada / puntuacionTotalResuelta) * 100)
    : 0;

  // ── Efectos ─────────────────────────────────────────────────────────────────

  React.useEffect(() => {
    if (detalleEntrega?.questionResponses) {
      const calificacionesIniciales: Record<string, number> = {};
      const retroalimentacionesIniciales: Record<string, string> = {};
      detalleEntrega.questionResponses.forEach((respuesta) => {
        calificacionesIniciales[respuesta.questionId] = respuesta.earnedPoints;
        retroalimentacionesIniciales[respuesta.questionId] = respuesta.teacherFeedback ?? "";
      });
      setCalificaciones(calificacionesIniciales);
      setRetroalimentaciones(retroalimentacionesIniciales);
    }
    if (detalleEntrega?.grade?.value) {
      setCalificacionGeneral(detalleEntrega.grade.value);
    }
  }, [detalleEntrega]);

  // ── Manejadores ─────────────────────────────────────────────────────────────────

  const normalizarTexto = (texto: string): string => {
    if (!texto) return "";
    return texto.toLowerCase().replace(/\s+/g, "").replace(/[^\w]/g, "");
  };

  const manejarCambioCalificacion = (preguntaId: string, puntuacion: number) => {
    const pregunta = respuestasPreguntas.find((q) => q.questionId === preguntaId);
    const puntosMaximos = pregunta?.maxPoints ?? 0;
    const puntuacionNormalizada = Math.max(0, Math.min(puntuacion, puntosMaximos));
    setCalificaciones((prev) => ({ ...prev, [preguntaId]: puntuacionNormalizada }));
  };

  const manejarCambioRetroalimentacion = (preguntaId: string, retroalimentacion: string) => {
    setRetroalimentaciones((prev) => ({ ...prev, [preguntaId]: retroalimentacion }));
  };

  const manejarEnvioCalificaciones = () => {
    if (!detalleEntrega) return;

    const actualizacionesCalificacion = respuestasPreguntas.map((q) => ({
      questionId: q.questionId,
      earnedPoints: calificaciones[q.questionId] ?? 0,
      maxPoints: q.maxPoints,
      feedback: retroalimentaciones[q.questionId] ?? "",
    }));

    gradeSubmission.mutate(
      {
        submissionId: detalleEntrega.id,
        grades: actualizacionesCalificacion,
        // Pasar calificación final ponderada escalada a puntuacionTotalResuelta
        overallGrade: {
          earnedPoints: calificacionFinalPonderada,
          totalPoints: puntuacionTotalResuelta,
        },
      },
      {
        onSuccess: (entregaActualizada) => {
          console.log("Calificaciones guardadas exitosamente:", entregaActualizada);
        },
        onError: (error) => {
          console.error("Error al guardar calificaciones:", error);
        },
      }
    );
  };

  // ── Estados de carga / error ────────────────────────────────────────────────

  if (cargandoEntrega) {
    return (
      <div className="p-8 text-center">
        <p>Cargando datos de la entrega...</p>
      </div>
    );
  }

  if (errorEntrega || !detalleEntrega) {
    return (
      <div className="p-8 text-center text-destructive">
        <p>Error al cargar los datos de la entrega</p>
        <Button onClick={onBack} className="mt-4">
          Volver al Inventario
        </Button>
      </div>
    );
  }

  const puntuacionAprobatoria = 70;
  const estaCalificado = detalleEntrega.status === "GRADED";
  const calificacionExistente = detalleEntrega.grade;
  const hayCambioCalificacion =
    estaCalificado &&
    calificacionExistente?.value &&
    String(calificacionFinalPonderada) !== calificacionExistente.value;

  // ── Renderizado ─────────────────────────────────────────────────────────────────
return (
  <div className="p-4 md:p-6 lg:p-8 space-y-6">
    {/* ── Encabezado ── */}
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <Button onClick={onBack} variant="outline" className="gap-2 mb-4 text-sm">
          <ArrowLeft className="h-4 w-4" /> Volver al Inventario
        </Button>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
          {detalleEntrega.quizTitle} — Entrega del Estudiante
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Estudiante: {detalleEntrega.studentName} ({detalleEntrega.studentId})
        </p>
      </div>

      <div className="flex flex-wrap gap-3 text-xs sm:text-sm">
        <div className="flex items-center gap-2 min-w-fit">
          <Users className="h-4 w-4 flex-shrink-0" />
          <span className="text-muted-foreground">
            Entregado: {new Date(detalleEntrega.submittedAt).toLocaleString()}
          </span>
        </div>
        <div className="flex items-center gap-2 min-w-fit">
          <BarChart3 className="h-4 w-4 flex-shrink-0" />
          <span className="text-muted-foreground">
            Puntuación: {porcentajePuntuacion}% ({calificacionFinalPonderada}/{puntuacionTotalResuelta} pts)
          </span>
        </div>
        <div className="flex items-center gap-2 min-w-fit">
          <Clock className="h-4 w-4 flex-shrink-0" />
          <span className="text-muted-foreground">Estado: {detalleEntrega.status}</span>
        </div>
        <div className="flex items-center gap-2 min-w-fit">
          <span className="text-muted-foreground">Intento: {detalleEntrega.attemptNumber}</span>
        </div>
      </div>
    </div>

    {/* ── Advertencia de ya calificado ── */}
    {estaCalificado && calificacionExistente?.value && (
      <Card className="p-4 bg-accent/10 border-2 border-accent/30">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-6 w-6 text-accent-foreground flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-accent-foreground text-base sm:text-lg">
              Esta entrega ya ha sido calificada
            </h3>
            <div className="mt-2 space-y-1 text-sm">
              <p className="text-accent-foreground/90">
                <strong>Calificación Actual:</strong> {calificacionExistente.value} / {calificacionExistente.maxScore} ({calificacionExistente.percentage}%)
              </p>
              <p className="text-xs text-accent-foreground/75 mt-2">
                Puedes modificar las calificaciones a continuación. La calificación existente se conservará hasta que guardes los cambios.
              </p>
            </div>
          </div>
        </div>
      </Card>
    )}

    {/* ── Alternativa de Tabla de Pesos ── */}
    <Card className="p-4 border border-primary/30 bg-primary/5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Scale className="h-5 w-5 text-primary flex-shrink-0" />
          <h3 className="font-semibold text-primary text-sm sm:text-base">
            Distribución de Pesos de Preguntas
          </h3>
          <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            Puntuación Total: {puntuacionTotalResuelta} pts
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setMostrarTablaPesos((v) => !v)}
          className="gap-2 text-sm"
        >
          <Info className="h-4 w-4" />
          {mostrarTablaPesos ? "Ocultar" : "Mostrar"} Tabla de Pesos
        </Button>
      </div>

      {mostrarTablaPesos && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-primary/10">
                <th className="text-left p-2 sm:p-3 border border-primary/30 text-primary font-semibold">
                  Pregunta
                </th>
                <th className="text-left p-2 sm:p-3 border border-primary/30 text-primary font-semibold">
                  Puntos Brutos
                </th>
                <th className="text-left p-2 sm:p-3 border border-primary/30 text-primary font-semibold">
                  Peso (%)
                </th>
                <th className="text-left p-2 sm:p-3 border border-primary/30 text-primary font-semibold">
                  Cálculo
                </th>
                <th className="text-left p-2 sm:p-3 border border-primary/30 text-primary font-semibold">
                  Valor Ponderado
                </th>
                <th className="text-left p-2 sm:p-3 border border-primary/30 text-primary font-semibold">
                  Obtenido (Ponderado)
                </th>
              </tr>
            </thead>
            <tbody>
              {respuestasPreguntas.map((q, idx) => {
                const peso = pesos[q.questionId] ?? 0;
                const vpp = valoresPuntosPonderados[q.questionId] ?? 0;
                const obtenido = calificaciones[q.questionId] ?? 0;
                const ponderadoObtenido =
                  q.maxPoints > 0
                    ? Math.round((obtenido / q.maxPoints) * vpp * 100) / 100
                    : 0;

                return (
                  <tr
                    key={q.questionId}
                    className={idx % 2 === 0 ? "bg-card" : "bg-primary/5"}
                  >
                    <td className="p-2 sm:p-3 border border-primary/30 font-medium text-foreground">
                      Pregunta #{idx + 1}
                    </td>
                    <td className="p-2 sm:p-3 border border-primary/30 text-foreground">
                      {obtenido} / {q.maxPoints}
                    </td>
                    <td className="p-2 sm:p-3 border border-primary/30">
                      <span className="font-semibold text-primary">{peso}%</span>
                    </td>
                    <td className="p-2 sm:p-3 border border-primary/30 text-muted-foreground font-mono text-xs">
                      {puntuacionTotalResuelta} × {(peso / 100).toFixed(2)} × ({obtenido}/{q.maxPoints})
                    </td>
                    <td className="p-2 sm:p-3 border border-primary/30 text-primary font-semibold">
                      {vpp} pts
                    </td>
                    <td className="p-2 sm:p-3 border border-primary/30">
                      <span
                        className={
                          ponderadoObtenido >= vpp * 0.7
                            ? "text-accent font-semibold"
                            : "text-destructive font-semibold"
                        }
                      >
                        {ponderadoObtenido} pts
                      </span>
                    </td>
                   </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-primary/10 font-bold">
                <td className="p-2 sm:p-3 border border-primary/30 text-primary">TOTAL</td>
                <td className="p-2 sm:p-3 border border-primary/30 text-primary">—</td>
                <td className="p-2 sm:p-3 border border-primary/30 text-primary">100%</td>
                <td className="p-2 sm:p-3 border border-primary/30 text-primary">—</td>
                <td className="p-2 sm:p-3 border border-primary/30 text-primary">
                  {puntuacionTotalResuelta} pts
                </td>
                <td className="p-2 sm:p-3 border border-primary/30 text-primary">
                  {calificacionFinalPonderada} pts
                </td>
               </tr>
            </tfoot>
          </table>
        </div>
      )}
    </Card>

    {/* ── Tarjeta de Entrega ── */}
    <Card className="p-4 border-l-4 border-primary">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
        <div>
          <h3 className="font-semibold text-base sm:text-lg text-foreground">
            Estudiante {detalleEntrega.studentName}
          </h3>
          <div className="flex items-center gap-3 mt-2 text-xs sm:text-sm text-muted-foreground flex-wrap">
            <span>Entregado: {new Date(detalleEntrega.submittedAt).toLocaleString()}</span>
            <Badge
              variant={porcentajePuntuacion >= puntuacionAprobatoria ? "default" : "secondary"}
              className="text-xs"
            >
              {porcentajePuntuacion}% ({calificacionFinalPonderada}/{puntuacionTotalResuelta} pts)
            </Badge>
            <span>Estado: {detalleEntrega.status}</span>
            {detalleEntrega.autoGraded && (
              <Badge variant="outline" className="text-xs">Auto-calificado</Badge>
            )}
          </div>
        </div>
        <Button
          onClick={() => setExpandido(!expandido)}
          variant="outline"
          size="sm"
          className="gap-2 text-sm flex-shrink-0"
        >
          {expandido ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
          {expandido ? "Colapsar" : "Expandir"}
        </Button>
      </div>

      {expandido && (
        <div className="space-y-4 mt-4 pt-4 border-t border-border">
          {/* ── Preguntas ── */}
          {respuestasPreguntas.map((pregunta, indice) => {
            const esOpcionMultiple = pregunta.questionType === "MULTIPLE_CHOICE";
            const esRespuestaAbierta = pregunta.questionType === "OPEN_ENDED";
            const puntuacionActual = calificaciones[pregunta.questionId] ?? 0;
            const retroalimentacionActual = retroalimentaciones[pregunta.questionId] ?? "";
            const opcionesSeleccionadasEstudiante = pregunta.selectedOptions ?? [];
            const tieneOpciones = pregunta.options && pregunta.options.length > 0;

            const respuestaEstudianteNormalizada = normalizarTexto(pregunta.textAnswer);
            const respuestaCorrectaNormalizada = normalizarTexto(pregunta.correctAnswer);
            const respuestasCoincidenNormalizadas =
              respuestaEstudianteNormalizada &&
              respuestaCorrectaNormalizada &&
              respuestaEstudianteNormalizada === respuestaCorrectaNormalizada;

            const pesoPregunta = pesos[pregunta.questionId] ?? 0;
            const vppPregunta = valoresPuntosPonderados[pregunta.questionId] ?? 0;
            const ponderadoObtenidoPregunta =
              pregunta.maxPoints > 0
                ? Math.round((puntuacionActual / pregunta.maxPoints) * vppPregunta * 100) / 100
                : 0;

            return (
              <div key={pregunta.questionId} className="p-3 sm:p-4 bg-card/50 rounded-lg border border-border">
                {/* Encabezado de pregunta */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-4 mb-3 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-medium text-foreground text-sm sm:text-base">Pregunta {indice + 1}</h4>
                    <span className="text-xs bg-primary/10 text-primary border border-primary/30 rounded-full px-2 py-0.5 font-semibold">
                      Peso: {pesoPregunta}%
                    </span>
                    <span className="text-xs bg-primary/10 text-primary border border-primary/30 rounded-full px-2 py-0.5 font-semibold">
                      Valor: {vppPregunta} / {puntuacionTotalResuelta} pts
                    </span>
                    <span className="text-xs text-muted-foreground">(Bruto: {pregunta.maxPoints} pts)</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="text-xs">
                      {pregunta.questionType === "MULTIPLE_CHOICE" ? "Opción Múltiple" : "Respuesta Abierta"}
                    </Badge>
                    {pregunta.isAutoGraded && (
                      <Badge variant="outline" className="text-xs">Auto-calificado</Badge>
                    )}
                    {esRespuestaAbierta && !respuestasCoincidenNormalizadas ? (
                      <AlertCircle className="h-4 w-4 text-accent-foreground" />
                    ) : pregunta.isCorrect ? (
                      <CheckCircle className="h-4 w-4 text-accent" />
                    ) : (
                      <XCircle className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                </div>

                <p className="mb-3 font-medium text-foreground text-sm sm:text-base">{pregunta.questionText}</p>

                {/* ── Respuesta del Estudiante ── */}
                <div className="mb-3">
                  <strong className="text-xs sm:text-sm text-foreground">Respuesta del Estudiante:</strong>

                  {esOpcionMultiple && tieneOpciones ? (
                    <div className="mt-2 space-y-2">
                      {pregunta.options.map((opcion, indiceOpcion) => {
                        const estaSeleccionada = opcionesSeleccionadasEstudiante.includes(indiceOpcion);
                        const esOpcionCorrecta = opcion.correct;
                        const esRespuestaEstudianteCorrecta = estaSeleccionada && esOpcionCorrecta;
                        const esRespuestaEstudianteIncorrecta = estaSeleccionada && !esOpcionCorrecta;
                        const esCorrectaPeroNoSeleccionada = !estaSeleccionada && esOpcionCorrecta;

                        return (
                          <div
                            key={indiceOpcion}
                            className={`p-2 sm:p-3 rounded-lg border-2 ${
                              esRespuestaEstudianteCorrecta
                                ? "bg-accent/10 border-accent/50"
                                : esRespuestaEstudianteIncorrecta
                                ? "bg-destructive/10 border-destructive/50"
                                : esCorrectaPeroNoSeleccionada
                                ? "bg-accent/5 border-accent/30"
                                : "bg-muted/30 border-border"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 mt-0.5">
                                {esRespuestaEstudianteCorrecta ? (
                                  <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
                                ) : esRespuestaEstudianteIncorrecta ? (
                                  <XCircle className="h-5 w-5 sm:h-6 sm:w-6 text-destructive" />
                                ) : esCorrectaPeroNoSeleccionada ? (
                                  <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-accent-foreground" />
                                ) : (
                                  <Circle className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
                                )}
                              </div>
                              <div className="flex-1">
                                <span className="font-medium text-sm sm:text-base text-foreground">
                                  {String.fromCharCode(65 + indiceOpcion)}. {opcion.text}
                                </span>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {estaSeleccionada && (
                                    <Badge
                                      variant="outline"
                                      className={`text-xs ${
                                        esOpcionCorrecta
                                          ? "border-accent text-accent bg-accent/10"
                                          : "border-destructive text-destructive bg-destructive/10"
                                      }`}
                                    >
                                      ✓ Seleccionada
                                    </Badge>
                                  )}
                                  {esOpcionCorrecta && (
                                    <Badge
                                      className={`text-xs ${
                                        estaSeleccionada
                                          ? "bg-accent text-accent-foreground"
                                          : "bg-primary text-primary-foreground"
                                      }`}
                                    >
                                      {estaSeleccionada ? "✓ Correcta" : "★ Respuesta Correcta"}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : esRespuestaAbierta ? (
                    <div className="mt-2 space-y-4">
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">
                          Respuesta del Estudiante:
                        </label>
                        <Textarea
                          value={pregunta.textAnswer || "No se proporcionó respuesta"}
                          readOnly
                          className={`min-h-[80px] sm:min-h-[100px] text-sm ${
                            respuestasCoincidenNormalizadas
                              ? "bg-accent/10 border-accent/50"
                              : ""
                          }`}
                        />
                      </div>
                      {pregunta.correctAnswer && (
                        <div className="p-3 sm:p-4 bg-primary/5 rounded-lg border-2 border-primary/30">
                          <label className="text-xs sm:text-sm text-primary font-semibold block mb-2">
                            Respuesta Esperada:
                          </label>
                          <p className="text-xs sm:text-sm text-primary">{pregunta.correctAnswer}</p>
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>

                {/* ── Sección de Calificación ── */}
                <div className="mt-4 sm:mt-6 pt-4 border-t border-border space-y-4">
                  {/* Vista previa de puntuación ponderada */}
                  <div className="p-3 bg-primary/5 border border-primary/30 rounded-lg flex flex-col sm:flex-row sm:items-center gap-3 text-xs sm:text-sm">
                    <div className="flex items-center gap-1.5">
                      <Scale className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-primary font-semibold">Puntuación Ponderada:</span>
                      <span className="font-bold text-primary">
                        {ponderadoObtenidoPregunta} / {vppPregunta} pts
                      </span>
                    </div>
                    <span className="text-muted-foreground text-xs">
                      ({puntuacionActual}/{pregunta.maxPoints} brutos × {pesoPregunta}% peso)
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <label className="text-xs sm:text-sm font-medium text-foreground">Puntos Brutos:</label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Ajustar puntuación (0 – {pregunta.maxPoints} puntos)
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        max={pregunta.maxPoints}
                        value={puntuacionActual}
                        onChange={(e) =>
                          manejarCambioCalificacion(
                            pregunta.questionId,
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-20 text-sm"
                      />
                      <span className="text-xs sm:text-sm text-muted-foreground">
                        / {pregunta.maxPoints}
                      </span>
                    </div>
                  </div>

                  {/* Retroalimentación */}
                  <div>
                    <label className="text-xs sm:text-sm font-medium block mb-2 text-foreground">
                      Retroalimentación del Profesor (Opcional):
                    </label>
                    <Textarea
                      value={retroalimentacionActual}
                      onChange={(e) =>
                        manejarCambioRetroalimentacion(pregunta.questionId, e.target.value)
                      }
                      placeholder="Proporcionar retroalimentación para esta pregunta..."
                      className="min-h-[70px] sm:min-h-[80px] text-sm"
                    />
                    {pregunta.teacherFeedback &&
                      pregunta.teacherFeedback !== retroalimentacionActual && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Retroalimentación anterior: {pregunta.teacherFeedback}
                        </p>
                      )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* ── Gestión de Calificación General ── */}
          <Card className="p-4 bg-primary/5 border border-primary/30">
            <h4 className="font-semibold text-primary mb-3 text-sm sm:text-base">
              Gestión de Calificación General
            </h4>

            {estaCalificado && calificacionExistente?.value && (
              <div className="mb-4 p-3 bg-card rounded-lg border border-primary/30">
                <p className="text-xs sm:text-sm font-semibold text-primary mb-1">
                  Calificación Actual:
                </p>
                <p className="text-base sm:text-lg font-bold text-primary">
                  {calificacionExistente.value} / {calificacionExistente.maxScore} ({calificacionExistente.percentage}%)
                </p>
              </div>
            )}

            {/* Visualización de calificación ponderada auto-calculada */}
            <div className="p-3 bg-card rounded-lg border border-primary/30 mb-4">
              <p className="text-xs sm:text-sm font-semibold text-primary mb-1">
                Calificación Ponderada Auto-Calculada:
              </p>
              <p className="text-base sm:text-lg font-bold text-primary">
                {calificacionFinalPonderada} / {puntuacionTotalResuelta} pts ({porcentajePuntuacion}%)
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Calculada a partir de los pesos de las preguntas × puntuaciones brutas
              </p>
            </div>

            {hayCambioCalificacion && (
              <div className="p-3 bg-accent/10 rounded-lg border border-accent/30">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-accent-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs sm:text-sm text-accent-foreground font-semibold">
                      La calificación será actualizada
                    </p>
                    <p className="text-xs text-accent-foreground/75 mt-1">
                      Anterior: {calificacionExistente?.value} → Nueva: {calificacionFinalPonderada}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* ── Resumen de Puntuación ── */}
          <Card className="p-4 bg-primary/5 border border-primary/30">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div>
                <h4 className="font-semibold text-primary text-sm sm:text-base">
                  Resumen de Puntuación Total
                </h4>
                <div className="mt-2 space-y-1 text-xs sm:text-sm">
                  <p className="text-primary">
                    Calificación ponderada:{" "}
                    <strong>
                      {calificacionFinalPonderada} / {puntuacionTotalResuelta} pts ({porcentajePuntuacion}%)
                    </strong>
                  </p>
                  <p className="text-primary">
                    Puntuación aprobatoria: {puntuacionAprobatoria}% requerido
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl sm:text-2xl font-bold text-primary">
                  {calificacionFinalPonderada} / {puntuacionTotalResuelta}
                </div>
                <Badge
                  variant={porcentajePuntuacion >= puntuacionAprobatoria ? "default" : "secondary"}
                  className="mt-2 text-xs"
                >
                  {porcentajePuntuacion >= puntuacionAprobatoria ? "✓ APROBADO" : "✗ NO APROBADO"}
                </Badge>
              </div>
            </div>
          </Card>

          {/* ── Botón Guardar ── */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              onClick={manejarEnvioCalificaciones}
              disabled={gradeSubmission.isPending}
              size="sm"
              className="text-sm"
            >
              {gradeSubmission.isPending ? "Guardando..." : "Guardar Todas las Calificaciones"}
            </Button>
          </div>
        </div>
      )}
    </Card>
  </div>
);
}