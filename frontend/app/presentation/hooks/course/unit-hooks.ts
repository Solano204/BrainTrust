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


export function useUnitsByCourse(courseId: CourseId | null) {
  return useQuery<CourseUnit[]>({
    queryKey: unitKeys.list(courseId || ""),
    queryFn: () => fetchUnitsByCourse(courseId!),
    enabled: !!courseId,
    staleTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

export function useUnit(unitId: UnitId | null) {
  return useQuery<CourseUnit>({
    queryKey: unitKeys.detail(unitId || ""),
    queryFn: () => fetchUnitById(unitId!),
    enabled: !!unitId,
    staleTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}


export function useUnitMutations() {
  const queryClient = useQueryClient();

  const uploadImageMutation = useMutation({
    mutationFn: async ({ unitId, file }: { unitId: string, file: File }) => {
      return uploadUnitImageFile(unitId, file);
    },
    onError: (error: Error) => {
      console.error("Error uploading unit image:", error.message);
    }
  });

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

      return await createUnitWithImage(courseId, unitData, imageFile);
    } else {
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


const updateUnitMutation = useMutation({
  mutationFn: async ({ 
    unitId, 
    unitData,
    imageFile,
    oldImageUrl,
  }: { 
    unitId: UnitId, 
    unitData: Partial<Omit<CourseUnit, "id" | "courseId" | "resources">>,
    imageFile?: File | null,
    oldImageUrl?: string,
  }) => {
    let finalUnitData = { ...unitData };
    
    if (imageFile) {
      console.log(`Uploading new image for unit ${unitId}...`);
      
      if (oldImageUrl && oldImageUrl.includes('cloudinary.com')) {
        try {
          console.log('Deleting old image from Cloudinary...');
          await deleteImageFromCloudinary(oldImageUrl);
          console.log('✓ Old image deleted from Cloudinary');
        } catch (deleteError) {
          console.warn('Failed to delete old image from Cloudinary:', deleteError);
        }
      }
      
      const uploadedUrl = await uploadImageFile(imageFile);
      finalUnitData.urlImage = uploadedUrl;
      console.log('✓ New image uploaded to Cloudinary');
    }

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