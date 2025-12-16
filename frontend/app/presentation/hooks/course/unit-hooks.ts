// File: src/app/features/courses/hooks/unit-hooks.ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CourseUnit } from "@/app/domain/entities/CourseEntities";
import { CourseId, UnitId } from "@/app/domain/valueObjects";
import { unitKeys } from "@/app/infraestructure/api/course/units/unit-keys";
import React from "react";
import { 
  createUnit, 
  createUnitWithImage, 
  deleteUnit, 
  fetchUnitById, 
  fetchUnitsByCourse, 
  reorderUnits, 
  updateUnit,
  uploadUnitImageFile 
} from "@/components/teacher-student/api/unit";
import { deleteImageFromCloudinary, uploadImageFile } from "@/app/utils/cloudinary/cloudinary";

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
 * Custom hook for unit mutations with image upload support
 */


// CURRENTLY WORKS

export function useUnitMutations() {
  const queryClient = useQueryClient();

  // Mutation for uploading unit image
  const uploadImageMutation = useMutation({
    mutationFn: async ({ unitId, file }: { unitId: string, file: File }) => {
      return uploadUnitImageFile(unitId, file);
    },
    onError: (error: Error) => {
      console.error("Error uploading unit image:", error.message);
    }
  });

  // Mutation for creating unit
  // Then in your mutation, you can use:
const createUnitMutation = useMutation({
  mutationFn: async ({ 
    courseId, 
    unitData, 
    imageFile 
  }: { 
    courseId: CourseId, 
    unitData: Omit<CourseUnit, "id" | "courseId" | "resources">,
    imageFile?: File | null 
  }) => {
    if (imageFile) {

      // Use the new function for units with images
      return await createUnitWithImage(courseId, unitData, imageFile);
    } else {
      // Use the regular function for units without images
      return await createUnit(courseId, unitData);
    }
  },
  onSuccess: (data, variables) => {
    queryClient.invalidateQueries({ 
      queryKey: unitKeys.list(variables.courseId) 
    });
  },
  onError: (error: Error) => {
    console.error("Error creating unit:", error.message);
  }
});
 // In your unit-hooks.ts file


// Mutation for updating unit
const updateUnitMutation = useMutation({
  mutationFn: async ({ 
    unitId, 
    unitData,
    imageFile,
    oldImageUrl, // Add this parameter
  }: { 
    unitId: UnitId, 
    unitData: Partial<Omit<CourseUnit, "id" | "courseId" | "resources">>,
    imageFile?: File | null,
    oldImageUrl?: string, // The current image URL from the unit
  }) => {
    let finalUnitData = { ...unitData };
    
    // If there's a new image file, handle the image swap
    if (imageFile) {
      console.log(`Uploading new image for unit ${unitId}...`);
      
      // 1. Delete old image from Cloudinary (if it exists)
      if (oldImageUrl && oldImageUrl.includes('cloudinary.com')) {
        try {
          console.log('Deleting old image from Cloudinary...');
          await deleteImageFromCloudinary(oldImageUrl);
          console.log('✓ Old image deleted from Cloudinary');
        } catch (deleteError) {
          console.warn('Failed to delete old image from Cloudinary:', deleteError);
          // Continue with upload even if delete fails
        }
      }
      
      // 2. Upload new image
      const uploadedUrl = await uploadImageFile(imageFile);
      finalUnitData.urlImage = uploadedUrl;
      console.log('✓ New image uploaded to Cloudinary');
    }

    // Update the unit with the (possibly updated) data
    return updateUnit(unitId, finalUnitData);
  },
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


  // Mutation for deleting unit
  const deleteUnitMutation = useMutation({
    mutationFn: deleteUnit,
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: unitKeys.lists() 
      });
    },
    onError: (error: Error) => {
      console.error("Error deleting unit:", error.message);
    }
  });

  // Mutation for reordering units
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

  return {
    createUnit: createUnitMutation,
    updateUnit: updateUnitMutation,
    deleteUnit: deleteUnitMutation,
    reorderUnits: reorderUnitsMutation,
    uploadImage: uploadImageMutation
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