"use server";

import { Course } from "@/app/domain/entities/CourseEntities";
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

export async function fetchStudentCourses(
    studentId: string
): Promise<Course[]> {
    try {
        const response = await apiClient.get<Course[]>(
            `/students/${studentId}/courses`
        );

        return response.data;
    } catch (error) {
        return handleApiError(error);
    }
}