// File: src/app/presentation/hooks/gradebook/student-gradebook-hooks.ts
"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { useCallback } from "react";
import { gradebookKeys } from "@/app/infraestructure/api/gradebook/gradebook-keys";
import { exportStudentGrades, fetchStudentGradebook } from "@/components/student/api/student-gradebook-api";

interface StudentGradebookStats {
    totalTasks: number;
    completedTasks: number;
    averageGrade: number;
    completionRate: number;
}

export function useStudentGradebook(courseId: string | null, studentId: string | null) {
  const { data: studentGradebook, isLoading, error, refetch } = useQuery({
    queryKey: gradebookKeys.studentData(courseId || "", studentId || ""),
    queryFn: async () => {
      if (!courseId || !studentId) throw new Error("Course ID and Student ID are required");
      return await fetchStudentGradebook(courseId, studentId);
    },
    enabled: !!courseId && !!studentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const exportMutation = useMutation({
    mutationFn: () => exportStudentGrades(courseId!, studentId!),
    onSuccess: (blob) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `my-grades-${courseId}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onError: (error: Error) => {
      console.error("Error exporting student grades:", error.message);
    }
  });

  // Calculate stats from student gradebook data
  const stats = useCallback((): StudentGradebookStats | null => {
    if (!studentGradebook) return null;

    const totalTasks = studentGradebook.tasks.length;
    const completedTasks = studentGradebook.tasks.filter(task => task.score !== null).length;
    
    const gradedTasks = studentGradebook.tasks.filter(task => task.score !== null);
    const totalGrade = gradedTasks.reduce((sum  ,task  ) => sum + (task.score || 0), 0);
    const averageGrade = gradedTasks.length > 0 ? (totalGrade / gradedTasks.reduce((sum, task) => sum + task.maxPoints, 0)) * 100 : 0;
    
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    return {
      totalTasks,
      completedTasks,
      averageGrade: Math.round(averageGrade * 10) / 10,
      completionRate: Math.round(completionRate)
    };
  }, [studentGradebook]);

  const handleExport = () => {
    if (courseId && studentId) {
      exportMutation.mutate();
    }
  };

  return {
    studentGradebook,
    isLoading,
    error,
    stats: stats(),
    handleExport,
    isExporting: exportMutation.isPending,
  };
}