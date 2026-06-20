"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Clock,
  Users,
  BookOpen,
  Loader2,
  AlertTriangle,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";
import Image from "next/image";
import { CourseId } from "@/app/domain/valueObjects/CourseValues";
import { ModalFormularioUnidad } from "./unit-form-modal-student-teacher";
import { useCourseAllUnits } from "@/components/teacher/hooks/courses-hooks";
import { useUnitMutations } from "@/app/presentation/hooks/course/unit-hooks";
import { useAuth } from "@/app/context/AuthContext";
import { CourseUnitDTO, fetchCourseById } from "../student/api/student-courses";
import { useQuery } from "@tanstack/react-query";

const TituloComponente: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  children,
  ...props
}) => (
  <h2 className={className} {...props}>
    {children}
  </h2>
);

const NumeroComponente: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <span className="text-3xl font-extrabold text-white">{children}</span>;

const DescripcionComponente: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <p className="text-sm text-muted-foreground">{children}</p>;

interface PropsVistaGeneralCurso {
  courseId: CourseId;
  onSelectUnit: (unitId: string) => void;
}

export function CourseOverview({
  courseId,
  onSelectUnit,
}: PropsVistaGeneralCurso) {
  const {
    data: datosCurso,
    isLoading: cargandoCurso,
    error: errorCurso,
  } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => fetchCourseById(courseId!),
    enabled: !!courseId,
  });

  const {
    units: unidades,
    isLoading: cargandoUnidades,
    error: errorUnidades,
    refetch: recargarUnidades,
  } = useCourseAllUnits(courseId);

  const { user } = useAuth();
  const esEstudiante = user?.role === "student";

  const [modalUnidadAbierto, setModalUnidadAbierto] = React.useState(false);
  const [unidadAEditar, setUnidadAEditar] = React.useState<any>(undefined);
  const [idConfirmacionEliminar, setIdConfirmacionEliminar] = React.useState<string | null>(null);

  const {
    createUnit: crearUnidad,
    updateUnit: actualizarUnidad,
    deleteUnit: eliminarUnidad,
  } = useUnitMutations();

  const cargando = cargandoCurso || cargandoUnidades;
  const error = errorCurso || errorUnidades;

  const handleCrearUnidad = () => {
    if (esEstudiante) return;
    setUnidadAEditar(undefined);
    setModalUnidadAbierto(true);
  };

  const handleEditarUnidad = (unidad: any) => {
    if (esEstudiante) return;
    setUnidadAEditar(unidad);
    setModalUnidadAbierto(true);
  };

  const handleCerrarModalUnidad = () => {
    setModalUnidadAbierto(false);
    setUnidadAEditar(undefined);
  };

 const handleGuardarUnidad = async (
  datosUnidad: any,
  unidadId?: string,
  archivoImagen?: File | null
) => {
  if (esEstudiante) return;

  try {
    if (unidadId) {
      console.log("Actualizando unidad con ID:", unidadId);
      console.log("Tiene nuevo archivo de imagen:", !!archivoImagen);
      
      const unidadActual = unidades?.find(u => u.id === unidadId);
      const urlImagenAnterior = unidadActual?.urlImage;
      
      await actualizarUnidad.mutateAsync(
        {
          unitId: unidadId,
          unitData: datosUnidad,
          imageFile: archivoImagen || undefined,
          oldImageUrl: urlImagenAnterior || undefined,
        },
        {
          onSuccess: () => {
            handleCerrarModalUnidad();
            recargarUnidades();
          },
        }
      );
    } else {
      console.log("Creando nueva unidad");
      console.log("Tiene archivo de imagen:", !!archivoImagen);
      
      await crearUnidad.mutateAsync(
        {
          courseId,
          unitData: {
            ...datosUnidad,
            numUnity: (unidades?.length || 0) + 1,
          },
          imageFile: archivoImagen || undefined
        },
        {
          onSuccess: () => {
            handleCerrarModalUnidad();
            recargarUnidades();
          },
        }
      );
    }
  } catch (error) {
    console.error("Error al guardar la unidad:", error);
  }
};

  const handleEliminarUnidad = (unidadId: string) => {
    if (esEstudiante) return;
    eliminarUnidad.mutate(unidadId, {
      onSuccess: () => {
        setIdConfirmacionEliminar(null);
        recargarUnidades();
      },
    });
  };

  if (cargando) {
    return (
      <Card className="p-8 h-80 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-lg font-medium text-muted-foreground">
          Cargando Curso...
        </p>
      </Card>
    );
  }

  if (error || !datosCurso) {
    return (
      <Card className="p-8 h-80 flex flex-col items-center justify-center space-y-4 bg-red-50 dark:bg-red-900/10 border-red-500">
        <AlertTriangle className="h-8 w-8 text-destructive" />
        <h3 className="text-xl font-bold text-destructive">
          Error al Cargar el Curso
        </h3>
        <p className="text-muted-foreground">
          {error?.message || "Datos del curso no disponibles."}
        </p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Reintentar
        </Button>
      </Card>
    );
  }

  const cantidadEstudiantes = datosCurso.enrollments?.length || 0;
  const duracionCurso = "12 semanas";
  const cantidadUnidades = unidades?.length || 0;
return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8 space-y-6 sm:space-y-8">
      <div className="relative">
        <Card className="overflow-hidden">
          <div className="relative h-48 sm:h-64 md:h-80 bg-gradient-to-br from-primary to-primary/70">
            <Image
              src={
                datosCurso.urlImage ||
                "https://placehold.co/800x300/4F46E5/FFFFFF?text=Imagen+del+Curso"
              }
              alt={datosCurso.name}
              fill
              className="object-cover opacity-20"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white p-4 sm:p-6">
                <Badge className="mb-3 sm:mb-4 bg-white/20 text-white border-white/30 backdrop-blur-sm text-xs sm:text-sm">
                  {datosCurso.code}
                </Badge>
                <TituloComponente className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 text-balance px-2">
                  {datosCurso.name}
                </TituloComponente>
                <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-2xl mx-auto text-balance px-2">
                  {datosCurso.description}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card border-t border-border p-4 sm:p-6">
            <div className="flex flex-wrap gap-4 sm:gap-6 justify-center text-sm sm:text-base">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                <span className="font-medium">{cantidadEstudiantes} Estudiantes</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                <span className="font-medium">{duracionCurso}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                <DescripcionComponente>{cantidadUnidades} Unidades</DescripcionComponente>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6 sm:p-8 lg:p-10">
        <div className="flex justify-between items-center mb-6">
          <TituloComponente className="text-2xl font-bold text-foreground">
            Unidades del Curso
          </TituloComponente>

          {!esEstudiante && (
            <Button
              onClick={handleCrearUnidad}
              className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground"
              disabled={crearUnidad.isPending}
            >
              <Plus className="h-4 w-4" />
              {crearUnidad.isPending ? "Creando..." : "Agregar Unidad"}
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {unidades?.map((unidad) => (
            <TarjetaUnidad
              key={unidad.id}
              unidad={unidad}
              onSelect={onSelectUnit}
              onEdit={handleEditarUnidad}
              onDelete={handleEliminarUnidad}
              deleteConfirmId={idConfirmacionEliminar}
              setDeleteConfirmId={setIdConfirmacionEliminar}
              isDeleting={eliminarUnidad.isPending}
              isStudent={esEstudiante}
            />
          ))}
        </div>

        {(!unidades || unidades.length === 0) && (
          <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">
              {esEstudiante ? "No hay unidades disponibles" : "Aún no hay unidades"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {esEstudiante
                ? "Vuelve más tarde para ver el contenido del curso"
                : "Comienza creando tu primera unidad"}
            </p>
            {!esEstudiante && (
              <Button onClick={handleCrearUnidad} className="gap-2">
                <Plus className="h-4 w-4" /> Crear Primera Unidad
              </Button>
            )}
          </div>
        )}
      </Card>

      {!esEstudiante && (
        <ModalFormularioUnidad
          open={modalUnidadAbierto}
          onClose={handleCerrarModalUnidad}
          initialData={unidadAEditar}
          onSave={handleGuardarUnidad}
          isSaving={crearUnidad.isPending || actualizarUnidad.isPending}
        />
      )}
    </div>
  );
}

interface PropsTarjetaUnidad {
  unidad: CourseUnitDTO;
  onSelect: (unitId: string) => void;
  onEdit: (unidad: CourseUnitDTO) => void;
  onDelete: (unitId: string) => void;
  deleteConfirmId: string | null;
  setDeleteConfirmId: (id: string | null) => void;
  isDeleting: boolean;
  isStudent: boolean;
}

const TarjetaUnidad: React.FC<PropsTarjetaUnidad> = ({
  unidad,
  onSelect,
  onEdit,
  onDelete,
  deleteConfirmId,
  setDeleteConfirmId,
  isDeleting,
  isStudent,
}) => {
  const pendienteEliminacion = deleteConfirmId === unidad.id;

  return (
    <Card className="group cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-300 overflow-hidden relative">
      <div className="relative h-32 bg-gradient-to-br from-blue-50 to-gray-50 dark:from-blue-950/20 dark:to-gray-950/20 flex items-center justify-center">
        <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
          <NumeroComponente>{unidad.numUnity}</NumeroComponente>
        </div>

        {unidad.urlImage && (
          <Image
            src={unidad.urlImage}
            alt={unidad.name}
            fill
            className="object-cover opacity-10"
          />
        )}

        {!isStudent && (
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 bg-white/80 hover:bg-white"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(unidad)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setDeleteConfirmId(unidad.id)}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      <div className="p-6 space-y-4">
        <div>
          <TituloComponente
            className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors cursor-pointer"
            onClick={() => onSelect(unidad.id)}
          >
            {unidad.name}
          </TituloComponente>
          <DescripcionComponente>{unidad.description}</DescripcionComponente>
        </div>

        {!isStudent && pendienteEliminacion ? (
          <div className="flex gap-2 pt-2">
            <Button
              variant="destructive"
              size="sm"
              className="flex-1 gap-2"
              onClick={() => onDelete(unidad.id)}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Trash2 className="h-3 w-3" />
              )}
              {isDeleting ? "Eliminando..." : "Confirmar"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteConfirmId(null)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
          </div>
        ) : (
          <Button
            variant="default"
            className="w-full gap-2"
            onClick={() => onSelect(unidad.id)}
          >
            {isStudent ? (
              <>
                <Eye className="h-4 w-4" />
                Ver Unidad
              </>
            ) : (
              <>
                Entrar a Unidad
                <BookOpen className="h-4 w-4" />
              </>
            )}
          </Button>
        )}
      </div>
    </Card>
  );
};