"use server";

import axios from "axios";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Quiz } from "@/app/domain/entities/CourseEntities";
import { CourseId, UnitId } from "@/app/domain/valueObjects";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
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
        error.response?.data?.message ||
        error.response?.statusText ||
        error.message;

    redirect("/courses");
    throw new Error(message);
  }

  throw error;
};


export async function fetchQuizzesByUnit(
    courseId: CourseId,
    unitId: UnitId
): Promise<Quiz[]> {
  try {
    const response = await apiClient.get<Quiz[]>(
        `/courses/${courseId}/units/${unitId}/quizzes`
    );

    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}


export async function fetchQuizById(quizId: string): Promise<Quiz> {
  try {
    const response = await apiClient.get<Quiz>(`/quizzes/${quizId}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Crea un quiz
 */
export async function createQuiz(
    courseId: CourseId,
    unitId: UnitId,
    quizData: Omit<Quiz, "id" | "courseId" | "courseUnitId" | "createdAt">
): Promise<Quiz> {
  try {
    const response = await apiClient.post<Quiz>(
        `/courses/${courseId}/units/${unitId}/quizzes`,
        quizData
    );

    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Actualiza un quiz
 */
export async function updateQuiz(
    quizId: string,
    quizData: Partial<Omit<Quiz, "id" | "courseId" | "courseUnitId" | "createdAt">>
): Promise<Quiz> {
  try {
    const response = await apiClient.put<Quiz>(
        `/quizzes/${quizId}`,
        quizData
    );

    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Elimina un quiz
 */
export async function deleteQuiz(quizId: string): Promise<void> {
  try {
    await apiClient.delete(`/quizzes/${quizId}`);
  } catch (error) {
    return handleApiError(error);
  }
}