"use server";

import {
  Course,
  Enrollment,
  CourseUnit,
} from "@/app/domain/entities/CourseEntities";
import { CourseId } from "@/app/domain/valueObjects/CourseValues";
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

export interface GradeDTO {
  value: string;
  maxScore: string;
  percentage: string;
}

export interface CreateCourseCommand {
  code: string;
  name: string;
  description: string;
  grade: string;
  group: string;
  teacherId: string;
}

export interface CreateCourseWithImageCommand extends CreateCourseCommand {
  imageUrl: string;
}

export interface UpdateCourseCommand {
  courseId: string;
  name: string;
  description: string;
  grade: string;
  group: string;
  imageUrl?: string;
}

export interface EnrollStudentRequest {
  studentId: string;
}

export interface AddUnitRequest {
  name: string;
  order: number;
  description: string;
}

export interface SuccessResponseDTO {
  success: boolean;
  message: string;
  data: any;
}

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
        config.headers["Authorization"] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
);

const handleApiError = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    throw new Error(
        error.response?.data?.message || error.message
    );
  }
  throw error;
};

async function mapCourseFromBackend(dto: CourseDTO): Promise<Course> {
  return {
    id: dto.id,
    code: dto.code,
    name: dto.name,
    description: dto.description,
    urlImage: dto.urlImage,
    grade: dto.grade,
    group: dto.group,
    teacherId: dto.teacherId,
    active: dto.active,
    enrollments: [],
    units: [],
  };
}

async function mapEnrollmentFromBackend(
    dto: EnrollmentDTO
): Promise<Enrollment> {
  return {
    id: dto.id,
    courseId: dto.courseId,
    studentId: dto.studentId,
    enrollmentDate: dto.enrollmentDate,
  };
}

async function mapCourseUnitFromBackend(
    dto: CourseUnitDTO
): Promise<CourseUnit> {
  return {
    id: dto.id,
    courseId: dto.courseId,
    name: dto.name,
    urlImage: dto.urlImage,
    numUnity: dto.numUnity,
    description: dto.description,
    resources: [],
  };
}

async function mapCreateCourseToBackendCommand(
    data: Omit<Course, "id" | "enrollments" | "units">
): Promise<CreateCourseCommand> {
  return {
    code: data.code,
    name: data.name,
    description: data.description,
    grade: data.grade,
    group: data.group,
    teacherId: data.teacherId,
  };
}

async function mapCreateCourseWithImageToBackendCommand(
    data: Omit<Course, "id" | "enrollments" | "units">
): Promise<CreateCourseWithImageCommand> {
  return {
    ...await mapCreateCourseToBackendCommand(data),
    imageUrl: data.urlImage || "",
  };
}

async function mapUpdateCourseToBackendCommandImage(
    courseId: string,
    data: Partial<Omit<Course, "id" | "teacherId" | "enrollments" | "units">>
): Promise<UpdateCourseCommand> {
  return {
    courseId,
    name: data.name || "",
    description: data.description || "",
    grade: data.grade || "",
    group: data.group || "",
    imageUrl: data.urlImage ?? undefined,
  };
}

async function mapEnrollStudentToBackendCommand(
    studentId: string
): Promise<EnrollStudentRequest> {
  return { studentId };
}

export async function fetchAllCourses(): Promise<Course[]> {
  try {
    const res = await apiClient.get<CourseDTO[]>("/api/courses");
    return Promise.all(res.data.map(mapCourseFromBackend));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function fetchCoursesByTeacher(
    teacherId: string
): Promise<Course[]> {
  try {
    const res = await apiClient.get<CourseDTO[]>(
        `/api/courses/teacher/${teacherId}`
    );
    return Promise.all(res.data.map(mapCourseFromBackend));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function fetchCoursesByStudent(
    studentId: string
): Promise<Course[]> {
  try {
    const res = await apiClient.get<CourseDTO[]>(
        `/api/courses/student/${studentId}`
    );
    return Promise.all(res.data.map(mapCourseFromBackend));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function fetchCourseById(
    courseId: string
): Promise<Course> {
  try {
    const res = await apiClient.get<CourseDTO>(
        `/api/courses/${courseId}`
    );
    return mapCourseFromBackend(res.data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function fetchCourseByIdAllUnits(
    courseId: CourseId
): Promise<CourseUnitDTO[]> {
  try {
    const res = await apiClient.get<CourseUnitDTO[]>(
        `/api/courses/${courseId}/units`
    );
    return res.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function createCourse(
    courseData: Course
): Promise<Course> {
  try {
    const cmd = await mapCreateCourseToBackendCommand(courseData);
    const res = await apiClient.post<CourseDTO>(
        "/api/courses",
        cmd
    );
    return mapCourseFromBackend(res.data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function createCourseWithImage(
    courseData: Course
): Promise<Course> {
  try {
    const cmd = await mapCreateCourseWithImageToBackendCommand(courseData);
    const res = await apiClient.post<CourseDTO>(
        "/api/courses/with-image",
        cmd
    );
    return mapCourseFromBackend(res.data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function updateCourse(
    courseId: CourseId,
    courseData: Partial<Omit<Course, "id" | "teacherId">>
): Promise<Course> {
  try {
    const cmd = await mapUpdateCourseToBackendCommandImage(
        courseId,
        courseData
    );
    const res = await apiClient.put<CourseDTO>(
        `/api/courses/${courseId}`,
        cmd
    );
    return mapCourseFromBackend(res.data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function deleteCourse(
    courseId: CourseId
): Promise<void> {
  try {
    await apiClient.delete(`/api/courses/${courseId}`);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function searchCourses(
    searchTerm: string
): Promise<Course[]> {
  try {
    const courses = await fetchAllCourses();
    const term = searchTerm.toLowerCase();
    return courses.filter(
        (c) =>
            c.name.toLowerCase().includes(term) ||
            c.code.toLowerCase().includes(term) ||
            c.description.toLowerCase().includes(term)
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function enrollStudent(
    courseId: CourseId,
    studentId: string
): Promise<void> {
  try {
    const cmd = await mapEnrollStudentToBackendCommand(studentId);
    await apiClient.post(
        `/api/courses/${courseId}/enrollments`,
        cmd
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function unenrollStudent(
    courseId: CourseId,
    studentId: string
): Promise<void> {
  try {
    await apiClient.delete(
        `/api/courses/${courseId}/enrollments/${studentId}`
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function uploadCourseImageFile(
    courseId: string,
    file: File
): Promise<string> {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await apiClient.post<SuccessResponseDTO>(
        `/api/courses/${courseId}/image/upload`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
    );

    const imageUrl = res.data.data?.url || res.data.data;
    if (!imageUrl) throw new Error("No image URL returned");

    return imageUrl;
  } catch (error) {
    return handleApiError(error);
  }
}
