"use client";

import { Course } from "@/app/domain/entities/CourseEntities";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CourseId } from "@/app/domain/valueObjects/CourseValues";
import { courseKeys } from "@/app/infraestructure/api/course/course-keys";
import React from "react";
import {
  createCourse,
  createCourseWithImage,
  deleteCourse,
  fetchAllCourses,
  fetchCourseById,
  fetchCourseByIdAllUnits,
  fetchCoursesByTeacher,
  updateCourse,
  uploadCourseImageFile,
} from "../api/teacher-courses";
import { deleteImageFromCloudinary, uploadImageFile } from "@/app/utils/cloudinary/cloudinary";

export function useCourseAllUnits(courseId: CourseId | null) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["course-all-units", courseId],
    queryFn: () => fetchCourseByIdAllUnits(courseId!),
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000,
  });

  return {
    units: data || [],
    isLoading,
    error: error as Error | null,
    refetch,
  };
}

export function useCoursesByTeacher(teacherId: string | null) {
  return useQuery<Course[]>({
    queryKey: courseKeys.list(teacherId || ""),
    queryFn: () => fetchCoursesByTeacher(teacherId!),
    enabled: !!teacherId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useCourseMutations() {
  const queryClient = useQueryClient();

  const uploadImageMutation = useMutation({
    mutationFn: async ({
      courseId,
      file,
    }: {
      courseId: string;
      file: File;
    }) => {
      return uploadCourseImageFile(courseId, file);
    },
    onError: (error: Error) => {
      console.error("Error uploading course image:", error.message);
    },
  });

  const createCourseMutation = useMutation({
    mutationFn: async ({
      courseData,
      imageFile,
    }: {
      courseData: Course;
      imageFile?: File | null;
    }) => {

      if (imageFile) {
        const uploadedUrl = await uploadImageFile(imageFile);
        courseData.urlImage = uploadedUrl;
        const createdCourse = await createCourseWithImage({
          ...courseData,
        });
        return createdCourse;
      } else {
        const createdCourse = await createCourse(courseData);
        return createdCourse;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: courseKeys.lists(),
      });
    },
    onError: (error: Error) => {
      console.error("Error creating course:", error.message);
    },
  });

const updateCourseMutation = useMutation({
  mutationFn: async ({
    courseId,
    courseData,
    imageFile,
    oldImageUrl,
  }: {
    courseId: CourseId;
    courseData: Partial<Omit<Course, "id" | "teacherId">>;
    imageFile?: File | null;
    oldImageUrl?: string;
  }) => {
    let finalCourseData = { ...courseData };

    if (imageFile) {
      console.log(`Uploading new image for course ${courseId}...`);
      
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
      finalCourseData.urlImage = uploadedUrl;
      console.log('✓ New image uploaded to Cloudinary');
    }

    return updateCourse(courseId, finalCourseData);
  },

  onSuccess: (data, variables) => {
    queryClient.invalidateQueries({
      queryKey: courseKeys.lists(),
    });
    queryClient.invalidateQueries({
      queryKey: courseKeys.detail(variables.courseId),
    });
  },
  onError: (error: Error) => {
    console.error("Error updating course:", error.message);
  },
});


  const deleteCourseMutation = useMutation({
    mutationFn: deleteCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: courseKeys.lists(),
      });
    },
    onError: (error: Error) => {
      console.error("Error deleting course:", error.message);
    },
  });

  return {
    createCourse: createCourseMutation,
    updateCourse: updateCourseMutation,
    deleteCourse: deleteCourseMutation,
    uploadImage: uploadImageMutation,
  };
}

export function useCourseForm(initialData?: Course) {
  const [formData, setFormData] = React.useState({
    name: initialData?.name || "",
    code: initialData?.code || "",
    description: initialData?.description || "",
    grade: initialData?.grade || "Beginner",
    group: initialData?.group || "Default Group",
    urlImage: initialData?.urlImage || "",
    active: initialData?.active ?? true,
  });

  React.useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        code: initialData.code,
        description: initialData.description,
        grade: initialData.grade,
        group: initialData.group,
        urlImage: initialData.urlImage || "",
        active: initialData.active,
      });
    } else {
      setFormData({
        name: "",
        code: "",
        description: "",
        grade: "Beginner",
        group: "Default Group",
        urlImage: "",
        active: true,
      });
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      description: "",
      grade: "Beginner",
      group: "Default Group",
      urlImage: "",
      active: true,
    });
  };

  return {
    formData,
    handleChange,
    resetForm,
    setFormData,
  };
}
