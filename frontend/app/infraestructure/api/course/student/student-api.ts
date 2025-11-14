// app/infraestructure/api/course/student-api.ts
"use server";

import { Course, Submission } from "@/app/domain/entities/CourseEntities";
import { generateUUID } from "@/app/utils/uuid";
import axios from "axios";
import { cookies } from "next/headers";

const isMockEnabled = true;

// Mock student courses data
const MOCK_STUDENT_COURSES: Course[] = [
  {
    id: generateUUID(),
    code: "CS101",
    name: "Introduction to Computer Science",
    description: "A foundational course covering basic programming concepts and algorithms.",
    urlImage: "https://picsum.photos/seed/cs101/400/300",
    grade: "Beginner",
    group: "Engineering",
    teacherId: "teacher-001",
    active: true,
    enrollments: [],
    units: [],
  },
  {
    id: generateUUID(),
    code: "MTH202",
    name: "Advanced Calculus",
    description: "Deeper study of differential equations and multivariate calculus.",
    urlImage: "https://picsum.photos/seed/mth202/400/300",
    grade: "Advanced",
    group: "Science",
    teacherId: "teacher-002",
    active: true,
    enrollments: [],
    units: [],
  },
];

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use(
  async (config) => {
    const token = (await cookies()).get("session")?.value;
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const handleApiError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const errorMessage = error.response?.data?.message || error.message;
    throw new Error(errorMessage);
  }
  throw error;
};


const simulateDelay = (ms: number = 500) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchStudentCourses(studentId: string): Promise<Course[]> {
  if (isMockEnabled) {
    await simulateDelay();
    console.log(`MOCK: Returning courses for student ${studentId}`);
    return MOCK_STUDENT_COURSES;
  }

  // Real API implementation would go here
  throw new Error("Real API not implemented");
}


