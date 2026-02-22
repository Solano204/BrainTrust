
'use client';

import { useState } from 'react';
import { AdminCoursesList } from '@/components/admin/AdminCoursesList';
import { CreateEditCourseModal } from '@/components/admin/CreateEditCourseModal';
import { ManageEnrollments } from '@/components/admin/ManageEnrollments';
import { ManageGrades } from '@/components/admin/ManageGrades';
import { AdminCourse } from  '@/components/admin/api/coursesApi';

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