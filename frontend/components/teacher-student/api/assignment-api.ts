// File: src/app/features/courses/api/assignment-api.ts
"use server";

import axios from "axios";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Assignment } from "@/app/domain/entities/CourseEntities";
import { CourseId, UnitId } from "@/app/domain/valueObjects";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const isMockEnabled = true; // Enable mock data

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use(
  async (config) => {
    const token = (await cookies()).get("session")?.value;
    if (token) config.headers["Authorization"] = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

const handleApiError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const errorMessage = error.response?.data?.message || error.message;
    redirect("/courses");
    throw new Error(errorMessage);
  }
  throw error;
};

// Mock data for assignments
const MOCK_ASSIGNMENTS: Assignment[] = [
  {
    id: "assign-1",
    title: "JavaScript Variables Assignment",
    courseId: "crs-101",
    unitId: "unit-1-1",
    description: "Practice declaring and using variables in JavaScript",
    createdAt: "2024-01-15T10:00:00Z",
    attachments: [
      {
        name: "assignment-instructions.pdf",
        storagePath: "/assignments/instructions.pdf",
        createdAt: "2024-01-15T10:00:00Z"
      }
    ],
    urls: ["https://developer.mozilla.org/en-US/docs/Web/JavaScript"],
    links: [],
    deliveryMode: "INDIVIDUAL",
    dueDate: "2024-02-01T23:59:00Z",
    maxScore: { value: 0, maxPoints: 100 },
    instructions: "Complete the following exercises:\n1. Declare variables using let, const, and var\n2. Create different data types\n3. Practice variable scope",
    submissions: [],
    allowLateSubmissions: true
  },
  {
    id: "assign-2",
    title: "Control Flow Exercises",
    courseId: "crs-101",
    unitId: "unit-1-2",
    description: "Practice if/else statements and loops",
    createdAt: "2024-01-20T10:00:00Z",
    attachments: [
      {
        name: "control-flow-exercises.pdf",
        storagePath: "/assignments/control-flow.pdf",
        createdAt: "2024-01-20T10:00:00Z"
      }
    ],
    urls: ["https://javascript.info/ifelse", "https://javascript.info/while-for"],
    links: [],
    deliveryMode: "GROUP",
    dueDate: "2024-02-10T23:59:00Z",
    maxScore: { value: 0, maxPoints: 150 },
    instructions: "Work in groups to solve the control flow problems. Submit one solution per group.",
    submissions: [],
    allowLateSubmissions: false
  }
];

const simulateDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Assignment-specific API calls
export async function fetchAssignmentsByUnit(courseId: CourseId, unitId: UnitId): Promise<Assignment[]> {
  if (isMockEnabled) {
    await simulateDelay();
    console.log(`MOCK: Fetching assignments for course ${courseId}, unit ${unitId}`);
    return MOCK_ASSIGNMENTS.filter(assign => assign.courseId === courseId && assign.unitId === unitId);
  }

  try {
    const response = await apiClient.get(`/courses/${courseId}/units/${unitId}/assignments`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function fetchAssignmentById(assignmentId: string): Promise<Assignment> {
  if (isMockEnabled) {
    await simulateDelay();
    const assignment = MOCK_ASSIGNMENTS.find(assign => assign.id === assignmentId);
    if (!assignment) {
      throw new Error(`Assignment not found: ${assignmentId}`);
    }
    console.log(`MOCK: Fetching assignment ${assignmentId}`);
    return assignment;
  }

  try {
    const response = await apiClient.get(`/assignments/${assignmentId}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function createAssignment(
  courseId: CourseId,
  unitId: UnitId,
  assignmentData: Omit<Assignment, "id" | "courseId" | "unitId" | "createdAt" | "submissions">
): Promise<Assignment> {
  if (isMockEnabled) {
    await simulateDelay(800);
    const newAssignment: Assignment = {
      ...assignmentData,
      id: `assign-${Date.now()}`,
      courseId,
      unitId,
      createdAt: new Date().toISOString(),
      submissions: []
    };
    MOCK_ASSIGNMENTS.push(newAssignment);
    console.log("MOCK: Created new assignment", newAssignment);
    return newAssignment;
  }

  try {
    const response = await apiClient.post(`/courses/${courseId}/units/${unitId}/assignments`, assignmentData);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function updateAssignment(
  assignmentId: string,
  assignmentData: Partial<Omit<Assignment, "id" | "courseId" | "unitId" | "createdAt" | "submissions">>
): Promise<Assignment> {

    console.log("Updating assignment:", assignmentId, assignmentData);
  if (isMockEnabled) {
    // await simulateDelay(600);
    // const index = MOCK_ASSIGNMENTS.findIndex(assign => assign.id === assignmentId);
    // if (index !== -1) {
    //   MOCK_ASSIGNMENTS[index] = { ...MOCK_ASSIGNMENTS[index], ...assignmentData };
    //   console.log(`MOCK: Updated assignment ${assignmentId}` + assignmentData);
    //   return MOCK_ASSIGNMENTS[index];
    // }
    // throw new Error(`Assignment not found: ${assignmentId}`);
  }

  try {
    // const response = await apiClient.put(`/assignments/${assignmentId}`, assignmentData);
    // return response.data;
    return assignmentData as Assignment;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function deleteAssignment(assignmentId: string): Promise<void> {
  if (isMockEnabled) {
    await simulateDelay(400);
    const index = MOCK_ASSIGNMENTS.findIndex(assign => assign.id === assignmentId);
    if (index !== -1) {
      MOCK_ASSIGNMENTS.splice(index, 1);
      console.log(`MOCK: Deleted assignment ${assignmentId}`);
      return;
    }
    throw new Error(`Assignment not found: ${assignmentId}`);
  }

  try {
    await apiClient.delete(`/assignments/${assignmentId}`);
  } catch (error) {
    return handleApiError(error);
  }
}