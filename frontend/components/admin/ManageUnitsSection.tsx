 'use client';

import { useState } from 'react';
import { useAdminCourseUnits, useDeleteUnitAdmin } from '@/components/admin/hooks/useCourses';
import { Trash2, BookOpen, BarChart3, Loader2 } from 'lucide-react';

interface ManageUnitsSectionProps {
  courseId: string;
  courseName: string;
}

export function ManageUnitsSection({ courseId, courseName }: ManageUnitsSectionProps) {
  const { data: units, isLoading } = useAdminCourseUnits(courseId);
  const deleteMutation = useDeleteUnitAdmin();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleDeleteUnit = async (unitId: string) => {
    if (deleteConfirm === unitId) {
      try {
        await deleteMutation.mutateAsync({ courseId, unitId });
        setDeleteConfirm(null);
      } catch (error) {
        console.error('Error al eliminar la unidad:', error);
      }
    } else {
      setDeleteConfirm(unitId);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8 text-gray-500">
        Cargando unidades...
      </div>
    );
  }

  if (!units || units.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No hay unidades disponibles para este curso
      </div>
    );
  }
return (
  <div className="space-y-4">

    {/* ── Encabezado ── */}
    <div className="flex items-center justify-between">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
        Unidades del Curso
      </h3>
      <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-bold">
        {units.length} unidades
      </span>
    </div>

    {/* ── Lista de unidades ── */}
    <div className="space-y-3">
      {units.map((unit) => (
        <div
          key={unit.id}
          className="p-4 bg-card rounded-2xl border border-border hover:border-primary/30 hover:bg-muted/10 transition-all"
        >
          <div className="flex items-start gap-4">

            {/* Imagen de la unidad */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-xl overflow-hidden bg-primary">
              {unit.urlImage ? (
                <img
                  src={unit.urlImage}
                  alt={unit.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpen className="w-7 h-7 text-primary-foreground" />
                </div>
              )}
            </div>

            {/* Contenido */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="font-semibold text-sm text-foreground truncate">
                    {unit.name}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {unit.description}
                  </p>
                  <span className="inline-block mt-2 px-2 py-0.5 bg-primary/10 text-primary text-xs font-semibold rounded-md">
                    Unidad #{unit.numUnity}
                  </span>
                </div>

                <button
                  onClick={() => handleDeleteUnit(unit.id)}
                  disabled={deleteMutation.isPending}
                  className={`p-2 rounded-xl flex-shrink-0 transition-all disabled:opacity-40 ${
                    deleteConfirm === unit.id
                      ? 'bg-destructive text-destructive-foreground'
                      : 'bg-destructive/10 text-destructive hover:bg-destructive/20'
                  }`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {deleteConfirm === unit.id && (
                <p className="mt-2 text-xs font-medium text-destructive">
                  Haz clic nuevamente para confirmar la eliminación
                </p>
              )}
            </div>

          </div>
        </div>
      ))}
    </div>

  </div>
);
}

interface CourseUnitsCardProps {
  courseId: string;
  courseName: string;
  onManageGrades?: (unitId: string) => void;
}

export function CourseUnitsCard({ courseId, courseName, onManageGrades }: CourseUnitsCardProps) {
  const { data: units, isLoading } = useAdminCourseUnits(courseId);
  const deleteMutation = useDeleteUnitAdmin();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleDeleteUnit = async (unitId: string) => {
    if (deleteConfirm === unitId) {
      try {
        await deleteMutation.mutateAsync({ courseId, unitId });
        setDeleteConfirm(null);
      } catch (error) {
        console.error('Error al eliminar la unidad:', error);
      }
    } else {
      setDeleteConfirm(unitId);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };
return (
  <div className="bg-card rounded-2xl border border-border p-5 sm:p-6">

    {/* ── Encabezado ── */}
    <div className="flex items-center justify-between mb-5">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
        Gestión de Unidades
      </h3>
      {units && (
        <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-bold">
          {units.length} {units.length === 1 ? 'Unidad' : 'Unidades'}
        </span>
      )}
    </div>

    {/* ── Estados ── */}
    {isLoading ? (
      <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Cargando unidades...</span>
      </div>
    ) : units && units.length > 0 ? (
      <div className="space-y-3">
        {units.map((unit) => (
          <div
            key={unit.id}
            className="p-4 bg-muted/30 rounded-xl border border-border hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center justify-between gap-3">

              {/* Información */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-sm text-foreground">
                    {unit.name}
                  </span>
                  <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-semibold rounded-md">
                    Unidad {unit.numUnity}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {unit.description}
                </p>
              </div>

              {/* Acciones */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {onManageGrades && (
                  <button
                    onClick={() => onManageGrades(unit.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-all"
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    Calificaciones
                  </button>
                )}
                <button
                  onClick={() => handleDeleteUnit(unit.id)}
                  disabled={deleteMutation.isPending}
                  className={`p-2 rounded-xl transition-all disabled:opacity-40 ${
                    deleteConfirm === unit.id
                      ? 'bg-destructive text-destructive-foreground'
                      : 'bg-destructive/10 text-destructive hover:bg-destructive/20'
                  }`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {deleteConfirm === unit.id && (
              <p className="mt-2 text-xs font-medium text-destructive text-center">
                Haz clic nuevamente para confirmar la eliminación
              </p>
            )}
          </div>
        ))}
      </div>
    ) : (
      <p className="text-center py-12 text-sm text-muted-foreground">
        No se han creado unidades para este curso aún
      </p>
    )}

  </div>
);
}