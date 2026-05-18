"use server";

import axios from "axios";
import { cookies } from "next/headers";
import { AssignmentId, UserId } from "@/app/domain/valueObjects/CourseValues";
import { calificationStudent } from "@/app/domain/entities/CourseEntities";


const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
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
    throw new Error(message);
  }
  throw error;
};

export async function fetchGradebookData(
    courseId: string
): Promise<calificationStudent[]> {
  try {
    const response = await apiClient.get(
        `/courses/${courseId}/gradebook`
    );
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function updateStudentGrade(
    courseId: string,
    updateData: {
      studentId: UserId;
      taskId: AssignmentId;
      grade: number | null;
    }
): Promise<calificationStudent> {
  try {
    const response = await apiClient.put(
        `/courses/${courseId}/gradebook/grade`,
        updateData
    );
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function bulkUpdateGrades(
    courseId: string,
    updates: Array<{
      studentId: UserId;
      taskId: AssignmentId;
      grade: number | null;
    }>
): Promise<calificationStudent[]> {
  try {
    const response = await apiClient.put(
        `/courses/${courseId}/gradebook/bulk-update`,
        { updates }
    );
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function exportGradebookToCSV(
    courseId: string
): Promise<Blob> {
  try {
    const response = await apiClient.get(
        `/courses/${courseId}/gradebook/export`,
        { responseType: "blob" }
    );
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function getGradebookStats(
    courseId: string
): Promise<{
  totalStudents: number;
  totalTasks: number;
  averageGrade: number;
  completionRate: number;
}> {
  try {
    const response = await apiClient.get(
        `/courses/${courseId}/gradebook/stats`
    );
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function getStudentGradeSummary(
    courseId: string,
    studentId: UserId
): Promise<{
  student: { id: UserId; name: string };
  grades: calificationStudent[];
  averageGrade: number;
  completedTasks: number;
  totalTasks: number;
}> {
  try {
    const response = await apiClient.get(
        `/courses/${courseId}/gradebook/students/${studentId}/summary`
    );
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}
