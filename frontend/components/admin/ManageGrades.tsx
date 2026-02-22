"use client";

import { useState } from "react";
import {
  useAdminCourseGrades,
  useAdminCourseUnits,
  useAssignFinalGradeAdmin,
  useBulkUpdateCourseGrades,
} from "@/components/admin/hooks/useCourses";
import {
  AdminCourse,
  UpdateStudentGradeCommand,
} from "@/components/admin/api/coursesApi";
import { X, Save, Edit2, Check, Loader2, BookOpen } from "lucide-react";
import { ManageUnitGrades } from "./ManageUnitGrades";

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
      console.error("Failed to save grade:", error);
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
      console.error("Failed to bulk update grades:", error);
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
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Manage Grades</h2>
            <p className="text-gray-500 text-sm mt-1">{course.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="px-6 pt-4 flex gap-2">
          <button
            onClick={() => setViewMode("course")}
            className={`px-4 py-2 rounded-lg transition ${
              viewMode === "course"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Course Final Grades
          </button>
          {units && units.length > 0 && (
            <button
              onClick={() => setViewMode("unit")}
              className={`px-4 py-2 rounded-lg transition ${
                viewMode === "unit"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Unit Grades
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {viewMode === "unit" ? (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 mb-4">
                Select a Unit
              </h3>
              {units?.map((unit) => (
                <button
                  key={unit.id}
                  onClick={() => setSelectedUnit(unit.id)}
                  className="w-full p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-500 transition text-left flex items-center gap-3"
                >
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{unit.name}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      {unit.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm text-blue-600">Total Students</div>
                  <div className="text-2xl font-bold text-blue-900">
                    {grades?.length || 0}
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm text-green-600">Graded</div>
                  <div className="text-2xl font-bold text-green-900">
                    {grades?.filter((g) => g.finalGrade !== null).length || 0}
                  </div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="text-sm text-yellow-600">Pending</div>
                  <div className="text-2xl font-bold text-yellow-900">
                    {grades?.filter((g) => g.finalGrade === null).length || 0}
                  </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-sm text-purple-600">Average Grade</div>
                  <div className="text-2xl font-bold text-purple-900">
                    {grades && grades.length > 0
                      ? (
                          grades
                            .filter((g) => g.finalGrade !== null)
                            .reduce(
                              (sum, g) =>
                                sum +
                                ((g.finalGrade?.value as unknown as number) ||
                                  0),
                              0
                            ) /
                          grades.filter((g) => g.finalGrade !== null).length
                        ).toFixed(1)
                      : "N/A"}
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
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
                    >
                      {bulkUpdateMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Save All
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {isLoading ? (
                <div className="text-center py-8 flex items-center justify-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                  <span className="text-gray-500">Loading grades...</span>
                </div>
              ) : grades && grades.length > 0 ? (
                <div className="space-y-3">
                  {grades.map((enrollment) => {
                    const isEditing = !!editingGrades[enrollment.studentId];
                    const editData = editingGrades[enrollment.studentId];

                    return (
                      <div
                        key={enrollment.id}
                        className="p-4 bg-white rounded-lg border border-gray-200"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium text-gray-900">
                                {enrollment.studentName}
                              </span>
                              <span className="text-sm text-gray-500">
                                {enrollment.studentEmail}
                              </span>
                              <span
                                className={`px-2 py-0.5 text-xs rounded ${
                                  enrollment.status === "ACTIVE"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {enrollment.status}
                              </span>
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
                                        [enrollment.studentId]: {
                                          ...editData,
                                          gradeValue:
                                            parseFloat(e.target.value) || 0,
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
                                        [enrollment.studentId]: {
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
                              <div className="space-y-1">
                                <div className="text-sm text-gray-600">
                                  <span className="font-medium">Grade:</span>{" "}
                                  {enrollment.finalGrade ? (
                                    <span className="text-blue-600 font-semibold">
                                      {enrollment.finalGrade.value}
                                    </span>
                                  ) : (
                                    <span className="text-gray-400">
                                      Not graded yet
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={() =>
                                    handleSaveGrade(enrollment.studentId)
                                  }
                                  disabled={assignGradeMutation.isPending}
                                  className="px-3 py-2 bg-green-50 text-green-700 rounded hover:bg-green-100 transition disabled:opacity-50"
                                  title="Save grade"
                                >
                                  {assignGradeMutation.isPending ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Check className="w-4 h-4" />
                                  )}
                                </button>
                                <button
                                  onClick={() =>
                                    handleCancelEdit(enrollment.studentId)
                                  }
                                  className="px-3 py-2 bg-gray-50 text-gray-700 rounded hover:bg-gray-100 transition"
                                  title="Cancel"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() =>
                                  handleStartEdit(
                                    enrollment.studentId,
                                    Number(enrollment.finalGrade?.value) || 0 // Convert string to number
                                  )
                                }
                                className="px-3 py-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition"
                                title="Edit grade"
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
                  No students enrolled in this course
                </div>
              )}
            </>
          )}
        </div>

        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
