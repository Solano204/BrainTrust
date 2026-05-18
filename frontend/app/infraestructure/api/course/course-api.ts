"use server";

import { Course } from "@/app/domain/entities/CourseEntities";
import { CourseId } from "@/app/domain/valueObjects/CourseValues";
import axios from "axios";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";


const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
    async (config) => {
      const token = (await cookies()).get("session")?.value;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
);

const handleApiError = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    const message =
        error.response?.data?.message || error.message || "API Error";
    redirect("/courses");
    throw new Error(message);
  }
  throw error;
};

export async function fetchAllCourses(): Promise<Course[]> {
  try {
    const response = await apiClient.get("/courses");
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function fetchCoursesByTeacher(
    teacherId: string
): Promise<Course[]> {
  try {
    const response = await apiClient.get(`/teachers/${teacherId}/courses`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function fetchCourseById(courseId: string): Promise<Course> {
  try {
    const response = await apiClient.get(`/courses/${courseId}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function fetchCourseByIdAllUnits(
    courseId: CourseId
): Promise<Course> {
  try {
    if (!courseId) throw new Error("Course ID is required");
    const response = await apiClient.get(`/courses/${courseId}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function createCourse(
    courseData: Omit<Course, "id" | "teacherId">
): Promise<Course> {
  try {
    const response = await apiClient.post("/courses", courseData);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function updateCourse(
    courseId: CourseId,
    courseData: Partial<Omit<Course, "id" | "teacherId">>
): Promise<Course> {
  try {
    if (!courseId) throw new Error("Course ID is required");
    const response = await apiClient.put(`/courses/${courseId}`, courseData);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function deleteCourse(courseId: CourseId): Promise<void> {
  try {
    if (!courseId) throw new Error("Course ID is required");
    await apiClient.delete(`/courses/${courseId}`);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function toggleCourseActive(
    courseId: CourseId
): Promise<Course> {
  try {
    if (!courseId) throw new Error("Course ID is required");
    const response = await apiClient.patch(
        `/courses/${courseId}/toggle-active`
    );
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function searchCourses(searchTerm: string): Promise<Course[]> {
  try {
    const response = await apiClient.get("/courses/search", {
      params: { q: searchTerm },
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function getCourseStats(courseId: CourseId): Promise<{
  totalStudents: number;
  activeStudents: number;
  averageGrade: number;
  unitCount: number;
}> {
  try {
    const response = await apiClient.get(`/courses/${courseId}/stats`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}
