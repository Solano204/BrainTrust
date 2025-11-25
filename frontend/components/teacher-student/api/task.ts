// File: src/app/features/tasks/api/task-api.ts
"use server";

import axios from "axios";
import { cookies } from "next/headers";
import { deliveryMode, Submission } from "@/app/domain/entities/CourseEntities";
import { AssignmentId, CourseId, Document, Score, UserId } from "@/app/domain/valueObjects";

// ============================================
// CONFIGURATION
// ============================================

const isMockEnabled = true;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// ============================================
// INTERFACES
// ============================================

export interface Assignment {
  id: AssignmentId;
  title: string;
  courseId: CourseId; 
  unitId: CourseId;
  description: string;
  createdAt: string;
  urls: string[];
  attachments: Document[];
  links: string[];
  deliveryMode: deliveryMode;
  dueDate: string | null;
  maxScore: Score;
  instructions: string;
  submissions: Submission[];
  allowLateSubmissions: boolean;
  idUser: UserId;
}

// ============================================
// BACKEND DTO TYPES
// ============================================

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
  links : string[];
  instructions: string;
  active: boolean;
  submissionCount: number;
  attachmentCount: number;
  canAcceptSubmissions: boolean;
  targetType: string;
  isTeamAssignment: boolean;
  attachments: DocumentDTO[];
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

// ============================================
// MOCK DATA
// ============================================

const MOCK_TASKS: Assignment[] = [
  {
    id: "sub-task-1",
    title: "Wireframe Design Project",
    courseId: "COURSE-DES-401",
    unitId: "UNIT-3",
    description: "Create detailed wireframes for a mobile banking application focusing on user experience and accessibility",
    createdAt: "2024-03-01T10:00:00Z",
    urls: [
      "https://figma.com/design/banking-wireframes",
      "https://material.io/design"
    ],
    attachments: [
      {
        name: "design-guidelines.pdf",
        storagePath: "/attachments/design-guidelines.pdf",
        createdAt: "2024-03-01T10:00:00Z"
      },
      {
        name: "wireframe-template.fig",
        storagePath: "/attachments/wireframe-template.fig",
        createdAt: "2024-03-01T10:00:00Z"
      }
    ],
    links: [
      "https://www.nngroup.com/articles/wireframing/",
      "https://uxdesign.cc/the-ultimate-wireframing-guide-2024"
    ],
    deliveryMode: "INDIVIDUAL",
    dueDate: "2025-11-14T23:59:00Z",
    maxScore: { value: 100, maxPoints: 100 },
    instructions: "Design wireframes for 5 key screens: login, dashboard, account overview, money transfer, and settings. Focus on intuitive navigation and WCAG 2.1 AA compliance. Submit your Figma file and a brief design rationale document.",
    submissions: [],
    allowLateSubmissions: true,
    idUser: "user-001"
  },
  {
    id: "task-102",
    title: "User Research Report",
    courseId: "COURSE-DES-401",
    unitId: "UNIT-2",
    description: "Conduct user research and compile findings into a comprehensive report",
    createdAt: "2024-03-05T09:30:00Z",
    urls: [
      "https://miro.com/board/user-research-template"
    ],
    attachments: [
      {
        name: "research-methods.docx",
        storagePath: "/attachments/research-methods.docx",
        createdAt: "2024-03-05T09:30:00Z"
      }
    ],
    links: [
      "https://www.interaction-design.org/literature/topics/user-research"
    ],
    deliveryMode: "GROUP",
    dueDate: "2025-11-19T23:59:00Z",
    maxScore: { value: 85, maxPoints: 100 },
    instructions: "Form groups of 3-4 students. Conduct interviews with at least 5 users, create personas, and document user journey maps. Include both qualitative and quantitative data in your final report.",
    submissions: [],
    allowLateSubmissions: false,
    idUser: "user-001"
  }
];

// ============================================
// UTILITIES
// ============================================

const simulateDelay = (ms: number = 500) =>
  new Promise((resolve) => setTimeout(resolve, ms));

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

// ============================================
// MAPPERS
// ============================================

function mapAssignmentFromBackend(dto: AssignmentDTO): Assignment {
  return {
    id: dto.id,
    title: dto.title,
    description: dto.description,
    courseId: dto.courseId,
    unitId: dto.unitId,
    createdAt: dto.createdAt,
    urls: [], // Will be populated from context
    attachments: dto.attachments.map(doc => ({
      name: doc.name,
      storagePath: doc.storagePath,
      createdAt: new Date().toISOString()
    })),
    links: dto.links, // Will be populated from context
    deliveryMode: dto.targetType as deliveryMode,
    dueDate: dto.dueDate,
    maxScore: { value: dto.maxPoints, maxPoints: dto.maxPoints },
    instructions: dto.instructions,
    submissions: [],
    allowLateSubmissions: dto.canAcceptSubmissions,
    idUser: "current-user" // This should come from auth context
  };
}

function mapCreateAssignmentToBackendCommand(data: Omit<Assignment, "id" | "createdAt" | "submissions" | "urls" | "links">): CreateAssignmentCommand {
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

// ============================================
// API FUNCTIONS (ONLY THE ONES YOU NEED)
// ============================================

export async function fetchTasksByMonth(
  userId: string,
  monthStart: string,
  userType: 'teacher' | 'student'
): Promise<Assignment[]> {
  if (isMockEnabled) {
    await simulateDelay();
    
    const month = new Date(monthStart).getMonth();
    const year = new Date(monthStart).getFullYear();
    
    const filteredTasks = MOCK_TASKS.filter(task => {
      if (!task.dueDate) return false;
      
      const taskDate = new Date(task.dueDate);
      const isInMonth = taskDate.getMonth() === month && taskDate.getFullYear() === year;
      
      if (userType === 'student') {
        const now = new Date();
        const timeDiff = taskDate.getTime() - now.getTime();
        const daysDiff = timeDiff / (1000 * 3600 * 24);
        return isInMonth && daysDiff >= -14 && daysDiff <= 60;
      }
      
      return isInMonth;
    });

    console.log(`MOCK: Returning ${filteredTasks.length} tasks for ${userType} ${userId} in month ${monthStart}`);
    return filteredTasks;
  }

  try {
    const endpoint = userType === 'teacher' ? 'teacher' : 'student';
    const response = await apiClient.get<AssignmentDTO[]>(`/api/assignments/calendar/${endpoint}/${userId}/month?monthStart=${monthStart}`);
    return response.data.map(mapAssignmentFromBackend);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function fetchThisWeekTasks(
  userId: string,
  weekStart: string,
  userType: 'teacher' | 'student'
): Promise<Assignment[]> {
  if (isMockEnabled) {
    await simulateDelay();
    
    const weekStartDate = new Date(weekStart);
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekEndDate.getDate() + 7);
    
    const thisWeekTasks = MOCK_TASKS.filter(task => {
      if (!task.dueDate) return false;
      
      const taskDate = new Date(task.dueDate);
      const isInWeek = taskDate >= weekStartDate && taskDate < weekEndDate;
      
      if (userType === 'student') {
        const now = new Date();
        return isInWeek && taskDate >= now;
      }
      
      return isInWeek;
    });

    console.log(`MOCK: Returning ${thisWeekTasks.length} tasks for ${userType} ${userId} in week starting ${weekStart}`);
    return thisWeekTasks;
  }

  try {
    const endpoint = userType === 'teacher' ? 'teacher' : 'student';
    const response = await apiClient.get<AssignmentDTO[]>(`/api/assignments/calendar/${endpoint}/${userId}/week?weekStart=${weekStart}`);
    return response.data.map(mapAssignmentFromBackend);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function fetchTaskDetail(
  taskId: string,
  userType: 'teacher' | 'student'
): Promise<Assignment> {
  if (isMockEnabled) {
    await simulateDelay(600);
    
    const task = MOCK_TASKS.find(t => t.id === taskId);
    
    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }

    console.log(`MOCK: Returning task detail for ${taskId} for ${userType}`);
    return task;
  }

  try {
    // Note: Your backend might need a specific endpoint for assignment detail
    // Using the course assignments endpoint as fallback
    const allAssignments = await apiClient.get<AssignmentDTO[]>(`/api/assignments/course/all`);
    const assignmentDTO = allAssignments.data.find(a => a.id === taskId);
    
    if (!assignmentDTO) {
      throw new Error(`Assignment not found: ${taskId}`);
    }
    
    return mapAssignmentFromBackend(assignmentDTO);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function createTask(taskData: Omit<Assignment, "id" | "createdAt" | "submissions">): Promise<Assignment> {
  if (isMockEnabled) {
    await simulateDelay(800);
    
    const newTask: Assignment = {
      ...taskData,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
      submissions: []
    };
    
    MOCK_TASKS.push(newTask);
    
    console.log("MOCK: Created new task");
    return newTask;
  }

  try {
    const backendCommand: CreateAssignmentCommand = mapCreateAssignmentToBackendCommand(taskData);
    const response = await apiClient.post<SuccessResponseDTO>("/api/assignments", backendCommand);
    
    // Fetch the created assignment to get full details
    const assignmentId = response.data.data;
    
    // In a real implementation, you would fetch the created assignment
    // For now, return the mock approach
    const newTask: Assignment = {
      ...taskData,
      id: assignmentId,
      createdAt: new Date().toISOString(),
      submissions: []
    };
    
    return newTask;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function updateTask(taskId: string, taskData: Partial<Omit<Assignment, "id" | "createdAt" | "submissions">>): Promise<Assignment> {
  if (isMockEnabled) {
    await simulateDelay(800);
    
    const taskIndex = MOCK_TASKS.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) {
      throw new Error(`Task not found: ${taskId}`);
    }
    
    MOCK_TASKS[taskIndex] = {
      ...MOCK_TASKS[taskIndex],
      ...taskData
    } as Assignment;
    
    console.log(`MOCK: Updated task ${taskId}`);
    return MOCK_TASKS[taskIndex];
  }

  try {
    // For simplicity, we'll use the mock approach for update
    // In a real implementation, you would map to backend update command
    await simulateDelay(800);
    throw new Error("Update task backend integration not implemented");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function deleteTask(taskId: string): Promise<void> {
  if (isMockEnabled) {
    await simulateDelay(800);
    
    const taskIndex = MOCK_TASKS.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) {
      throw new Error(`Task not found: ${taskId}`);
    }
    
    MOCK_TASKS.splice(taskIndex, 1);
    
    console.log(`MOCK: Deleted task ${taskId}`);
    return;
  }

  try {
    await apiClient.delete(`/api/assignments/${taskId}`);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function fetchTasksByCourse(courseId: string): Promise<Assignment[]> {
  if (isMockEnabled) {
    await simulateDelay();
    
    const courseTasks = MOCK_TASKS.filter(task => task.courseId === courseId);
    
    console.log(`MOCK: Returning ${courseTasks.length} tasks for course ${courseId}`);
    return courseTasks;
  }

  try {
    const response = await apiClient.get<AssignmentDTO[]>(`/api/assignments/course/${courseId}`);
    return response.data.map(mapAssignmentFromBackend);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function fetchTasksByUnit(unitId: string, courseId: string): Promise<Assignment[]> {
  if (isMockEnabled) {
    await simulateDelay();
    
    const unitTasks = MOCK_TASKS.filter(task => task.unitId === unitId);
    
    console.log(`MOCK: Returning ${unitTasks.length} tasks for unit ${unitId}`);
    return unitTasks;
  }

  try {
    const response = await apiClient.get<AssignmentDTO[]>(`/api/assignments/course/all/unit/${unitId}/course/${courseId}`);
    return response.data.map(mapAssignmentFromBackend);
  } catch (error) {
    return handleApiError(error);
  }
}