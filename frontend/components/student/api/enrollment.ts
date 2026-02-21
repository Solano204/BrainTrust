// File: src/app/features/courses/api/student-api.ts
"use server";

import axios from "axios";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Enrollment } from "@/app/domain/entities/CourseEntities";
import { CourseId, UserId } from "@/app/domain/valueObjects";


const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface EnrollmentDTO {
  id: string;
  courseId: string;
  courseName: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentRefId: string;
  enrollmentDate: string;
  status: string;
  finalGrade: GradeDTO | null;
}

export  interface GradeDTO {
  grade: number;
  feedback: string;
  gradedBy: string;
  gradedDate: string;
}

interface StudentSearchResultDTO {
  userId: string;
  personId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  studentRefId: string;
  isAlreadyEnrolled: boolean;
  enrollmentId: string | null;
  enrollmentStatus: string | null;
}

interface EnrollStudentRequest {
  studentId: string;
}

interface BulkEnrollRequest {
  studentIds: string[];
}

interface BulkUnenrollRequest {
  studentIds: string[];
}

interface SuccessResponseDTO {
  success: boolean;
  message: string;
  data: any;
}

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
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const handleApiError = async (error: unknown): Promise<never> => {
  if (axios.isAxiosError(error)) {
    const errorMessage = error.response?.data?.message || error.message;
    console.error("API Error:", errorMessage);
    throw new Error(errorMessage);
  }
  throw error;
};

function mapEnrollmentFromBackend(dto: EnrollmentDTO): Enrollment {
  return {
    id: dto.id,
    courseId: dto.courseId,
    studentId: dto.studentId,
    enrollmentDate: dto.enrollmentDate,
    status: dto.status,
    studentName: dto.studentName,
    studentEmail: dto.studentEmail,
    studentRefId: dto.studentRefId,
    finalGrade: dto.finalGrade 
  };
}


export interface User {
  id: UserId;
  personId: string;
  email: string;
  role: string;
  active: boolean;
  person: {
    id: string;
    firstName: string;
    lastName: string;
    gender: string;
    phone: string;
    registrationDate: string;
    imagePath: string;
    address: null;
  };
  // Additional fields from search result
  studentRefId: string;
  isAlreadyEnrolled: boolean;
  enrollmentId: string | null;
  enrollmentStatus: string | null;
}
function mapStudentSearchResultToUser(dto: StudentSearchResultDTO): User {
  return {
    id: dto.userId,
    personId: dto.personId,
    email: dto.email,
    role: "STUDENT",
    active: true,
    person: {
      id: dto.personId,
      firstName: dto.firstName,
      lastName: dto.lastName,
      gender: "",
      phone: "",
      registrationDate: "",
      imagePath: "",
      address: null
    },
    studentRefId: dto.studentRefId,
    isAlreadyEnrolled: dto.isAlreadyEnrolled,
    enrollmentId: dto.enrollmentId,
    enrollmentStatus: dto.enrollmentStatus
  };
}


export async function fetchEnrollmentsByCourse(courseId: CourseId): Promise<Enrollment[]> {
  try {
    const response = await apiClient.get<EnrollmentDTO[]>(
      `/api/courses/${courseId}/enrollments`
    );
    
    const enrollments = response.data.map(mapEnrollmentFromBackend);
    console.log(`Fetched ${enrollments.length} enrollments for course ${courseId}`);
    
    return enrollments;
  } catch (error) {
    return await handleApiError(error);
  }
}

export async function searchStudentsForEnrollment(
  courseId: CourseId,
  searchTerm: string
): Promise<User[]> {
  try {
    if (!searchTerm || searchTerm.trim().length === 0) {
      return [];
    }

    const response = await apiClient.get<StudentSearchResultDTO[]>(
      `/api/courses/${courseId}/enrollments/search`,
      {
        params: { query: searchTerm.trim() }
      }
    );
    
    const availableStudents = response.data
      .filter(dto => !dto.isAlreadyEnrolled)
      .map(mapStudentSearchResultToUser);
    
    console.log(`Found ${availableStudents.length} available students for course ${courseId}`);
    
    return availableStudents;
  } catch (error) {
    return await handleApiError(error);
  }
}

export async function createEnrollment(enrollmentData: {
  courseId: CourseId;
  studentId: UserId;
}): Promise<{ enrollmentId: string; courseId: CourseId; studentId: UserId }> {
  try {
    const request: EnrollStudentRequest = {
      studentId: enrollmentData.studentId
    };

    const response = await apiClient.post<SuccessResponseDTO>(
      `/api/courses/${enrollmentData.courseId}/enrollments`,
      request
    );
    
    const enrollmentId = response.data.data;
    console.log(`Enrolled student ${enrollmentData.studentId} in course ${enrollmentData.courseId}`);
    
    return {
      enrollmentId,
      courseId: enrollmentData.courseId,
      studentId: enrollmentData.studentId
    };
  } catch (error) {
    return await handleApiError(error);
  }
}

export async function bulkEnrollStudents(
  courseId: CourseId,
  studentIds: UserId[]
): Promise<{ enrollmentIds: string[]; courseId: CourseId }> {
  try {
    const request: BulkEnrollRequest = {
      studentIds
    };

    const response = await apiClient.post<SuccessResponseDTO>(
      `/api/courses/${courseId}/enrollments/bulk`,
      request
    );
    
    const enrollmentIds = Array.isArray(response.data.data)
      ? response.data.data 
      : [response.data.data];
    
    console.log(`Bulk enrolled ${studentIds.length} students in course ${courseId}`);
    
    return {
      enrollmentIds,
      courseId
    };
  } catch (error) {
    return await handleApiError(error);
  }
}

export async function deleteEnrollment(
    courseId: CourseId,
    studentId: UserId
): Promise<void> {
  try {
    await apiClient.delete(
        `/api/courses/${courseId}/enrollments/${studentId}`
    );

    console.log(
        `Unenrolled student ${studentId} from course ${courseId}`
    );
  } catch (error: any) {
    console.error("Error unenrolling student");

    if (error.response) {
      console.error("STATUS:", error.response.status);
      console.error("DATA:", error.response.data);
    } else {
      console.error(error);
    }

    throw error;
  }
}


export async function bulkUnenrollStudents(
  courseId: CourseId,
  studentIds: UserId[]
): Promise<void> {
  try {
    const request: BulkUnenrollRequest = {
      studentIds
    };

    await apiClient.delete(
      `/api/courses/${courseId}/enrollments/bulk`,
      { data: request }
    );
    
    console.log(`Bulk unenrolled ${studentIds.length} students from course ${courseId}`);
  } catch (error) {
    return await handleApiError(error);
  }
}


export async function getEnrollmentStats(courseId: CourseId): Promise<{
  total: number;
  active: number;
  completed: number;
  cancelled: number;
  averageGrade: number;
}> {
  try {
    const enrollments = await fetchEnrollmentsByCourse(courseId);
    
    const active = enrollments.filter(e => e.status === 'ACTIVE').length;
    const completed = enrollments.filter(e => e.status === 'COMPLETED').length;
    const cancelled = enrollments.filter(e => e.status === 'CANCELLED').length;
    
    const gradesWithValues = enrollments
      .filter(e => e.finalGrade?.grade != null)
      .map(e => e.finalGrade!.grade);
    
    const averageGrade = gradesWithValues.length > 0
      ? gradesWithValues.reduce((sum, grade) => sum + grade, 0) / gradesWithValues.length
      : 0;
    
    return {
      total: enrollments.length,
      active,
      completed,
      cancelled,
      averageGrade: Math.round(averageGrade * 100) / 100
    };
  } catch (error) {
    return await handleApiError(error);
  }
}