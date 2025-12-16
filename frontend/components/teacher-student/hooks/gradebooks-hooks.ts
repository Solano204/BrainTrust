// File: src/app/infraestructure/hooks/gradebook/use-gradebook.ts
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { StudentGradebook , UnitGradeDTO, assignFinalGrade, assignUnitFinalGrade, exportStudentGrades, fetchCourseGradebooks, fetchStudentGradebook, fetchUnitGrades } from '@/components/student/api/student-gradebooks';

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

      console.log("Loading gradebook for course:", courseId);
      console.log("User role:", user?.role, "User ID:", user?.id);

      if (isStudent && user?.id) {
        // Load student's personal gradebook
        console.log("Fetching student gradebook...");
        const studentGradebook = await fetchStudentGradebook(courseId, user.id);
        console.log("Fetched student gradebook:", studentGradebook);
        setGradebook(studentGradebook);
      } else if (isTeacher) {
        // Load all students' gradebooks for the course
        console.log("Fetching course gradebooks...");
        const gradebooks = await fetchCourseGradebooks(courseId);
        console.log("Fetched course gradebooks:", gradebooks);
        setCourseGradebooks(gradebooks || []);
      } else {
        console.log("No gradebook data to load - user not student or teacher");
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

// CURRENTLY WORKS
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

      console.log("Fetching unit grades for unit:", unitId);
      const grades = await fetchUnitGrades(unitId);
      console.log("UNIT GRADES fetched:", grades);
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