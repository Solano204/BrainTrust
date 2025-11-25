// File: src/app/features/courses/hooks/unit-hooks.ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { CourseUnit, UnitResource } from "@/app/domain/entities/CourseEntities";
import { CourseId, UnitId } from "@/app/domain/valueObjects";
import { unitKeys } from "@/app/infraestructure/api/course/units/unit-keys";
import React from "react";
import { createUnit, deleteUnit, fetchUnitById, fetchUnitsByCourse, reorderUnits, updateUnit } from "@/components/teacher-student/api/unit";
import { deleteUnitResource } from "@/components/teacher-student/api/unit-api";

/**
 * Custom hook for fetching units by course
 */
export function useUnitsByCourse(courseId: CourseId | null) {
  return useQuery<CourseUnit[]>({
    queryKey: unitKeys.list(courseId || ""),
    queryFn: () => fetchUnitsByCourse(courseId!),
    enabled: !!courseId,
    staleTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Custom hook for fetching a single unit by ID
 */
export function useUnit(unitId: UnitId | null) {
  return useQuery<CourseUnit>({
    queryKey: unitKeys.detail(unitId || ""),
    queryFn: () => fetchUnitById(unitId!),
    enabled: !!unitId,
    staleTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Custom hook for unit mutations
 */
export function useUnitMutations() {
  const queryClient = useQueryClient();

  const createUnitMutation = useMutation({
    mutationFn: ({ courseId, unitData }: { courseId: CourseId, unitData: Omit<CourseUnit, "id" | "courseId" | "resources"> }) =>
      createUnit(courseId, unitData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: unitKeys.list(variables.courseId) 
      });
    },
    onError: (error: Error) => {
      console.error("Error creating unit:", error.message);
    }
  });

  const updateUnitMutation = useMutation({
    mutationFn: ({ unitId, unitData }: { unitId: UnitId, unitData: Partial<Omit<CourseUnit, "id" | "courseId" | "resources">> }) =>
      updateUnit(unitId, unitData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: unitKeys.list(data.courseId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: unitKeys.detail(variables.unitId) 
      });
    },
    onError: (error: Error) => {
      console.error("Error updating unit:", error.message);
    }
  });

  const deleteUnitMutation = useMutation({
    mutationFn: deleteUnit,
    onSuccess: (_, unitId) => {
      // We need to invalidate all course unit lists since we don't know which course this unit belonged to
      queryClient.invalidateQueries({ 
        queryKey: unitKeys.lists() 
      });
    },
    onError: (error: Error) => {
      console.error("Error deleting unit:", error.message);
    }
  });

  const reorderUnitsMutation = useMutation({
    mutationFn: ({ courseId, unitOrder }: { courseId: CourseId, unitOrder: { unitId: UnitId, order: number }[] }) =>
      reorderUnits(courseId, unitOrder),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: unitKeys.list(variables.courseId) 
      });
    },
    onError: (error: Error) => {
      console.error("Error reordering units:", error.message);
    }
  });

 

//   const deleteResourceMutation = useMutation({
//     mutationFn: ({ unitId, resourceId }: { unitId: UnitId, resourceId: string }) =>
//       deleteUnitResource(unitId, resourceId),
//     onSuccess: (data, variables) => {
//       queryClient.invalidateQueries({ 
//         queryKey: unitKeys.detail(variables.unitId) 
//       });
//     },
//     onError: (error: Error) => {
//       console.error("Error deleting resource:", error.message);
//     }
//   });

  return {
    createUnit: createUnitMutation,
    updateUnit: updateUnitMutation,
    deleteUnit: deleteUnitMutation,
    reorderUnits: reorderUnitsMutation,
    // deleteResource: deleteResourceMutation
  };
}

/**
 * Custom hook for managing unit form state
 */
export function useUnitForm(initialData?: CourseUnit) {
  const [formData, setFormData] = React.useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    numUnity: initialData?.numUnity || 1,
    urlImage: initialData?.urlImage || "",
  });

  React.useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description,
        numUnity: initialData.numUnity,
        urlImage: initialData.urlImage || "",
      });
    } else {
      setFormData({
        name: "",
        description: "",
        numUnity: 1,
        urlImage: "",
      });
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value, type } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [id]: type === 'number' ? parseInt(value) || 1 : value 
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      numUnity: 1,
      urlImage: "",
    });
  };

  return {
    formData,
    handleChange,
    resetForm,
    setFormData
  };
}