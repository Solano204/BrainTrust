'use client';

import { useState } from 'react';
import {
  useAdminUnitGrades,
  useAssignUnitFinalGradeAdmin,
  useBulkUpdateUnitGrades,
} from '@/components/admin/hooks/useCourses';
import { UpdateStudentGradeCommand } from '@/components/admin/api/coursesApi';
import { ArrowLeft, Save, Edit2, Check, X } from 'lucide-react';

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
      console.error('Failed to save unit grade:', error);
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
      console.error('Failed to bulk update unit grades:', error);
    }
  };

  if (!isOpen) return null;

  const unitName = unitGrades && unitGrades.length > 0 ? unitGrades[0].unitName : 'Unit';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Course Grades
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{unitName}</h2>
              <p className="text-gray-500 text-sm mt-1">{courseName}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-blue-600">Total Students</div>
              <div className="text-2xl font-bold text-blue-900">
                {unitGrades?.length || 0}
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-green-600">Graded</div>
              <div className="text-2xl font-bold text-green-900">
                {unitGrades?.filter((g) => g.finalGrade && g.finalGrade !== 'N/A').length || 0}
              </div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-sm text-yellow-600">Pending</div>
              <div className="text-2xl font-bold text-yellow-900">
                {unitGrades?.filter((g) => !g.finalGrade || g.finalGrade === 'N/A').length || 0}
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-sm text-purple-600">Average Grade</div>
              <div className="text-2xl font-bold text-purple-900">
                {unitGrades && unitGrades.length > 0
                  ? (
                      unitGrades
                        .filter((g) => g.finalGrade && g.finalGrade !== 'N/A')
                        .reduce((sum, g) => sum + parseFloat(g.finalGrade), 0) /
                      unitGrades.filter((g) => g.finalGrade && g.finalGrade !== 'N/A').length
                    ).toFixed(1)
                  : 'N/A'}
              </div>
            </div>
          </div>

          {Object.keys(editingGrades).length > 0 && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
              <div className="text-blue-900 font-medium">
                {Object.keys(editingGrades).length} grade(s) being edited
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingGrades({})}
                  className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel All
                </button>
                <button
                  onClick={handleBulkSave}
                  disabled={bulkUpdateMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  <Save className="w-4 h-4 inline mr-2" />
                  {bulkUpdateMutation.isPending ? 'Saving...' : 'Save All'}
                </button>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading unit grades...</div>
          ) : unitGrades && unitGrades.length > 0 ? (
            <div className="space-y-3">
              {unitGrades.map((unitGrade) => {
                const isEditing = !!editingGrades[unitGrade.studentId];
                const editData = editingGrades[unitGrade.studentId];

                return (
                  <div
                    key={unitGrade.id}
                    className="p-4 bg-white rounded-lg border border-gray-200"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 mb-2">
                          {unitGrade.studentName}
                        </div>

                        {isEditing ? (
                          <div className="space-y-2">
                            <div className="flex gap-2 items-center">
                              <label className="text-sm font-medium text-gray-700 w-20">
                                Grade:
                              </label>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.1"
                                value={editData.gradeValue}
                                onChange={(e) =>
                                  setEditingGrades({
                                    ...editingGrades,
                                    [unitGrade.studentId]: {
                                      ...editData,
                                      gradeValue: parseFloat(e.target.value) || 0,
                                    },
                                  })
                                }
                                className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-24"
                              />
                            </div>
                            <div className="flex gap-2 items-start">
                              <label className="text-sm font-medium text-gray-700 w-20 pt-1">
                                Feedback:
                              </label>
                              <textarea
                                value={editData.feedback}
                                onChange={(e) =>
                                  setEditingGrades({
                                    ...editingGrades,
                                    [unitGrade.studentId]: {
                                      ...editData,
                                      feedback: e.target.value,
                                    },
                                  })
                                }
                                className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={2}
                                placeholder="Add feedback..."
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex items-center gap-4 text-sm">
                              <span className="text-gray-600">
                                <span className="font-medium">Calculated Total:</span>{' '}
                                {unitGrade.calculatedTotal || 'N/A'}
                              </span>
                              <span className="text-gray-600">
                                <span className="font-medium">Final Grade:</span>{' '}
                                {unitGrade.finalGrade && unitGrade.finalGrade !== 'N/A' ? (
                                  <span className="text-blue-600 font-semibold">
                                    {unitGrade.finalGrade}
                                  </span>
                                ) : (
                                  <span className="text-gray-400">Not graded yet</span>
                                )}
                              </span>
                            </div>

                            {unitGrade.assignmentGrades &&
                              Object.keys(unitGrade.assignmentGrades).length > 0 && (
                                <div className="mt-2">
                                  <div className="text-xs font-medium text-gray-500 mb-1">
                                    Assignments:
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    {Object.entries(unitGrade.assignmentGrades).map(
                                      ([key, grade]: [string, any]) => (
                                        <span
                                          key={key}
                                          className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"
                                        >
                                          {key}: {grade.value || grade.percentage || 'N/A'}
                                        </span>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}

                            {unitGrade.quizGrades &&
                              Object.keys(unitGrade.quizGrades).length > 0 && (
                                <div className="mt-2">
                                  <div className="text-xs font-medium text-gray-500 mb-1">
                                    Quizzes:
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    {Object.entries(unitGrade.quizGrades).map(
                                      ([key, grade]: [string, any]) => (
                                        <span
                                          key={key}
                                          className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs"
                                        >
                                          {key}: {grade.value || grade.percentage || 'N/A'}
                                        </span>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}

                            {unitGrade.finalFeedback && (
                              <div className="text-sm text-gray-600 mt-2">
                                <span className="font-medium">Feedback:</span>{' '}
                                {unitGrade.finalFeedback}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => handleSaveGrade(unitGrade.studentId)}
                              disabled={assignGradeMutation.isPending}
                              className="px-3 py-2 bg-green-50 text-green-700 rounded hover:bg-green-100 transition"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleCancelEdit(unitGrade.studentId)}
                              className="px-3 py-2 bg-gray-50 text-gray-700 rounded hover:bg-gray-100 transition"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() =>
                              handleStartEdit(
                                unitGrade.studentId,
                                unitGrade.finalGrade,
                                unitGrade.finalFeedback
                              )
                            }
                            className="px-3 py-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition"
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
            <div className="text-center py-8 text-gray-500">
              No grades available for this unit
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={onBack}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
          >
            Back
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}