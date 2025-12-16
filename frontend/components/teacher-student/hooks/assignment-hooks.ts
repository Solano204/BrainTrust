// File: src/app/features/courses/hooks/assignment-hooks.ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { assignmentKeys } from "@/app/infraestructure/api/course/units/resources/assignment-keys";

import { Assignment } from "@/app/domain/entities/CourseEntities";
import { CourseId, UnitId } from "@/app/domain/valueObjects";
import { fetchTasksByUnit } from "../api/task";
import { 
  activateAssignment, 
  addAttachmentToAssignment, 
  addLinkToAssignment, 
  addMultipleAttachmentsToAssignment, 
  addMultipleLinksToAssignment, 
  clearAllAttachmentsFromAssignment, 
  clearAllLinksFromAssignment, 
  createAssignment, 
  deactivateAssignment, 
  deleteAssignment, 
  extendAssignmentDueDate, 
  fetchAssignmentById, 
  removeAttachmentFromAssignment, 
  removeLinkFromAssignment, 
  updateAssignment 
} from "../api/task-teacher";



// CURRENTLY WORKS

export function useAssignmentsByUnit(courseId: CourseId | null, unitId: UnitId | null) {
  return useQuery<Assignment[]>({
    queryKey: assignmentKeys.list(courseId || "", unitId || ""),
    queryFn: () => fetchTasksByUnit(courseId!, unitId!),
    enabled: !!courseId && !!unitId,
    staleTime: 300000,
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


// CURRENTLY WORKS

export function useAssignmentMutations() {
  const queryClient = useQueryClient();

  
  const createAssignmentMutation = useMutation({
    mutationFn: ({ 
      courseId, 
      unitId, 
      assignmentData,
      files
    }: { 
      courseId: string; 
      unitId: string; 
      assignmentData: Omit<Assignment, "id" | "courseId" | "unitId" | "createdAt" | "submissions" | "idUser">;
      files?: File[];
    }) => createAssignment(courseId, unitId, assignmentData, files),
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
      assignmentData: Partial<Omit<Assignment, "id" | "courseId" | "unitId" | "createdAt" | "submissions" | "idUser">>;
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

  const extendDueDateMutation = useMutation({
    mutationFn: ({ 
      assignmentId, 
      newDueDate 
    }: { 
      assignmentId: string; 
      newDueDate: string;
    }) => extendAssignmentDueDate(assignmentId, newDueDate),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: assignmentKeys.detail(variables.assignmentId) 
      });
    }
  });

  const activateAssignmentMutation = useMutation({
    mutationFn: activateAssignment,
    onSuccess: (_, assignmentId) => {
      queryClient.invalidateQueries({ 
        queryKey: assignmentKeys.detail(assignmentId) 
      });
    }
  });

  const deactivateAssignmentMutation = useMutation({
    mutationFn: deactivateAssignment,
    onSuccess: (_, assignmentId) => {
      queryClient.invalidateQueries({ 
        queryKey: assignmentKeys.detail(assignmentId) 
      });
    }
  });

  return {
    createAssignment: createAssignmentMutation,
    updateAssignment: updateAssignmentMutation,
    deleteAssignment: deleteAssignmentMutation,
    extendDueDate: extendDueDateMutation,
    activateAssignment: activateAssignmentMutation,
    deactivateAssignment: deactivateAssignmentMutation
  };
}

// ============================================
// ATTACHMENT MANAGEMENT HOOKS
// ============================================


// CURRENTLY WORKS

export function useAssignmentAttachmentMutations() {
  const queryClient = useQueryClient();

  const addAttachmentMutation = useMutation({
    mutationFn: ({ 
      assignmentId, 
      file 
    }: { 
      assignmentId: string; 
      file: File;
    }) => addAttachmentToAssignment(assignmentId, file),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: assignmentKeys.detail(variables.assignmentId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: assignmentKeys.lists() 
      });
    }
  });

  const addMultipleAttachmentsMutation = useMutation({
    mutationFn: ({ 
      assignmentId, 
      files 
    }: { 
      assignmentId: string; 
      files: File[];
    }) => addMultipleAttachmentsToAssignment(assignmentId, files),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: assignmentKeys.detail(variables.assignmentId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: assignmentKeys.lists() 
      });
    }
  });

  const removeAttachmentMutation = useMutation({
    mutationFn: ({ 
      assignmentId, 
      documentName,
      storagePath
    }: { 

      assignmentId: string; 
      documentName: string;
      storagePath?: string
    }) => removeAttachmentFromAssignment(assignmentId, documentName),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: assignmentKeys.detail(variables.assignmentId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: assignmentKeys.lists() 
      });
    }
  });

  const clearAttachmentsMutation = useMutation({
    mutationFn: (assignmentId: string) => clearAllAttachmentsFromAssignment(assignmentId),
    onSuccess: (_, assignmentId) => {
      queryClient.invalidateQueries({ 
        queryKey: assignmentKeys.detail(assignmentId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: assignmentKeys.lists() 
      });
    }
  });

  return {
    addAttachment: addAttachmentMutation,
    addMultipleAttachments: addMultipleAttachmentsMutation,
    removeAttachment: removeAttachmentMutation,
    clearAttachments: clearAttachmentsMutation
  };
}

// ============================================
// LINK MANAGEMENT HOOKS
// ============================================



// CURRENTLY WORKS

export function useAssignmentLinkMutations() {
  const queryClient = useQueryClient();

  const addLinkMutation = useMutation({
    mutationFn: ({ 
      assignmentId, 
      url 
    }: { 
      assignmentId: string; 
      url: string;
    }) => addLinkToAssignment(assignmentId, url), // Note: You need to create addLinkToAssignment in your API
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: assignmentKeys.detail(variables.assignmentId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: assignmentKeys.lists() 
      });
    }
  });

  const addMultipleLinksMutation = useMutation({
    mutationFn: ({ 
      assignmentId, 
      urls 
    }: { 
      assignmentId: string; 
      urls: string[];
    }) => addMultipleLinksToAssignment(assignmentId, urls),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: assignmentKeys.detail(variables.assignmentId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: assignmentKeys.lists() 
      });
    }
  });

  const removeLinkMutation = useMutation({
    mutationFn: ({ 
      assignmentId, 
      url 
    }: { 
      assignmentId: string; 
      url: string;
    }) => removeLinkFromAssignment(assignmentId, url),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: assignmentKeys.detail(variables.assignmentId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: assignmentKeys.lists() 
      });
    }
  });

  const clearLinksMutation = useMutation({
    mutationFn: (assignmentId: string) => clearAllLinksFromAssignment(assignmentId),
    onSuccess: (_, assignmentId) => {
      queryClient.invalidateQueries({ 
        queryKey: assignmentKeys.detail(assignmentId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: assignmentKeys.lists() 
      });
    }
  });

  return {
    addLink: addLinkMutation,
    addMultipleLinks: addMultipleLinksMutation,
    removeLink: removeLinkMutation,
    clearLinks: clearLinksMutation
  };
}