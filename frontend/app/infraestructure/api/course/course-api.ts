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

// --- MOCKING CONFIGURATION AND DATA ---

/**
 * Flag to enable/disable mocking.
 * Set to true to use mock data, false to use the real backend.
 */
const isMockEnabled = true;

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
    // Must use `cookies()` directly in a 'use server' file
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
    // In a Server Action/File, redirect works by throwing an error that Next.js catches
    redirect("/courses");
    throw new Error(errorMessage); // Throw to stop execution after redirect
  }
  throw error;
};

// --- API FUNCTIONS WITH MOCKING LOGIC ---

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
    const response = await apiClient.get("/courses");
    return response.data;
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
    const response = await apiClient.get(`/teachers/${teacherId}/courses`);
    return response.data;
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
      // For a smoother front-end experience, return the first one or throw error
      const fallbackCourse = MOCK_COURSES[0];
      console.log(`MOCK: Falling back to course ${fallbackCourse.id}`);
      return fallbackCourse;
    }
    console.log(`MOCK: Returning course ${courseId}.`);
    console.log("COURSE DATA:", course);
    return course;
  }

  try {
    const response = await apiClient.get(`/courses/${courseId}`);
    return response.data;
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
      // Fallback to regular courses data
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
    const response = await apiClient.get(`/courses/${courseId}`);
    return response.data;
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
      teacherId: "mock-teacher", // Assign a mock ID
      enrollments: [],
      units: [],
    };
    MOCK_COURSES.push(newCourse);
    // Also add to ALL_UNITS for consistency
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
    const response = await apiClient.post("/courses", courseData);
    return response.data;
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

    // Update in MOCK_COURSES
    const index = MOCK_COURSES.findIndex((c) => c.id === courseId);
    if (index !== -1) {
      const originalCourse = MOCK_COURSES[index];
      MOCK_COURSES[index] = { ...MOCK_COURSES[index], ...courseData } as Course;
      console.log(`MOCK: Updated course ${courseId} in MOCK_COURSES.`);
      console.log("ORIGINAL COURSE DATA:", originalCourse);
      console.log("UPDATE DATA PROVIDED:", courseData);
      console.log("UPDATED COURSE DATA:", MOCK_COURSES[index]);
    }

    // Also update in MOCK_COURSES_ALL_UNITS for consistency
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
    const response = await apiClient.put(`/courses/${courseId}`, courseData);
    return response.data;
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

    // Delete from MOCK_COURSES
    const courseIndex = MOCK_COURSES.findIndex((c) => c.id === courseId);
    if (courseIndex > -1) {
      const deletedCourse = MOCK_COURSES[courseIndex];
      MOCK_COURSES.splice(courseIndex, 1);
      deletedFromCourses = true;
      console.log(`MOCK: Deleted course ${courseId} from MOCK_COURSES.`);
      console.log("DELETED COURSE DATA:", deletedCourse);
    }

    // Delete from MOCK_COURSES_ALL_UNITS
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
    await apiClient.delete(`/courses/${courseId}`);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Toggle course active status
 */
export async function toggleCourseActive(courseId: CourseId): Promise<Course> {
  if (isMockEnabled) {
    await simulateDelay(800);

    let toggledCourse: Course | null = null;

    // Toggle in MOCK_COURSES
    const index = MOCK_COURSES.findIndex((c) => c.id === courseId);
    if (index !== -1) {
      const originalActive = MOCK_COURSES[index].active;
      MOCK_COURSES[index].active = !MOCK_COURSES[index].active;
      toggledCourse = MOCK_COURSES[index];
      console.log(
        `MOCK: Toggled active status for course ${courseId} in MOCK_COURSES from ${originalActive} to ${MOCK_COURSES[index].active}.`
      );
    }

    // Also toggle in MOCK_COURSES_ALL_UNITS for consistency
    const allUnitsIndex = MOCK_COURSES_ALL_UNITS.findIndex(
      (c) => c.id === courseId
    );
    if (allUnitsIndex !== -1) {
      const originalAllUnitsActive =
        MOCK_COURSES_ALL_UNITS[allUnitsIndex].active;
      MOCK_COURSES_ALL_UNITS[allUnitsIndex].active =
        !MOCK_COURSES_ALL_UNITS[allUnitsIndex].active;
      console.log(
        `MOCK: Also toggled active status for course ${courseId} in MOCK_COURSES_ALL_UNITS from ${originalAllUnitsActive} to ${MOCK_COURSES_ALL_UNITS[allUnitsIndex].active}.`
      );
    }

    if (!toggledCourse) {
      throw new Error(`MOCK: Course ${courseId} not found for toggle.`);
    }

    console.log("TOGGLED COURSE DATA:", toggledCourse);
    return toggledCourse;
  }

  try {
    if (!courseId) throw new Error("Course ID is required");
    const response = await apiClient.patch(
      `/courses/${courseId}/toggle-active`
    );
    return response.data;
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
    const response = await apiClient.get("/courses/search", {
      params: { q: searchTerm },
    });
    return response.data;
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
      averageGrade: 85.5, // Mock average
      unitCount: course.units?.length || 0,
    };

    console.log(`MOCK: Returning stats for course ${courseId}`);
    console.log("COURSE STATS DATA:", stats);

    return stats;
  }

  try {
    const response = await apiClient.get(`/courses/${courseId}/stats`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}
