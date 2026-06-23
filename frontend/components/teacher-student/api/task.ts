"use server";

import axios from "axios";
import { cookies } from "next/headers";
import { Assignment, deliveryMode, Submission } from "@/app/domain/entities/CourseEntities";
import { AssignmentId, CourseId, Document, Score, UserId } from "@/app/domain/valueObjects";
import { submissionFormat } from "./task-teacher";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface AssignmentDTO {
  id: string;
  courseId: string;
  unitId: string;
  courseName: string;
  unitName: string;
  title: string;
  description: string;
  createdAt: string;
  dueDate: string;
  maxPoints: number;
  submissionFormat: string;
  links : string[];
  instructions: string;
  active: boolean;
  submissionCount: number;
  attachmentCount: number;
  canAcceptSubmissions: boolean;
  targetType: string;
  isTeamAssignment: boolean;
  attachments: DocumentDTO[];
  studentSubmissionStatus?: string | null;
}

interface DocumentDTO {
  name: string;
  storagePath: string;
}

interface CreateAssignmentCommand {
  courseId: string;
  unitId: string;
  title: string;
  description: string;
  dueDate: string;
  maxPoints: number;
  instructions: string;
  targetType: string;
}

interface SuccessResponseDTO {
  success: boolean;
  message: string;
  data: any;
}

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

const handleApiError = async (error: unknown): Promise<never> => {
  if (axios.isAxiosError(error)) {
    const errorMessage = error.response?.data?.message || error.message;
    throw new Error(errorMessage);
  }
  throw error;
};

async function mapAssignmentFromBackend(dto: AssignmentDTO): Promise<Assignment> {
  const submissions = dto.studentSubmissionStatus
    ? [{ studentId: "current-user", status: dto.studentSubmissionStatus } as any]
    : [];

  return {
    id: dto.id,
    title: dto.title,
    description: dto.description,
    courseId: dto.courseId,
    unitId: dto.unitId,
    submissionFormat: dto.submissionFormat as submissionFormat,
    createdAt: dto.createdAt,
    urls: dto.links,
    attachments: dto.attachments.map(doc => ({
      name: doc.name,
      storagePath: doc.storagePath,
      createdAt: new Date().toISOString()
    })),
    links: dto.links,
    deliveryMode: dto.targetType as deliveryMode,
    dueDate: dto.dueDate,
    maxScore: { value: dto.maxPoints, maxPoints: dto.maxPoints },
    instructions: dto.instructions,
    submissions,
    allowLateSubmissions: dto.canAcceptSubmissions,
    idUser: "current-user"
  };
}

async function mapCreateAssignmentToBackendCommand(data: Omit<Assignment, "id" | "createdAt" | "submissions" | "urls" | "links">): Promise<CreateAssignmentCommand> {
  return {
    courseId: data.courseId,
    unitId: data.unitId,
    title: data.title,
    description: data.description,
    dueDate: data.dueDate || new Date().toISOString(),
    maxPoints: data.maxScore.maxPoints,
    instructions: data.instructions,
    targetType: data.deliveryMode
  };
}

export async function fetchTasksByMonth(
  userId: string,
  monthStart: string,
  userType: 'teacher' | 'student'
): Promise<Assignment[]> {
  try {
    const endpoint = userType === 'teacher' ? 'teacher' : 'student';
    const response = await apiClient.get<AssignmentDTO[]>(`/api/assignments/calendar/${endpoint}/${userId}/month?monthStart=${monthStart}`);
    const tasks = await Promise.all(response.data.map(dto => mapAssignmentFromBackend(dto)));
    return tasks;
  } catch (error) {
    return await handleApiError(error);
  }
}

export async function fetchThisWeekTasks(
  userId: string,
  weekStart: string,
  userType: 'teacher' | 'student'
): Promise<Assignment[]> {
  try {
    const endpoint = userType === 'teacher' ? 'teacher' : 'student';
    const response = await apiClient.get<AssignmentDTO[]>(`/api/assignments/calendar/${endpoint}/${userId}/week?weekStart=${weekStart}`);
    console.log("API Response:", response.data);
    const tasks = await Promise.all(response.data.map(dto => mapAssignmentFromBackend(dto)));
    return tasks;
  } catch (error) {
    return await handleApiError(error);
  }
}

export async function fetchTaskDetail(
  taskId: string,
  userType: 'teacher' | 'student'
): Promise<Assignment> {
  try {
    const allAssignments = await apiClient.get<AssignmentDTO[]>(`/api/assignments/course/all`);
    const assignmentDTO = allAssignments.data.find(a => a.id === taskId);
    
    if (!assignmentDTO) {
      throw new Error(`Assignment not found: ${taskId}`);
    }
    
    const task = await mapAssignmentFromBackend(assignmentDTO);
    return task;
  } catch (error) {
    return await handleApiError(error);
  }
}

export async function createTask(taskData: Omit<Assignment, "id" | "createdAt" | "submissions">): Promise<Assignment> {
  try {
    const backendCommand = await mapCreateAssignmentToBackendCommand(taskData);
    const response = await apiClient.post<SuccessResponseDTO>("/api/assignments", backendCommand);
    
    const assignmentId = response.data.data;
    
    const newTask: Assignment = {
      ...taskData,
      id: assignmentId,
      createdAt: new Date().toISOString(),
      submissions: []
    };
    
    return newTask;
  } catch (error) {
    return await handleApiError(error);
  }
}

export async function updateTask(taskId: string, taskData: Partial<Omit<Assignment, "id" | "createdAt" | "submissions">>): Promise<Assignment> {
  try {
    throw new Error("Update task backend integration not implemented");
  } catch (error) {
    return await handleApiError(error);
  }
}

export async function deleteTask(taskId: string): Promise<void> {
  try {
    await apiClient.delete(`/api/assignments/${taskId}`);
  } catch (error) {
    return await handleApiError(error);
  }
}

export async function fetchTasksByCourse(courseId: string): Promise<Assignment[]> {
  try {
    const response = await apiClient.get<AssignmentDTO[]>(`/api/assignments/course/${courseId}`);
    const tasks = await Promise.all(response.data.map(dto => mapAssignmentFromBackend(dto)));
    return tasks;
  } catch (error) {
    return await handleApiError(error);
  }
}

export async function fetchTasksByUnit(courseId: string, unitId: string): Promise<Assignment[]> {
  try {
    console.log(`API: Fetching tasks for course ${courseId} and unit ${unitId}`);
    const response = await apiClient.get<AssignmentDTO[]>(`/api/assignments/course/${courseId}/unit/${unitId}`);
    const tasks = await Promise.all(response.data.map(dto => mapAssignmentFromBackend(dto)));
    return tasks;
  } catch (error) {
    return await handleApiError(error);
  }
}