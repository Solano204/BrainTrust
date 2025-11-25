// File: src/app/features/courses/hooks/task-inventory-hooks.ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { taskInventoryKeys } from "@/app/infraestructure/api/task/task-inventory-keys";
import {
  fetchTaskInventory,
  fetchSubmissionDetail,
  updateSubmissionGrade,
  requestAIAnalysis,
  downloadSubmissionAttachment,
  bulkUpdateTaskDeadlines
} from "@/components/teacher/api/task-inventory-api";
import { CourseId, SubmissionId } from "@/app/domain/valueObjects";
import React from "react";
import { SubmissionDetailData, TaskInventoryItem } from "@/app/domain/entities/CourseEntities";
import { fetchTeacherSubmissionsItem, SubmissionTask } from "@/components/student/api/student-submission";

/**
 * Custom hook for fetching task inventory by course
 */
export function useTaskInventory(courseId: CourseId | null) {
  return useQuery<SubmissionTask[]>({
    queryKey: taskInventoryKeys.inventoryByCourse(courseId || ""),
    queryFn: () => fetchTeacherSubmissionsItem(courseId!),
    enabled: !!courseId,
    staleTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Custom hook for fetching submission detail
 */
export function useSubmissionDetail(submissionId: SubmissionId | null) {
  return useQuery<SubmissionDetailData>({
    queryKey: taskInventoryKeys.submissionDetail(submissionId || ""),
    queryFn: () => fetchSubmissionDetail(submissionId!),
    enabled: !!submissionId,
    staleTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}


/**
 * Custom hook for task inventory mutations
 */
export function useTaskInventoryMutations() {
  const queryClient = useQueryClient();

  const updateGradeMutation = useMutation({
    mutationFn: ({ 
      submissionId, 
      gradeData 
    }: { 
      submissionId: SubmissionId;
      gradeData: {
        grade: number;
        feedback: string;
      };
    }) => updateSubmissionGrade(submissionId, gradeData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: taskInventoryKeys.submissionDetail(variables.submissionId) 
      });
    },
    onError: (error: Error) => {
      console.error("Error updating grade:", error.message);
    }
  });

  const requestAnalysisMutation = useMutation({
    mutationFn: (submissionId: SubmissionId) => requestAIAnalysis(submissionId),
    onSuccess: (data, submissionId) => {
      queryClient.invalidateQueries({ 
        queryKey: taskInventoryKeys.submissionDetail(submissionId) 
      });
    },
    onError: (error: Error) => {
      console.error("Error requesting AI analysis:", error.message);
    }
  });

  const downloadAttachmentMutation = useMutation({
    mutationFn: ({ 
      submissionId, 
      attachmentId 
    }: { 
      submissionId: SubmissionId;
      attachmentId: string;
    }) => downloadSubmissionAttachment(submissionId, attachmentId),
    onSuccess: (blob, variables) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `attachment-${variables.attachmentId}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onError: (error: Error) => {
      console.error("Error downloading attachment:", error.message);
    }
  });

  const bulkUpdateDeadlinesMutation = useMutation({
    mutationFn: ({ 
      courseId, 
      updates 
    }: { 
      courseId: CourseId;
      updates: Array<{
        taskId: string;
        newDeadline: string;
      }>;
    }) => bulkUpdateTaskDeadlines(courseId, updates),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: taskInventoryKeys.inventoryByCourse(variables.courseId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: taskInventoryKeys.statsByCourse(variables.courseId) 
      });
    },
    onError: (error: Error) => {
      console.error("Error bulk updating deadlines:", error.message);
    }
  });

  return {
    updateGrade: updateGradeMutation,
    requestAnalysis: requestAnalysisMutation,
    downloadAttachment: downloadAttachmentMutation,
    bulkUpdateDeadlines: bulkUpdateDeadlinesMutation
  };
}

/**
 * Custom hook for managing task inventory state
 */
export function useTaskInventoryManagement(courseId: CourseId | null) {
  const [selectedSubmissionId, setSelectedSubmissionId] = React.useState<SubmissionId | null>(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterType, setFilterType] = React.useState("all");

  const { 
    data: tasks = [], 
    isLoading: isLoadingTasks, 
    error: tasksError 
  } = useTaskInventory(courseId);

  const { 
    data: submissionDetail, 
    isLoading: isLoadingDetail,
    error: detailError 
  } = useSubmissionDetail(selectedSubmissionId);


  // Filter tasks based on search and filter
  const filteredTasks = React.useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === "all" || task.type.toLowerCase() === filterType.toLowerCase();
      return matchesSearch && matchesType;
    });
  }, [tasks, searchTerm, filterType]);


  const handleViewSubmission = (submissionId: SubmissionId) => {
    setSelectedSubmissionId(submissionId);
  };

  const handleBackFromDetail = () => {
    setSelectedSubmissionId(null);
  };

  return {
    // Task list state
    tasks: filteredTasks,
    isLoadingTasks,
    tasksError,
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    
    // Submission detail state
    selectedSubmissionId,
    submissionDetail,
    isLoadingDetail,
    detailError,
    handleViewSubmission,
    handleBackFromDetail,
    
  };
}