// File: src/app/features/courses/hooks/task-inventory-hooks.ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { taskInventoryKeys } from "@/app/infraestructure/api/task/task-inventory-keys";
// import {
//   fetchTaskInventory,
//   fetchSubmissionDetail,
//   updateSubmissionGrade,
//   requestAIAnalysis,
//   downloadSubmissionAttachment,
//   bulkUpdateTaskDeadlines
// } from "@/components/teacher/api/task-inventory-api";
import { CourseId, SubmissionId } from "@/app/domain/valueObjects";
import React from "react";
import {  TaskInventoryItem } from "@/app/domain/entities/CourseEntities";
import { fetchTeacherSubmissionsItem, SubmissionTask } from "@/components/student/api/student-submission";
import { fetchSubmissionDetail, updateSubmissionGrade } from "@/components/teacher/api/teacher-submission";

/**
 * Custom hook for fetching task inventory by course
 */

// THIS CURRENTLY WORKS

export function useTaskInventory(courseId: CourseId | null, unitId: string | null) {
  return useQuery<SubmissionTask[]>({
    queryKey: taskInventoryKeys.inventoryByCourse(courseId || "", unitId || ""),
    queryFn: () => fetchTeacherSubmissionsItem(courseId! , unitId!),
    enabled: !!courseId,
    staleTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Custom hook for fetching submission detail
 */
// export function useSubmissionDetail(submissionId: SubmissionId | null) {
//   return useQuery<SubmissionDetailData>({
//     queryKey: taskInventoryKeys.submissionDetail(submissionId || ""),
//     queryFn: () => fetchSubmissionDetail(submissionId!),
//     enabled: !!submissionId,
//     staleTime: 300000, // 5 minutes
//     refetchOnWindowFocus: false,
//   });
// }


/**
 * Custom hook for task inventory mutations
 */

// THIS CURRENTLY WORKS

export function useTaskInventoryMutations() {
  const queryClient = useQueryClient();

   const updateGradeMutation = useMutation({
    mutationFn: ({ 
      submissionId, 
      gradeValue,
      maxScore,
      feedback
    }: { 
      submissionId: SubmissionId;
      gradeValue: string;
      maxScore: string;
      feedback: string;
    }) => updateSubmissionGrade(submissionId, { 
      grade: parseFloat(gradeValue), 
      feedback 
    }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: taskInventoryKeys.submissionDetail(variables.submissionId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: taskInventoryKeys.all 
      });
    },
    onError: (error: Error) => {
      console.error("Error updating grade:", error.message);
    }
  });

  // const requestAnalysisMutation = useMutation({
  //   mutationFn: (submissionId: SubmissionId) => requestAIAnalysis(submissionId),
  //   onSuccess: (data, submissionId) => {
  //     queryClient.invalidateQueries({ 
  //       queryKey: taskInventoryKeys.submissionDetail(submissionId) 
  //     });
  //   },
  //   onError: (error: Error) => {
  //     console.error("Error requesting AI analysis:", error.message);
  //   }
  // });

  //  const downloadAttachmentMutation = useMutation({
  //   mutationFn: (attachment: { 
  //     name: string;
  //     storagePath: string;
  //     createdAt: string;
  //   }) => {
  //     // Since we already have the attachment data, we can create a download directly
  //     // If you need to fetch from server, you'd use: downloadSubmissionAttachment(submissionId, attachmentId)
  //     return Promise.resolve(attachment);
  //   },
  //   onSuccess: (attachment) => {
  //     // Create a simple download for the attachment
  //     // In a real scenario, you might fetch the file from the storagePath
  //     const blob = new Blob([`Attachment: ${attachment.name}`], { type: 'text/plain' });
  //     const url = window.URL.createObjectURL(blob);
  //     const a = document.createElement('a');
  //     a.style.display = 'none';
  //     a.href = url;
  //     a.download = attachment.name;
  //     document.body.appendChild(a);
  //     a.click();
  //     window.URL.revokeObjectURL(url);
  //     document.body.removeChild(a);
  //   },
  //   onError: (error: Error) => {
  //     console.error("Error downloading attachment:", error.message);
  //   }
  // });

  // const bulkUpdateDeadlinesMutation = useMutation({
  //   mutationFn: ({ 
  //     courseId, 
  //     updates 
  //   }: { 
  //     courseId: CourseId;
  //     updates: Array<{
  //       taskId: string;
  //       newDeadline: string;
  //     }>;
  //   }) => bulkUpdateTaskDeadlines(courseId, updates),
  //   onSuccess: (data, variables) => {
  //     queryClient.invalidateQueries({ 
  //       queryKey: taskInventoryKeys.inventoryByCourse(variables.courseId) 
  //     });
  //     queryClient.invalidateQueries({ 
  //       queryKey: taskInventoryKeys.statsByCourse(variables.courseId) 
  //     });
  //   },
  //   onError: (error: Error) => {
  //     console.error("Error bulk updating deadlines:", error.message);
  //   }
  // });

  return {
    updateGrade: updateGradeMutation,
    // requestAnalysis: requestAnalysisMutation,
    // downloadAttachment: downloadAttachmentMutation,
    // bulkUpdateDeadlines: bulkUpdateDeadlinesMutation
  };
}

/**
 * Custom hook for managing task inventory state
 */

// THIS CURRENTLY WORKS

export function useTaskInventoryManagement(courseId: CourseId | null, unitId: string | null) {
  const [selectedSubmissionId, setSelectedSubmissionId] = React.useState<SubmissionId | null>(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterType, setFilterType] = React.useState("all");

  const { 
    data: tasks = [], 
    isLoading: isLoadingTasks, 
    error: tasksError 
  } = useTaskInventory(courseId, unitId);

  // const { 
  //   data: submissionDetail, 
  //   isLoading: isLoadingDetail,
  //   error: detailError 
  // } = useSubmissionDetail(selectedSubmissionId);


  // Filter tasks based on search and filter
  const filteredTasks = React.useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch = task.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
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
    // submissionDetail,
    // isLoadingDetail,
    // detailError,
    handleViewSubmission,
    handleBackFromDetail,
    
  };
}