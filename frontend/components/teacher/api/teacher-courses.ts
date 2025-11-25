// File: src/app/features/courses/api/course-api.ts
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
"use server";

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
const isMockEnabled = process.env.NEXT_PUBLIC_MOCK_ENABLED === 'true';

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
const simulateDelay = (ms: number = 500) =>
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
const handleApiError = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    const errorMessage = error.response?.data?.message || error.message;
    redirect("/courses");
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
function mapCourseFromBackend(dto: CourseDTO): Course {
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
function mapEnrollmentFromBackend(dto: EnrollmentDTO): Enrollment {
  return {
    id: dto.id,
    courseId: dto.courseId,
    studentId: dto.studentId,
    enrollmentDate: dto.enrollmentDate,
    status: dto.status,
    grade: dto.finalGrade ? {
      value: parseFloat(dto.finalGrade.value),
      maxScore: parseFloat(dto.finalGrade.maxScore)
    } : null
  };
}

/**
 * Maps backend CourseUnitDTO to frontend CourseUnit entity
 */
function mapCourseUnitFromBackend(dto: CourseUnitDTO): CourseUnit {
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
function mapCreateCourseToBackendCommand(data: Omit<Course, "id" | "enrollments" | "units">): CreateCourseCommand {
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
function mapCreateCourseWithImageToBackendCommand(data: Omit<Course, "id" | "teacherId" | "enrollments" | "units">): CreateCourseWithImageCommand {
  return {
    code: data.code,
    name: data.name,
    description: data.description,
    grade: data.grade,
    group: data.group,
    teacherId: "current-user-id", // This should come from auth context
    imageUrl: data.urlImage
  };
}

/**
 * Maps frontend course update data to backend UpdateCourseCommand
 */
function mapUpdateCourseToBackendCommand(courseId: string, data: Partial<Omit<Course, "id" | "teacherId" | "enrollments" | "units">>): UpdateCourseCommand {
  return {
    courseId,
    name: data.name || "",
    description: data.description || "",
    grade: data.grade || "",
    group: data.group || ""
  };
}

/**
 * Maps frontend enrollment data to backend EnrollStudentRequest
 */
function mapEnrollStudentToBackendCommand(studentId: string): EnrollStudentRequest {
  return {
    studentId
  };
}

/**
 * Maps frontend unit data to backend AddUnitRequest
 */
function mapAddUnitToBackendCommand(data: { name: string; order: number; description: string }): AddUnitRequest {
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
  if (isMockEnabled) {
    await simulateDelay();
    console.log("MOCK: Returning all courses.");
    console.log("MOCK COURSES DATA:", MOCK_COURSES);
    console.log(
      "COURSE IDs:",
      MOCK_COURSES.map((c) => c.id)
    );
    return MOCK_COURSES;
  }

  try {
    const response = await apiClient.get<CourseDTO[]>("/api/courses");
    const backendCourses = response.data;
    return backendCourses.map(mapCourseFromBackend);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Fetch courses by teacher ID
 */
export async function fetchCoursesByTeacher(
  teacherId: string
): Promise<Course[]> {
  if (isMockEnabled) {
    await simulateDelay();
    const teacherCourses = MOCK_COURSES.filter(
      (course) => course.teacherId === teacherId
    );
    console.log(`MOCK: Returning courses for teacher ${teacherId}`);
    console.log("TEACHER COURSES DATA:", teacherCourses);
    console.log(
      "TEACHER COURSE IDs:",
      teacherCourses.map((c) => c.id)
    );
    return teacherCourses;
  }

  try {
    const response = await apiClient.get<CourseDTO[]>(`/api/courses/teacher/${teacherId}`);
    const backendCourses = response.data;
    return backendCourses.map(mapCourseFromBackend);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Fetch courses by student ID
 */
export async function fetchCoursesByStudent(
  studentId: string
): Promise<Course[]> {
  if (isMockEnabled) {
    await simulateDelay();
    console.log(`MOCK: Returning courses for student ${studentId}`);
    // Return all active courses for mock
    const studentCourses = MOCK_COURSES.filter(course => course.active);
    return studentCourses;
  }

  try {
    const response = await apiClient.get<CourseDTO[]>(`/api/courses/student/${studentId}`);
    const backendCourses = response.data;
    return backendCourses.map(mapCourseFromBackend);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Fetch course by ID
 */
export async function fetchCourseById(courseId: string): Promise<Course> {
  if (isMockEnabled) {
    await simulateDelay();
    const course = MOCK_COURSES.find((c) => c.id === courseId);
    if (!course) {
      console.error(`MOCK: Course with ID ${courseId} not found.`);
      const fallbackCourse = MOCK_COURSES[0];
      console.log(`MOCK: Falling back to course ${fallbackCourse.id}`);
      return fallbackCourse;
    }
    console.log(`MOCK: Returning course ${courseId}.`);
    console.log("COURSE DATA:", course);
    return course;
  }

  try {
    const response = await apiClient.get<CourseDTO>(`/api/courses/${courseId}`);
    return mapCourseFromBackend(response.data);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Fetch course by ID with all units
 */
export async function fetchCourseByIdAllUnits(
  courseId: CourseId
): Promise<Course> {
  if (isMockEnabled) {
    await simulateDelay();
    const course = MOCK_COURSES_ALL_UNITS.find((c) => c.id === courseId);
    if (!course) {
      console.error(
        `MOCK: Course with ID ${courseId} not found in ALL_UNITS data.`
      );
      const fallbackCourse = MOCK_COURSES.find((c) => c.id === courseId);
      if (fallbackCourse) {
        console.log(
          `MOCK: Falling back to regular course data for ${courseId}`
        );
        return fallbackCourse;
      }
      throw new Error(`MOCK: Course ${courseId} not found in any dataset.`);
    }
    console.log(`MOCK: Returning course ${courseId} with all units.`);
    console.log("COURSE WITH UNITS DATA:", course);
    console.log("UNIT COUNT:", course.units.length);
    console.log(
      "UNIT IDs:",
      course.units.map((u) => u.id)
    );
    return course;
  }

  try {
    if (!courseId) throw new Error("Course ID is required");
    
    // Fetch course details
    const courseResponse = await apiClient.get<CourseDTO>(`/api/courses/${courseId}`);
    const course = mapCourseFromBackend(courseResponse.data);
    
    // Fetch course units
    const unitsResponse = await apiClient.get<CourseUnitDTO[]>(`/api/courses/${courseId}/units`);
    course.units = unitsResponse.data.map(mapCourseUnitFromBackend);
    
    // Fetch course enrollments
    const enrollmentsResponse = await apiClient.get<EnrollmentDTO[]>(`/api/courses/${courseId}/enrollments`);
    course.enrollments = enrollmentsResponse.data.map(mapEnrollmentFromBackend);
    
    return course;
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Create a new course
 */
export async function createCourse(
  courseData: Omit<Course, "id" | "teacherId">
): Promise<Course> {
  if (isMockEnabled) {
    await simulateDelay(800);
    const newCourse: Course = {
      ...courseData,
      id: `crs-${Date.now()}`,
      teacherId: "mock-teacher",
      enrollments: [],
      units: [],
    };
    MOCK_COURSES.push(newCourse);
    MOCK_COURSES_ALL_UNITS.push({
      ...newCourse,
      enrollments: Array.from({ length: 0 }, (_, i) => ({
        id: `enr-new-${i}`,
        courseId: newCourse.id,
        studentId: `student-new-${i}`,
        enrollmentDate: "2024-01-01",
        status: "ACTIVE",
        grade: null,
      })),
      units: [],
    });

    console.log("MOCK: Created new course.");
    console.log("COURSE DATA PROVIDED:", courseData);
    console.log("CREATED COURSE DATA:", newCourse);
    console.log("NEW COURSE ID:", newCourse.id);
    return newCourse;
  }

  try {
    const backendCommand: CreateCourseCommand = mapCreateCourseToBackendCommand(courseData);
    const response = await apiClient.post<SuccessResponseDTO>("/api/courses", backendCommand);
    
    // Fetch the created course to get full details
    const courseId = response.data.data;
    const courseResponse = await apiClient.get<CourseDTO>(`/api/courses/${courseId}`);
    return mapCourseFromBackend(courseResponse.data);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Update an existing course
 */
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
    const backendCommand: UpdateCourseCommand = mapUpdateCourseToBackendCommand(courseId, courseData);
    
    await apiClient.put(`/api/courses/${courseId}`, backendCommand);
    
    // Fetch the updated course
    const response = await apiClient.get<CourseDTO>(`/api/courses/${courseId}`);
    return mapCourseFromBackend(response.data);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Delete a course
 */
export async function deleteCourse(courseId: CourseId): Promise<void> {
  if (isMockEnabled) {
    await simulateDelay(800);

    let deletedFromCourses = false;
    let deletedFromAllUnits = false;

    const courseIndex = MOCK_COURSES.findIndex((c) => c.id === courseId);
    if (courseIndex > -1) {
      const deletedCourse = MOCK_COURSES[courseIndex];
      MOCK_COURSES.splice(courseIndex, 1);
      deletedFromCourses = true;
      console.log(`MOCK: Deleted course ${courseId} from MOCK_COURSES.`);
      console.log("DELETED COURSE DATA:", deletedCourse);
    }

    const allUnitsIndex = MOCK_COURSES_ALL_UNITS.findIndex(
      (c) => c.id === courseId
    );
    if (allUnitsIndex > -1) {
      const deletedAllUnitsCourse = MOCK_COURSES_ALL_UNITS[allUnitsIndex];
      MOCK_COURSES_ALL_UNITS.splice(allUnitsIndex, 1);
      deletedFromAllUnits = true;
      console.log(
        `MOCK: Deleted course ${courseId} from MOCK_COURSES_ALL_UNITS.`
      );
      console.log("DELETED ALL_UNITS COURSE DATA:", deletedAllUnitsCourse);
    }

    if (!deletedFromCourses && !deletedFromAllUnits) {
      throw new Error(`MOCK: Course ${courseId} not found for deletion.`);
    }

    console.log(
      `MOCK: Deletion completed. MOCK_COURSES size: ${MOCK_COURSES.length}, MOCK_COURSES_ALL_UNITS size: ${MOCK_COURSES_ALL_UNITS.length}`
    );
    return;
  }

  try {
    if (!courseId) throw new Error("Course ID is required");
    await apiClient.delete(`/api/courses/${courseId}`);
  } catch (error) {
    return handleApiError(error);
  }
}



/**
 * Search courses by name or code
 */
export async function searchCourses(searchTerm: string): Promise<Course[]> {
  if (isMockEnabled) {
    await simulateDelay(600);

    const searchLower = searchTerm.toLowerCase();
    const filteredCourses = MOCK_COURSES.filter(
      (course) =>
        course.name.toLowerCase().includes(searchLower) ||
        course.code.toLowerCase().includes(searchLower) ||
        course.description.toLowerCase().includes(searchLower)
    );

    console.log(`MOCK: Searching courses with term "${searchTerm}"`);
    console.log("SEARCH RESULTS:", filteredCourses);
    console.log(
      "MATCHED COURSE IDs:",
      filteredCourses.map((c) => c.id)
    );

    return filteredCourses;
  }

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
    return handleApiError(error);
  }
}

/**
 * Get course statistics
 */
export async function getCourseStats(courseId: CourseId): Promise<{
  totalStudents: number;
  activeStudents: number;
  averageGrade: number;
  unitCount: number;
}> {
  if (isMockEnabled) {
    await simulateDelay(400);

    const course =
      MOCK_COURSES_ALL_UNITS.find((c) => c.id === courseId) ||
      MOCK_COURSES.find((c) => c.id === courseId);

    if (!course) {
      console.error(`MOCK: Course ${courseId} not found for stats`);
      throw new Error(`Course not found: ${courseId}`);
    }

    const stats = {
      totalStudents: course.enrollments?.length || 0,
      activeStudents:
        course.enrollments?.filter((e) => e.status === "ACTIVE").length || 0,
      averageGrade: 85.5,
      unitCount: course.units?.length || 0,
    };

    console.log(`MOCK: Returning stats for course ${courseId}`);
    console.log("COURSE STATS DATA:", stats);

    return stats;
  }

  try {
    // Note: Your backend might not have a stats endpoint
    // You might need to calculate from course data
    const course = await fetchCourseByIdAllUnits(courseId);
    return {
      totalStudents: course.enrollments.length,
      activeStudents: course.enrollments.filter(e => e.status === "ACTIVE").length,
      averageGrade: 0, // You might need to calculate this from grades
      unitCount: course.units.length
    };
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Enroll student in course
 */
export async function enrollStudent(courseId: CourseId, studentId: string): Promise<void> {
  if (isMockEnabled) {
    await simulateDelay(600);
    console.log(`MOCK: Enrolling student ${studentId} in course ${courseId}`);
    return;
  }

  try {
    const backendCommand: EnrollStudentRequest = mapEnrollStudentToBackendCommand(studentId);
    await apiClient.post(`/api/courses/${courseId}/enrollments`, backendCommand);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Unenroll student from course
 */
export async function unenrollStudent(courseId: CourseId, studentId: string): Promise<void> {
  if (isMockEnabled) {
    await simulateDelay(600);
    console.log(`MOCK: Unenrolling student ${studentId} from course ${courseId}`);
    return;
  }

  try {
    await apiClient.delete(`/api/courses/${courseId}/enrollments/${studentId}`);
  } catch (error) {
    return handleApiError(error);
  }
}