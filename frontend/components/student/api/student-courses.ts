// File: src/app/infraestructure/api/types/backend-types.ts
"use server";

import { Course } from "@/app/domain/entities";
import { generateUUID } from "@/app/utils/uuid";
import { GradeDTO } from "@/components/student/api/student-submission";
import axios from "axios";
import { cookies } from "next/headers";

// Add these types for course and student
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
  status: string; // ACTIVE, COMPLETED, CANCELLED
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



const isMockEnabled = process.env.NEXT_PUBLIC_MOCK_ENABLED === 'true';

// Mock student courses data
const MOCK_STUDENT_COURSES: Course[] = [
  {
    id: "crs-101",
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

// Mappers for backend to frontend types
const mapBackendCourseToFrontend = (backendCourse: CourseDTO): Course => {
  return {
    id: backendCourse.id,
    code: backendCourse.code,
    name: backendCourse.name,
    description: backendCourse.description,
    urlImage: backendCourse.urlImage,
    grade: backendCourse.grade,
    group: backendCourse.group,
    teacherId: backendCourse.teacherId,
    active: backendCourse.active,
    enrollments: [], // You might need to fetch enrollments separately
    units: [] // You might need to fetch units separately
  };
};

const mapBackendEnrollmentToCourse = (enrollment: EnrollmentDTO): Course => {
  return {
    id: enrollment.courseId,
    code: "", // You might need to fetch course details separately
    name: enrollment.courseName,
    description: "", // You might need to fetch course details separately
    urlImage: "", // You might need to fetch course details separately
    grade: "", // You might need to fetch course details separately
    group: "", // You might need to fetch course details separately
    teacherId: "", // You might need to fetch course details separately
    active: enrollment.status === 'ACTIVE',
    enrollments: [enrollment],
    units: []
  };
};



// THIS CURRENTLY WORKS

/**
 * Fetch courses for a specific student WORK
 */
export async function fetchStudentCourses(studentId: string): Promise<Course[]> {
  if (isMockEnabled) {
    await simulateDelay();
    console.log(`MOCK: Returning courses for student ${studentId}`);
    return MOCK_STUDENT_COURSES;
  }

  try {
    // Option 1: Use the dedicated student courses endpoint
    const response = await apiClient.get<CourseDTO[]>(`/api/courses/student/${studentId}`);
    const backendCourses = response.data;
    
    return backendCourses.map(mapBackendCourseToFrontend);
    
  } catch (error) {
    console.error("Error fetching student courses from backend:", error);
    return handleApiError(error);
  }
}

/**
 * Fetch course details by ID
 */
export async function fetchCourseById(courseId: string): Promise<Course> {
  if (isMockEnabled) {
    await simulateDelay();
    console.log(`MOCK: Returning course details for ${courseId}`);
    
    const mockCourse = MOCK_STUDENT_COURSES.find(course => course.id === courseId);
    if (!mockCourse) {
      throw new Error("Course not found");
    }
    
    return mockCourse;
  }

  try {
    const response = await apiClient.get<CourseDTO>(`/api/courses/${courseId}`);
    return mapBackendCourseToFrontend(response.data);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Fetch course units
 */
export async function fetchCourseUnits(courseId: string): Promise<CourseUnitDTO[]> {
  if (isMockEnabled) {
    await simulateDelay(400);
    console.log(`MOCK: Returning units for course ${courseId}`);
    
    // Mock units data
    const mockUnits: CourseUnitDTO[] = [
      {
        id: "unit-1",
        courseId,
        name: "Introduction to Programming",
        urlImage: "https://picsum.photos/seed/unit1/300/200",
        numUnity: 1,
        description: "Basic programming concepts and syntax"
      },
      {
        id: "unit-2",
        courseId,
        name: "Data Structures",
        urlImage: "https://picsum.photos/seed/unit2/300/200",
        numUnity: 2,
        description: "Arrays, lists, and basic data structures"
      },
      {
        id: "unit-3",
        courseId,
        name: "Algorithms",
        urlImage: "https://picsum.photos/seed/unit3/300/200",
        numUnity: 3,
        description: "Basic algorithms and problem solving"
      }
    ];
    
    return mockUnits;
  }

  try {
    const response = await apiClient.get<CourseUnitDTO[]>(`/api/courses/${courseId}/units`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Fetch student enrollments
 */
export async function fetchStudentEnrollments(studentId: string): Promise<EnrollmentDTO[]> {
  if (isMockEnabled) {
    await simulateDelay(600);
    console.log(`MOCK: Returning enrollments for student ${studentId}`);
    
    // Mock enrollments data
    const mockEnrollments: EnrollmentDTO[] = [
      {
        id: "enroll-1",
        courseId: "course-1",
        courseName: "Introduction to Computer Science",
        studentId,
        studentName: "Student Name",
        enrollmentDate: "2024-01-15T00:00:00Z",
        status: "ACTIVE",
        finalGrade: { value: "85", maxScore: "100", percentage: "85%" }
      },
      {
        id: "enroll-2",
        courseId: "course-2",
        courseName: "Advanced Calculus",
        studentId,
        studentName: "Student Name",
        enrollmentDate: "2024-01-15T00:00:00Z",
        status: "ACTIVE",
        finalGrade: { value: "92", maxScore: "100", percentage: "92%" }
      }
    ];
    
    return mockEnrollments;
  }

  try {
    // This might require a different approach since the backend doesn't have a direct endpoint
    // You might need to get all courses and filter by student enrollment
    const coursesResponse = await apiClient.get<CourseDTO[]>(`/api/courses/student/${studentId}`);
    const courses = coursesResponse.data;
    
    // Convert courses to enrollments (simplified approach)
    const enrollments: EnrollmentDTO[] = courses.map(course => ({
      id: `enroll-${course.id}`,
      courseId: course.id,
      courseName: course.name,
      studentId,
      studentName: "Student", // You might need to fetch student name separately
      enrollmentDate: course.createdAt,
      status: "ACTIVE",
      finalGrade: { value: "0", maxScore: "100", percentage: "0%" } // You might need to fetch grade separately
    }));
    
    return enrollments;
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Check if student is enrolled in a course
 */
export async function isStudentEnrolled(courseId: string, studentId: string): Promise<boolean> {
  if (isMockEnabled) {
    await simulateDelay(200);
    console.log(`MOCK: Checking enrollment for student ${studentId} in course ${courseId}`);
    return true; // Mock always returns true
  }

  try {
    // You might need to create this endpoint or check via enrollments
    const enrollments = await fetchStudentEnrollments(studentId);
    return enrollments.some(enrollment => 
      enrollment.courseId === courseId && enrollment.status === 'ACTIVE'
    );
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Get courses by teacher
 */

// CURRENTLY WORK

export async function fetchTeacherCourses(teacherId: string): Promise<Course[]> {
  if (isMockEnabled) {
    await simulateDelay();
    console.log(`MOCK: Returning courses for teacher ${teacherId}`);
    
    // Return mock courses with teacher ID
    return MOCK_STUDENT_COURSES.map(course => ({
      ...course,
      teacherId
    }));
  }

  try {
    const response = await apiClient.get<CourseDTO[]>(`/api/courses/teacher/${teacherId}`);
    const backendCourses = response.data;
    
    return backendCourses.map(mapBackendCourseToFrontend);
  } catch (error) {
    return handleApiError(error);
  }
}