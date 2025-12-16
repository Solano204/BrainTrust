// File: src/app/infraestructure/hooks/gradebook/use-gradebook.ts
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { StudentGradebook, assignFinalGrade, assignUnitFinalGrade, exportStudentGrades, fetchCourseGradebooks, fetchStudentGradebook } from '@/components/student/api/student-gradebooks';


export function useGradebook(courseId: string) {
  const { user } = useAuth();
  const [gradebook, setGradebook] = useState<StudentGradebook | null>(null);
  const [courseGradebooks, setCourseGradebooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isStudent = user?.role === 'student';
  const isTeacher = user?.role === 'teacher';

  useEffect(() => {
    loadGradebookData();
  }, [courseId, user]);

  const loadGradebookData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (isStudent && user?.id) {
        // Load student's personal gradebook
        const studentGradebook = await fetchStudentGradebook(courseId, user.id);
        setGradebook(studentGradebook);
      } else if (isTeacher) {
        // Load all students' gradebooks for the course
        const gradebooks = await fetchCourseGradebooks(courseId);
        setCourseGradebooks(gradebooks);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load gradebook');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignFinalGrade = async (studentId: string, gradeValue: string, feedback?: string) => {
    if (!isTeacher) return;
    
    try {
      await assignFinalGrade(courseId, studentId, gradeValue, feedback);
      await loadGradebookData(); // Refresh data
    } catch (err) {
      throw err;
    }
  };

  const handleAssignUnitFinalGrade = async (unitId: string, studentId: string, gradeValue: string, feedback?: string) => {
    if (!isTeacher) return;
    
    try {
      await assignUnitFinalGrade(unitId, studentId, gradeValue, feedback);
      await loadGradebookData(); // Refresh data
    } catch (err) {
      throw err;
    }
  };

  const handleExportGrades = async (studentId: string) => {
    try {
      const blob = await exportStudentGrades(courseId, studentId);
      return blob;
    } catch (err) {
      throw err;
    }
  };

  return {
    gradebook,
    courseGradebooks,
    loading,
    error,
    isStudent,
    isTeacher,
    assignFinalGrade: handleAssignFinalGrade,
    assignUnitFinalGrade: handleAssignUnitFinalGrade,
    exportGrades: handleExportGrades,
    refresh: loadGradebookData
  };
}