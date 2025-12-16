"use server";
// File: src/app/infraestructure/api/gradebook/student-gradebook-api.ts

import axios from "axios";
import { GradeDTO } from "./student-submission";
import { cookies } from "next/headers";

// Add these types for gradebook
export interface GradebookDTO {
  id: string;
  courseId: string;
  courseName: string;
  studentId: string;
  studentName: string;
  lastCalculated: string;
  calculatedTotal: string;
  finalGrade: string;
  finalFeedback: string;
}

export interface UnitGradeDTO {
  id: string;
  unitId: string;
  unitName: string;
  studentId: string;
  studentName: string;
  grade: GradeDTO;
  assignmentGrades: Map<string, GradeDTO>;
  quizGrades: Map<string, GradeDTO>;
  feedback: string;
  lastCalculated: string;
  calculatedTotal: string;
  finalGrade: string;
  finalFeedback: string;
}

export interface StudentGradebook {
  studentId: string;
  studentName: string;
  courseId: string;
  tasks: StudentGradebookTask[];
  calculatedTotal: string;
  finalGrade: string;
  finalFeedback: string;
  lastCalculated: string;
}

export interface StudentGradebookTask {
  id: string;
  name: string;
  unitName: string;
  maxPoints: number;
  score: number | null;
  type: 'ASSIGNMENT' | 'QUIZ';
  submittedAt?: string;
  gradedAt?: string;
}

// Mock data for student gradebook
const MOCK_STUDENT_GRADEBOOK: StudentGradebook = {
  studentId: "student-1",
  studentName: "Alice Johnson",
  courseId: "crs-101",
  calculatedTotal: "87.5%",
  finalGrade: "88%",
  finalFeedback: "Excellent performance",
  lastCalculated: "2024-03-25T10:00:00Z",
  tasks: [
    {
      id: "task-101",
      name: "Wireframe Design Project",
      unitName: "Prototyping & Testing",
      maxPoints: 100,
      score: 85,
      type: 'ASSIGNMENT',
      submittedAt: "2024-03-14T23:45:00Z",
      gradedAt: "2024-03-15T10:30:00Z"
    },
    {
      id: "task-102",
      name: "User Research Report",
      unitName: "User Research",
      maxPoints: 85,
      score: 88,
      type: 'ASSIGNMENT',
      submittedAt: "2024-03-10T14:20:00Z",
      gradedAt: "2024-03-12T09:15:00Z"
    },
    {
      id: "task-103",
      name: "Design System Documentation",
      unitName: "Design Systems",
      maxPoints: 95,
      score: 91,
      type: 'ASSIGNMENT',
      submittedAt: "2024-03-18T11:30:00Z",
      gradedAt: "2024-03-20T16:45:00Z"
    },
    {
      id: "quiz-1",
      name: "UX Design Fundamentals Quiz",
      unitName: "User Research",
      maxPoints: 100,
      score: 90,
      type: 'QUIZ',
      submittedAt: "2024-03-21T10:15:00Z",
      gradedAt: "2024-03-21T14:20:00Z"
    },
    {
      id: "quiz-2",
      name: "Prototyping Methods Quiz",
      unitName: "Prototyping & Testing",
      maxPoints: 50,
      score: null,
      type: 'QUIZ',
      submittedAt: "2024-03-25T09:30:00Z"
    }
  ]
};

// Utility to simulate network delay
const simulateDelay = async (ms: number = 500): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Flag to enable/disable mocking
const isMockEnabled = false;

// API client configuration
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

const handleApiError = async (error: unknown): Promise<never> => {
  if (axios.isAxiosError(error)) {
    const errorMessage = error.response?.data?.message || error.message;
    throw new Error(errorMessage);
  }
  throw error;
};

// Helper function to convert Map to object if needed
const convertMapToObject = (mapData: any): Record<string, any> => {
  if (!mapData) return {};
  
  if (mapData instanceof Map || mapData.constructor?.name === 'Map') {
    return Object.fromEntries(mapData);
  }
  
  if (typeof mapData === 'object' && mapData !== null) {
    return mapData;
  }
  
  return {};
};

// Helper function to extract task name from ID
const extractTaskName = (taskId: string): string => {
  if (taskId.includes('assign_')) {
    const num = taskId.split('_').pop();
    return `Assignment ${num}`;
  } else if (taskId.includes('quiz_')) {
    const num = taskId.split('_').pop();
    return `Quiz ${num}`;
  } else if (taskId.includes('task_')) {
    const num = taskId.split('_').pop();
    return `Task ${num}`;
  }
  return taskId;
};

// COMPLETE Mapper for backend gradebook to frontend
const mapBackendGradebookToFrontend = (backendData: GradebookDTO): StudentGradebook => {
  if (!backendData) {
    return {
      studentId: "",
      studentName: "",
      courseId: "",
      tasks: [],
      calculatedTotal: "0%",
      finalGrade: "N/A",
      finalFeedback: "",
      lastCalculated: ""
    };
  }

  return {
    studentId: backendData.studentId || "",
    studentName: backendData.studentName || "Student",
    courseId: backendData.courseId || "",
    calculatedTotal: backendData.calculatedTotal || "0%",
    finalGrade: backendData.finalGrade || "N/A",
    finalFeedback: backendData.finalFeedback || "",
    lastCalculated: backendData.lastCalculated || "",
    tasks: [] // Tasks will be populated from unit grades
  };
};

// COMPLETE Mapper for backend unit grades to frontend tasks
const mapBackendUnitGradesToFrontendTasks = (backendData: UnitGradeDTO[]): StudentGradebookTask[] => {
  const tasks: StudentGradebookTask[] = [];

  if (!backendData || !Array.isArray(backendData)) {
    return tasks;
  }

  backendData.forEach((unitGrade: UnitGradeDTO) => {
    const unitName = unitGrade.unitName || "Unknown Unit";
    
    // Map assignment grades
    const assignmentGrades = convertMapToObject(unitGrade.assignmentGrades);
    if (assignmentGrades && typeof assignmentGrades === 'object') {
      Object.entries(assignmentGrades).forEach(([assignmentId, grade]: [string, any]) => {
        if (grade && typeof grade === 'object') {
          tasks.push({
            id: assignmentId,
            name: extractTaskName(assignmentId),
            unitName: unitName,
            maxPoints: parseFloat(grade.maxScore) || 100,
            score: grade.value ? parseFloat(grade.value) : null,
            type: 'ASSIGNMENT',
            // Note: You'll need to get submittedAt/gradedAt from your backend
            // submittedAt: grade.submittedAt,
            // gradedAt: grade.gradedAt
          });
        }
      });
    }
    
    // Map quiz grades
    const quizGrades = convertMapToObject(unitGrade.quizGrades);
    if (quizGrades && typeof quizGrades === 'object') {
      Object.entries(quizGrades).forEach(([quizId, grade]: [string, any]) => {
        if (grade && typeof grade === 'object') {
          tasks.push({
            id: quizId,
            name: extractTaskName(quizId),
            unitName: unitName,
            maxPoints: parseFloat(grade.maxScore) || 100,
            score: grade.value ? parseFloat(grade.value) : null,
            type: 'QUIZ',
            // Note: You'll need to get submittedAt/gradedAt from your backend
            // submittedAt: grade.submittedAt,
            // gradedAt: grade.gradedAt
          });
        }
      });
    }
  });

  return tasks;
};

// COMPLETE Mapper for combined gradebook data
const mapCompleteBackendDataToFrontend = (
  gradebookData: GradebookDTO,
  unitGradesData: UnitGradeDTO[]
): StudentGradebook => {
  // Start with base gradebook mapping
  const studentGradebook = mapBackendGradebookToFrontend(gradebookData);
  
  // Add tasks from unit grades
  studentGradebook.tasks = mapBackendUnitGradesToFrontendTasks(unitGradesData);
  
  return studentGradebook;
};

/**
 * Fetch gradebook data for a specific student in a course using gradebook endpoint
 */
export async function fetchStudentGradebook(courseId: string, studentId: string): Promise<StudentGradebook> {
  if (isMockEnabled) {
    await simulateDelay();
    
    console.log(`MOCK: Returning student gradebook for student ${studentId} in course ${courseId}`);
    return MOCK_STUDENT_GRADEBOOK;
  }

  try {
    // Get the base gradebook info
    const gradebookResponse = await apiClient.get<GradebookDTO>(`/api/gradebook/course/${courseId}/student/${studentId}`);
    const gradebookData = gradebookResponse.data;
    
    console.log("GRADEBOOK DATA FROM BACKEND:", gradebookData);
    
    // Try to get unit grades for detailed task information
    let unitGradesData: UnitGradeDTO[] = [];
    // Map complete data to frontend format
    const gradebook = mapCompleteBackendDataToFrontend(gradebookData, unitGradesData);
    
    console.log("COMPLETE STUDENT GRADEBOOK:", gradebook);
    return gradebook;
    
  } catch (error) {
    console.error("Error fetching student gradebook from backend:", error);
    return await handleApiError(error);
  }
}

/**
 * Fetch gradebook data using unit grades endpoint (more detailed)
 */
export async function fetchStudentGradebookByUnitGrades(courseId: string, studentId: string): Promise<StudentGradebook> {
  if (isMockEnabled) {
    await simulateDelay();
    console.log(`MOCK: Returning student gradebook via unit grades for student ${studentId} in course ${courseId}`);
    return MOCK_STUDENT_GRADEBOOK;
  }

  try {
    // First, get all units for the course
    const unitsResponse = await apiClient.get(`/api/courses/${courseId}/units`);
    const units = unitsResponse.data;
    
    // Then get unit grades for each unit for this student
    const unitGradesPromises = units.map((unit: any) => 
      apiClient.get<UnitGradeDTO[]>(`/api/unit-grades/unit/${unit.id}`)
    );
    
    const unitGradesResponses = await Promise.all(unitGradesPromises);
    const allUnitGrades = unitGradesResponses.flatMap((response: any) => response.data);
    
    // Filter for this specific student
    const studentUnitGrades = allUnitGrades.filter((unitGrade: UnitGradeDTO) => 
      unitGrade.studentId === studentId
    );
    
    // Try to get gradebook data for final grades
    let gradebookData: GradebookDTO | null = null;
    try {
      const gradebookResponse = await apiClient.get<GradebookDTO>(`/api/gradebook/course/${courseId}/student/${studentId}`);
      gradebookData = gradebookResponse.data;
    } catch (gradebookError) {
      console.warn("Could not fetch gradebook data, will create from unit grades:", gradebookError);
      // Create a basic gradebook from unit grades
      gradebookData = {
        id: `temp-${studentId}-${courseId}`,
        courseId,
        courseName: units[0]?.courseName || "Course",
        studentId,
        studentName: studentUnitGrades[0]?.studentName || "Student",
        lastCalculated: new Date().toISOString(),
        calculatedTotal: "0%",
        finalGrade: "N/A",
        finalFeedback: ""
      };
    }
    
    const gradebook = mapCompleteBackendDataToFrontend(gradebookData, studentUnitGrades);
    return gradebook;
    
  } catch (error) {
    console.error("Error fetching student gradebook via unit grades:", error);
    return await handleApiError(error);
  }
}

/**
 * Fetch final grade for a student in a course
 */
export async function fetchStudentFinalGrade(courseId: string, studentId: string): Promise<{ grade: string; feedback: string }> {
  if (isMockEnabled) {
    await simulateDelay(300);
    
    // Calculate final grade from mock data
    const gradebook = MOCK_STUDENT_GRADEBOOK;
    const gradedTasks = gradebook.tasks.filter(task => task.score !== null);
    
    if (gradedTasks.length === 0) {
      return { grade: "N/A", feedback: "No grades available" };
    }
    
    const totalScore = gradedTasks.reduce((sum, task) => sum + (task.score || 0), 0);
    const totalMaxPoints = gradedTasks.reduce((sum, task) => sum + task.maxPoints, 0);
    const finalPercentage = (totalScore / totalMaxPoints) * 100;
    
    return {
      grade: finalPercentage.toFixed(1) + "%",
      feedback: "Good overall performance. Keep up the good work!"
    };
  }

  try {
    const response = await apiClient.get<GradebookDTO[]>(`/api/gradebook/course/${courseId}`);
    const gradebooks = response.data;
    
    const studentGradebook = gradebooks.find(gb => gb.studentId === studentId);
    
    if (!studentGradebook) {
      return { grade: "N/A", feedback: "No gradebook data available" };
    }
    
    return {
      grade: studentGradebook.finalGrade,
      feedback: studentGradebook.finalFeedback
    };
    
  } catch (error) {
    return await handleApiError(error);
  }
}

/**
 * Assign final grade to a student
 */
export async function assignFinalGrade(
  courseId: string, 
  studentId: string, 
  gradeValue: string, 
  feedback?: string
): Promise<void> {
  if (isMockEnabled) {
    await simulateDelay(800);
    console.log(`MOCK: Assigning final grade ${gradeValue} to student ${studentId} in course ${courseId}`);
    console.log(`Feedback: ${feedback}`);
    return;
  }

  try {
    await apiClient.put(`/api/gradebook/course/${courseId}/student/${studentId}/final-grade`, {
      gradeValue,
      feedback: feedback || ""
    });
  } catch (error) {
    return await handleApiError(error);
  }
}

/**
 * Assign final grade to a student for a specific unit
 */
export async function assignUnitFinalGrade(
  unitId: string, 
  studentId: string, 
  gradeValue: string, 
  feedback?: string
): Promise<void> {
  if (isMockEnabled) {
    await simulateDelay(800);
    console.log(`MOCK: Assigning unit final grade ${gradeValue} to student ${studentId} for unit ${unitId}`);
    console.log(`Feedback: ${feedback}`);
    return;
  }

  try {
    await apiClient.put(`/api/unit-grades/unit/${unitId}/student/${studentId}/final-grade`, {
      gradeValue,
      feedback: feedback || ""
    });
  } catch (error) {
    return await handleApiError(error);
  }
}

/**
 * Get unit grades for a specific unit
 */


// CURRENTLY WORKS

export async function fetchUnitGrades(unitId: string): Promise<UnitGradeDTO[]> {
  if (isMockEnabled) {
    await simulateDelay(500);
    console.log(`MOCK: Returning unit grades for unit ${unitId}`);
    
    // Generate mock unit grades
    const mockUnitGrades: UnitGradeDTO[] = [
      {
        id: `unit-grade-${unitId}-1`,
        unitId,
        unitName: "Prototyping & Testing",
        studentId: "student-1",
        studentName: "Alice Johnson",
        grade: { value: "85", maxScore: "100", percentage: "85%" },
        assignmentGrades: new Map([["task-101", { value: "85", maxScore: "100", percentage: "85%" }]]),
        quizGrades: new Map([["quiz-2", { value: "45", maxScore: "50", percentage: "90%" }]]),
        feedback: "Good work on prototyping assignments",
        lastCalculated: "2024-03-25T10:00:00Z",
        calculatedTotal: "85%",
        finalGrade: "85%",
        finalFeedback: "Excellent unit performance"
      }
    ];
    
    return mockUnitGrades;
  }

  try {
    const response = await apiClient.get<UnitGradeDTO[]>(`/api/unit-grades/unit/${unitId}`);
    console.log(`Returning unit grades for unit ${unitId}`, response.data);
    
    // Ensure assignmentGrades and quizGrades are properly typed
    const unitGrades = response.data.map((unitGrade: any) => ({
      ...unitGrade,
      assignmentGrades: unitGrade.assignmentGrades || {},
      quizGrades: unitGrade.quizGrades || {}
    }));
    
    return unitGrades;
  } catch (error) {
    return await handleApiError(error);
  }
}

/**
 * Export student's grades to CSV
 */
export async function exportStudentGrades(courseId: string, studentId: string): Promise<Blob> {
  if (isMockEnabled) {
    await simulateDelay(800);
    
    const studentGradebook = await fetchStudentGradebook(courseId, studentId);
    
    // Create CSV content for student's grades
    const headers = "Assignment Name,Type,Unit,Your Score,Max Points,Percentage,Status,Submitted At,Graded At\n";
    const rows = studentGradebook.tasks.map((task) => {
      const percentage = task.score !== null ? (task.score / task.maxPoints) * 100 : null;
      const status = task.score !== null ? "Graded" : "Submitted";
      
      return `"${task.name}","${task.type}","${task.unitName}",${task.score || "N/A"},${task.maxPoints},${
        percentage ? percentage.toFixed(1) + "%" : "N/A"
      },${status},"${task.submittedAt || "N/A"}","${task.gradedAt || "N/A"}"`;
    }).join("\n");
    
    const csvContent = headers + rows;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    
    console.log(`MOCK: Generated CSV export for student ${studentId} in course ${courseId}`);
    return blob;
  }

  try {
    const response = await apiClient.get(`/api/gradebook/course/${courseId}/student/${studentId}/export`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    return await handleApiError(error);
  }
}

/**
 * Get gradebooks for entire course (for teachers)
 */
export async function fetchCourseGradebooks(courseId: string): Promise<GradebookDTO[]> {
  if (isMockEnabled) {
    await simulateDelay(600);
    
    console.log(`MOCK: Returning course gradebooks for course ${courseId}`);
    
    const mockCourseGradebooks: GradebookDTO[] = [
      {
        id: "gb-101-1",
        courseId,
        courseName: "UX Design Fundamentals",
        studentId: "student-1",
        studentName: "Alice Johnson",
        lastCalculated: "2024-03-25T10:00:00Z",
        calculatedTotal: "87.5%",
        finalGrade: "88%",
        finalFeedback: "Excellent performance"
      },
      {
        id: "gb-101-2",
        courseId,
        courseName: "UX Design Fundamentals",
        studentId: "student-2",
        studentName: "Bob Smith",
        lastCalculated: "2024-03-25T10:00:00Z",
        calculatedTotal: "92.0%",
        finalGrade: "92%",
        finalFeedback: "Outstanding work"
      },
      {
        id: "gb-101-3",
        courseId,
        courseName: "UX Design Fundamentals",
        studentId: "student-3",
        studentName: "Carol Davis",
        lastCalculated: "2024-03-25T10:00:00Z",
        calculatedTotal: "78.5%",
        finalGrade: "79%",
        finalFeedback: "Good progress, room for improvement"
      }
    ];
    
    return mockCourseGradebooks;
  }

  try {
    const response = await apiClient.get<GradebookDTO[]>(`/api/gradebook/course/${courseId}`);
    console.log(`Returning course gradebooks for course ${courseId}`, response.data);
    return response.data;
  } catch (error) {
    return await handleApiError(error);
  }
}