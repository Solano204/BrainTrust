// File: src/app/features/courses/hooks/course-hooks.ts
"use client";

import { Course } from "@/app/domain/entities/CourseEntities";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CourseId } from "@/app/domain/valueObjects/CourseValues";

import { courseKeys } from "@/app/infraestructure/api/course/course-keys";
import React from "react";
import { createCourse, deleteCourse, fetchAllCourses, fetchCourseById, fetchCourseByIdAllUnits, fetchCoursesByTeacher, updateCourse } from "../api/teacher-courses";
/**
 * Custom hook for fetching all courses
 */






export function useCourseAllUnits(courseId: CourseId | null) {
  return useQuery<Course>({
    queryKey: courseKeys.detail(courseId || ""),
    queryFn: () => fetchCourseByIdAllUnits(courseId!),
    enabled: !!courseId,
    staleTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}




export function useCoursesByTeacher(teacherId: string | null) {
  return useQuery<Course[]>({
    queryKey: courseKeys.list(teacherId || ""),
    queryFn: () => fetchCoursesByTeacher(teacherId!),
    enabled: !!teacherId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Custom hook for fetching all courses (fallback)
 */
export function useCourses() {
  return useQuery<Course[]>({
    queryKey: courseKeys.list("all"),
    queryFn: fetchAllCourses,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/**
 * Custom hook for fetching a single course by ID
 */
export function useCourse(courseId: string | null) {
  return useQuery<Course>({
    queryKey: courseKeys.detail(courseId || ""),
    queryFn: () => fetchCourseById(courseId!),
    enabled: !!courseId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}




/**
 * Custom hook for course mutations
 */
export function useCourseMutations() {
  const queryClient = useQueryClient();

  const createCourseMutation = useMutation({
    mutationFn: createCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: courseKeys.lists() 
      });
    },
    onError: (error: Error) => {
      console.error("Error creating course:", error.message);
    }
  });

  const updateCourseMutation = useMutation({
    mutationFn: ({ courseId, courseData }: { courseId: CourseId, courseData: Partial<Omit<Course, "id" | "teacherId">> }) =>
      updateCourse(courseId, courseData),
    onSuccess: (data, variables) => {
      // Update both the list and the specific course detail
      queryClient.invalidateQueries({ 
        queryKey: courseKeys.lists() 
      });
      queryClient.invalidateQueries({ 
        queryKey: courseKeys.detail(variables.courseId) 
      });
    },
    onError: (error: Error) => {
      console.error("Error updating course:", error.message);
    }
  });

  const deleteCourseMutation = useMutation({
    mutationFn: deleteCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: courseKeys.lists() 
      });
    },
    onError: (error: Error) => {
      console.error("Error deleting course:", error.message);
    }
  });

 

  return {
    createCourse: createCourseMutation,
    updateCourse: updateCourseMutation,
    deleteCourse: deleteCourseMutation
  };
}

/**
 * Custom hook for managing course form state
 */
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
    setFormData
  };
}