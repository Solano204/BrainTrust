"use server";

import { Course } from "@/app/domain/entities";

import { GradeDTO } from "@/app/shared/dtos/assignment.dto";
import axios from "axios";
import { cookies } from "next/headers";

export interface CourseDTO {
  id: string;
  code: string;
  name: string;
  description: string;
  urlImage: string;
  grade: string;
  group: string;
  teacherId: string;
  teacherName: string;
  active: boolean;
  studentCount: number;
  assignmentCount: number;
  unitCount: number;
  createdAt: string;
}

export interface EnrollmentDTO {
  id: string;
  courseId: string;
  courseName: string;
  studentId: string;
  studentName: string;
  enrollmentDate: string;
  status: string;
  finalGrade: GradeDTO;
}

export interface CourseUnitDTO {
  id: string;
  courseId: string;
  name: string;
  urlImage: string;
  numUnity: number;
  description: string;
}

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

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
    (error) => Promise.reject(error)
);

const handleApiError = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    const message =
        error.response?.data?.message || error.message;
    throw new Error(message);
  }
  throw error;
};

const mapBackendCourseToFrontend = (
    backendCourse: CourseDTO
): Course => ({
  id: backendCourse.id,
  code: backendCourse.code,
  name: backendCourse.name,
  description: backendCourse.description,
  urlImage: backendCourse.urlImage,
  grade: backendCourse.grade,
  group: backendCourse.group,
  teacherId: backendCourse.teacherId,
  active: backendCourse.active,
  enrollments: [],
  units: [],
});

export async function fetchStudentCourses(
    studentId: string
): Promise<Course[]> {
  try {
    const response = await apiClient.get<CourseDTO[]>(
        `/api/courses/student/${studentId}`
    );
    return response.data.map(mapBackendCourseToFrontend);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function fetchCourseById(
    courseId: string
): Promise<Course> {
  try {
    const response = await apiClient.get<CourseDTO>(
        `/api/courses/${courseId}`
    );
    return mapBackendCourseToFrontend(response.data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function fetchCourseUnits(
    courseId: string
): Promise<CourseUnitDTO[]> {
  try {
    const response = await apiClient.get<CourseUnitDTO[]>(
        `/api/courses/${courseId}/units`
    );
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function fetchStudentEnrollments(
    studentId: string
): Promise<EnrollmentDTO[]> {
  try {
    const response = await apiClient.get<CourseDTO[]>(
        `/api/courses/student/${studentId}`
    );

    return response.data.map((course) => ({
      id: `enroll-${course.id}`,
      courseId: course.id,
      courseName: course.name,
      studentId,
      studentName: "Student",
      enrollmentDate: course.createdAt,
      status: "ACTIVE",
      finalGrade: {
        value: "0",
        maxScore: "100",
        percentage: "0%",
      },
    }));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function isStudentEnrolled(
    courseId: string,
    studentId: string
): Promise<boolean> {
  try {
    const enrollments = await fetchStudentEnrollments(studentId);
    return enrollments.some(
        (e) => e.courseId === courseId && e.status === "ACTIVE"
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function fetchTeacherCourses(
    teacherId: string
): Promise<Course[]> {
  try {
    const response = await apiClient.get<CourseDTO[]>(
        `/api/courses/teacher/${teacherId}`
    );
    return response.data.map(mapBackendCourseToFrontend);
  } catch (error) {
    return handleApiError(error);
  }
}
