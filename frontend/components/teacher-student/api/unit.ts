// File: src/app/features/courses/api/unit-api.ts
"use server";

import { CourseUnit, UnitResource } from "@/app/domain/entities/CourseEntities";
import { CourseId, UnitId } from "@/app/domain/valueObjects/CourseValues";
import axios from "axios";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// ============================================
// CONFIGURATION
// ============================================

const isMockEnabled = true;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// ============================================
// BACKEND DTO TYPES
// ============================================

interface CourseUnitDTO {
  id: string;
  courseId: string;
  name: string;
  urlImage: string;
  numUnity: number;
  description: string;
}

interface AddUnitRequest {
  name: string;
  order: number;
  description: string;
}

interface AddUnitWithImageRequest {
  name: string;
  order: number;
  description: string;
  imageUrl: string;
}

interface UpdateUnitRequest {
  unitId: string;
  name: string;
  description: string;
  urlImage: string;
}

interface SuccessResponseDTO {
  success: boolean;
  message: string;
  data: any;
}

// ============================================
// MOCK DATA
// ============================================

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

// ============================================
// UTILITIES
// ============================================

const simulateDelay = (ms: number = 500) =>
  new Promise((resolve) => setTimeout(resolve, ms));

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

const handleApiError = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    const errorMessage = error.response?.data?.message || error.message;
    redirect("/courses");
    throw new Error(errorMessage);
  }
  throw error;
};

// ============================================
// MAPPERS
// ============================================

function mapCourseUnitFromBackend(dto: CourseUnitDTO): CourseUnit {
  return {
    id: dto.id,
    courseId: dto.courseId,
    name: dto.name,
    urlImage: dto.urlImage,
    numUnity: dto.numUnity,
    description: dto.description,
    resources: [] // Will be populated separately if needed
  };
}

function mapAddUnitToBackendCommand(data: Omit<CourseUnit, "id" | "courseId" | "resources">): AddUnitRequest {
  return {
    name: data.name,
    order: data.numUnity,
    description: data.description
  };
}

function mapAddUnitWithImageToBackendCommand(data: Omit<CourseUnit, "id" | "courseId" | "resources">): AddUnitWithImageRequest {
  return {
    name: data.name,
    order: data.numUnity,
    description: data.description,
    imageUrl: data.urlImage || ""
  };
}

function mapUpdateUnitToBackendCommand(unitId: string, data: Partial<Omit<CourseUnit, "id" | "courseId" | "resources">>): UpdateUnitRequest {
  return {
    unitId,
    name: data.name || "",
    description: data.description || "",
    urlImage: data.urlImage || ""
  };
}

// ============================================
// API FUNCTIONS (ONLY THE ONES YOU NEED)
// ============================================

export async function fetchUnitsByCourse(courseId: CourseId): Promise<CourseUnit[]> {
  if (isMockEnabled) {
    await simulateDelay(300);
    
    const units = MOCK_UNITS
      .filter(unit => unit.courseId === courseId)
      .sort((a, b) => a.numUnity - b.numUnity);
    
    console.log(`MOCK: Returning ${units.length} units for course ${courseId}`);
    return units;
  }

  try {
    const response = await apiClient.get<CourseUnitDTO[]>(`/api/courses/${courseId}/units`);
    return response.data.map(mapCourseUnitFromBackend);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function fetchUnitById(unitId: UnitId): Promise<CourseUnit> {
  if (isMockEnabled) {
    await simulateDelay(300);
    
    const unit = MOCK_UNITS.find(unit => unit.id === unitId);
    if (!unit) {
      throw new Error(`Unit not found: ${unitId}`);
    }
    
    console.log(`MOCK: Returning unit ${unitId}`);
    return unit;
  }

  try {
    // Note: Your backend might not have a direct unit endpoint
    // You might need to fetch from course units and filter
    const allUnits = await fetchUnitsByCourse("all"); // This would need adjustment
    const unit = allUnits.find(u => u.id === unitId);
    
    if (!unit) {
      throw new Error(`Unit not found: ${unitId}`);
    }
    
    return unit;
  } catch (error) {
    return handleApiError(error);
  }
}

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
      resources: [],
    };
    
    MOCK_UNITS.push(newUnit);
    
    console.log(`MOCK: Created new unit ${newUnit.id} in course ${courseId}`);
    return newUnit;
  }

  try {
    const backendCommand: AddUnitRequest = mapAddUnitToBackendCommand(unitData);
    const response = await apiClient.post<SuccessResponseDTO>(`/api/courses/${courseId}/units`, backendCommand);
    
    // Fetch the created unit to get full details
    const unitId = response.data.data;
    
    // In a real implementation, you would fetch the created unit
    // For now, return the mock approach
    const newUnit: CourseUnit = {
      ...unitData,
      id: unitId,
      courseId: courseId,
      resources: [],
    };
    
    return newUnit;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function createUnitWithImage(
  courseId: CourseId,
  unitData: Omit<CourseUnit, "id" | "courseId" | "resources">
): Promise<CourseUnit> {
  if (isMockEnabled) {
    await simulateDelay(800);
    
    const newUnit: CourseUnit = {
      ...unitData,
      id: `unit-${Date.now()}`,
      courseId: courseId,
      resources: [],
    };
    
    MOCK_UNITS.push(newUnit);
    
    console.log(`MOCK: Created new unit with image ${newUnit.id} in course ${courseId}`);
    return newUnit;
  }

  try {
    const backendCommand: AddUnitWithImageRequest = mapAddUnitWithImageToBackendCommand(unitData);
    const response = await apiClient.post<SuccessResponseDTO>(`/api/courses/${courseId}/units/with-image`, backendCommand);
    
    // Fetch the created unit to get full details
    const unitId = response.data.data;
    
    // In a real implementation, you would fetch the created unit
    const newUnit: CourseUnit = {
      ...unitData,
      id: unitId,
      courseId: courseId,
      resources: [],
    };
    
    return newUnit;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function updateUnit(
  unitId: UnitId,
  unitData: Partial<Omit<CourseUnit, "id" | "courseId" | "resources">>
): Promise<CourseUnit> {
  if (isMockEnabled) {
    await simulateDelay(800);
    
    const unitIndex = MOCK_UNITS.findIndex(unit => unit.id === unitId);
    if (unitIndex === -1) {
      throw new Error(`Unit not found: ${unitId}`);
    }
    
    MOCK_UNITS[unitIndex] = {
      ...MOCK_UNITS[unitIndex],
      ...unitData
    } as CourseUnit;
    
    console.log(`MOCK: Updated unit ${unitId}`);
    return MOCK_UNITS[unitIndex];
  }

  try {
    const backendCommand: UpdateUnitRequest = mapUpdateUnitToBackendCommand(unitId, unitData);
    await apiClient.put(`/api/courses/units/${unitId}`, backendCommand);
    
    // Fetch the updated unit
    const updatedUnit = await fetchUnitById(unitId);
    return updatedUnit;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function deleteUnit(unitId: UnitId): Promise<void> {
  if (isMockEnabled) {
    await simulateDelay(800);
    
    const initialLength = MOCK_UNITS.length;
    MOCK_UNITS = MOCK_UNITS.filter(unit => unit.id !== unitId);
    
    if (MOCK_UNITS.length === initialLength) {
      throw new Error(`Unit not found: ${unitId}`);
    }
    
    console.log(`MOCK: Deleted unit ${unitId}`);
    return;
  }

  try {
    await apiClient.delete(`/api/courses/units/${unitId}`);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function updateUnitImage(
  unitId: UnitId,
  imageUrl: string
): Promise<void> {
  if (isMockEnabled) {
    await simulateDelay(800);
    
    const unitIndex = MOCK_UNITS.findIndex(unit => unit.id === unitId);
    if (unitIndex === -1) {
      throw new Error(`Unit not found: ${unitId}`);
    }
    
    MOCK_UNITS[unitIndex].urlImage = imageUrl;
    
    console.log(`MOCK: Updated image for unit ${unitId}`);
    return;
  }

  try {
    await apiClient.put(`/api/courses/units/${unitId}/image`, { imageUrl });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function reorderUnits(
  courseId: CourseId,
  unitOrder: { unitId: UnitId; order: number }[]
): Promise<void> {
  if (isMockEnabled) {
    await simulateDelay(500);

    const orderMap = new Map(unitOrder.map(item => [item.unitId, item.order]));

    MOCK_UNITS = MOCK_UNITS.map(unit => {
      if (unit.courseId === courseId && orderMap.has(unit.id)) {
        return { ...unit, numUnity: orderMap.get(unit.id)! };
      }
      return unit;
    });

    console.log(`MOCK: Reordered ${unitOrder.length} units in course ${courseId}`);
    return;
  }

  try {
    // Note: Your backend might not have a reorder endpoint
    // You would need to update each unit individually
    await Promise.all(
      unitOrder.map(async (item) => {
        await updateUnit(item.unitId, { numUnity: item.order });
      })
    );
  } catch (error) {
    return handleApiError(error);
  }
}