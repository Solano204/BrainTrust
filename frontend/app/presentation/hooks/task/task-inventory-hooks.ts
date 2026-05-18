"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { taskInventoryKeys } from "@/app/infraestructure/api/task/task-inventory-keys";
import { CourseId, SubmissionId } from "@/app/domain/valueObjects";
import React from "react";

import { fetchTeacherSubmissions, gradeSubmission } from "@/components/student/api/student-submission";
import type { SubmissionTask } from "@/app/shared/models/assignment.model";

export function useTaskInventory(courseId: CourseId | null, unitId: string | null) {
  return useQuery<SubmissionTask[]>({
    queryKey: taskInventoryKeys.inventoryByCourse(courseId || "", unitId || ""),
    queryFn: () => fetchTeacherSubmissions(courseId!, unitId!),
    enabled: !!courseId && !!unitId,
    staleTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

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
    }) => gradeSubmission(submissionId, gradeValue, maxScore, feedback),
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

  return {
    updateGrade: updateGradeMutation,
  };
}


export function useTaskInventoryManagement(courseId: CourseId | null, unitId: string | null) {
  const [selectedSubmissionId, setSelectedSubmissionId] = React.useState<SubmissionId | null>(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterType, setFilterType] = React.useState("all");

  const {
    data: tasks = [],
    isLoading: isLoadingTasks,
    error: tasksError
  } = useTaskInventory(courseId, unitId);

  const filteredTasks = React.useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch = task.name.toLowerCase().includes(searchTerm.toLowerCase());

      if (filterType === "all") return matchesSearch;

      if (filterType === "graded") {
        return matchesSearch && task.submission?.status === "GRADED";
      }
      if (filterType === "pending") {
        return matchesSearch && (!task.submission || task.submission.status === "SUBMITTED");
      }
      if (filterType === "overdue") {
        return matchesSearch && task.isOverdue;
      }

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
    tasks: filteredTasks,
    isLoadingTasks,
    tasksError,
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    selectedSubmissionId,
    handleViewSubmission,
    handleBackFromDetail,
  };
}