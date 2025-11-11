// File: src/app/features/courses/hooks/assignment-hooks.ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { assignmentKeys } from "@/app/infraestructure/api/course/units/resources/assignment-keys";
import {
  fetchAssignmentsByUnit,
  fetchAssignmentById,
  createAssignment,
  updateAssignment,
  deleteAssignment
} from "@/app/infraestructure/api/course/units/resources/assignment-api";
import { Assignment } from "@/app/domain/entities/CourseEntities";
import { CourseId, UnitId } from "@/app/domain/valueObjects";

export function useAssignmentsByUnit(courseId: CourseId | null, unitId: UnitId | null) {
  return useQuery<Assignment[]>({
    queryKey: assignmentKeys.list(courseId || "", unitId || ""),
    queryFn: () => fetchAssignmentsByUnit(courseId!, unitId!),
    enabled: !!courseId && !!unitId,
    staleTime: 300000,
      // Remove any refetchOnMount, refetchOnWindowFocus if present
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}

export function useAssignment(assignmentId: string | null) {
  return useQuery<Assignment>({
    queryKey: assignmentKeys.detail(assignmentId || ""),
    queryFn: () => fetchAssignmentById(assignmentId!),
    enabled: !!assignmentId,
    staleTime: 300000,
    
  });
}

export function useAssignmentMutations() {
  const queryClient = useQueryClient();

  const createAssignmentMutation = useMutation({
    mutationFn: ({ 
      courseId, 
      unitId, 
      assignmentData 
    }: { 
      courseId: CourseId; 
      unitId: UnitId; 
      assignmentData: Omit<Assignment, "id" | "courseId" | "unitId" | "createdAt" | "submissions">;
    }) => createAssignment(courseId, unitId, assignmentData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: assignmentKeys.list(variables.courseId, variables.unitId) 
      });
    }
  });

  const updateAssignmentMutation = useMutation({
    mutationFn: ({ 
      assignmentId, 
      assignmentData 
    }: { 
      assignmentId: string; 
      assignmentData: Partial<Omit<Assignment, "id" | "courseId" | "unitId" | "createdAt" | "submissions">>;
    }) => updateAssignment(assignmentId, assignmentData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: assignmentKeys.detail(variables.assignmentId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: assignmentKeys.lists() 
      });
    }
  });

  const deleteAssignmentMutation = useMutation({
    mutationFn: deleteAssignment,
    onSuccess: (_, assignmentId) => {
      queryClient.invalidateQueries({ 
        queryKey: assignmentKeys.lists() 
      });
    }
  });

  return {
    createAssignment: createAssignmentMutation,
    updateAssignment: updateAssignmentMutation,
    deleteAssignment: deleteAssignmentMutation
  };
}