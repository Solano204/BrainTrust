"use server";

import {
  Course,
  Enrollment,
  CourseUnit,
} from "@/app/domain/entities/CourseEntities";
import { CourseId } from "@/app/domain/valueObjects/CourseValues";
import axios from "axios";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
// File: src/app/infraestructure/api/types/course-types.ts

// ============================================
// BACKEND DTO TYPES
// ============================================

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

export interface GradeDTO {
  value: string;
  maxScore: string;
  percentage: string;
}

// ============================================
// BACKEND COMMAND TYPES
// ============================================

export interface CreateCourseCommand {
  code: string;
  name: string;
  description: string;
  grade: string;
  group: string;
  teacherId: string;
}

export interface CreateCourseWithImageCommand {
  code: string;
  name: string;
  description: string;
  grade: string;
  group: string;
  teacherId: string;
  imageUrl: string;
}

export interface UpdateCourseCommand {
  courseId: string;
  name: string;
  description: string;
  grade: string;
  group: string;
  teacherId?: string;
  imageUrl?: string;
}

export interface UpdateImageRequest {
  imageUrl: string;
}

export interface EnrollStudentRequest {
  studentId: string;
}

export interface AddUnitRequest {
  name: string;
  order: number;
  description: string;
}

export interface AddUnitWithImageRequest {
  name: string;
  order: number;
  description: string;
  imageUrl: string;
}

export interface UpdateUnitRequest {
  unitId: string;
  name: string;
  description: string;
  urlImage: string;
}

// ============================================
// RESPONSE TYPES
// ============================================

export interface SuccessResponseDTO {
  success: boolean;
  message: string;
  data: any;
}

export interface CourseStatsDTO {
  totalStudents: number;
  activeStudents: number;
  averageGrade: number;
  unitCount: number;
  assignmentCount: number;
  completionRate: number;
}

// --- MOCKING CONFIGURATION AND DATA ---

/**
 * Flag to enable/disable mocking.
 * Set to true to use mock data, false to use the real backend.
 */
const isMockEnabled = false ;

// Mock course data
const MOCK_COURSES_ALL_UNITS: Course[] = [
  {
    id: "crs-101",
    code: "JS-101",
    name: "JavaScript Fundamentals",
    description: "Learn the basics of JavaScript programming",
    urlImage:
      "https://placehold.co/800x300/4F46E5/FFFFFF?text=JavaScript+Fundamentals",
    grade: "Beginner",
    group: "Section A",
    teacherId: "user-001",
    active: true,
    enrollments: Array.from({ length: 25 }, (_, i) => ({
      id: `enr-${i}`,
      courseId: "crs-101",
      studentId: `student-${i}`,
      enrollmentDate: "2024-01-01",
      status: "ACTIVE",
      grade: null,
    })),
    units: [
      {
        id: "unit-1-1",
        courseId: "crs-101",
        name: "Module 1: Basic JavaScript Syntax",
        urlImage: "https://picsum.photos/seed/unit-1-1/300/200",
        numUnity: 1,
        description: "Covers variables, data types, and basic operators in JS.",
        resources: [],
      },
      {
        id: "unit-1-2",
        courseId: "crs-101",
        name: "Module 2: Control Flow",
        urlImage: "https://picsum.photos/seed/unit-1-2/300/200",
        numUnity: 2,
        description: "Conditionals (if/else) and loops (for/while).",
        resources: [],
      },
    ],
  },
  {
    id: "crs-202",
    code: "MATH-202",
    name: "Linear Algebra",
    description: "Advanced linear algebra concepts and applications",
    urlImage: "https://placehold.co/800x300/4F46E5/FFFFFF?text=Linear+Algebra",
    grade: "Advanced",
    group: "Section B",
    teacherId: "user-001",
    active: true,
    enrollments: Array.from({ length: 18 }, (_, i) => ({
      id: `enr-math-${i}`,
      courseId: "crs-202",
      studentId: `student-math-${i}`,
      enrollmentDate: "2024-01-01",
      status: "ACTIVE",
      grade: null,
    })),
    units: [
      {
        id: "unit-2-1",
        courseId: "crs-202",
        name: "Chapter 1: Vector Spaces",
        urlImage: "https://picsum.photos/seed/unit-2-1/300/200",
        numUnity: 1,
        description:
          "Introduction to vector spaces and linear transformations.",
        resources: [],
      },
    ],
  },
];

const MOCK_COURSES: Course[] = [
  {
    id: "crs-101",
    code: "CS101",
    name: "Introduction to Computer Science",
    description:
      "A foundational course covering basic programming concepts and algorithms.",
    urlImage: "https://picsum.photos/seed/cs101/400/300",
    grade: "Beginner",
    group: "Engineering",
    teacherId: "user-001",
    active: true,
    enrollments: [],
    units: [],
  },
  {
    id: "crs-202",
    code: "MTH202",
    name: "Advanced Calculus",
    description:
      "Deeper study of differential equations and multivariate calculus.",
    urlImage: "https://picsum.photos/seed/mth202/400/300",
    grade: "Advanced",
    group: "Science",
    teacherId: "tchr-1",
    active: true,
    enrollments: [],
    units: [],
  },
  {
    id: "crs-303",
    code: "LIT303",
    name: "Classical Literature Survey",
    description: "Examining major works from Greek and Roman antiquity.",
    urlImage: "https://picsum.photos/seed/lit303/400/300",
    grade: "Intermediate",
    group: "Humanities",
    teacherId: "user-001",
    active: false,
    enrollments: [],
    units: [],
  },
];

// Utility to simulate network delay for mock data
const simulateDelay = async (ms: number = 500): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

// --- API CLIENT CONFIGURATION (ONLY USED WHEN MOCKING IS DISABLED) ---

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Axios Request Interceptor
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

/**
 * Error handling wrapper for API calls
 */
const handleApiError = async (error: unknown): Promise<never> => {
  if (axios.isAxiosError(error)) {
    const errorMessage = error.response?.data?.message || error.message;
  //  redirect("/courses");
    throw new Error(errorMessage);
  }
  throw error;
};

// ============================================
// MAPPERS - BACKEND TO FRONTEND
// ============================================

/**
 * Maps backend CourseDTO to frontend Course entity
 */
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
    enrollments: [], // Will be populated separately
    units: [] // Will be populated separately
  };
}

/**
 * Maps backend EnrollmentDTO to frontend Enrollment entity
 */
async function mapEnrollmentFromBackend(dto: EnrollmentDTO): Promise<Enrollment> {
  return {
    id: dto.id,
    courseId: dto.courseId,
    studentId: dto.studentId,
    enrollmentDate: dto.enrollmentDate,
    // status: dto.status,
    
    // grade: dto.finalGrade ? {
    //   value: parseFloat(dto.finalGrade.value),
    //   maxScore: parseFloat(dto.finalGrade.maxScore)
    // } : null
  };
}

/**
 * Maps backend CourseUnitDTO to frontend CourseUnit entity
 */
async function mapCourseUnitFromBackend(dto: CourseUnitDTO): Promise<CourseUnit> {
  return {
    id: dto.id,
    courseId: dto.courseId,
    name: dto.name,
    urlImage: dto.urlImage,
    numUnity: dto.numUnity,
    description: dto.description,
    resources: [] // Will be populated separately
  };
}

// ============================================
// MAPPERS - FRONTEND TO BACKEND
// ============================================

/**
 * Maps frontend course data to backend CreateCourseCommand
 */
async function mapCreateCourseToBackendCommand(data: Omit<Course, "id" | "enrollments" | "units">): Promise<CreateCourseCommand> {
  return {
    code: data.code,
    name: data.name,
    description: data.description,
    grade: data.grade,
    group: data.group,
    teacherId: data.teacherId // This should come from auth context
  };
}

/**
 * Maps frontend course data to backend CreateCourseWithImageCommand
 */
async function mapCreateCourseWithImageToBackendCommand(data: Omit<Course, "id"  | "enrollments" | "units">): Promise<CreateCourseWithImageCommand> {
  return {
    code: data.code,
    name: data.name,
    description: data.description,
    grade: data.grade,
    group: data.group,
    teacherId: data.teacherId, // This should come from auth context
    imageUrl: data.urlImage || ""
  };
}

/**
 * Maps frontend course update data to backend UpdateCourseCommand
 */
async function mapUpdateCourseToBackendCommand(courseId: string, data: Partial<Omit<Course, "id" | "teacherId" | "enrollments" | "units">>): Promise<UpdateCourseCommand> {
  return {
    courseId,
    name: data.name || "",
    description: data.description || "",
    grade: data.grade || "",
    group: data.group || ""
  };
}

async function mapUpdateCourseToBackendCommandImage(courseId: string, data: Partial<Omit<Course, "id" | "teacherId" | "enrollments" | "units">>): Promise<UpdateCourseCommand> {
  return {
    courseId,
    name: data.name || "",
    description: data.description || "",
    grade: data.grade || "",
    group: data.group || "",
    imageUrl: data.urlImage || ""
  };
}

/**
 * Maps frontend enrollment data to backend EnrollStudentRequest
 */
async function mapEnrollStudentToBackendCommand(studentId: string): Promise<EnrollStudentRequest> {
  return {
    studentId
  };
}

/**
 * Maps frontend unit data to backend AddUnitRequest
 */
async function mapAddUnitToBackendCommand(data: { name: string; order: number; description: string }): Promise<AddUnitRequest> {
  return {
    name: data.name,
    order: data.order,
    description: data.description
  };
}

// ============================================
// API FUNCTIONS WITH MOCKING LOGIC
// ============================================

/**
 * Fetch all courses for current user
 */
export async function fetchAllCourses(): Promise<Course[]> {
 

  try {
    const response = await apiClient.get<CourseDTO[]>("/api/courses");
    const backendCourses = await Promise.all(response.data.map(dto => mapCourseFromBackend(dto)));
    return backendCourses;
  } catch (error) {
    return await handleApiError(error);
  }
}

/**
 * Fetch courses by teacher ID
 */

// CURRENTLY WORKS

export async function fetchCoursesByTeacher(
  teacherId: string
): Promise<Course[]> {
 

  try {
    const response = await apiClient.get<CourseDTO[]>(`/api/courses/teacher/${teacherId}`);

    const backendCourses = await Promise.all(response.data.map(dto => mapCourseFromBackend(dto)));
    return backendCourses;
  } catch (error) {
    return await handleApiError(error);
  }
}

/**
 * Fetch courses by student ID
 */
export async function fetchCoursesByStudent(
  studentId: string
): Promise<Course[]> {
  
  try {
    const response = await apiClient.get<CourseDTO[]>(`/api/courses/student/${studentId}`);
    const backendCourses = await Promise.all(response.data.map(dto => mapCourseFromBackend(dto)));
    return backendCourses;
  } catch (error) {
    return await handleApiError(error);
  }
}

/**
 * Fetch course by ID
 */
export async function fetchCourseById(courseId: string): Promise<Course> {
  

  try {
    const response = await apiClient.get<CourseDTO>(`/api/courses/${courseId}`);
    const course = await mapCourseFromBackend(response.data);
    return course;
  } catch (error) {
    return await handleApiError(error);
  }
}

/**
 * Fetch course by ID with all units
 */


const MOCK_COURSE_UNITS_DTO: CourseUnitDTO[] = [
  {
    id: "unit-1-1",
    courseId: "crs-101",
    name: "Module 1: Basic JavaScript Syntax",
    urlImage: "https://picsum.photos/seed/unit-1-1/300/200",
    numUnity: 1,
    description: "Covers variables, data types, and basic operators in JS.",
  },
  {
    id: "unit-1-2",
    courseId: "crs-101",
    name: "Module 2: Control Flow",
    urlImage: "https://picsum.photos/seed/unit-1-2/300/200",
    numUnity: 2,
    description: "Conditionals (if/else) and loops (for/while).",
  },
  {
    id: "unit-1-3",
    courseId: "crs-101",
    name: "Module 3: Functions and Scope",
    urlImage: "https://picsum.photos/seed/unit-1-3/300/200",
    numUnity: 3,
    description: "Understanding functions, parameters, and variable scope.",
  },
  {
    id: "unit-2-1",
    courseId: "crs-202",
    name: "Chapter 1: Vector Spaces",
    urlImage: "https://picsum.photos/seed/unit-2-1/300/200",
    numUnity: 1,
    description: "Introduction to vector spaces and linear transformations.",
  },
  {
    id: "unit-2-2",
    courseId: "crs-202",
    name: "Chapter 2: Matrices and Determinants",
    urlImage: "https://picsum.photos/seed/unit-2-2/300/200",
    numUnity: 2,
    description: "Matrix operations and determinant calculations.",
  },
  {
    id: "unit-2-3",
    courseId: "crs-202",
    name: "Chapter 3: Eigenvalues and Eigenvectors",
    urlImage: "https://picsum.photos/seed/unit-2-3/300/200",
    numUnity: 3,
    description: "Understanding eigenvalues and their applications.",
  },
  {
    id: "unit-3-1",
    courseId: "crs-303",
    name: "Unit 1: Greek Literature",
    urlImage: "https://picsum.photos/seed/unit-3-1/300/200",
    numUnity: 1,
    description: "Exploring Homer's Iliad and Odyssey.",
  },
  {
    id: "unit-3-2",
    courseId: "crs-303",
    name: "Unit 2: Roman Literature",
    urlImage: "https://picsum.photos/seed/unit-3-2/300/200",
    numUnity: 2,
    description: "Study of Virgil's Aeneid and Ovid's Metamorphoses.",
  },
];



// THIS CURRENTLY WORKS
export async function fetchCourseByIdAllUnits(
  courseId: CourseId
): Promise<CourseUnitDTO[]> { // Now returns array of CourseUnitDTO
  

  try {
    if (!courseId) throw new Error("Course ID is required");
    
    // Fetch course units from backend
    const unitsResponse = await apiClient.get<CourseUnitDTO[]>(`/api/courses/${courseId}/units`);
    console.log(`Fetched ${unitsResponse.data.length} units for course ${courseId} from backend.`);
    return unitsResponse.data; // Directly return the DTO array
    
  } catch (error) {
    return await handleApiError(error);
  }
}

/**
 * Create a new course
 */


// CURRENTLY WORKS

export async function createCourse(
  courseData: Course
): Promise<Course> {
  

  try {
    const backendCommand = await mapCreateCourseToBackendCommand(courseData);
    const courseResponse = await apiClient.post<CourseDTO>("/api/courses", backendCommand);
    
    // Fetch the created course to get full details
   
    const course = await mapCourseFromBackend(courseResponse.data);
    return course;
  } catch (error) {
    return await handleApiError(error);
  }
}

export async function createCourseWithImage(
  courseData: Course
): Promise<Course> {
 

  try {
    // Create a mapping function for the new command

    console.log("COURSE DATA PROVIDED:", courseData);
    const backendCommand = await mapCreateCourseWithImageToBackendCommand(courseData);
    const courseResponse = await apiClient.post<CourseDTO>("/api/courses/with-image", backendCommand);
    
    const course = await mapCourseFromBackend(courseResponse.data);
    return course;
  } catch (error) {
    return await handleApiError(error);
  }
}


/**
 * Update an existing course
 */

// CURRENTLY WORKS

export async function updateCourse(
  courseId: CourseId,
  courseData: Partial<Omit<Course, "id" | "teacherId">>
): Promise<Course> {
  if (isMockEnabled) {
    await simulateDelay(800);

    const index = MOCK_COURSES.findIndex((c) => c.id === courseId);
    if (index !== -1) {
      const originalCourse = MOCK_COURSES[index];
      MOCK_COURSES[index] = { ...MOCK_COURSES[index], ...courseData } as Course;
      console.log(`MOCK: Updated course ${courseId} in MOCK_COURSES.`);
      console.log("ORIGINAL COURSE DATA:", originalCourse);
      console.log("UPDATE DATA PROVIDED:", courseData);
      console.log("UPDATED COURSE DATA:", MOCK_COURSES[index]);
    }

    const allUnitsIndex = MOCK_COURSES_ALL_UNITS.findIndex(
      (c) => c.id === courseId
    );
    if (allUnitsIndex !== -1) {
      MOCK_COURSES_ALL_UNITS[allUnitsIndex] = {
        ...MOCK_COURSES_ALL_UNITS[allUnitsIndex],
        ...courseData,
      } as Course;
      console.log(
        `MOCK: Also updated course ${courseId} in MOCK_COURSES_ALL_UNITS.`
      );
    }

    if (index === -1 && allUnitsIndex === -1) {
      throw new Error(`MOCK: Course ${courseId} not found for update.`);
    }

    return index !== -1
      ? MOCK_COURSES[index]
      : MOCK_COURSES_ALL_UNITS[allUnitsIndex];
  }

  try {
    if (!courseId) throw new Error("Course ID is required");
    const backendCommand = await mapUpdateCourseToBackendCommandImage(courseId, courseData);
    
    const response = await apiClient.put<CourseDTO>(`/api/courses/${courseId}`, backendCommand);
    
    // Fetch the updated course
    const course = await mapCourseFromBackend(response.data);
    return course;
  } catch (error) {
    return await handleApiError(error);
  }
}

/**
 * Delete a course
 */

// CURRENTLY WORKS

export async function deleteCourse(courseId: CourseId): Promise<void> {
 

  try {
    if (!courseId) throw new Error("Course ID is required");
    await apiClient.delete(`/api/courses/${courseId}`);
  } catch (error) {
    return await handleApiError(error);
  }
}

/**
 * Search courses by name or code
 */
export async function searchCourses(searchTerm: string): Promise<Course[]> {
 

  try {
    // Note: Your backend might not have a search endpoint
    // You might need to fetch all and filter client-side
    const allCourses = await fetchAllCourses();
    const searchLower = searchTerm.toLowerCase();
    return allCourses.filter(
      (course) =>
        course.name.toLowerCase().includes(searchLower) ||
        course.code.toLowerCase().includes(searchLower) ||
        course.description.toLowerCase().includes(searchLower)
    );
  } catch (error) {
    return await handleApiError(error);
  }
}

/**
 * Enroll student in course
 */
export async function enrollStudent(courseId: CourseId, studentId: string): Promise<void> {
 
  try {
    const backendCommand = await mapEnrollStudentToBackendCommand(studentId);
    await apiClient.post(`/api/courses/${courseId}/enrollments`, backendCommand);
  } catch (error) {
    return await handleApiError(error);
  }
}

/**
 * Unenroll student from course
 */
export async function unenrollStudent(courseId: CourseId, studentId: string): Promise<void> {
  
  try {
    await apiClient.delete(`/api/courses/${courseId}/enrollments/${studentId}`);
  } catch (error) {
    return await handleApiError(error);
  }
}



// CURRENTLY WORKS

export async function uploadCourseImageFile(courseId: string, file: File): Promise<string> {

  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post<SuccessResponseDTO>(
      `/api/courses/${courseId}/image/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    // Extract the URL from the response
    // Based on your backend: data.data.url
    const imageUrl = response.data.data?.url || response.data.data;
    
    if (!imageUrl) {
      throw new Error("No image URL returned from upload");
    }

    return imageUrl;
  } catch (error) {
    return await handleApiError(error);
  }
}