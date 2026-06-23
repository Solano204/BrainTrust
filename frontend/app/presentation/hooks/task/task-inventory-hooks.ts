"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { taskInventoryKeys } from "@/app/infraestructure/api/task/task-inventory-keys";
import { CourseId, SubmissionId } from "@/app/domain/valueObjects";
import { toast } from "sonner";
import React from "react";

import { fetchTeacherSubmissions, gradeSubmission } from "@/components/student/api/student-submission";
import type { SubmissionTask } from "@/app/shared/models/assignment.model";

export function useTaskInventory(courseId: CourseId | null, unitId: string | null) {
  return useQuery<SubmissionTask[]>({
    queryKey: taskInventoryKeys.inventoryByCourse(courseId || "", unitId || ""),
    queryFn: () => fetchTeacherSubmissions(courseId!, unitId!),
    enabled: !!courseId && !!unitId,
    staleTime: 0,
  });
}

export function useTaskInventoryMutations() {
  const queryClient = useQueryClient();

  const updateGradeMutation = useMutation({
    mutationFn: ({
                   submissionId,
                   teamMemberSubmissionIds,
                   gradeValue,
                   maxScore,
                   feedback
                 }: {
      submissionId: SubmissionId;
      teamMemberSubmissionIds?: string[];
      gradeValue: string;
      maxScore: string;
      feedback: string;
    }) => {
      const ids = teamMemberSubmissionIds?.length ? teamMemberSubmissionIds : [submissionId];
      return Promise.all(ids.map(id => gradeSubmission(id, gradeValue, maxScore, feedback)));
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: taskInventoryKeys.submissionDetail(variables.submissionId)
      });
      queryClient.invalidateQueries({
        queryKey: taskInventoryKeys.all
      });
      toast.success("Calificación guardada exitosamente");
    },
    onError: (error: Error) => {
      toast.error(`Error al guardar la calificación: ${error.message}`);
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