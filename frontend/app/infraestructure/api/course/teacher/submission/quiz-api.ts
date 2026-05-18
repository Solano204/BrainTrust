"use server";

import { SubmissionQuiz } from "@/app/domain/entities/CourseEntities";
import { CourseId, UserId } from "@/app/domain/valueObjects";
import { QuizId } from "@/app/domain/valueObjects/CourseValues";
import axios from "axios";
import { cookies } from "next/headers";

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
        error.response?.data?.message ||
        error.response?.statusText ||
        error.message;

    throw new Error(message);
  }

  throw error;
};

/**
 * Obtiene todas las entregas de quizzes de un curso
 */
export async function fetchSubmissionQuizzesByCourse(
    courseId: CourseId
): Promise<SubmissionQuiz[]> {
  try {
    const response = await apiClient.get<SubmissionQuiz[]>(
        `/courses/${courseId}/submission-quizzes`
    );

    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Obtiene la entrega de un quiz específico por estudiante
 */
export async function fetchSubmissionQuizByStudentAndQuiz(
    quizId: QuizId,
    studentId: UserId
): Promise<SubmissionQuiz | null> {
  try {
    const response = await apiClient.get<SubmissionQuiz>(
        `/quizzes/${quizId}/submissions/${studentId}`
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }

    return handleApiError(error);
  }
}