// File: src/app/features/tasks/api/task-api.ts
"use server";

import axios from "axios";
import { cookies } from "next/headers";
    import {  deliveryMode, Submission } from "@/app/domain/entities/CourseEntities";
import { AssignmentId, CourseId, Document, Score, UserId } from "@/app/domain/valueObjects";

// --- MOCKING CONFIGURATION AND DATA ---

/** Represents com.braintrust.education.domain.model.Assignment (Aggregate Root) */
export interface Assignment {
  id: AssignmentId;
  title: string;
  courseId: CourseId; 
  unitId: CourseId;
  description: string;
  /** Java: LocalDateTime, serialized to ISO 8601 string */
  createdAt: string;
  urls: string[];
  attachments: Document[];
  links: string[];
  deliveryMode: deliveryMode;
  /** Java: LocalDateTime, serialized to ISO 8601 string */
  dueDate: string | null;
  maxScore: Score;
  instructions: string;
  submissions: Submission[];
  allowLateSubmissions: boolean;
  idUser: UserId;
}

const isMockEnabled = true;

// Mock task data
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
  },
  {
    id: "task-103",
    title: "Design System Documentation",
    courseId: "COURSE-DES-401",
    unitId: "UNIT-4",
    description: "Create a comprehensive design system for a fictional product",
    createdAt: "2024-03-10T14:15:00Z",
    urls: [
      "https://storybook.js.org/",
      "https://zeroheight.com/"
    ],
    attachments: [
      {
        name: "design-system-examples.zip",
        storagePath: "/attachments/design-system-examples.zip",
        createdAt: "2024-03-10T14:15:00Z"
      }
    ],
    links: [
      "https://medium.com/eightshapes-llc/a-design-system-isn-t-a-project-it-s-a-product-serving-products-74dcfffef935"
    ],
    deliveryMode: "INDIVIDUAL",
    dueDate: "2025-11-24T23:59:00Z",
    maxScore: { value: 95, maxPoints: 100 },
    instructions: "Develop a complete design system including color palette, typography scale, component library, and usage guidelines. Document your decisions and provide examples of implementation.",
    submissions: [],
    allowLateSubmissions: true,
    idUser: "user-001"
  },
  {
    id: "task-201",
    title: "Linear Algebra Problem Set",
    courseId: "crs-202",
    unitId: "UNIT-2-1",
    description: "Solve vector space and linear transformation problems",
    createdAt: "2024-03-03T11:00:00Z",
    urls: [
      "https://khanacademy.org/math/linear-algebra"
    ],
    attachments: [
      {
        name: "problem-set-3.pdf",
        storagePath: "/attachments/problem-set-3.pdf",
        createdAt: "2024-03-03T11:00:00Z"
      },
      {
        name: "solution-template.tex",
        storagePath: "/attachments/solution-template.tex",
        createdAt: "2024-03-03T11:00:00Z"
      }
    ],
    links: [
      "https://math.mit.edu/linearalgebra/"
    ],
    deliveryMode: "INDIVIDUAL",
    dueDate: "2025-11-17T23:59:00Z",
    maxScore: { value: 100, maxPoints: 100 },
    instructions: "Complete all 10 problems from the attached PDF. Show all your work and reasoning. Submit your solutions as a PDF document with clear numbering and organization.",
    submissions: [],
    allowLateSubmissions: false,
    idUser: "user-001"
  },
  {
    id: "task-104",
    title: "Accessibility Audit",
    courseId: "COURSE-DES-401",
    unitId: "UNIT-5",
    description: "Perform accessibility evaluation on an existing website and provide recommendations",
    createdAt: "2024-03-12T16:45:00Z",
    urls: [
      "https://wave.webaim.org/",
      "https://developer.chrome.com/docs/lighthouse/accessibility/"
    ],
    attachments: [
      {
        name: "wcag-checklist.pdf",
        storagePath: "/attachments/wcag-checklist.pdf",
        createdAt: "2024-03-12T16:45:00Z"
      }
    ],
    links: [
      "https://www.w3.org/WAI/standards-guidelines/wcag/"
    ],
    deliveryMode: "GROUP",
    dueDate: "2025-11-30T23:59:00Z",
    maxScore: { value: 90, maxPoints: 100 },
    instructions: "Select a public website and conduct a thorough accessibility audit using automated tools and manual testing. Document violations, provide screenshots, and suggest specific improvements following WCAG guidelines.",
    submissions: [],
    allowLateSubmissions: true,
    idUser: "user-001"
  }
];


// Utility to simulate network delay for mock data
const simulateDelay = (ms: number = 500) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// --- API CLIENT CONFIGURATION (ONLY USED WHEN MOCKING IS DISABLED) ---

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

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

/**
 * Fetch ALL tasks for a specific month
 */
export async function fetchTasksByMonth(
  userId: string,
  monthStart: string,
  userType: 'teacher' | 'student'
): Promise<Assignment[]> {
  if (isMockEnabled) {
    await simulateDelay();
    
    // Filter tasks based on user type and date range
    const month = new Date(monthStart).getMonth();
    const year = new Date(monthStart).getFullYear();
    
    const filteredTasks = MOCK_TASKS.filter(task => {
      if (!task.dueDate) return false;
      
      const taskDate = new Date(task.dueDate);
      const isInMonth = taskDate.getMonth() === month && taskDate.getFullYear() === year;
      
      // For students, only show upcoming or recent tasks
      if (userType === 'student') {
        const now = new Date();
        const timeDiff = taskDate.getTime() - now.getTime();
        const daysDiff = timeDiff / (1000 * 3600 * 24);
        
        // Show tasks from the last 14 days and next 60 days
        return isInMonth && daysDiff >= -14 && daysDiff <= 60;
      }
      
      // For teachers, show all tasks in the month
      return isInMonth;
    });

    console.log(`MOCK: Returning ${filteredTasks.length} tasks for ${userType} ${userId} in month ${monthStart}`);
    console.log("FILTERED TASKS DATA:", filteredTasks);
    console.log("TASK IDs:", filteredTasks.map(t => t.id));
    console.log("TASK TITLES:", filteredTasks.map(t => t.title));
    
    return filteredTasks;
  }

  try {
    const response = await apiClient.get(`/${userType}s/${userId}/tasks`, {
      params: { 
        monthStart,
        view: 'monthly'
      }
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Fetch specific task details by ID SS
 */
export async function fetchTaskDetail(
  taskId: string,
  userType: 'teacher' | 'student'
): Promise<Assignment> {
  if (isMockEnabled) {
    await simulateDelay(600);
    
    const task = MOCK_TASKS.find(t => t.id === taskId);
    
    if (!task) {
      console.error(`MOCK: Task with ID ${taskId} not found`);
      throw new Error(`Task not found: ${taskId}`);
    }

    console.log(`MOCK: Returning task detail for ${taskId} for ${userType}`);
    console.log("TASK DETAIL DATA:", task);
    console.log("TASK ID:", task.id);
    console.log("TASK TITLE:", task.title);
    console.log("COURSE ID:", task.courseId);
    console.log("UNIT ID:", task.unitId);
    console.log("DELIVERY MODE:", task.deliveryMode);
    console.log("DUE DATE:", task.dueDate);
    console.log("ATTACHMENTS COUNT:", task.attachments.length);
    console.log("ATTACHMENT NAMES:", task.attachments.map(a => a.name));
    
    return task;
  }

  try {
    const response = await apiClient.get(`/tasks/${taskId}`, {
      params: { userType }
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Fetch this week's tasks only
 */
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
      
      // For students, only show upcoming tasks
      if (userType === 'student') {
        const now = new Date();
        return isInWeek && taskDate >= now;
      }
      
      return isInWeek;
    });

    console.log(`MOCK: Returning ${thisWeekTasks.length} tasks for ${userType} ${userId} in week starting ${weekStart}`);
    console.log("THIS WEEK TASKS DATA:", thisWeekTasks);
    console.log("TASK IDs FOR THIS WEEK:", thisWeekTasks.map(t => t.id));
    console.log("TASK TITLES FOR THIS WEEK:", thisWeekTasks.map(t => t.title));
    console.log("WEEK RANGE:", {
      start: weekStartDate.toISOString(),
      end: weekEndDate.toISOString()
    });
    
    return thisWeekTasks;
  }

  try {
    const response = await apiClient.get(`/${userType}s/${userId}/tasks/week`, {
      params: { weekStart }
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

// Additional mock functions for task management
/**
 * Create a new task
 */
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
    console.log("TASK DATA PROVIDED:", taskData);
    console.log("CREATED TASK DATA:", newTask);
    console.log("NEW TASK ID:", newTask.id);
    console.log("CREATED AT:", newTask.createdAt);
    
    return newTask;
  }

  try {
    const response = await apiClient.post("/tasks", taskData);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Update an existing task
 */
export async function updateTask(taskId: string, taskData: Partial<Omit<Assignment, "id" | "createdAt" | "submissions">>): Promise<Assignment> {
  if (isMockEnabled) {
    await simulateDelay(800);
    
    const taskIndex = MOCK_TASKS.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) {
      console.error(`MOCK: Task with ID ${taskId} not found for update`);
      throw new Error(`Task not found: ${taskId}`);
    }
    
    const originalTask = MOCK_TASKS[taskIndex];
    MOCK_TASKS[taskIndex] = {
      ...originalTask,
      ...taskData
    } as Assignment;
    
    console.log(`MOCK: Updated task ${taskId}`);
    console.log("ORIGINAL TASK DATA:", originalTask);
    console.log("UPDATE DATA PROVIDED:", taskData);
    console.log("UPDATED TASK DATA:", MOCK_TASKS[taskIndex]);
    console.log("UPDATED TASK ID:", MOCK_TASKS[taskIndex].id);
    console.log("UPDATED FIELDS:", Object.keys(taskData));
    
    return MOCK_TASKS[taskIndex];
  }

  try {
    const response = await apiClient.put(`/tasks/${taskId}`, taskData);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Delete a task
 */
export async function deleteTask(taskId: string): Promise<void> {
  if (isMockEnabled) {
    await simulateDelay(800);
    
    const taskIndex = MOCK_TASKS.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) {
      console.error(`MOCK: Task with ID ${taskId} not found for deletion`);
      throw new Error(`Task not found: ${taskId}`);
    }
    
    const deletedTask = MOCK_TASKS[taskIndex];
    MOCK_TASKS.splice(taskIndex, 1);
    
    console.log(`MOCK: Deleted task ${taskId}`);
    console.log("DELETED TASK DATA:", deletedTask);
    console.log("REMAINING TASKS COUNT:", MOCK_TASKS.length);
    console.log("REMAINING TASK IDs:", MOCK_TASKS.map(t => t.id));
    
    return;
  }

  try {
    await apiClient.delete(`/tasks/${taskId}`);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Fetch tasks by course
 */
export async function fetchTasksByCourse(courseId: string): Promise<Assignment[]> {
  if (isMockEnabled) {
    await simulateDelay();
    
    const courseTasks = MOCK_TASKS.filter(task => task.courseId === courseId);
    
    console.log(`MOCK: Returning ${courseTasks.length} tasks for course ${courseId}`);
    console.log("COURSE TASKS DATA:", courseTasks);
    console.log("TASK IDs FOR COURSE:", courseTasks.map(t => t.id));
    
    return courseTasks;
  }

  try {
    const response = await apiClient.get(`/courses/${courseId}/tasks`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Fetch tasks by unit
 */
export async function fetchTasksByUnit(unitId: string): Promise<Assignment[]> {
  if (isMockEnabled) {
    await simulateDelay();
    
    const unitTasks = MOCK_TASKS.filter(task => task.unitId === unitId);
    
    console.log(`MOCK: Returning ${unitTasks.length} tasks for unit ${unitId}`);
    console.log("UNIT TASKS DATA:", unitTasks);
    console.log("TASK IDs FOR UNIT:", unitTasks.map(t => t.id));
    
    return unitTasks;
  }

  try {
    const response = await apiClient.get(`/units/${unitId}/tasks`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

