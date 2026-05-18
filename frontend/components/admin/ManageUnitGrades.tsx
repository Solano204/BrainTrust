'use client';

import { useState } from 'react';
import {
  useAdminUnitGrades,
  useAssignUnitFinalGradeAdmin,
  useBulkUpdateUnitGrades,
} from '@/components/admin/hooks/useCourses';
import { ArrowLeft, Save, Edit2, Check, X, Loader2, BarChart3 } from 'lucide-react';
import { UpdateStudentGradeCommand } from '@/app/shared/dtos/commands/course.commands';

interface ManageUnitGradesProps {
  unitId: string;
  courseName: string;
  isOpen: boolean;
  onBack: () => void;
  onClose: () => void;
}

export function ManageUnitGrades({
  unitId,
  courseName,
  isOpen,
  onBack,
  onClose,
}: ManageUnitGradesProps) {
  const { data: unitGrades, isLoading } = useAdminUnitGrades(unitId);
  const assignGradeMutation = useAssignUnitFinalGradeAdmin();
  const bulkUpdateMutation = useBulkUpdateUnitGrades();

  const [editingGrades, setEditingGrades] = useState<
    Record<string, { gradeValue: number; feedback: string }>
  >({});

  const handleStartEdit = (studentId: string, currentGrade?: string, currentFeedback?: string) => {
    setEditingGrades({
      ...editingGrades,
      [studentId]: {
        gradeValue: parseFloat(currentGrade || '0'),
        feedback: currentFeedback || '',
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
        unitId,
        studentId,
        gradeValue: gradeData.gradeValue,
        feedback: gradeData.feedback,
      });

      handleCancelEdit(studentId);
    } catch (error) {
      console.error('Error al guardar la calificación de la unidad:', error);
    }
  };

  const handleBulkSave = async () => {
    const gradeCommands: UpdateStudentGradeCommand[] = Object.entries(editingGrades).map(
      ([studentId, data]) => ({
        studentId,
        gradeValue: data.gradeValue,
        feedback: data.feedback,
      })
    );

    try {
      await bulkUpdateMutation.mutateAsync({
        unitId,
        grades: gradeCommands,
      });

      setEditingGrades({});
    } catch (error) {
      console.error('Error al actualizar calificaciones de unidad en lote:', error);
    }
  };

  if (!isOpen) return null;

  const unitName = unitGrades && unitGrades.length > 0 ? unitGrades[0].unitName : 'Unidad';
return (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
    <div className="bg-card rounded-3xl border border-border shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">

      {/* ── Header ── */}
      <div className="px-5 py-4 sm:px-7 sm:py-5 border-b border-border flex-shrink-0 rounded-t-3xl">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Volver a Calificaciones del Curso
        </button>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-9 h-9 rounded-2xl flex items-center justify-center bg-primary/10 flex-shrink-0">
              <BarChart3 className="w-4 h-4 text-primary" />
            </span>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-foreground tracking-tight truncate">
                {unitName}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{courseName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-7 space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Total Estudiantes</p>
            <p className="text-2xl font-bold text-foreground">{unitGrades?.length || 0}</p>
          </div>
          <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4">
            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Calificados</p>
            <p className="text-2xl font-bold text-foreground">
              {unitGrades?.filter((g) => g.finalGrade && g.finalGrade !== 'N/A').length || 0}
            </p>
          </div>
          <div className="bg-accent/10 border border-accent/20 rounded-2xl p-4">
            <p className="text-xs font-semibold text-accent-foreground uppercase tracking-wider mb-1">Pendientes</p>
            <p className="text-2xl font-bold text-foreground">
              {unitGrades?.filter((g) => !g.finalGrade || g.finalGrade === 'N/A').length || 0}
            </p>
          </div>
          <div className="bg-muted/50 border border-border rounded-2xl p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Promedio</p>
            <p className="text-2xl font-bold text-foreground">
              {unitGrades && unitGrades.length > 0
                ? (
                    unitGrades
                      .filter((g) => g.finalGrade && g.finalGrade !== 'N/A')
                      .reduce((sum, g) => sum + parseFloat(g.finalGrade), 0) /
                    unitGrades.filter((g) => g.finalGrade && g.finalGrade !== 'N/A').length
                  ).toFixed(1)
                : 'N/A'}
            </p>
          </div>
        </div>

        {/* Bulk edit banner */}
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
                <Save className="w-4 h-4" />
                {bulkUpdateMutation.isPending ? 'Guardando...' : 'Guardar Todo'}
              </button>
            </div>
          </div>
        )}

        {/* Grade rows */}
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Cargando calificaciones de la unidad...</span>
          </div>
        ) : unitGrades && unitGrades.length > 0 ? (
          <div className="space-y-3">
            {unitGrades.map((unitGrade) => {
              const isEditing = !!editingGrades[unitGrade.studentId];
              const editData  = editingGrades[unitGrade.studentId];

              return (
                <div
                  key={unitGrade.id}
                  className="p-4 bg-card rounded-2xl border border-border hover:bg-muted/10 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">

                      {/* Student name */}
                      <p className="font-semibold text-sm text-foreground mb-3">
                        {unitGrade.studentName}
                      </p>

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
                                [unitGrade.studentId]: { ...editData, gradeValue: parseFloat(e.target.value) || 0 },
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
                                [unitGrade.studentId]: { ...editData, feedback: e.target.value },
                              })}
                              className="flex-1 px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 resize-none transition-all"
                              rows={2}
                              placeholder="Agregar retroalimentación..."
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">

                          {/* Totals row */}
                          <div className="flex flex-wrap items-center gap-4 text-sm">
                            <span className="text-muted-foreground">
                              <span className="font-semibold text-foreground">Total Calculado: </span>
                              {unitGrade.calculatedTotal || 'N/A'}
                            </span>
                            <span className="text-muted-foreground">
                              <span className="font-semibold text-foreground">Calificación Final: </span>
                              {unitGrade.finalGrade && unitGrade.finalGrade !== 'N/A' ? (
                                <span className="font-bold text-primary">{unitGrade.finalGrade}</span>
                              ) : (
                                <span className="italic text-muted-foreground/60">Aún no calificado</span>
                              )}
                            </span>
                          </div>

                          {/* Assignment badges */}
                          {unitGrade.assignmentGrades && Object.keys(unitGrade.assignmentGrades).length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">
                                Tareas
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {Object.entries(unitGrade.assignmentGrades).map(([key, grade]: [string, any]) => (
                                  <span
                                    key={key}
                                    className="px-2 py-1 bg-primary/10 text-primary rounded-lg text-xs font-medium"
                                  >
                                    {key}: {grade.value || grade.percentage || 'N/A'}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Quiz badges */}
                          {unitGrade.quizGrades && Object.keys(unitGrade.quizGrades).length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">
                                Cuestionarios
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {Object.entries(unitGrade.quizGrades).map(([key, grade]: [string, any]) => (
                                  <span
                                    key={key}
                                    className="px-2 py-1 bg-accent/20 text-accent-foreground rounded-lg text-xs font-medium"
                                  >
                                    {key}: {grade.value || grade.percentage || 'N/A'}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Feedback */}
                          {unitGrade.finalFeedback && (
                            <p className="text-xs text-muted-foreground">
                              <span className="font-semibold text-foreground">Retroalimentación: </span>
                              {unitGrade.finalFeedback}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-1.5 flex-shrink-0">
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => handleSaveGrade(unitGrade.studentId)}
                            disabled={assignGradeMutation.isPending}
                            className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-40 transition-all"
                            title="Guardar calificación"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleCancelEdit(unitGrade.studentId)}
                            className="p-2 rounded-xl bg-muted text-muted-foreground hover:bg-muted/80 transition-all"
                            title="Cancelar"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleStartEdit(unitGrade.studentId, unitGrade.finalGrade, unitGrade.finalFeedback)}
                          className="p-2 rounded-xl text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all"
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
            No hay calificaciones disponibles para esta unidad
          </p>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="px-5 py-4 sm:px-7 border-t border-border bg-muted/30 flex-shrink-0 rounded-b-3xl">
        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>
          <button
            onClick={onClose}
            className="flex-1 flex items-center justify-center px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 active:scale-95 transition-all"
          >
            Cerrar
          </button>
        </div>
      </div>

    </div>
  </div>
);
}