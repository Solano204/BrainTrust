// File: src/app/features/gradebook/api/gradebook-api.ts
"use server";

import axios from "axios";
import { cookies } from "next/headers";
import { GradebookData } from "@/app/domain/service/service";
import { AssignmentId, UserId } from "@/app/domain/valueObjects/CourseValues";
import { calificationStudent } from "@/app/domain/entities/CourseEntities";

// --- MOCKING CONFIGURATION AND DATA ---

/**
 * Flag to enable/disable mocking.
 * Set to true to use mock data, false to use the real backend.
 */
const isMockEnabled = true;

// Mock gradebook data
const MOCK_GRADEBOOK_DATA: calificationStudent[] = [
  {
    id: "grade-101-1",
    student: {
      studentId: "student-1",
      nameStudent: "Alice Johnson",
      taskId: "sub-task-101-1",
      calification: 85
    },
    task: {
      id: "task-101",
      nameTask: "Wireframe Design Project",
      maxPoints: 100,
      unitId: "UNIT-3",
      unitName: "Prototyping & Testing",
      CourseId: "crs-101"
    },
    total: 85
  },
  {
    id: "grade-101-2",
    student: {
      studentId: "student-2",
      nameStudent: "Bob Smith",
      taskId: "sub-task-101-2",
      calification: 92
    },
    task: {
      id: "task-101",
      nameTask: "Wireframe Design Project",
      maxPoints: 100,
      unitId: "UNIT-3",
      unitName: "Prototyping & Testing",
      CourseId: "crs-101"
    },
    total: 92
  },
  {
    id: "grade-101-3",
    student: {
      studentId: "student-3",
      nameStudent: "Carol Davis",
      taskId: "sub-task-101-3",
      calification: 78
    },
    task: {
      id: "task-101",
      nameTask: "Wireframe Design Project",
      maxPoints: 100,
      unitId: "UNIT-3",
      unitName: "Prototyping & Testing",
      CourseId: "crs-101"
    },
    total: 78
  },
  {
    id: "grade-102-1",
    student: {
      studentId: "student-1",
      nameStudent: "Alice Johnson",
      taskId: "sub-task-102-1",
      calification: 88
    },
    task: {
      id: "task-102",
      nameTask: "User Research Report",
      maxPoints: 85,
      unitId: "UNIT-2",
      unitName: "User Research",
      CourseId: "crs-101"
    },
    total: 88
  },
  {
    id: "grade-102-2",
    student: {
      studentId: "student-2",
      nameStudent: "Bob Smith",
      taskId: "sub-task-102-2",
      calification: 0
    },
    task: {
      id: "task-102",
      nameTask: "User Research Report",
      maxPoints: 85,
      unitId: "UNIT-2",
      unitName: "User Research",
      CourseId: "crs-101"
    },
    total: 0
  },
  {
    id: "grade-201-1",
    student: {
      studentId: "student-4",
      nameStudent: "David Wilson",
      taskId: "sub-task-201-1",
      calification: 95
    },
    task: {
      id: "task-201",
      nameTask: "Linear Algebra Problem Set",
      maxPoints: 75,
      unitId: "UNIT-2-1",
      unitName: "Vector Spaces",
      CourseId: "crs-202"
    },
    total: 95
  },
  {
    id: "grade-201-2",
    student: {
      studentId: "student-5",
      nameStudent: "Eva Brown",
      taskId: "sub-task-201-2",
      calification: 82
    },
    task: {
      id: "task-201",
      nameTask: "Linear Algebra Problem Set",
      maxPoints: 75,
      unitId: "UNIT-2-1",
      unitName: "Vector Spaces",
      CourseId: "crs-202"
    },
    total: 82
  },
  {
    id: "grade-103-1",
    student: {
      studentId: "student-1",
      nameStudent: "Alice Johnson",
      taskId: "sub-task-103-1",
      calification: 91
    },
    task: {
      id: "task-103",
      nameTask: "Design System Documentation",
      maxPoints: 95,
      unitId: "UNIT-4",
      unitName: "Design Systems",
      CourseId: "crs-101"
    },
    total: 91
  }
];

// Mock student data for additional context
const MOCK_STUDENTS = [
  { id: "student-1", name: "Alice Johnson", email: "alice@university.edu" },
  { id: "student-2", name: "Bob Smith", email: "bob@university.edu" },
  { id: "student-3", name: "Carol Davis", email: "carol@university.edu" },
  { id: "student-4", name: "David Wilson", email: "david@university.edu" },
  { id: "student-5", name: "Eva Brown", email: "eva@university.edu" },
  { id: "student-6", name: "Frank Miller", email: "frank@university.edu" }
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

// --- API FUNCTIONS WITH MOCKING LOGIC ---

/**
 * Fetch gradebook data for a course
 */
export async function fetchGradebookData(courseId: string): Promise<calificationStudent[]> {
  if (isMockEnabled) {
    await simulateDelay();
    
    const gradebookData = MOCK_GRADEBOOK_DATA.filter(grade => 
      grade.task.CourseId === courseId
    );
    
    console.log(`MOCK: Returning gradebook data for course ${courseId}`);
    console.log("GRADEBOOK DATA:", gradebookData);
    console.log("GRADE ENTRIES COUNT:", gradebookData.length);
    console.log("STUDENT IDs:", [...new Set(gradebookData.map(g => g.student.studentId))]);
    console.log("TASK IDs:", [...new Set(gradebookData.map(g => g.task.id))]);
    console.log("GRADE IDs:", gradebookData.map(g => g.id));
    
    return gradebookData;
  }

  try {
    const response = await apiClient.get(`/courses/${courseId}/gradebook`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Update student grade for a specific task
 */
export async function updateStudentGrade(
  courseId: string,
  updateData: {
    studentId: UserId;
    taskId: AssignmentId;
    grade: number | null;
  }
): Promise<calificationStudent> {
  if (isMockEnabled) {
    await simulateDelay(800);
    
    const { studentId, taskId, grade } = updateData;
    
    // Find existing grade entry
    const gradeIndex = MOCK_GRADEBOOK_DATA.findIndex(g => 
      g.student.studentId === studentId && 
      g.task.id === taskId &&
      g.task.CourseId === courseId
    );
    
    let updatedGrade: calificationStudent;
    
    if (gradeIndex !== -1) {
      // Update existing grade
      const originalGrade = MOCK_GRADEBOOK_DATA[gradeIndex];
      MOCK_GRADEBOOK_DATA[gradeIndex] = {
        ...originalGrade,
        student: {
          ...originalGrade.student,
          calification: grade || 0
        },
        total: grade || 0
      };
      updatedGrade = MOCK_GRADEBOOK_DATA[gradeIndex];
      console.log(`MOCK: Updated existing grade for student ${studentId}, task ${taskId}`);
    } else {
      // Create new grade entry
      const student = MOCK_STUDENTS.find(s => s.id === studentId);
      const task = MOCK_GRADEBOOK_DATA.find(g => g.task.id === taskId)?.task;
      
      if (!student || !task) {
        console.error(`MOCK: Student ${studentId} or task ${taskId} not found`);
        throw new Error(`Student or task not found`);
      }
      
      updatedGrade = {
        id: `grade-${taskId}-${studentId}-${Date.now()}`,
        student: {
          studentId: studentId,
          nameStudent: student.name,
          taskId: `sub-${taskId}-${studentId}`,
          calification: grade || 0
        },
        task: {
          id: taskId,
          nameTask: task.nameTask,
          maxPoints: task.maxPoints,
          unitId: task.unitId,
          unitName: task.unitName,
          CourseId: courseId
        },
        total: grade || 0
      };
      
      MOCK_GRADEBOOK_DATA.push(updatedGrade);
      console.log(`MOCK: Created new grade entry for student ${studentId}, task ${taskId}`);
    }
    
    console.log("UPDATE DATA PROVIDED:", updateData);
    console.log("UPDATED GRADE ENTRY:", updatedGrade);
    console.log("GRADE ID:", updatedGrade.id);
    console.log("STUDENT NAME:", updatedGrade.student.nameStudent);
    console.log("TASK NAME:", updatedGrade.task.nameTask);
    console.log("NEW GRADE:", grade);
    
    return updatedGrade;
  }

  try {
    const response = await apiClient.put(`/courses/${courseId}/gradebook/grade`, updateData);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Bulk update multiple grades
 */
export async function bulkUpdateGrades(
  courseId: string,
  updates: Array<{
    studentId: UserId;
    taskId: AssignmentId;
    grade: number | null;
  }>
): Promise<calificationStudent[]> {
  if (isMockEnabled) {
    await simulateDelay(1200);
    
    const updatedGrades: calificationStudent[] = [];
    const errors: string[] = [];
    
    console.log(`MOCK: Processing bulk update for ${updates.length} grades in course ${courseId}`);
    console.log("BULK UPDATE DATA:", updates);
    
    for (const update of updates) {
      try {
        const { studentId, taskId, grade } = update;
        
        // Find existing grade entry
        const gradeIndex = MOCK_GRADEBOOK_DATA.findIndex(g => 
          g.student.studentId === studentId && 
          g.task.id === taskId &&
          g.task.CourseId === courseId
        );
        
        if (gradeIndex !== -1) {
          // Update existing grade
          const originalGrade = MOCK_GRADEBOOK_DATA[gradeIndex];
          MOCK_GRADEBOOK_DATA[gradeIndex] = {
            ...originalGrade,
            student: {
              ...originalGrade.student,
              calification: grade || 0
            },
            total: grade || 0
          };
          updatedGrades.push(MOCK_GRADEBOOK_DATA[gradeIndex]);
          console.log(`✓ Updated grade for student ${studentId}, task ${taskId}: ${grade}`);
        } else {
          // Create new grade entry
          const student = MOCK_STUDENTS.find(s => s.id === studentId);
          const existingTask = MOCK_GRADEBOOK_DATA.find(g => g.task.id === taskId)?.task;
          
          if (!student || !existingTask) {
            errors.push(`Student ${studentId} or task ${taskId} not found`);
            continue;
          }
          
          const newGrade: calificationStudent = {
            id: `grade-${taskId}-${studentId}-${Date.now()}`,
            student: {
              studentId: studentId,
              nameStudent: student.name,
              taskId: `sub-${taskId}-${studentId}`,
              calification: grade || 0
            },
            task: {
              id: taskId,
              nameTask: existingTask.nameTask,
              maxPoints: existingTask.maxPoints,
              unitId: existingTask.unitId,
              unitName: existingTask.unitName,
              CourseId: courseId
            },
            total: grade || 0
          };
          
          MOCK_GRADEBOOK_DATA.push(newGrade);
          updatedGrades.push(newGrade);
          console.log(`✓ Created new grade for student ${studentId}, task ${taskId}: ${grade}`);
        }
      } catch (error) {
        errors.push(`Failed to update grade for student ${update.studentId}, task ${update.taskId}`);
      }
    }
    
    if (errors.length > 0) {
      console.warn(`MOCK: Bulk update completed with ${errors.length} errors`);
      console.warn("BULK UPDATE ERRORS:", errors);
    }
    
    console.log(`MOCK: Bulk update completed. Successfully processed ${updatedGrades.length} grades`);
    console.log("UPDATED GRADES:", updatedGrades);
    
    return updatedGrades;
  }

  try {
    const response = await apiClient.put(`/courses/${courseId}/gradebook/bulk-update`, { updates });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Export gradebook to CSV
 */
export async function exportGradebookToCSV(courseId: string): Promise<Blob> {
  if (isMockEnabled) {
    await simulateDelay(1000);
    
    const gradebookData = MOCK_GRADEBOOK_DATA.filter(grade => 
      grade.task.CourseId === courseId
    );
    
    // Create mock CSV content
    const headers = "Student ID,Student Name,Task Name,Unit,Grade,Max Points,Percentage\n";
    const rows = gradebookData.map(grade => 
      `${grade.student.studentId},"${grade.student.nameStudent}","${grade.task.nameTask}","${grade.task.unitName}",${grade.student.calification || "N/A"},${grade.task.maxPoints || 0},${grade.student.calification ? ((grade.student.calification / (grade.task.maxPoints || 0)) * 100).toFixed(1) + "%" : "N/A"}`
    ).join("\n");
    
    const csvContent = headers + rows;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    
    console.log(`MOCK: Generated CSV export for course ${courseId}`);
    console.log("CSV CONTENT LENGTH:", csvContent.length);
    console.log("BLOB SIZE:", blob.size);
    console.log("BLOB TYPE:", blob.type);
    console.log("GRADE ENTRIES IN EXPORT:", gradebookData.length);
    
    return blob;
  }

  try {
    const response = await apiClient.get(`/courses/${courseId}/gradebook/export`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Get gradebook statistics
 */
export async function getGradebookStats(courseId: string): Promise<{
  totalStudents: number;
  totalTasks: number;
  averageGrade: number;
  completionRate: number;
}> {
  if (isMockEnabled) {
    await simulateDelay(400);
    
    const gradebookData = MOCK_GRADEBOOK_DATA.filter(grade => 
      grade.task.CourseId === courseId
    );
    
    const studentIds = [...new Set(gradebookData.map(g => g.student.studentId))];
    const taskIds = [...new Set(gradebookData.map(g => g.task.id))];
    
    const gradedEntries = gradebookData.filter(g => g.student.calification !== null);
    const totalGrade = gradedEntries.reduce((sum, grade) => sum + (grade.student.calification || 0), 0);
    const averageGrade = gradedEntries.length > 0 ? totalGrade / gradedEntries.length : 0;
    
    // Calculate completion rate (percentage of possible grade entries that have grades)
    const totalPossibleEntries = studentIds.length * taskIds.length;
    const completionRate = totalPossibleEntries > 0 ? (gradedEntries.length / totalPossibleEntries) * 100 : 0;
    
    const stats = {
      totalStudents: studentIds.length,
      totalTasks: taskIds.length,
      averageGrade: Math.round(averageGrade * 10) / 10,
      completionRate: Math.round(completionRate)
    };
    
    console.log(`MOCK: Returning gradebook stats for course ${courseId}`);
    console.log("GRADEBOOK STATS DATA:", stats);
    console.log("CALCULATION DETAILS:", {
      studentCount: studentIds.length,
      taskCount: taskIds.length,
      gradedEntriesCount: gradedEntries.length,
      totalPossibleEntries: totalPossibleEntries,
      totalGrade: totalGrade,
      averageGrade: averageGrade
    });
    
    return stats;
  }

  try {
    const response = await apiClient.get(`/courses/${courseId}/gradebook/stats`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Get student grade summary (additional utility function)
 */
export async function getStudentGradeSummary(
  courseId: string,
  studentId: UserId
): Promise<{
  student: { id: UserId; name: string };
  grades: calificationStudent[];
  averageGrade: number;
  completedTasks: number;
  totalTasks: number;
}> {
  if (isMockEnabled) {
    await simulateDelay(600);
    
    const studentGrades = MOCK_GRADEBOOK_DATA.filter(grade => 
      grade.task.CourseId === courseId && grade.student.studentId === studentId
    );
    
    const student = MOCK_STUDENTS.find(s => s.id === studentId);
    const taskIds = [...new Set(MOCK_GRADEBOOK_DATA.filter(g => g.task.CourseId === courseId).map(g => g.task.id))];
    
    const gradedTasks = studentGrades.filter(g => g.student.calification !== null);
    const totalGrade = gradedTasks.reduce((sum, grade) => sum + (grade.student.calification || 0), 0);
    const averageGrade = gradedTasks.length > 0 ? totalGrade / gradedTasks.length : 0;
    
    const summary = {
      student: { id: studentId, name: student?.name || "Unknown Student" },
      grades: studentGrades,
      averageGrade: Math.round(averageGrade * 10) / 10,
      completedTasks: gradedTasks.length,
      totalTasks: taskIds.length
    };
    
    console.log(`MOCK: Returning grade summary for student ${studentId} in course ${courseId}`);
    console.log("STUDENT GRADE SUMMARY:", summary);
    
    return summary;
  }

  try {
    const response = await apiClient.get(`/courses/${courseId}/gradebook/students/${studentId}/summary`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}