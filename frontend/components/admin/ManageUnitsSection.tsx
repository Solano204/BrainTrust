// File: src/app/features/admin/components/ManageUnitsSection.tsx
'use client';

import { useState } from 'react';
import { useAdminCourseUnits, useDeleteUnitAdmin } from '@/components/admin/hooks/useCourses';
import { Trash2, BookOpen } from 'lucide-react';

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
        console.error('Failed to delete unit:', error);
      }
    } else {
      setDeleteConfirm(unitId);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8 text-gray-500">
        Loading units...
      </div>
    );
  }

  if (!units || units.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No units available for this course
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Course Units</h3>
        <span className="text-sm text-gray-500">{units.length} units</span>
      </div>

      <div className="space-y-3">
        {units.map((unit) => (
          <div
            key={unit.id}
            className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition"
          >
            <div className="flex items-start gap-4">
              {/* Unit Image */}
              <div className="w-20 h-20 flex-shrink-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg overflow-hidden">
                {unit.urlImage ? (
                  <img
                    src={unit.urlImage}
                    alt={unit.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                )}
              </div>

              {/* Unit Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{unit.name}</h4>
                    <p className="text-sm text-gray-500 mt-1">{unit.description}</p>
                    <span className="inline-block mt-2 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                      Unit #{unit.numUnity}
                    </span>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteUnit(unit.id)}
                    className={`px-3 py-2 rounded transition ${
                      deleteConfirm === unit.id
                        ? 'bg-red-600 text-white'
                        : 'bg-red-50 text-red-700 hover:bg-red-100'
                    }`}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {deleteConfirm === unit.id && (
                  <div className="mt-2 text-xs text-red-600">
                    Click again to confirm deletion
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Also export an integrated version for the course detail view
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
        console.error('Failed to delete unit:', error);
      }
    } else {
      setDeleteConfirm(unitId);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Units Management</h3>
        {units && (
          <span className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded">
            {units.length} {units.length === 1 ? 'Unit' : 'Units'}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-gray-500">Loading units...</div>
      ) : units && units.length > 0 ? (
        <div className="space-y-3">
          {units.map((unit) => (
            <div
              key={unit.id}
              className="p-4 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{unit.name}</span>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                      Unit {unit.numUnity}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {unit.description}
                  </p>
                </div>

                <div className="flex gap-2 ml-4">
                  {onManageGrades && (
                    <button
                      onClick={() => onManageGrades(unit.id)}
                      className="px-3 py-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition text-sm"
                    >
                      Grades
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteUnit(unit.id)}
                    className={`px-3 py-2 rounded transition ${
                      deleteConfirm === unit.id
                        ? 'bg-red-600 text-white'
                        : 'bg-red-50 text-red-700 hover:bg-red-100'
                    }`}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {deleteConfirm === unit.id && (
                <div className="mt-2 text-xs text-red-600 text-center">
                  Click again to confirm deletion
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No units created yet for this course
        </div>
      )}
    </div>
  );
}