"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Eye,
  Plus,
  X,
  Check,
  Loader2,
  Users,
  BookOpen,
  Monitor,
  Clock,
  CalendarX,
} from "lucide-react";
import {
  UnitResource,
  CourseUnit,
  Assignment,
  Quiz,
  Page,
} from "@/app/domain/entities/CourseEntities";
import { CourseId, UnitId } from "@/app/domain/valueObjects/CourseValues";
import { ResourceTypeSelector } from "../teacher/resource-type-selector-teacher";
import { CreadorTarea } from "../teacher/task-form-creator-teacher";
import { PageCreator } from "../teacher/page-form-creator-teacher";
import { CreadorQuiz } from "../teacher/quiz-form-creator-teacher";
import { VistaQuiz } from "../teacher/quiz-view-information-teacher";
import { VistaPagina } from "./page-view-student-teacher";
import { VistaInfoTarea } from "../teacher/task-view-information-teacher";
import { VistaTareaEstudiante } from "../student/tasks-transactional-view-student";
import { VistaQuizEstudiante } from "../student/quiz-transactional-view-student";

import { useAuth } from "@/app/context/AuthContext";
import {
  useAssignmentMutations,
  useAssignmentsByUnit,
  useAssignment,
} from "./hooks/assignment-hooks";
import { useQuizMutations, useQuizzesByUnit } from "./hooks/quiz-hooks";
import { usePageMutations, usePagesByUnit } from "./hooks/page-hooks";
import { useUserTeam } from "./hooks/team-hooks";
import { useQuizSubmission, useTaskSubmission } from "./hooks/submission-hooks";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PropsDetalleUnidad {
  idUnit: UnitId;
  idCourse: CourseId;
  onBack: () => void;
  unitData?: CourseUnit;
}

export function UnitDetail({
  idUnit,
  idCourse,
  onBack,
  unitData,
}: PropsDetalleUnidad) {
  const { user } = useAuth();
  const esEstudiante = user?.role === "student";

  const {
    data: tareas = [],
    isLoading: cargandoTareas,
    refetch: recargarTareas,
  } = useAssignmentsByUnit(idCourse, idUnit);

  const {
    data: quizzes = [],
    isLoading: cargandoQuizzes,
    refetch: recargarQuizzes,
  } = useQuizzesByUnit(idCourse, idUnit);

  const {
    data: paginas = [],
    isLoading: cargandoPaginas,
    refetch: recargarPaginas,
  } = usePagesByUnit(idCourse, idUnit);

  const { data: equipoUsuario } = useUserTeam(user?.id || "");

  const mutacionesTarea = useAssignmentMutations();
  const mutacionesQuiz = useQuizMutations();
  const mutacionesPagina = usePageMutations();

  const { submitTask: mutacionEnviarTarea, isSubmitting: enviandoTarea } =
    useTaskSubmission();
  const { submitQuiz: mutacionEnviarQuiz, isSubmitting: enviandoQuiz } =
    useQuizSubmission();

  const recursos = React.useMemo((): UnitResource[] => {
    return [...tareas, ...quizzes, ...paginas].sort((a, b) =>
      a.title.localeCompare(b.title)
    );
  }, [tareas, quizzes, paginas]);

  const [indiceRecursoActual, setIndiceRecursoActual] = React.useState(0);
  const [modoVista, setModoVista] = React.useState<"carousel" | "detail" | "student">("carousel");
  const [recursoActual, setRecursoActual] = React.useState<UnitResource | null>(null);
  const [confirmacionEliminar, setConfirmacionEliminar] = React.useState<string | null>(null);
  const [mostrarSelectorRecurso, setMostrarSelectorRecurso] = React.useState(false);
  const [tipoRecursoSeleccionado, setTipoRecursoSeleccionado] = React.useState<"ASSIGNMENT" | "QUIZ" | "PAGE" | null>(null);
  const [errorDisponibilidadQuiz, setErrorDisponibilidadQuiz] = React.useState<string | null>(null);

  const { data: tareaVista, refetch: recargarTareaVista } =
    useAssignment(
      modoVista === "detail" &&
        recursoActual &&
        obtenerTipoRecurso(recursoActual) === "ASSIGNMENT"
        ? recursoActual.id
        : null
    );

  const cargando = cargandoTareas || cargandoQuizzes || cargandoPaginas;

  function obtenerTipoRecurso(
    recurso: UnitResource
  ): "ASSIGNMENT" | "QUIZ" | "PAGE" {
    if ("questions" in recurso) return "QUIZ";
    if ("submissions" in recurso) return "ASSIGNMENT";
    if ("sectionContent" in recurso) return "PAGE";
    return "PAGE";
  }

  // Verificar si el quiz está disponible para que el estudiante lo realice
  const estaQuizDisponible = (quiz: Quiz): { available: boolean; reason?: string } => {
    const ahora = new Date();

    // Verificar si el quiz tiene fechas de disponibilidad
    if (quiz.availableFrom) {
      const disponibleDesde = new Date(quiz.availableFrom);
      if (ahora < disponibleDesde) {
        return {
          available: false,
          reason: `Este quiz no está disponible aún. Estará disponible desde el ${disponibleDesde.toLocaleDateString()} a las ${disponibleDesde.toLocaleTimeString()}.`
        };
      }
    }

    if (quiz.availableUntil) {
      const disponibleHasta = new Date(quiz.availableUntil);
      if (ahora > disponibleHasta) {
        return {
          available: false,
          reason: `Este quiz ya no está disponible. Estuvo disponible hasta el ${disponibleHasta.toLocaleDateString()} a las ${disponibleHasta.toLocaleTimeString()}.`
        };
      }
    }

    // Verificar fecha de entrega si no hay availableUntil
    if (!quiz.availableUntil && quiz.dueDate && !quiz.acceptLateSubmissions) {
      const fechaEntrega = new Date(quiz.dueDate);
      if (ahora > fechaEntrega) {
        return {
          available: false,
          reason: `Este quiz ha pasado su fecha de entrega (${fechaEntrega.toLocaleDateString()}) y no se aceptan entregas tardías.`
        };
      }
    }

    return { available: true };
  };

  const handleCrearRecurso = (datosRecurso: any, archivos?: File[]) => {
    if (!tipoRecursoSeleccionado) return;

    const configComun = {
      courseId: idCourse,
      unitId: idUnit,
      onSuccess: () => {
        setTipoRecursoSeleccionado(null);
        recargarTareas();
        recargarQuizzes();
        recargarPaginas();
      },
    };

    switch (tipoRecursoSeleccionado) {
      case "ASSIGNMENT":
        mutacionesTarea.createAssignment.mutate({
          ...configComun,
          assignmentData: datosRecurso,
          files: archivos,
        });
        break;
      case "QUIZ":
        mutacionesQuiz.createQuiz.mutate({
          ...configComun,
          quizData: datosRecurso,
        });
        break;
      case "PAGE":
        mutacionesPagina.createPage.mutate({
          ...configComun,
          pageData: datosRecurso,
          attachments: archivos,
        });
        break;
    }
  };

  const handleEliminarRecurso = (recurso: UnitResource) => {
    const tipoRecurso = obtenerTipoRecurso(recurso);

    const configComun = {
      onSuccess: () => {
        setConfirmacionEliminar(null);
        if (
          indiceRecursoActual >= recursos.length - 1 &&
          indiceRecursoActual > 0
        ) {
          setIndiceRecursoActual(indiceRecursoActual - 1);
        }
        recargarTareas();
        recargarQuizzes();
        recargarPaginas();
      },
    };

    switch (tipoRecurso) {
      case "ASSIGNMENT":
        mutacionesTarea.deleteAssignment.mutate(recurso.id, configComun);
        break;
      case "QUIZ":
        mutacionesQuiz.deleteQuiz.mutate(recurso.id, configComun);
        break;
      case "PAGE":
        mutacionesPagina.deletePage.mutate(recurso.id, configComun);
        break;
    }
  };

  const handleVistaEstudiante = (recurso: UnitResource) => {
    const tipoRecurso = obtenerTipoRecurso(recurso);

    // Si es un quiz y el usuario es estudiante, verificar disponibilidad
    if (tipoRecurso === "QUIZ" && esEstudiante) {
      const quiz = recurso as Quiz;
      const disponibilidad = estaQuizDisponible(quiz);
      
      if (!disponibilidad.available) {
        setErrorDisponibilidadQuiz(disponibilidad.reason || "Este quiz no está disponible.");
        return;
      }
    }

    setErrorDisponibilidadQuiz(null);
    setRecursoActual(recurso);
    setModoVista("student");
  };

  const handleEnvioTarea = async (datosEnvio: {
    content: string;
    attachments: File[];
  }) => {
    if (!recursoActual || !user?.id) return;

    try {
      const tarea = recursoActual as Assignment;
      const tipoEnvio =
        tarea.deliveryMode === "TEAM" ? "TEAM" : "INDIVIDUAL";

      let idGrupo: string | undefined;
      if (tipoEnvio === "TEAM" && equipoUsuario) {
        idGrupo = equipoUsuario.teamId.id;
      }

      const parametrosEnvio = {
        assignmentId: recursoActual.id,
        studentId: user.id,
        content: datosEnvio.content,
        attachments: datosEnvio.attachments,
        submissionType: tipoEnvio as "INDIVIDUAL" | "TEAM",
        ...(idGrupo && { groupId: idGrupo }),
      };

      await mutacionEnviarTarea.mutateAsync(parametrosEnvio);

      setModoVista("carousel");
      setRecursoActual(null);
      recargarTareas();
    } catch (error) {
      console.error("Error al enviar la tarea:", error);
    }
  };

  const handleEnvioQuiz = async (respuestas: any) => {
    if (!recursoActual || !user?.id) return;

    try {
      // Verificar disponibilidad nuevamente antes de enviar
      const quiz = recursoActual as Quiz;
      const disponibilidad = estaQuizDisponible(quiz);
      
      if (!disponibilidad.available) {
        setErrorDisponibilidadQuiz(disponibilidad.reason || "Este quiz no está disponible.");
        setModoVista("carousel");
        setRecursoActual(null);
        return;
      }

      await mutacionEnviarQuiz.mutateAsync({
        quizId: recursoActual.id,
        studentId: user.id,
        answers: respuestas,
      });

      setModoVista("carousel");
      setRecursoActual(null);
      setErrorDisponibilidadQuiz(null);
      recargarQuizzes();
    } catch (error) {
      console.error("Error al enviar el quiz:", error);
    }
  };

  const handleAnterior = () => {
    if (indiceRecursoActual > 0) {
      setIndiceRecursoActual(indiceRecursoActual - 1);
      setErrorDisponibilidadQuiz(null);
    }
  };

  const handleSiguiente = () => {
    if (indiceRecursoActual < recursos.length - 1) {
      setIndiceRecursoActual(indiceRecursoActual + 1);
      setErrorDisponibilidadQuiz(null);
    }
  };

  const handleVer = (recurso: UnitResource) => {
    setRecursoActual(recurso);
    setModoVista("detail");
  };

  const handleVolverDelDetalle = () => {
    setModoVista("carousel");
    setRecursoActual(null);
    setErrorDisponibilidadQuiz(null);
    recargarTareas();
    recargarQuizzes();
    recargarPaginas();
  };

  const obtenerIconoRecurso = (recurso: UnitResource) => {
    const tipoRecurso = obtenerTipoRecurso(recurso);
    if (tipoRecurso === "ASSIGNMENT") {
      const tarea = recurso as Assignment;
      if (tarea.submissionFormat === "NOTEBOOK") {
        return "📓";
      }
      return tarea.deliveryMode === "TEAM" ? "👥" : "📝";
    }
    if (tipoRecurso === "QUIZ") return "📋";
    if (tipoRecurso === "PAGE") return "📄";
    return "📚";
  };

  const obtenerColorRecurso = (recurso: UnitResource) => {
    const tipoRecurso = obtenerTipoRecurso(recurso);
    if (tipoRecurso === "ASSIGNMENT") {
      const tarea = recurso as Assignment;
      return tarea.deliveryMode === "TEAM"
        ? "from-blue-500 to-blue-600"
        : "from-orange-500 to-orange-600";
    }
    if (tipoRecurso === "QUIZ") return "from-purple-500 to-purple-600";
    if (tipoRecurso === "PAGE") return "from-cyan-500 to-cyan-600";
    return "from-gray-500 to-gray-600";
  };

  const obtenerDetallesRecurso = (recurso: UnitResource) => {
    const tipoRecurso = obtenerTipoRecurso(recurso);

    switch (tipoRecurso) {
      case "ASSIGNMENT": {
        const tarea = recurso as Assignment;
        const modoEntrega =
          tarea.deliveryMode === "TEAM"
            ? "Tarea Grupal"
            : "Tarea Individual";
        const formatoEntrega =
          tarea.submissionFormat === "NOTEBOOK"
            ? "Entrega en Cuaderno"
            : "Entrega Digital";
        const fechaEntrega = tarea.dueDate
          ? `Entrega: ${new Date(tarea.dueDate).toLocaleDateString()}`
          : "";
        const puntuacionMaxima = `Puntuación Máx: ${tarea.maxScore.maxPoints}`;
        return `${modoEntrega} | ${formatoEntrega} | ${puntuacionMaxima} ${fechaEntrega ? `| ${fechaEntrega}` : ""}`;
      }
      case "QUIZ": {
        const quiz = recurso as Quiz;
        const disponibilidad = esEstudiante ? estaQuizDisponible(quiz) : { available: true };
        const textoDisponibilidad = !disponibilidad.available ? " | NO DISPONIBLE" : "";
        return `Calificación Máx: ${quiz.maxGrade} | Tiempo: ${quiz.timeLimit} min${textoDisponibilidad}`;
      }
      case "PAGE": {
        const pagina = recurso as Page;
        const vistaPrevia = pagina.sectionContent.substring(0, 100);
        return vistaPrevia + (pagina.sectionContent.length > 100 ? "..." : "");
      }
      default:
        return "";
    }
  };

  const obtenerInsigniaDisponibilidadQuiz = (quiz: Quiz) => {
    if (!esEstudiante) return null;

    const disponibilidad = estaQuizDisponible(quiz);
    const ahora = new Date();

    if (!disponibilidad.available) {
      if (quiz.availableFrom && ahora < new Date(quiz.availableFrom)) {
        return (
          <Badge variant="secondary" className="text-sm">
            <Clock className="h-3 w-3 mr-1" />
            Abre el {new Date(quiz.availableFrom).toLocaleDateString()}
          </Badge>
        );
      }
      if (quiz.availableUntil && ahora > new Date(quiz.availableUntil)) {
        return (
          <Badge variant="destructive" className="text-sm">
            <CalendarX className="h-3 w-3 mr-1" />
            Cerrado
          </Badge>
        );
      }
      if (quiz.dueDate && !quiz.acceptLateSubmissions && ahora > new Date(quiz.dueDate)) {
        return (
          <Badge variant="destructive" className="text-sm">
            <CalendarX className="h-3 w-3 mr-1" />
            Vencido
          </Badge>
        );
      }
    }

    return null;
  };

  const renderizarVistaDetalle = () => {
    if (!recursoActual) return null;

    const tipoRecurso = obtenerTipoRecurso(recursoActual);

    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          {tipoRecurso === "ASSIGNMENT" && tareaVista && (
            <VistaInfoTarea
              assignment={tareaVista}
              onClose={handleVolverDelDetalle}
            />
          )}
          {tipoRecurso === "QUIZ" && (
            <VistaQuiz
              quiz={recursoActual as Quiz}
              onClose={handleVolverDelDetalle}
            />
          )}
          {tipoRecurso === "PAGE" && (
            <VistaPagina
              page={recursoActual as Page}
              onClose={handleVolverDelDetalle}
            />
          )}
        </div>
      </div>
    );
  };

  const renderizarVistaEstudiante = () => {
    if (!recursoActual || !user) return null;

    const tipoRecurso = obtenerTipoRecurso(recursoActual);

    if (tipoRecurso === "ASSIGNMENT") {
      return (
        <VistaTareaEstudiante
          assignment={recursoActual as Assignment}
          studentId={user.id}
          onSubmit={handleEnvioTarea}
          onExit={handleVolverDelDetalle}
          isSubmitting={enviandoTarea}
        />
      );
    } else if (tipoRecurso === "QUIZ") {
      return (
        <VistaQuizEstudiante
          quizData={recursoActual as Quiz}
          studentId={user.id}
          onSubmit={handleEnvioQuiz}
          onExit={handleVolverDelDetalle}
          isSubmitting={enviandoQuiz}
        />
      );
    } else if (tipoRecurso === "PAGE") {
      return (
        <VistaPagina
          page={recursoActual as Page}
          onClose={handleVolverDelDetalle}
        />
      );
    }

    return null;
  };

  if (cargando) {
    return (
      <div className="min-h-screen p-10 flex items-center justify-center text-lg text-primary">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        Cargando Recursos de la Unidad...
      </div>
    );
  }

  if (modoVista === "detail" && recursoActual) {
    return renderizarVistaDetalle();
  }

  if (modoVista === "student" && recursoActual) {
    return renderizarVistaEstudiante();
  }

  const recursoCarruselActual = recursos[indiceRecursoActual];
  const tipoRecursoActual = recursoCarruselActual
    ? obtenerTipoRecurso(recursoCarruselActual)
    : null;
  const esTareaGrupal =
    tipoRecursoActual === "ASSIGNMENT" &&
    (recursoCarruselActual as Assignment).deliveryMode === "TEAM";
return (
  <div className="min-h-screen bg-background">
    {/* Encabezado */}
    <div className="bg-card border-b border-border p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" onClick={onBack} className="hover:bg-secondary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Curso
          </Button>
          <Badge variant="secondary" className="bg-secondary text-foreground border border-border text-sm">
            {recursos.length}{" "}
            {recursos.length === 1 ? "recurso" : "recursos"}
          </Badge>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">
              {unitData
                ? `Unidad ${unitData.numUnity}: ${unitData.name}`
                : `Recursos de la Unidad`}
            </h1>
            <p className="text-muted-foreground text-sm">
              {esEstudiante
                ? "Ver y completar recursos de aprendizaje"
                : "Gestionar recursos de aprendizaje para esta unidad"}
            </p>
          </div>

          {!esEstudiante && (
            <Button
              onClick={() => setMostrarSelectorRecurso(true)}
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 self-start sm:self-auto"
              disabled={
                mutacionesTarea.createAssignment.isPending ||
                mutacionesQuiz.createQuiz.isPending ||
                mutacionesPagina.createPage.isPending
              }
            >
              {mutacionesTarea.createAssignment.isPending ||
              mutacionesQuiz.createQuiz.isPending ||
              mutacionesPagina.createPage.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Agregar Recurso
            </Button>
          )}
        </div>
      </div>
    </div>

    <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
      <Card className="overflow-hidden border-border shadow-sm">
        {/* Banner de la tarjeta */}
        <div className="bg-primary p-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground tracking-wide">
            RECURSOS DE LA UNIDAD
          </h2>
        </div>

        <div className="p-8 md:p-12">
          {recursos.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <p className="text-muted-foreground text-lg">
                {esEstudiante ? "No hay recursos disponibles" : "Aún no hay recursos"}
              </p>
              {!esEstudiante && (
                <Button
                  onClick={() => setMostrarSelectorRecurso(true)}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Agregar Tu Primer Recurso
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-12">
              {errorDisponibilidadQuiz && (
                <Alert variant="destructive">
                  <CalendarX className="h-4 w-4" />
                  <AlertDescription>{errorDisponibilidadQuiz}</AlertDescription>
                </Alert>
              )}

              {/* Navegación del carrusel */}
              <div className="flex items-center justify-center gap-8">
                <button
                  onClick={handleAnterior}
                  disabled={indiceRecursoActual === 0}
                  className={`h-16 w-16 rounded-full border-4 border-primary flex items-center justify-center transition-all text-foreground ${
                    indiceRecursoActual === 0
                      ? "opacity-30 cursor-not-allowed"
                      : "hover:bg-primary hover:text-primary-foreground cursor-pointer"
                  }`}
                >
                  <ChevronLeft className="h-8 w-8" />
                </button>

                <div
                  className={`h-40 w-40 md:h-48 md:w-48 rounded-full ${obtenerColorRecurso(
                    recursoCarruselActual
                  )} flex items-center justify-center border-4 border-border`}
                >
                  <div className="text-primary-foreground text-4xl">
                    {obtenerIconoRecurso(recursoCarruselActual)}
                  </div>
                </div>

                <button
                  onClick={handleSiguiente}
                  disabled={indiceRecursoActual === recursos.length - 1}
                  className={`h-16 w-16 rounded-full border-4 border-primary flex items-center justify-center transition-all text-foreground ${
                    indiceRecursoActual === recursos.length - 1
                      ? "opacity-30 cursor-not-allowed"
                      : "hover:bg-primary hover:text-primary-foreground cursor-pointer"
                  }`}
                >
                  <ChevronRight className="h-8 w-8" />
                </button>
              </div>

              {/* Información del recurso */}
              <div className="text-center space-y-4 max-w-2xl mx-auto">
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <Badge className="bg-accent/10 text-accent-foreground border border-accent/20 text-sm">
                    {tipoRecursoActual === "ASSIGNMENT" ? "TAREA" : tipoRecursoActual === "QUIZ" ? "QUIZ" : "PÁGINA"}
                  </Badge>
                  {esTareaGrupal && (
                    <Badge variant="secondary" className="bg-secondary text-foreground border border-border text-sm">
                      <Users className="h-3 w-3 mr-1" />
                      Tarea Grupal
                    </Badge>
                  )}

                  {tipoRecursoActual === "ASSIGNMENT" && (
                    <Badge
                      variant={
                        (recursoCarruselActual as Assignment).submissionFormat === "NOTEBOOK"
                          ? "outline"
                          : "secondary"
                      }
                      className="border-border text-foreground text-sm"
                    >
                      {(recursoCarruselActual as Assignment).submissionFormat === "NOTEBOOK" ? (
                        <>
                          <BookOpen className="h-3 w-3 mr-1" />
                          Cuaderno
                        </>
                      ) : (
                        <>
                          <Monitor className="h-3 w-3 mr-1" />
                          Digital
                        </>
                      )}
                    </Badge>
                  )}

                  {tipoRecursoActual === "QUIZ" &&
                    obtenerInsigniaDisponibilidadQuiz(recursoCarruselActual as Quiz)}
                </div>

                <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                  {recursoCarruselActual.title}
                </h2>
                <p className="text-muted-foreground text-lg">
                  {"description" in recursoCarruselActual
                    ? (recursoCarruselActual as Assignment).description
                    : ""}
                  {"sectionContent" in recursoCarruselActual
                    ? (recursoCarruselActual as Page).sectionContent.substring(0, 200) + "..."
                    : ""}
                </p>
                <p className="text-sm text-muted-foreground">
                  {obtenerDetallesRecurso(recursoCarruselActual)}
                </p>
              </div>

              {/* Botones de acción */}
              <div className="flex items-center justify-center gap-4">
                {esEstudiante ? (
                  <Button
                    onClick={() => handleVistaEstudiante(recursoCarruselActual)}
                    className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                    size="lg"
                    disabled={
                      tipoRecursoActual === "QUIZ" &&
                      !estaQuizDisponible(recursoCarruselActual as Quiz).available
                    }
                  >
                    <Eye className="h-4 w-4" />
                    {tipoRecursoActual === "PAGE"
                      ? "Ver Contenido"
                      : tipoRecursoActual === "QUIZ" &&
                        !estaQuizDisponible(recursoCarruselActual as Quiz).available
                      ? "No Disponible"
                      : "Comenzar"}
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => handleVer(recursoCarruselActual)}
                      className="gap-2 border-border hover:bg-secondary"
                    >
                      <Eye className="h-4 w-4" /> Ver y Editar
                    </Button>

                    {confirmacionEliminar === recursoCarruselActual.id ? (
                      <div className="flex gap-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleEliminarRecurso(recursoCarruselActual)}
                          className="gap-2"
                          disabled={
                            mutacionesTarea.deleteAssignment.isPending ||
                            mutacionesQuiz.deleteQuiz.isPending ||
                            mutacionesPagina.deletePage.isPending
                          }
                        >
                          {mutacionesTarea.deleteAssignment.isPending ||
                          mutacionesQuiz.deleteQuiz.isPending ||
                          mutacionesPagina.deletePage.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                          {mutacionesTarea.deleteAssignment.isPending ||
                          mutacionesQuiz.deleteQuiz.isPending ||
                          mutacionesPagina.deletePage.isPending
                            ? "Eliminando..."
                            : "Confirmar"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setConfirmacionEliminar(null)}
                          className="gap-2 border-border hover:bg-secondary"
                        >
                          <X className="h-4 w-4" /> Cancelar
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="destructive"
                        onClick={() => setConfirmacionEliminar(recursoCarruselActual.id)}
                        className="gap-2"
                      >
                        <Trash2 className="h-4 w-4" /> Eliminar
                      </Button>
                    )}
                  </>
                )}
              </div>

              {/* Indicadores de puntos */}
              <div className="flex justify-center gap-2 pt-4 pb-8">
                {recursos.map((_, indice) => (
                  <button
                    key={indice}
                    onClick={() => setIndiceRecursoActual(indice)}
                    className={`h-3 rounded-full transition-all ${
                      indice === indiceRecursoActual
                        ? "w-8 bg-accent"
                        : "w-3 bg-border"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>

    {!esEstudiante && (
      <>
        <ResourceTypeSelector
          open={mostrarSelectorRecurso}
          onClose={() => setMostrarSelectorRecurso(false)}
          onSelect={setTipoRecursoSeleccionado}
        />
        {tipoRecursoSeleccionado === "ASSIGNMENT" && (
          <CreadorTarea
            idCourse={idCourse}
            idUnit={idUnit}
            open={true}
            onClose={() => setTipoRecursoSeleccionado(null)}
            onSave={handleCrearRecurso}
          />
        )}
        {tipoRecursoSeleccionado === "PAGE" && (
          <PageCreator
            courseId={idCourse}
            open={true}
            onClose={() => setTipoRecursoSeleccionado(null)}
            unitId={idUnit}
            onSave={handleCrearRecurso}
          />
        )}
        {tipoRecursoSeleccionado === "QUIZ" && (
          <CreadorQuiz
            courseId={idCourse}
            unitId={idUnit}
            open={true}
            onClose={() => setTipoRecursoSeleccionado(null)}
            onSave={handleCrearRecurso}
          />
        )}
      </>
    )}
  </div>
);
}