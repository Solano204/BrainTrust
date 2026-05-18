"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Loader2,
  Users,
  User,
} from "lucide-react";
import {
  Assignment,
  Quiz,
  CourseResourceType,
} from "@/app/domain/entities/CourseEntities";
import {
  useQuizDetail,
  useQuizzesByMonth,
} from "@/app/presentation/hooks/calendar/quiz-hooks";
import {
  useTasksByMonth,
} from "@/app/presentation/hooks/calendar/task-hooks";
import { useAuth } from "@/app/context/AuthContext";
import { Submission } from "@/app/domain/entities";
import { VistaTareaEstudiante } from "../student/tasks-transactional-view-student";
import { VistaQuizEstudiante } from "../student/quiz-transactional-view-student";
import { VistaQuiz } from "../teacher/quiz-view-information-teacher";
import { VistaInfoTarea } from "../teacher/task-view-information-teacher";
import {
  useQuizSubmission,
  useTaskSubmission,
} from "@/components/teacher-student/hooks/submission-hooks";
import { useUserTeam } from "./hooks/team-hooks";

export type RecursoCalendario = Assignment | Quiz;

const funcionesFecha = {

  format: (fecha: Date, formatoStr: string) => {
    const d = new Date(fecha);
    if (formatoStr === "yyyy-MM-dd") {
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(d.getDate()).padStart(2, "0")}`;
    }
    if (formatoStr === "MMM yyyy") {
      return d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
      });
    }
    if (formatoStr === "dd") {
      return String(d.getDate());
    }
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  },
  inicioSemana: (fecha: Date) => {
    const d = new Date(fecha);
    const dia = d.getDay();
    const diff = d.getDate() - dia + (dia === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  },
  obtenerInicioMes: (fecha: Date) => {
    const d = new Date(fecha);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  },
  agregarMeses: (fecha: Date, cantidad: number) => {
    const d = new Date(fecha);
    d.setMonth(d.getMonth() + cantidad);
    return d;
  },
  restarMeses: (fecha: Date, cantidad: number) => {
    const d = new Date(fecha);
    d.setMonth(d.getMonth() - cantidad);
    return d;
  },
  agregarDias: (fecha: Date, cantidad: number) => {
    const d = new Date(fecha);
    d.setDate(d.getDate() + cantidad);
    return d;
  },
  esMismoDia: (fecha1: Date, fecha2: Date) =>
    new Date(fecha1).toDateString() === new Date(fecha2).toDateString(),
  esMismoMes: (fecha1: Date, fecha2: Date) =>
    fecha1.getMonth() === fecha2.getMonth() &&
    fecha1.getFullYear() === fecha2.getFullYear(),
};

const {
  format,
  inicioSemana,
  obtenerInicioMes,
  agregarMeses,
  restarMeses,
  agregarDias,
  esMismoDia,
  esMismoMes,
} = funcionesFecha;

const obtenerTipoRecurso = (recurso: RecursoCalendario): CourseResourceType => {
  if ("questions" in recurso) return "QUIZ";
  return "ASSIGNMENT";
};

const obtenerEstilosRecurso = (recurso: RecursoCalendario) => {
  const tipo = obtenerTipoRecurso(recurso);
  switch (tipo) {
    case "ASSIGNMENT":
      const tarea = recurso as Assignment;
      const esTareaGrupal = tarea.deliveryMode === "TEAM";
      return {
        icono: esTareaGrupal ? "👥" : "📝",
        color: esTareaGrupal 
          ? "text-blue-600 bg-blue-100 border-blue-200" 
          : "text-red-600 bg-red-100 border-red-200",
        titulo: esTareaGrupal ? "Tarea Grupal" : "Tarea Individual",
      };
    case "QUIZ":
      return {
        icono: "📋",
        color: "text-purple-600 bg-purple-100 border-purple-200",
        titulo: "Quiz",
      };
    default:
      return {
        icono: "📎",
        color: "text-gray-600 bg-gray-100 border-gray-200",
        titulo: "Recurso",
      };
  }
};

const formatearParaAPI = (fecha: Date): string => {
  return fecha.toISOString().split("T")[0] + "T00:00:00";
};

interface PropsVistaCalendario {
  userId: string;
  userType: "teacher" | "student";
}

export function CalendarView({ userId, userType }: PropsVistaCalendario) {
  const [mesActual, setMesActual] = React.useState(
    obtenerInicioMes(new Date())
  );
  const [recursoActivo, setRecursoActivo] =
    React.useState<RecursoCalendario | null>(null);
  const [idRecursoSeleccionado, setIdRecursoSeleccionado] = React.useState<
    string | null
  >(null);
  const { user } = useAuth();

  const fechaInicioMes = formatearParaAPI(mesActual);

  const {
    data: tareas = [],
    isLoading: cargandoTareas,
    error: errorTareas,
  } = useTasksByMonth(userId, fechaInicioMes, userType);

  const {
    data: quizzes = [],
    isLoading: cargandoQuizzes,
    error: errorQuizzes,
  } = useQuizzesByMonth(userId, fechaInicioMes, userType);


  console.log("QUIZZES ",quizzes)
  console.log("TAREAS",tareas)
  const { data: equipoUsuario } = useUserTeam(userId);

  const { data: detalleQuiz, isLoading: cargandoQuiz } = useQuizDetail(
    idRecursoSeleccionado && recursoActivo && "questions" in recursoActivo
      ? idRecursoSeleccionado
      : null,
    userType
  );

  const todosRecursos = React.useMemo(() => {
    return [...tareas, ...quizzes];
  }, [tareas, quizzes]);

  const eventosPorDia = React.useMemo(() => {
    const agrupados: { [claveFecha: string]: RecursoCalendario[] } = {};

    todosRecursos.forEach((recurso) => {
      const fechaEntrega = "dueDate" in recurso ? (recurso as any).dueDate : null;

      if (fechaEntrega) {
        const claveFecha = format(new Date(fechaEntrega), "yyyy-MM-dd");
        if (!agrupados[claveFecha]) {
          agrupados[claveFecha] = [];
        }
        agrupados[claveFecha].push(recurso);
      }
    });

    return agrupados;
  }, [todosRecursos]);

  const nombresDias = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

  const irAlMesAnterior = () => {
    setMesActual((prev) => obtenerInicioMes(restarMeses(prev, 1)));
  };

  const irAlMesSiguiente = () => {
    setMesActual((prev) => obtenerInicioMes(agregarMeses(prev, 1)));
  };

  const irAlDiaActual = () => {
    setMesActual(obtenerInicioMes(new Date()));
  };

  const manejarClickRecurso = (recurso: RecursoCalendario) => {
    setRecursoActivo(recurso);
    setIdRecursoSeleccionado(recurso.id);
  };

  const manejarVolverDelDetalle = () => {
    setRecursoActivo(null);
    setIdRecursoSeleccionado(null);
  };

  const { submitTask: mutacionEnviarTarea, isSubmitting: enviandoTarea } =
    useTaskSubmission();
  const { submitQuiz: mutacionEnviarQuiz, isSubmitting: enviandoQuiz } =
    useQuizSubmission();

  const manejarEnvioTarea = async (datosEnvio: {
  content: string;
  attachments: File[];
}) => {
  if (!recursoActivo || !user?.id) return;

  try {
    const tarea = recursoActivo as Assignment;
    const tipoEnvio = tarea.deliveryMode === "TEAM" ? "TEAM" : "INDIVIDUAL";
    
    let idGrupo: string | undefined;
    if (tipoEnvio === "TEAM" && equipoUsuario) {
      idGrupo = equipoUsuario.teamId;
    }
    
    const parametrosEnvio = {
      assignmentId: recursoActivo.id,
      studentId: user.id,
      content: datosEnvio.content,
      attachments: datosEnvio.attachments,
      submissionType: tipoEnvio as "INDIVIDUAL" | "TEAM",
      ...(idGrupo && { groupId: idGrupo })
    };

    await mutacionEnviarTarea.mutateAsync(parametrosEnvio);

    manejarVolverDelDetalle();
  } catch (error) {
    console.error("Error al enviar la tarea:", error);
  }
};

  const manejarEnvioQuiz = async (respuestas: any) => {
    if (!recursoActivo || !user?.id) return;
    try {
      await mutacionEnviarQuiz.mutateAsync({
        quizId: recursoActivo.id,
        studentId: user.id,
        answers: respuestas,
      });

      manejarVolverDelDetalle();
    } catch (error) {
      console.error("Error al enviar el quiz:", error);
    }
  };

  const obtenerEnvioExistente = (
    idRecurso: string
  ): Submission | undefined => {
    if (userType === "student") {
      return tareas
        .flatMap((t) => t.submissions)
        .find((s) => s.studentId === userId);
    }
    return undefined;
  };

  const primerDiaDelMes = obtenerInicioMes(mesActual);
  const diaInicioGrilla = inicioSemana(primerDiaDelMes);
  const diasCalendario: Date[] = [];
  let fechaActual = diaInicioGrilla;

  for (let i = 0; i < 42; i++) {
    diasCalendario.push(fechaActual);
    fechaActual = agregarDias(fechaActual, 1);
    if (i >= 28 && !esMismoMes(fechaActual, mesActual)) break;
  }

  const renderizarCeldaDia = (fecha: Date) => {
    const claveFecha = format(fecha, "yyyy-MM-dd");
    const esHoy = esMismoDia(fecha, new Date());
    const esFueraDelMes = !esMismoMes(fecha, mesActual);
    const eventosDia = eventosPorDia[claveFecha] || [];

    return (
      <div
        key={claveFecha}
        className={`flex flex-col p-2 min-h-[8rem] border border-border/50 transition-colors 
                    ${
                      esFueraDelMes
                        ? "bg-gray-100/50 text-muted-foreground/60 dark:bg-gray-700/50"
                        : "bg-white dark:bg-gray-800"
                    }
                    ${
                      esHoy
                        ? "ring-2 ring-primary border-primary/50 dark:bg-blue-900/20"
                        : ""
                    }
                `}
      >
        <div
          className={`text-sm font-semibold mb-2 ${
            esHoy && !esFueraDelMes ? "text-primary" : "text-foreground"
          }`}
        >
          {format(fecha, "dd")}
        </div>

        {eventosDia.map((recurso, indice) => {
          const { icono, color, titulo } = obtenerEstilosRecurso(recurso);
          const tituloMostrar =
            recurso.title.length > 20
              ? recurso.title.substring(0, 20) + "..."
              : recurso.title;

          const envioExistente =
            userType === "student"
              ? obtenerEnvioExistente(recurso.id)
              : undefined;
          const estaEnviado = !!envioExistente;

          return (
            <div
              key={`${recurso.id}-${indice}`}
              onClick={() => manejarClickRecurso(recurso)}
              className={`flex items-center gap-1 p-1.5 rounded text-xs font-medium cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md border ${color} mb-1 ${
                estaEnviado ? "opacity-80" : ""
              }`}
              title={`${titulo}: ${recurso.title}${
                estaEnviado ? " (Enviado)" : ""
              }`}
            >
              <span className="text-xs">{icono}</span>
              <span className="truncate flex-1">{tituloMostrar}</span>
              {estaEnviado && <span className="text-xs">✓</span>}
            </div>
          );
        })}

        {(cargandoTareas || cargandoQuizzes) && esHoy && (
          <div className="flex items-center text-xs text-muted-foreground mt-auto">
            <Loader2 className="h-3 w-3 animate-spin mr-1" />
            Cargando...
          </div>
        )}
      </div>
    );
  };

  const renderizarVistaDetalle = () => {
    if (!recursoActivo) return null;

    const tipoRecurso = obtenerTipoRecurso(recursoActivo);
    
    const cargando = cargandoQuiz && tipoRecurso === "QUIZ";

    if (cargando) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl dark:bg-gray-900">
            <div className="min-h-full bg-background p-8 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                <p className="text-xl text-primary">
                  Cargando detalles del quiz...
                </p>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    if (userType === "student") {
      if (tipoRecurso === "ASSIGNMENT") {
        const tarea = recursoActivo as Assignment;
        const envioExistente = obtenerEnvioExistente(tarea.id);

        return (
          <div className="fixed inset-0 z-50 bg-gray-50 dark:bg-gray-900 overflow-y-auto">
            <div className="container mx-auto py-4">
              <VistaTareaEstudiante
                onExit={manejarVolverDelDetalle}
                assignment={tarea}
                onSubmit={manejarEnvioTarea}
                studentId={userId}
                isSubmitting={enviandoTarea}
              />
              <div className="text-center mt-4">
                <Button
                  onClick={manejarVolverDelDetalle}
                  variant="outline"
                  className="mx-auto"
                >
                  Volver al Calendario
                </Button>
              </div>
            </div>
          </div>
        );
      } else if (tipoRecurso === "QUIZ" && detalleQuiz) {
        const envioExistente = obtenerEnvioExistente(detalleQuiz.id);

        return (
          <div className="fixed inset-0 z-50 bg-gray-50 dark:bg-gray-900 overflow-y-auto">
            <div className="container mx-auto py-4">
              <VistaQuizEstudiante
                quizData={detalleQuiz}
                onSubmit={manejarEnvioQuiz}
                onExit={manejarVolverDelDetalle}
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
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl dark:bg-gray-900">
            <div className="min-h-full bg-background p-4 md:p-6">
              <div className="max-w-4xl mx-auto">
                {tipoRecurso === "ASSIGNMENT" && (
                  <VistaInfoTarea assignment={recursoActivo as Assignment} onClose={manejarVolverDelDetalle} />
                )}
                {tipoRecurso === "QUIZ" && detalleQuiz && (
                  <VistaQuiz
                    quiz={detalleQuiz}
                    onClose={manejarVolverDelDetalle}
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

  const cargando = cargandoTareas || cargandoQuizzes;
  const hayError = errorTareas || errorQuizzes;

return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <Card className="max-w-7xl mx-auto p-6 space-y-4">
        {/* Encabezado del Calendario */}
        <div className="flex justify-between items-center border-b border-border pb-4">
          <Button onClick={irAlDiaActual} variant="outline" className="text-sm">
            Hoy
          </Button>
          <div className="flex items-center gap-4">
            <Button
              onClick={irAlMesAnterior}
              size="icon"
              className="h-8 w-8 p-0"
              disabled={cargando}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-xl font-bold text-foreground min-w-[200px] text-center">
              {format(mesActual, "MMM yyyy")}
            </h2>
            <Button
              onClick={irAlMesSiguiente}
              size="icon"
              className="h-8 w-8 p-0"
              disabled={cargando}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarIcon className="h-4 w-4" />
            <span className="capitalize">{userType === "teacher" ? "Profesor" : "Estudiante"}</span>
            {user && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                {user.name}
              </span>
            )}
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 text-center border border-border">
            <div className="text-2xl font-bold text-primary">
              {tareas.length}
            </div>
            <div className="text-sm text-muted-foreground">Tareas</div>
          </Card>
          <Card className="p-4 text-center border border-border">
            <div className="text-2xl font-bold text-accent">
              {quizzes.length}
            </div>
            <div className="text-sm text-muted-foreground">Quizzes</div>
          </Card>
          <Card className="p-4 text-center border border-border">
            <div className="text-2xl font-bold text-primary/70">
              {
                todosRecursos.filter((r) => {
                  const fechaEntrega = "dueDate" in r ? r.dueDate : null;
                  return fechaEntrega && new Date(fechaEntrega) >= new Date();
                }).length
              }
            </div>
            <div className="text-sm text-muted-foreground">Próximos</div>
          </Card>
          <Card className="p-4 text-center border border-border">
            <div className="text-2xl font-bold text-destructive">
              {
                todosRecursos.filter((r) => {
                  const fechaEntrega = "dueDate" in r ? r.dueDate : null;
                  return fechaEntrega && new Date(fechaEntrega) < new Date();
                }).length
              }
            </div>
            <div className="text-sm text-muted-foreground">Vencidos</div>
          </Card>
        </div>

        {/* Nombres de los Días */}
        <div className="grid grid-cols-7 text-center font-bold text-sm uppercase tracking-wider text-muted-foreground border-b border-border/50">
          {nombresDias.map((dia) => (
            <div key={dia} className="p-2">
              {dia}
            </div>
          ))}
        </div>

        {/* Cuadrícula del Calendario */}
        <div className="grid grid-cols-7 gap-px border border-border/50 rounded-lg overflow-hidden bg-border/50">
          {diasCalendario.map(renderizarCeldaDia)}
        </div>

        {/* Leyenda */}
        <div className="flex flex-wrap gap-4 justify-center text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-destructive/20 border border-destructive/30 rounded"></div>
            <span>Tarea Individual</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-primary/20 border border-primary/30 rounded"></div>
            <span>Tarea Grupal</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-accent/20 border border-accent/30 rounded"></div>
            <span>Quiz</span>
          </div>
          {userType === "student" && (
            <div className="flex items-center gap-1">
              <span className="text-primary font-bold">✓</span>
              <span>Enviado</span>
            </div>
          )}
        </div>

        {/* Cargando */}
        {cargando && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
            <span className="text-muted-foreground">
              Cargando {cargandoTareas ? "tareas" : ""}
              {cargandoTareas && cargandoQuizzes ? " y " : ""}
              {cargandoQuizzes ? "quizzes" : ""}...
            </span>
          </div>
        )}

        {/* Error */}
        {hayError && (
          <div className="text-center py-8 text-destructive">
            Error al cargar los datos del calendario. Por favor, intente de nuevo.
            {errorTareas && <div>Tareas: {errorTareas.message}</div>}
            {errorQuizzes && <div>Quizzes: {errorQuizzes.message}</div>}
          </div>
        )}
      </Card>

      {renderizarVistaDetalle()}
    </div>
  );
}