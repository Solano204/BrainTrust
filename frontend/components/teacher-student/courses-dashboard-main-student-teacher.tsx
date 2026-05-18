"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Loader2,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  Zap,
  ChevronRight,
  GraduationCap,
  BookOpen,
  Eye,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Course } from "@/app/domain/entities/CourseEntities";
import { CourseId } from "@/app/domain/valueObjects";
import { CourseFormModal } from "../teacher/course-form-creator-teacher";
import {
  useCourseMutations,
  useCoursesByTeacher,
} from "@/components/teacher/hooks/courses-hooks";
import { useAuth } from "@/app/context/AuthContext";
import { useStudentCourses } from "@/app/presentation/hooks/course/student/student-hooks";

export function CourseDashboard() {
  const router = useRouter();
  const { user } = useAuth();

  const tipoUsuario = user?.role === "student" ? "student" : "teacher";
  const esEstudiante = tipoUsuario === "student";
  const usuarioId = user?.id;

  const {
    data: cursos = [],
    isLoading,
    error: errorFetch,
    refetch,
  } = esEstudiante ? useStudentCourses(usuarioId!) : useCoursesByTeacher(usuarioId!);


  console.log("CURSOS ", cursos)
  const { createCourse: crearCurso, updateCourse: actualizarCurso, deleteCourse: eliminarCurso } = useCourseMutations();

  const [idConfirmacionEliminar, setIdConfirmacionEliminar] = React.useState<CourseId | null>(
    null
  );
  const [modalFormularioAbierto, setModalFormularioAbierto] = React.useState(false);
  const [cursoAEditar, setCursoAEditar] = React.useState<Course | undefined>(
    undefined
  );

  const handleCrearCurso = () => {
    if (esEstudiante) return;
    setCursoAEditar(undefined);
    setModalFormularioAbierto(true);
  };

  const handleActualizarCurso = (cursoId: CourseId) => {
    if (esEstudiante) return;
    const curso = cursos.find((c) => c.id === cursoId);
    if (curso) {
      setCursoAEditar(curso);
      setModalFormularioAbierto(true);
    }
  };

  const handleCerrarModalFormulario = () => {
    setModalFormularioAbierto(false);
    setCursoAEditar(undefined);
  };

  const handleGuardarCurso = async (
    datosFormulario: Omit<Course, "id" | "teacherId">,
    cursoId?: string,
    archivoImagen?: File | null
  ) => {
    if (esEstudiante) return;

    try {
      if (cursoId) {
        console.log("Actualizando curso con ID:", cursoId);
        console.log("Tiene nuevo archivo de imagen:", !!archivoImagen);

        const cursoActual = cursos.find((c) => c.id === cursoId);
        const urlImagenAnterior = cursoActual?.urlImage;

        await actualizarCurso.mutateAsync(
          {
            courseId: cursoId,
            courseData: datosFormulario,
            imageFile: archivoImagen || undefined,
            oldImageUrl: urlImagenAnterior || undefined, // Pasar la URL de imagen anterior
          },
          {
            onSuccess: () => {
              handleCerrarModalFormulario();
            },
          }
        );
      } else {
        console.log("Creando nuevo curso");
        console.log("Tiene archivo de imagen:", !!archivoImagen);

        const cursoConProfesor = {
          ...datosFormulario,
          teacherId: usuarioId || "current-teacher-id",
        } as Course;

        await crearCurso.mutateAsync(
          {
            courseData: cursoConProfesor,
            imageFile: archivoImagen || undefined,
          },
          {
            onSuccess: () => {
              handleCerrarModalFormulario();
            },
          }
        );
      }
    } catch (error) {
      console.error("Error al guardar el curso:", error);
    }
  };

  const handleIngresarCurso = (cursoId: CourseId) => {
    router.push(`/courses/${cursoId}`);
  };

  const handleEliminacionConfirmada = (cursoId: CourseId) => {
    if (esEstudiante) return;
    eliminarCurso.mutate(cursoId, {
      onSuccess: () => {
        setIdConfirmacionEliminar(null);
      },
    });
  };

  const TarjetaCurso: React.FC<{ course: Course }> = ({ course }) => {
    const colorMostrar = "bg-primary";
    const eliminacionPendiente = idConfirmacionEliminar === course.id;
return (
      <Card
        className={`flex flex-col border-l-4 border-l-primary bg-card shadow-xl transition-transform duration-300 hover:scale-[1.02] overflow-hidden`}
      >
        <div
          className="relative h-32 w-full bg-cover bg-center overflow-hidden"
          style={{
            backgroundImage: course.urlImage
              ? `url(${course.urlImage})`
              : "none",
          }}
        >
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4">
            <p className="text-white text-center italic text-sm font-semibold opacity-80 backdrop-blur-[1px]">
              {course.description.substring(0, 75)}...
            </p>
          </div>
          <div className="absolute top-2 right-2 flex gap-2">
            <span className="text-xs font-bold px-2 py-1 rounded-full bg-accent text-accent-foreground shadow-lg uppercase flex items-center gap-1">
              <GraduationCap className="h-3 w-3" />{" "}
              {course.grade + " - " + course.group}
            </span>
          </div>
        </div>

        <div className="p-6 flex flex-col space-y-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              {course.code} ({course.group})
            </p>
            <h3 className="text-xl font-extrabold text-foreground">
              {course.name}
            </h3>
            <p className="text-sm text-muted-foreground pt-1 line-clamp-2">
              {course.description}
            </p>
          </div>

          <div className="flex gap-2 pt-4 border-t border-border/50">
            {esEstudiante ? (
              <Button
                variant="default"
                className="flex-1 gap-2 shadow-md transition-all"
                onClick={() => handleIngresarCurso(course.id)}
              >
                <Eye className="h-4 w-4" />
                Ingresar al Curso
              </Button>
            ) : eliminacionPendiente ? (
              <div className="flex gap-2 w-full justify-between">
                <Button
                  variant="destructive"
                  className="flex-1 gap-2 shadow-sm"
                  onClick={() => handleEliminacionConfirmada(course.id)}
                  disabled={eliminarCurso.isPending}
                >
                  {eliminarCurso.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  {eliminarCurso.isPending ? "Eliminando..." : "Confirmar Eliminación"}
                </Button>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => setIdConfirmacionEliminar(null)}
                  disabled={eliminarCurso.isPending}
                >
                  <X className="h-4 w-4" /> Cancelar
                </Button>
              </div>
            ) : (
              <>
                <Button
                  variant="default"
                  className="flex-1 gap-2 shadow-md transition-all"
                  onClick={() => handleIngresarCurso(course.id)}
                >
                  Ingresar al Curso <ChevronRight className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  className="text-accent border-accent/30 hover:bg-accent/10"
                  onClick={() => handleActualizarCurso(course.id)}
                >
                  <Edit className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  className="text-destructive border-destructive/30 hover:bg-destructive/10"
                  onClick={() => setIdConfirmacionEliminar(course.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>
    );
  };

  const error = errorFetch as Error;

  return (
    <div className="p-4 md:p-8 space-y-8 min-h-screen bg-background">
      <header className="flex justify-between items-center pb-4 border-b border-border">
        <h1 className="text-3xl font-extrabold text-foreground flex items-center gap-3">
          <Zap className="h-7 w-7 text-primary" />
          {esEstudiante ? "MIS CURSOS" : "MIS CURSOS"}
        </h1>

        {!esEstudiante && (
          <Button
            onClick={handleCrearCurso}
            className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2 shadow-md"
            disabled={crearCurso.isPending}
          >
            <Plus className="h-4 w-4" />
            {crearCurso.isPending ? "Creando..." : "Crear Curso"}
          </Button>
        )}
      </header>

      {/* Estado de Carga */}
      {isLoading && (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="mr-2 h-8 w-8 animate-spin text-primary" />
          <span className="text-lg font-medium text-muted-foreground">
            Cargando cursos...
          </span>
        </div>
      )}

      {/* Estado de Error */}
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error.message || "Error al cargar los cursos."}
            <Button
              variant="outline"
              size="sm"
              className="ml-4"
              onClick={() => refetch()}
            >
              Reintentar
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {!isLoading && !error && cursos.length > 0 && (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {cursos.map((curso) => (
            <TarjetaCurso key={curso.id} course={curso} />
          ))}
        </section>
      )}

      {/* Estado Vacío */}
      {!isLoading && !error && cursos.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground">
            {esEstudiante ? "No hay cursos inscritos" : "No se encontraron cursos"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {esEstudiante
              ? "Aún no estás inscrito en ningún curso."
              : "Comienza creando tu primer curso."}
          </p>
          {!esEstudiante && (
            <Button onClick={handleCrearCurso} className="gap-2">
              <Plus className="h-4 w-4" /> Crear Tu Primer Curso
            </Button>
          )}
        </div>
      )}

      {!esEstudiante && (
        <CourseFormModal
          open={modalFormularioAbierto}
          onClose={handleCerrarModalFormulario}
          initialData={cursoAEditar}
          onSave={handleGuardarCurso}
          isSaving={crearCurso.isPending || actualizarCurso.isPending}
        />
      )}
    </div>
  );
}