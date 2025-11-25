// File: src/app/features/courses/api/unit-api.ts
"use server";

import { Course, CourseUnit, UnitResource } from "@/app/domain/entities/CourseEntities";
import { CourseId, UnitId } from "@/app/domain/valueObjects/CourseValues";
import axios from "axios";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// --- MOCKING CONFIGURATION AND DATA ---

/**
 * Flag to enable/disable mocking.
 * Set to true to use mock data, false to use the real backend.
 */
const isMockEnabled = true; // **TOGGLE SWITCH ENABLED**

// Mock data structure: Course units, simulating an in-memory database
let MOCK_UNITS: CourseUnit[] = [
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
  {
    id: "unit-2-1",
    courseId: "crs-202",
    name: "Chapter 1: Vector Spaces",
    urlImage: "https://picsum.photos/seed/unit-2-1/300/200",
    numUnity: 1,
    description: "Introduction to vector spaces and linear transformations.",
    resources: [],
  },
];




// Mock course data
const MOCK_COURSES: Course[] = [
  {
    id: "crs-101",
    code: "JS-101",
    name: "JavaScript Fundamentals",
    description: "Learn the basics of JavaScript programming",
    urlImage: "https://placehold.co/800x300/4F46E5/FFFFFF?text=JavaScript+Fundamentals",
    grade: "Beginner",
    group: "Section A",
    teacherId: "teacher-1",
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
    teacherId: "teacher-1",
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
        description: "Introduction to vector spaces and linear transformations.",
        resources: [],
      },
    ],
  },
];

export async function fetchUnitsByCourse(courseId: CourseId): Promise<CourseUnit[]> {
  if (isMockEnabled) {
    await simulateDelay(300);
    console.log(`MOCK: Fetching units for course ${courseId}.`);
    
    const course = MOCK_COURSES.find(c => c.id === courseId);
    if (!course) {
      throw new Error(`MOCK: Course with ID ${courseId} not found.`);
    }
    
    return course.units.sort((a, b) => a.numUnity - b.numUnity);
  }

  try {
    if (!courseId) throw new Error("Course ID is required");
    const response = await apiClient.get(`/courses/${courseId}/units`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}


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

// --- API FUNCTIONS WITH MOCKING LOGIC ---

/**
 * Fetch units by course
 */


/**
 * Fetch unit by ID
 */
export async function fetchUnitById(unitId: UnitId): Promise<CourseUnit> {
  if (isMockEnabled) {
    await simulateDelay(300);
    const unit = MOCK_UNITS.find((u) => u.id === unitId);
    if (!unit) {
      throw new Error(`MOCK: Unit with ID ${unitId} not found.`);
    }
    console.log(`MOCK: Returning unit ${unitId}.`);
    return unit;
  }

  try {
    if (!unitId) throw new Error("Unit ID is required");
    const response = await apiClient.get(`/units/${unitId}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Create a new unit
 */
export async function createUnit(
  courseId: CourseId,
  unitData: Omit<CourseUnit, "id" | "courseId" | "resources">
): Promise<CourseUnit> {
  if (isMockEnabled) {
    await simulateDelay(800);
    const newUnit: CourseUnit = {
      ...unitData,
      id: `unit-${Date.now()}`,
      courseId: courseId,
      numUnity: MOCK_UNITS.filter((u) => u.courseId === courseId).length + 1, // Assign next order number
      resources: [],
    };
    MOCK_UNITS.push(newUnit);
    console.log(`MOCK: Created new unit ${newUnit.id} in course ${courseId}.`);
    return newUnit;
  }

  try {
    const response = await apiClient.post(
      `/courses/${courseId}/units`,
      unitData
    );
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Update an existing unit
 */
export async function updateUnit(
  unitId: UnitId,
  unitData: Partial<Omit<CourseUnit, "id" | "courseId" | "resources">>
): Promise<CourseUnit> {
  if (isMockEnabled) {
    await simulateDelay(800);
    const index = MOCK_UNITS.findIndex((u) => u.id === unitId);
    if (index !== -1) {
      MOCK_UNITS[index] = { ...MOCK_UNITS[index], ...unitData } as CourseUnit;
      console.log(`MOCK: Updated unit ${unitId}.`);
      return MOCK_UNITS[index];
    }
    throw new Error(`MOCK: Unit ${unitId} not found for update.`);
  }

  try {
    if (!unitId) throw new Error("Unit ID is required");
    const response = await apiClient.put(`/units/${unitId}`, unitData);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Delete a unit
 */
export async function deleteUnit(unitId: UnitId): Promise<void> {
  if (isMockEnabled) {
    await simulateDelay(800);
    const initialLength = MOCK_UNITS.length;
    MOCK_UNITS = MOCK_UNITS.filter((u) => u.id !== unitId);
    if (MOCK_UNITS.length === initialLength) {
      throw new Error(`MOCK: Unit ${unitId} not found for deletion.`);
    }
    console.log(`MOCK: Deleted unit ${unitId}.`);
    return;
  }

  try {
    if (!unitId) throw new Error("Unit ID is required");
    await apiClient.delete(`/units/${unitId}`);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Reorder units
 */
export async function reorderUnits(
  courseId: CourseId,
  unitOrder: { unitId: UnitId; order: number }[]
): Promise<void> {
  if (isMockEnabled) {
    await simulateDelay(500);

    // 1. Create a map of UnitId to its new order number
    const orderMap = new Map(
      unitOrder.map((item) => [item.unitId, item.order])
    );

    // 2. Apply the new order to the mock array
    MOCK_UNITS = MOCK_UNITS.map((unit) => {
      if (unit.courseId === courseId && orderMap.has(unit.id)) {
        return { ...unit, numUnity: orderMap.get(unit.id)! };
      }
      return unit;
    });

    console.log(
      `MOCK: Reordered ${unitOrder.length} units in course ${courseId}.`
    );
    return;
  }

  try {
    await apiClient.put(`/courses/${courseId}/units/reorder`, unitOrder);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Add resource to unit
 */


/**
 * Delete resource from unit
 */
export async function deleteUnitResource(
  unitId: UnitId,
  resourceId: string
): Promise<void> {
  if (isMockEnabled) {
    await simulateDelay(800);
    const unit = MOCK_UNITS.find((u) => u.id === unitId);
    if (unit) {
      const initialLength = unit.resources.length;
      unit.resources = unit.resources.filter((r) => r.id !== resourceId);
      if (unit.resources.length === initialLength) {
        throw new Error(
          `MOCK: Resource ${resourceId} not found in unit ${unitId}.`
        );
      }
      console.log(`MOCK: Deleted resource ${resourceId} from unit ${unitId}.`);
      return;
    }
    throw new Error(`MOCK: Unit ${unitId} not found to delete resource.`);
  }

  try {
    await apiClient.delete(`/units/${unitId}/resources/${resourceId}`);
  } catch (error) {
    return handleApiError(error);
  }
}
