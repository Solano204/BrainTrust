// File: src/app/infraestructure/api/types/backend-types.ts
"use server";

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


// File: src/app/infraestructure/api/gradebook/student-gradebook-api.ts


// Mock data for student gradebook
const MOCK_STUDENT_GRADEBOOK: StudentGradebook = {
  studentId: "student-1",
  studentName: "Alice Johnson",
  courseId: "crs-101",
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
const simulateDelay = (ms: number = 500) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Flag to enable/disable mocking
const isMockEnabled = process.env.NEXT_PUBLIC_MOCK_ENABLED === 'true';

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

const handleApiError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const errorMessage = error.response?.data?.message || error.message;
    throw new Error(errorMessage);
  }
  throw error;
};

// Mappers for backend to frontend types
const mapBackendGradebookToFrontend = (backendData: GradebookDTO[]): StudentGradebook => {
  // This would need to be adjusted based on your actual backend structure
  // For now, returning a simplified version
  return {
    studentId: backendData[0]?.studentId || "",
    studentName: backendData[0]?.studentName || "Student",
    courseId: backendData[0]?.courseId || "",
    tasks: [] // You'll need to populate this from assignment and quiz data
  };
};

const mapBackendUnitGradesToFrontend = (backendData: UnitGradeDTO[], courseId: string, studentId: string): StudentGradebook => {
  const tasks: StudentGradebookTask[] = [];

  backendData.forEach((unitGrade: UnitGradeDTO) => {
    // Map assignment grades
    if (unitGrade.assignmentGrades) {
      Object.entries(unitGrade.assignmentGrades).forEach(([assignmentId, grade]: [string, any]) => {
        tasks.push({
          id: assignmentId,
          name: `Assignment - ${assignmentId}`,
          unitName: unitGrade.unitName,
          maxPoints: parseFloat(grade.maxScore),
          score: parseFloat(grade.value),
          type: 'ASSIGNMENT'
        });
      });
    }
    
    // Map quiz grades
    if (unitGrade.quizGrades) {
      Object.entries(unitGrade.quizGrades).forEach(([quizId, grade]: [string, any]) => {
        tasks.push({
          id: quizId,
          name: `Quiz - ${quizId}`,
          unitName: unitGrade.unitName,
          maxPoints: parseFloat(grade.maxScore),
          score: parseFloat(grade.value),
          type: 'QUIZ'
        });
      });
    }
  });

  return {
    studentId,
    studentName: backendData[0]?.studentName || "Student",
    courseId,
    tasks
  };
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
    // Option 1: Use gradebook endpoint
    const response = await apiClient.get<GradebookDTO[]>(`/api/gradebook/course/${courseId}`);
    const gradebooks = response.data;
    
    // Find the specific student's gradebook
    const studentGradebook = gradebooks.find(gb => gb.studentId === studentId);
    
    if (!studentGradebook) {
      return {
        studentId,
        studentName: "Student",
        courseId,
        tasks: []
      };
    }

    // For a complete gradebook, we might need to combine with assignment and quiz data
    // This is a simplified version - you might need additional API calls
    return mapBackendGradebookToFrontend([studentGradebook]);
    
  } catch (error) {
    console.error("Error fetching student gradebook from backend:", error);
    return handleApiError(error);
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
    
    return mapBackendUnitGradesToFrontend(studentUnitGrades, courseId, studentId);
    
  } catch (error) {
    console.error("Error fetching student gradebook via unit grades:", error);
    return handleApiError(error);
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
    return handleApiError(error);
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
    return handleApiError(error);
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
    return handleApiError(error);
  }
}

/**
 * Get unit grades for a specific unit
 */
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
    return response.data;
  } catch (error) {
    return handleApiError(error);
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
    return handleApiError(error);
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
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}