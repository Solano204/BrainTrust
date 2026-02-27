"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { StudentGradebook, UnitGradeDTO, assignFinalGrade, assignUnitFinalGrade, exportStudentGrades, fetchCourseGradebooks, fetchStudentGradebook, fetchUnitGrades } from '@/components/student/api/student-gradebooks';

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
        const studentGradebook = await fetchStudentGradebook(courseId, user.id);
        setGradebook(studentGradebook);
      } else if (isTeacher) {
        const gradebooks = await fetchCourseGradebooks(courseId);
        setCourseGradebooks(gradebooks || []);
      }
    } catch (err) {
      console.error("Error loading gradebook:", err);
      setError(err instanceof Error ? err.message : 'Failed to load gradebook');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignFinalGrade = async (studentId: string, gradeValue: string, feedback?: string) => {
    if (!isTeacher) return;
    try {
      await assignFinalGrade(courseId, studentId, gradeValue, feedback);
      await loadGradebookData();
    } catch (err) {
      throw err;
    }
  };

  const handleAssignUnitFinalGrade = async (
    unitId: string,
    studentId: string,
    gradeValue: string,
    incomingCourseId: string,
    feedback?: string,
  ) => {
    if (!isTeacher) return;

    // DEBUG — remove once confirmed working
    console.log('[useGradebook] handleAssignUnitFinalGrade called with:', {
      unitId,
      studentId,
      gradeValue,
      incomingCourseId,
      feedback,
      hookCourseId: courseId,
    });

    // Use the hook's own courseId (closure from page.tsx useParams) as source
    // of truth; fall back to incomingCourseId if somehow the closure is stale.
    const resolvedCourseId = courseId || incomingCourseId;

    console.log('[useGradebook] resolvedCourseId:', resolvedCourseId);

    try {
      await assignUnitFinalGrade(unitId, studentId, gradeValue, feedback, resolvedCourseId);
      await loadGradebookData();
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

 const handleAssignCourseFinalGrade = async (
  studentId: string,
  gradeValue: string,
  feedback?: string
) => {
  if (!isTeacher) return;
  try {
    await assignFinalGrade(courseId, studentId, gradeValue, feedback);
    await loadGradebookData();
  } catch (err) {
    throw err;
  }
};

// In the return object, rename for clarity:
return {
  gradebook,
  courseGradebooks,
  loading,
  error,
  isStudent,
  isTeacher,
  assignCourseFinalGrade: handleAssignCourseFinalGrade,  // ← NEW clear name
  assignUnitFinalGrade: handleAssignUnitFinalGrade,
  assignFinalGrade: handleAssignFinalGrade,              // ← keep old one too
  exportGrades: handleExportGrades,
  refresh: loadGradebookData
}
}

export function useUnitGrades(unitId: string) {
  const [unitGrades, setUnitGrades] = useState<UnitGradeDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUnitGrades();
  }, [unitId]);

  const loadUnitGrades = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!unitId) {
        setUnitGrades([]);
        return;
      }

      const grades = await fetchUnitGrades(unitId);
      setUnitGrades(grades || []);
    } catch (err) {
      console.error("Error loading unit grades:", err);
      setError(err instanceof Error ? err.message : 'Failed to load unit grades');
    } finally {
      setLoading(false);
    }
  };

  return {
    unitGrades,
    loading,
    error,
    refresh: loadUnitGrades
  };
}