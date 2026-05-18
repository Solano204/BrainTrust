//DARK
"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Clock,
  AlertTriangle,
  MessageSquare,
  FileText,
  ArrowRight,
  Trash2,
  X,
  ClipboardList,
  Check,
  Loader2,
  Calendar,
  Users,
  User as UserIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CourseResourceType,
  Assignment,
  Quiz,
} from "@/app/domain/entities/CourseEntities";
import { useAuth } from "@/app/context/AuthContext";
import { VistaTareaEstudiante } from "../student/tasks-transactional-view-student";
import { VistaQuizEstudiante } from "../student/quiz-transactional-view-student";
import { VistaQuiz as VistaQuizProfesor } from "../teacher/quiz-view-information-teacher";
import { VistaInfoTarea } from "../teacher/task-view-information-teacher";
import {
  useQuizSubmission,
  useTaskSubmission,
} from "@/components/teacher-student/hooks/submission-hooks";
import { TimelineSectionSkeleton } from "../sketons/timeline-skeleton";
import { useQuizDetail } from "@/app/presentation/hooks/calendar/quiz-hooks";
import { useUserTeam } from "./hooks/team-hooks";

import { useThisWeekTasks } from "@/app/presentation/hooks/calendar/task-hooks";
import { useThisWeekQuizzes } from "@/app/presentation/hooks/calendar/quiz-hooks";

export type DatosRecursoLineaTiempo = Assignment | Quiz;

const obtenerTipoRecurso = (
  recurso: DatosRecursoLineaTiempo
): CourseResourceType => {
  if ("questions" in recurso) return "QUIZ";
  return "ASSIGNMENT";
};

const obtenerIconoRecurso = (recurso: DatosRecursoLineaTiempo): React.ElementType => {
  const tipo = obtenerTipoRecurso(recurso);
  if (tipo === "ASSIGNMENT") {
    const tarea = recurso as Assignment;
    return tarea.deliveryMode === "TEAM" ? Users : AlertTriangle;
  }
  return ClipboardList;
};

const obtenerTextoPlazoRecurso = (recurso: DatosRecursoLineaTiempo): string => {
  const fechaEntrega = "dueDate" in recurso ? recurso.dueDate : null;

  if (!fechaEntrega) return "Sin fecha límite";

  const diasHastaEntrega = obtenerDiasHastaEntrega(fechaEntrega);

  if (diasHastaEntrega < 0) return "VENCIDO";
  if (diasHastaEntrega === 0) return "Vence hoy";
  if (diasHastaEntrega === 1) return "Vence mañana";
  if (diasHastaEntrega <= 2) return `Vence en ${diasHastaEntrega} días`;
  if (diasHastaEntrega <= 7) return "Vence esta semana";
  return "Próximamente";
};

const obtenerEstadoRecurso = (
  recurso: DatosRecursoLineaTiempo,
  tipoUsuario: "teacher" | "student",
  userId?: string
): string => {
  const tipo = obtenerTipoRecurso(recurso);
  const fechaEntrega = "dueDate" in recurso ? recurso.dueDate : null;

  if (fechaEntrega && new Date(fechaEntrega) < new Date()) {
    return "VENCIDO - Necesita atención";
  }

  if (tipoUsuario === "teacher") {
    switch (tipo) {
      case "ASSIGNMENT":
        const tarea = recurso as Assignment;
        const entregasPendientes =
          tarea.submissions?.filter(
            (s) => s.status === "SUBMITTED" || s.status === "LATE_SUBMITTED"
          ).length || 0;
        return `${entregasPendientes} entregas necesitan calificación`;
      case "QUIZ":
        return "Necesita revisión";
      default:
        return "Pendiente de revisión";
    }
  } else {
    switch (tipo) {
      case "ASSIGNMENT":
        const tarea = recurso as Assignment;
        const estaEntregado = tarea.submissions?.some(
          (s) => s.studentId === userId
        );
        const modoEntrega =
          tarea.deliveryMode === "TEAM" ? "Grupal" : "Individual";
        return estaEntregado
          ? `Entregado (${modoEntrega})`
          : `No entregado (${modoEntrega})`;
      case "QUIZ":
        return "No intentado";
      default:
        return "No iniciado";
    }
  }
};

const obtenerDiasHastaEntrega = (fechaEntrega: string | null): number => {
  if (!fechaEntrega) return Infinity;
  const entrega = new Date(fechaEntrega);
  const ahora = new Date();
  const diffTiempo = entrega.getTime() - ahora.getTime();
  return Math.ceil(diffTiempo / (1000 * 60 * 60 * 24));
};

const obtenerUrgenciaLineaTiempo = (fechaEntrega: string | null): "urgent" | "warning" | "normal" => {
  const diasHastaEntrega = obtenerDiasHastaEntrega(fechaEntrega);

  if (diasHastaEntrega < 0) return "urgent";
  if (diasHastaEntrega <= 2) return "warning";
  return "normal";
};

const obtenerInicioSemana = (fecha: Date = new Date()): Date => {
  const d = new Date(fecha);
  const dia = d.getDay();
  const diff = d.getDate() - dia + (dia === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const formatearParaAPI = (fecha: Date): string => {
  return fecha.toISOString().split('T')[0] + 'T00:00:00';
};

interface PropsSeccionLineaTiempo {
  userId: string;
  userType: "teacher" | "student";
}



export function TimelineSection({ userId, userType }: PropsSeccionLineaTiempo) {
  const [mostrarTodo, setMostrarTodo] = React.useState(false);
  const [descartandoId, setDescartandoId] = React.useState<string | null>(null);
  const [recursoActivo, setRecursoActivo] =
    React.useState<DatosRecursoLineaTiempo | null>(null);
  const [idRecursoSeleccionado, setIdRecursoSeleccionado] = React.useState<
    string | null
  >(null);
  const { user } = useAuth();

  const inicioSemana = React.useMemo(() => {
    const inicio = obtenerInicioSemana();
    return formatearParaAPI(inicio);
  }, []);

  const {
    data: tareas = [],
    isLoading: cargandoTareas,
    error: errorTareas,
  } = useThisWeekTasks(userId, inicioSemana, userType);

  const {
    data: quizzes = [],
    isLoading: cargandoQuizzes,
    error: errorQuizzes,
  } = useThisWeekQuizzes(userId, inicioSemana, userType);

  const { data: equipoUsuario } = useUserTeam(userId);

  const { data: detalleQuiz, isLoading: cargandoQuiz } = useQuizDetail(
    idRecursoSeleccionado && recursoActivo && "questions" in recursoActivo
      ? idRecursoSeleccionado
      : null,
    userType
  );

  const recursosLineaTiempo = React.useMemo(() => {
    return [...tareas, ...quizzes];
  }, [tareas, quizzes]);

  const handleDescartar = (id: string) => {
    setDescartandoId(null);
  };

  const handleVerDetalles = (item: DatosRecursoLineaTiempo) => {
    setRecursoActivo(item);
    setIdRecursoSeleccionado(item.id);
  };

  const handleCerrarModal = () => {
    setRecursoActivo(null);
    setIdRecursoSeleccionado(null);
  };

  const { submitTask: mutacionEnviarTarea, isSubmitting: enviandoTarea } =
    useTaskSubmission();
  const { submitQuiz: mutacionEnviarQuiz, isSubmitting: enviandoQuiz } =
    useQuizSubmission();

  const handleEnvioTarea = async (datosEnvio: {
    content: string;
    attachments: File[];
  }) => {
    if (!recursoActivo || !user?.id) return;

    try {
      const tarea = recursoActivo as Assignment;
      const tipoEnvio =
        tarea.deliveryMode === "TEAM" ? "TEAM" : "INDIVIDUAL";

      let idGrupo: string | undefined;
      if (tipoEnvio === "TEAM" && equipoUsuario) {
        idGrupo = equipoUsuario.teamId.id;
      }

      const parametrosEnvio = {
        assignmentId: recursoActivo.id,
        studentId: user.id,
        content: datosEnvio.content,
        attachments: datosEnvio.attachments,
        submissionType: tipoEnvio as "INDIVIDUAL" | "TEAM",
        ...(idGrupo && { groupId: idGrupo }),
      };

      await mutacionEnviarTarea.mutate(parametrosEnvio);
      handleCerrarModal();
    } catch (error) {
      console.error("Error al enviar la tarea:", error);
    }
  };

  const handleEnvioQuiz = async (respuestas: any) => {
    if (!recursoActivo || !user?.id) return;

    try {
      await mutacionEnviarQuiz.mutateAsync({
        quizId: recursoActivo.id,
        studentId: user.id,
        answers: respuestas,
      });
      handleCerrarModal();
    } catch (error) {
      console.error("Error al enviar el quiz:", error);
    }
  };

  const recursosOrdenados = React.useMemo(() => {
    return [...recursosLineaTiempo].sort((a, b) => {
      const aEntrega = "dueDate" in a ? a.dueDate : null;
      const bEntrega = "dueDate" in b ? b.dueDate : null;

      const aUrgencia = obtenerUrgenciaLineaTiempo(aEntrega);
      const bUrgencia = obtenerUrgenciaLineaTiempo(bEntrega);

      if (aUrgencia !== bUrgencia) {
        const ordenUrgencia = { urgent: 0, warning: 1, normal: 2 };
        return ordenUrgencia[aUrgencia] - ordenUrgencia[bUrgencia];
      }

      if (aEntrega && bEntrega) {
        return new Date(aEntrega).getTime() - new Date(bEntrega).getTime();
      }

      return 0;
    });
  }, [recursosLineaTiempo]);

  const recursosMostrados = mostrarTodo
    ? recursosOrdenados
    : recursosOrdenados.slice(0, 4);

  const renderizarVistaDetalle = () => {
    if (!recursoActivo) return null;

    const tipoRecurso = obtenerTipoRecurso(recursoActivo);
    const cargando = cargandoQuiz && tipoRecurso === "QUIZ";

    if (cargando) {
      return <TimelineSectionSkeleton />;
    }

    if (userType === "student") {
      if (tipoRecurso === "ASSIGNMENT") {
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-6xl max-h-[95vh] overflow-y-auto">
              <VistaTareaEstudiante
                onExit={handleCerrarModal}
                assignment={recursoActivo as Assignment}
                onSubmit={handleEnvioTarea}
                studentId={userId}
                isSubmitting={enviandoTarea}
              />
            </div>
          </div>
        );
      } else if (tipoRecurso === "QUIZ" && detalleQuiz) {
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-6xl max-h-[95vh] overflow-y-auto">
              <VistaQuizEstudiante
                quizData={detalleQuiz}
                onSubmit={handleEnvioQuiz}
                onExit={handleCerrarModal}
                studentId={userId}
                isSubmitting={enviandoQuiz}
              />
            </div>
          </div>
        );
      }
    } else {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl bg-card">
            <div className="min-h-full bg-background p-4 md:p-6">
              <div className="max-w-4xl mx-auto">
                {tipoRecurso === "ASSIGNMENT" && (
                  <VistaInfoTarea
                    assignment={recursoActivo as Assignment}
                    onClose={handleCerrarModal}
                  />
                )}
                {tipoRecurso === "QUIZ" && detalleQuiz && (
                  <VistaQuizProfesor
                    quiz={detalleQuiz}
                    onClose={handleCerrarModal}
                  />
                )}
              </div>
            </div>
          </Card>
        </div>
      );
    }

    return null;
  };

  const rangoSemana = React.useMemo(() => {
    const inicio = obtenerInicioSemana();
    const fin = new Date(inicio);
    fin.setDate(inicio.getDate() + 6);

    return {
      inicio: inicio.toLocaleDateString("es-ES", {
        month: "short",
        day: "numeric",
      }),
      fin: fin.toLocaleDateString("es-ES", { month: "short", day: "numeric" }),
    };
  }, []);

  const cargando = cargandoTareas || cargandoQuizzes;
  const hayError = errorTareas || errorQuizzes;

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">
                {userType === "teacher" ? "Línea de Tiempo Docente" : "Mi Línea de Tiempo"}
              </h2>
            </div>
            <p className="text-sm text-muted-foreground">
              {rangoSemana.inicio} - {rangoSemana.fin} •{" "}
              {cargando
                ? "Cargando..."
                : `${recursosOrdenados.length} ${
                    recursosOrdenados.length === 1 ? "elemento" : "elementos"
                  }`}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-primary hover:text-primary"
            onClick={() => setMostrarTodo(!mostrarTodo)}
            disabled={cargando || recursosOrdenados.length === 0}
          >
            {mostrarTodo ? "Mostrar Menos" : "Ver Todo"}
            <ArrowRight
              className={cn(
                "ml-2 h-4 w-4 transition-transform",
                mostrarTodo && "rotate-180"
              )}
            />
          </Button>
        </div>

        {cargando ? (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              Cargando actividades de esta semana...
            </p>
          </div>
        ) : hayError ? (
          <div className="text-center py-12 text-destructive">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-4">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              Error al cargar la línea de tiempo
            </h3>
            <p className="text-sm text-muted-foreground">
              Por favor, intente de nuevo más tarde.
            </p>
          </div>
        ) : recursosOrdenados.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Check className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              ¡Todo al día para esta semana!
            </h3>
            <p className="text-sm text-muted-foreground">
              No hay actividades pendientes para esta semana.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {recursosMostrados.map((item) => {
              const estadoItem = obtenerEstadoRecurso(item, userType, userId);
              const textoPlazo = obtenerTextoPlazoRecurso(item);
              const urgenciaItem = obtenerUrgenciaLineaTiempo(
                "dueDate" in item ? item.dueDate : null
              );
              const IconoItem = obtenerIconoRecurso(item);
              const esTareaGrupal =
                obtenerTipoRecurso(item) === "ASSIGNMENT" &&
                (item as Assignment).deliveryMode === "TEAM";

              return (
                <div
                  key={item.id}
                  className={cn(
                    "group relative p-4 rounded-lg border transition-all hover:shadow-md cursor-pointer",
                    urgenciaItem === "urgent"
                      ? "border-destructive/30 bg-destructive/5 hover:border-destructive/50"
                      : urgenciaItem === "warning"
                      ? "border-accent/40 bg-accent/5 hover:border-accent/60"
                      : "border-border bg-card hover:border-primary/30"
                  )}
                  onClick={() => handleVerDetalles(item)}
                >
                  <div className="flex items-start gap-4">
                    {/* Icono */}
                    <div
                      className={cn(
                        "h-10 w-10 rounded-lg flex items-center justify-center shrink-0",
                        urgenciaItem === "urgent"
                          ? "bg-destructive/10 text-destructive"
                          : urgenciaItem === "warning"
                          ? "bg-accent/10 text-accent-foreground"
                          : esTareaGrupal
                          ? "bg-secondary text-secondary-foreground"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {React.createElement(IconoItem, { className: "h-5 w-5" })}
                    </div>

                    {/* Contenido */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3
                          className={cn(
                            "font-semibold text-base leading-tight",
                            urgenciaItem === "urgent"
                              ? "text-destructive"
                              : "text-foreground"
                          )}
                        >
                          {item.title}
                          {esTareaGrupal && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              Grupal
                            </Badge>
                          )}
                        </h3>
                        <Badge
                          variant={
                            urgenciaItem === "urgent"
                              ? "destructive"
                              : urgenciaItem === "warning"
                              ? "secondary"
                              : "outline"
                          }
                          className="shrink-0"
                        >
                          {textoPlazo}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium text-foreground/80 mt-1">
                        {estadoItem}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2"></p>

                      {/* Fecha de entrega */}
                      {"dueDate" in item && item.dueDate && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          Entrega:{" "}
                          {new Date(item.dueDate).toLocaleDateString("es-ES", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      )}
                    </div>

                    {/* Botón Descartar */}
                    <div
                      className="flex items-center gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {descartandoId === item.id ? (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDescartar(item.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setDescartandoId(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => setDescartandoId(item.id)}
                          title="Descartar"
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Modal de Detalle */}
      {renderizarVistaDetalle()}
    </>
  );
}