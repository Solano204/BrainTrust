'use client';

"use client";

import { useState } from "react";
import {
  useAdminCourseGrades,
  useAdminCourseUnits,
  useAssignFinalGradeAdmin,
  useBulkUpdateCourseGrades,
} from "@/components/admin/hooks/useCourses";

import { X, Save, Edit2, Check, Loader2, BookOpen, BarChart3 } from "lucide-react";
import { ManageUnitGrades } from "./ManageUnitGrades";
import { UpdateStudentGradeCommand } from "@/app/shared/dtos/commands/course.commands";
import { AdminCourse } from "@/app/shared/models/admin-course.model";

interface ManageGradesProps {
  course: AdminCourse;
  isOpen: boolean;
  onClose: () => void;
}

export function ManageGrades({ course, isOpen, onClose }: ManageGradesProps) {
  const { data: grades, isLoading, refetch } = useAdminCourseGrades(course.id);

  console.log("id", course.id);
  console.log("cgrades", grades);
  const { data: units } = useAdminCourseUnits(course.id);
  const assignGradeMutation = useAssignFinalGradeAdmin();
  const bulkUpdateMutation = useBulkUpdateCourseGrades();

  const [editingGrades, setEditingGrades] = useState<
    Record<string, { gradeValue: number; feedback: string }>
  >({});
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"course" | "unit">("course");

  const handleStartEdit = (
    studentId: string,
    currentGrade?: number,
    currentFeedback?: string
  ) => {
    setEditingGrades({
      ...editingGrades,
      [studentId]: {
        gradeValue: currentGrade || 0,
        feedback: currentFeedback || "",
      },
    });
  };

  const handleCancelEdit = (studentId: string) => {
    const updated = { ...editingGrades };
    delete updated[studentId];
    setEditingGrades(updated);
  };

  const handleSaveGrade = async (studentId: string) => {
    const gradeData = editingGrades[studentId];
    if (!gradeData) return;

    try {
      await assignGradeMutation.mutateAsync({
        courseId: course.id,
        studentId,
        gradeValue: gradeData.gradeValue,
        feedback: gradeData.feedback,
      });

      handleCancelEdit(studentId);
      refetch();
    } catch (error) {
      console.error("Error al guardar la calificación:", error);
    }
  };

  const handleBulkSave = async () => {
    const gradeCommands: UpdateStudentGradeCommand[] = Object.entries(
      editingGrades
    ).map(([studentId, data]) => ({
      studentId,
      gradeValue: data.gradeValue,
      feedback: data.feedback,
    }));

    try {
      await bulkUpdateMutation.mutateAsync({
        courseId: course.id,
        grades: gradeCommands,
      });

      setEditingGrades({});
      refetch();
    } catch (error) {
      console.error("Error al actualizar calificaciones en lote:", error);
    }
  };

  const handleBackToUnitSelection = () => {
    setSelectedUnit(null);
  };

  if (!isOpen) return null;

  if (viewMode === "unit" && selectedUnit) {
    return (
      <ManageUnitGrades
        unitId={selectedUnit}
        courseName={course.name}
        isOpen={isOpen}
        onBack={handleBackToUnitSelection}
        onClose={onClose}
      />
    );
  }
return (
  <div
    className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
    onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
  >
    <div
      className="bg-card rounded-3xl border border-border shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      onClick={(e) => e.stopPropagation()}
    >

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-4 sm:px-7 sm:py-5 border-b border-border flex-shrink-0 rounded-t-3xl">
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-2xl flex items-center justify-center bg-primary/10 flex-shrink-0">
            <BarChart3 className="w-4 h-4 text-primary" />
          </span>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
              Gestionar Calificaciones
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">{course.name}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* ── View mode tabs ── */}
      <div className="px-5 sm:px-7 pt-4 flex gap-2 flex-shrink-0">
        <button
          onClick={() => setViewMode("course")}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            viewMode === "course"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          Calificaciones Finales del Curso
        </button>
        {units && units.length > 0 && (
          <button
            onClick={() => setViewMode("unit")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              viewMode === "unit"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            Calificaciones por Unidad
          </button>
        )}
      </div>

      {/* ── Body ── */}
      <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-7 space-y-5">

        {viewMode === "unit" ? (

          /* ── Unit picker ── */
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">
              Seleccionar una Unidad
            </h3>
            {units?.map((unit) => (
              <button
                key={unit.id}
                onClick={() => setSelectedUnit(unit.id)}
                className="w-full p-4 bg-card rounded-2xl border-2 border-border hover:border-primary/50 hover:bg-muted/20 transition-all text-left flex items-center gap-3 group"
              >
                <span className="w-9 h-9 rounded-xl flex items-center justify-center bg-primary/10 flex-shrink-0 group-hover:bg-primary/20 transition-all">
                  <BookOpen className="w-4 h-4 text-primary" />
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-foreground">{unit.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{unit.description}</p>
                </div>
              </button>
            ))}
          </div>

        ) : (

          <>
            {/* ── Stats ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
                <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Total Estudiantes</p>
                <p className="text-2xl font-bold text-foreground">{grades?.length || 0}</p>
              </div>
              <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4">
                <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Calificados</p>
                <p className="text-2xl font-bold text-foreground">
                  {grades?.filter((g) => g.finalGrade !== null).length || 0}
                </p>
              </div>
              <div className="bg-accent/10 border border-accent/20 rounded-2xl p-4">
                <p className="text-xs font-semibold text-accent-foreground uppercase tracking-wider mb-1">Pendientes</p>
                <p className="text-2xl font-bold text-foreground">
                  {grades?.filter((g) => g.finalGrade === null).length || 0}
                </p>
              </div>
              <div className="bg-muted/50 border border-border rounded-2xl p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Promedio</p>
                <p className="text-2xl font-bold text-foreground">
                  {grades && grades.length > 0
                    ? (
                        grades.filter((g) => g.finalGrade !== null)
                          .reduce((sum, g) => sum + ((g.finalGrade?.value as unknown as number) || 0), 0) /
                        grades.filter((g) => g.finalGrade !== null).length
                      ).toFixed(1)
                    : "N/A"}
                </p>
              </div>
            </div>

            {/* ── Bulk edit banner ── */}
            {Object.keys(editingGrades).length > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/20">
                <p className="text-sm font-semibold text-foreground">
                  <span className="px-1.5 py-0.5 rounded-md bg-primary/10 text-primary font-bold mr-1.5">
                    {Object.keys(editingGrades).length}
                  </span>
                  calificación(es) siendo editadas
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingGrades({})}
                    className="px-4 py-2 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                  >
                    Cancelar Todo
                  </button>
                  <button
                    onClick={handleBulkSave}
                    disabled={bulkUpdateMutation.isPending}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-40 transition-all"
                  >
                    {bulkUpdateMutation.isPending ? (
                      <><Loader2 className="w-4 h-4 animate-spin" />Guardando...</>
                    ) : (
                      <><Save className="w-4 h-4" />Guardar Todo</>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* ── Grade rows ── */}
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">Cargando calificaciones...</span>
              </div>
            ) : grades && grades.length > 0 ? (
              <div className="space-y-3">
                {grades.map((enrollment) => {
                  const isEditing = !!editingGrades[enrollment.studentId];
                  const editData  = editingGrades[enrollment.studentId];

                  return (
                    <div
                      key={enrollment.id}
                      className="p-4 bg-card rounded-2xl border border-border hover:bg-muted/10 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-1 min-w-0">

                          {/* Student info */}
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <span className="font-semibold text-sm text-foreground">
                              {enrollment.studentName}
                            </span>
                            <span className="text-xs text-muted-foreground truncate">
                              {enrollment.studentEmail}
                            </span>
                            <span className={`px-2 py-0.5 text-xs rounded-md font-semibold ${
                              enrollment.status === "ACTIVE"
                                ? "bg-primary/10 text-primary"
                                : "bg-muted text-muted-foreground"
                            }`}>
                              {enrollment.status === "ACTIVE" ? "ACTIVO" : enrollment.status}
                            </span>
                          </div>

                          {/* Edit mode */}
                          {isEditing ? (
                            <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                <label className="text-xs font-semibold text-muted-foreground w-20 flex-shrink-0">
                                  Calificación:
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="0.1"
                                  value={editData.gradeValue}
                                  onChange={(e) => setEditingGrades({
                                    ...editingGrades,
                                    [enrollment.studentId]: { ...editData, gradeValue: parseFloat(e.target.value) || 0 },
                                  })}
                                  className="w-24 px-3 py-1.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all"
                                />
                              </div>
                              <div className="flex items-start gap-3">
                                <label className="text-xs font-semibold text-muted-foreground w-20 flex-shrink-0 pt-2">
                                  Retroalimentación:
                                </label>
                                <textarea
                                  value={editData.feedback}
                                  onChange={(e) => setEditingGrades({
                                    ...editingGrades,
                                    [enrollment.studentId]: { ...editData, feedback: e.target.value },
                                  })}
                                  className="flex-1 px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 resize-none transition-all"
                                  rows={2}
                                  placeholder="Agregar retroalimentación..."
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm">
                              <span className="text-muted-foreground">Calificación: </span>
                              {enrollment.finalGrade ? (
                                <span className="font-semibold text-primary">
                                  {enrollment.finalGrade.value}
                                </span>
                              ) : (
                                <span className="text-muted-foreground/60 italic">Aún no calificado</span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-1.5 flex-shrink-0">
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => handleSaveGrade(enrollment.studentId)}
                                disabled={assignGradeMutation.isPending}
                                className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-40 transition-all"
                                title="Guardar calificación"
                              >
                                {assignGradeMutation.isPending
                                  ? <Loader2 className="w-4 h-4 animate-spin" />
                                  : <Check className="w-4 h-4" />}
                              </button>
                              <button
                                onClick={() => handleCancelEdit(enrollment.studentId)}
                                className="p-2 rounded-xl bg-muted text-muted-foreground hover:bg-muted/80 transition-all"
                                title="Cancelar"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleStartEdit(enrollment.studentId, Number(enrollment.finalGrade?.value) || 0)}
                              className="p-2 rounded-xl hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all"
                              title="Editar calificación"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center py-12 text-sm text-muted-foreground">
                No hay estudiantes inscritos en este curso
              </p>
            )}
          </>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="px-5 py-4 sm:px-7 border-t border-border bg-muted/30 flex-shrink-0 rounded-b-3xl">
        <button
          onClick={onClose}
          className="w-full flex items-center justify-center px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
        >
          Cerrar
        </button>
      </div>

    </div>
  </div>
);
}