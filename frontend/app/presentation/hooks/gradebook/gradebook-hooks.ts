// File: src/app/features/gradebook/hooks/gradebook-hooks.ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import { gradebookKeys } from "@/app/infraestructure/api/gradebook/gradebook-keys";
import { 
  fetchGradebookData, 
  updateStudentGrade, 
  bulkUpdateGrades, 
  exportGradebookToCSV,
  getGradebookStats 
} from "@/app/infraestructure/api/gradebook/gradebook-api";
import {  GradebookData, transformCalifications } from "@/app/domain/services/service";
import { AssignmentId, UserId } from "@/app/domain/valueObjects/CourseValues";

export function useGradebookData(courseId: string | null) {
  return useQuery<GradebookData>({
    queryKey: gradebookKeys.data(courseId || ""),
    queryFn: async () => {
      if (!courseId) throw new Error("Course ID is required");
      const data = await fetchGradebookData(courseId);
      return transformCalifications(data);
    },
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useGradebookStats(courseId: string | null) {
  return useQuery({
    queryKey: gradebookKeys.stats(courseId || ""),
    queryFn: () => getGradebookStats(courseId!),
    enabled: !!courseId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useGradebookMutations(courseId: string) {
  const queryClient = useQueryClient();

  const updateGradeMutation = useMutation({
    mutationFn: (params: {
      studentId: UserId;
      taskId: AssignmentId;
      grade: number | null;
    }) => updateStudentGrade(courseId, params),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: gradebookKeys.data(courseId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: gradebookKeys.stats(courseId) 
      });
    },
    onError: (error: Error) => {
      console.error("Error updating grade:", error.message);
    }
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: (updates: Array<{
      studentId: UserId;
      taskId: AssignmentId;
      grade: number | null;
    }>) => bulkUpdateGrades(courseId, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: gradebookKeys.data(courseId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: gradebookKeys.stats(courseId) 
      });
    },
    onError: (error: Error) => {
      console.error("Error bulk updating grades:", error.message);
    }
  });

  const exportMutation = useMutation({
    mutationFn: () => exportGradebookToCSV(courseId),
    onSuccess: (blob) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `gradebook-${courseId}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onError: (error: Error) => {
      console.error("Error exporting gradebook:", error.message);
    }
  });

  return {
    updateGrade: updateGradeMutation,
    bulkUpdate: bulkUpdateMutation,
    export: exportMutation,
  };
}

export function useGradebookManagement(courseId: string) {
  const [optimisticUpdates, setOptimisticUpdates] = useState<Map<string, number | null>>(new Map());
  const [pendingUpdates, setPendingUpdates] = useState<Array<{
    studentId: UserId;
    taskId: AssignmentId;
    grade: number | null;
  }>>([]);

  const { data: gradebook, isLoading, error, refetch } = useGradebookData(courseId);
  const { data: stats } = useGradebookStats(courseId);
  const { updateGrade, bulkUpdate, export: exportMutation } = useGradebookMutations(courseId);

  // Create an optimized gradebook with optimistic updates
  const optimizedGradebook = useCallback((): GradebookData | null => {
    if (!gradebook) return null;

    const updatedStudents = gradebook.students.map(student => {
      const updatedScores = { ...student.scores };
      
      // Apply optimistic updates to this student's scores
      for (const [key, grade] of optimisticUpdates.entries()) {
        const [studentId, taskId] = key.split('|');
        if (studentId === student.studentId) {
          updatedScores[taskId as AssignmentId] = {
            ...updatedScores[taskId as AssignmentId],
            score: grade
          };
        }
      }

      // Recalculate total percentage with optimistic updates
      let pointsEarned = 0;
      let pointsPossibleGraded = 0;
      let fullyGraded = true;

      for (const task of gradebook.tasks) {
        const scoreData = updatedScores[task.id];
        
        if (scoreData) {
          pointsPossibleGraded += scoreData.max;
          if (scoreData.score === null) {
            fullyGraded = false;
          } else {
            pointsEarned += scoreData.score;
          }
        } else {
          fullyGraded = false;
        }
      }
      
      let newTotal = null;
      if (pointsPossibleGraded > 0) {
        const percentage = (pointsEarned / pointsPossibleGraded) * 100;
        newTotal = fullyGraded ? Math.round(percentage) : null;
      }

      return {
        ...student,
        scores: updatedScores,
        totalPercentage: newTotal
      };
    });

    return {
      ...gradebook,
      students: updatedStudents
    };
  }, [gradebook, optimisticUpdates]);

  const handleGradeChange = useCallback((studentId: UserId, taskId: AssignmentId, value: string) => {
    const numValue = value === "" ? null : Number.parseFloat(value);
    const updateKey = `${studentId}|${taskId}`;
    
    // Update optimistic state immediately
    setOptimisticUpdates(prev => {
      const newMap = new Map(prev);
      if (numValue === null) {
        newMap.delete(updateKey);
      } else {
        newMap.set(updateKey, numValue);
      }
      return newMap;
    });

    // Add to pending updates for bulk save
    setPendingUpdates(prev => {
      const filtered = prev.filter(update => 
        !(update.studentId === studentId && update.taskId === taskId)
      );
      return [...filtered, { studentId, taskId, grade: numValue }];
    });
  }, []);

  const handleSaveGrades = async () => {
    if (pendingUpdates.length > 0) {
      try {
        await bulkUpdate.mutateAsync(pendingUpdates);
        // Clear optimistic updates and pending updates after successful save
        setOptimisticUpdates(new Map());
        setPendingUpdates([]);
        // Refetch to ensure we have the latest data
        refetch();
      } catch (error) {
        console.error("Failed to save grades:", error);
        // Keep the optimistic updates if save fails
      }
    }
  };

  const handleExport = () => {
    exportMutation.mutate();
  };

  const getOptimisticGrade = useCallback((studentId: UserId, taskId: AssignmentId): number | null => {
    const key = `${studentId}|${taskId}`;
    return optimisticUpdates.get(key) ?? null;
  }, [optimisticUpdates]);

  const hasOptimisticUpdate = useCallback((studentId: UserId, taskId: AssignmentId): boolean => {
    const key = `${studentId}|${taskId}`;
    return optimisticUpdates.has(key);
  }, [optimisticUpdates]);

  return {
    // Data
    gradebook: optimizedGradebook(),
    isLoading,
    error,
    stats,
    
    // Optimistic state
    optimisticUpdates,
    pendingUpdates,
    hasPendingChanges: pendingUpdates.length > 0,
    
    // Actions
    handleGradeChange,
    handleSaveGrades,
    handleExport,
    
    // Helper functions
    getOptimisticGrade,
    hasOptimisticUpdate,
    
    // Loading states
    isSaving: bulkUpdate.isPending,
    isExporting: exportMutation.isPending,
  };
}