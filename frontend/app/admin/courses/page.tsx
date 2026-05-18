
'use client';

export const dynamic = 'force-dynamic';
export const dynamic = 'force-dynamic';
import { useState } from 'react';
export const dynamic = 'force-dynamic';
export const dynamic = 'force-dynamic';
import { AdminCoursesList } from '@/components/admin/AdminCoursesList';
export const dynamic = 'force-dynamic';
export const dynamic = 'force-dynamic';
import { CreateEditCourseModal } from '@/components/admin/CreateEditCourseModal';
export const dynamic = 'force-dynamic';
export const dynamic = 'force-dynamic';
import { ManageEnrollments } from '@/components/admin/ManageEnrollments';
export const dynamic = 'force-dynamic';
export const dynamic = 'force-dynamic';
import { ManageGrades } from '@/components/admin/ManageGrades';
export const dynamic = 'force-dynamic';
export const dynamic = 'force-dynamic';
import { AdminCourse } from '@/app/shared/models/admin-course.model';

export default function AdminCoursesPage() {
  const [selectedCourse, setSelectedCourse] = useState<AdminCourse | null>(null);
  const [modalState, setModalState] = useState<{
    createEdit: boolean;
    enrollments: boolean;
    grades: boolean;
  }>({
    createEdit: false,
    enrollments: false,
    grades: false,
  });

  const handleCreateCourse = () => {
    setSelectedCourse(null);
    setModalState({ ...modalState, createEdit: true });
  };

  const handleEditCourse = (course: AdminCourse) => {
    setSelectedCourse(course);
    setModalState({ ...modalState, createEdit: true });
  };

  const handleManageEnrollments = (course: AdminCourse) => {
    setSelectedCourse(course);
    setModalState({ ...modalState, enrollments: true });
  };

  const handleManageGrades = (course: AdminCourse) => {
    setSelectedCourse(course);
    setModalState({ ...modalState, grades: true });
  };

  const closeAllModals = () => {
    setModalState({
      createEdit: false,
      enrollments: false,
      grades: false,
    });
    setSelectedCourse(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <AdminCoursesList
        onEditCourse={handleEditCourse}
        onManageEnrollments={handleManageEnrollments}
        onManageGrades={handleManageGrades}
        onCreateCourse={handleCreateCourse}
      />

      <CreateEditCourseModal
        course={selectedCourse}
        isOpen={modalState.createEdit}
        onClose={closeAllModals}
        onSuccess={closeAllModals}
      />

      {selectedCourse && (
        <ManageEnrollments
          course={selectedCourse}
          isOpen={modalState.enrollments}
          onClose={closeAllModals}
        />
      )}

      {selectedCourse && (
        <ManageGrades
          course={selectedCourse}
          isOpen={modalState.grades}
          onClose={closeAllModals}
        />
      )}
    </div>
  );
}