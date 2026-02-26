"use server";

import axios from "axios";
import { GradeDTO } from "@/app/shared/dtos/assignment.dto";
import { cookies } from "next/headers";

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
  type: "ASSIGNMENT" | "QUIZ";
  submittedAt?: string;
  gradedAt?: string;
}

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

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
    (error) => Promise.reject(error)
);

const handleApiError = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    throw new Error(
        error.response?.data?.message || error.message
    );
  }
  throw error;
};

const convertMapToObject = (mapData: any): Record<string, any> => {
  if (!mapData) return {};
  if (mapData instanceof Map) return Object.fromEntries(mapData);
  if (typeof mapData === "object") return mapData;
  return {};
};

const extractTaskName = (taskId: string): string => {
  if (taskId.includes("assign_")) return `Assignment ${taskId.split("_").pop()}`;
  if (taskId.includes("quiz_")) return `Quiz ${taskId.split("_").pop()}`;
  if (taskId.includes("task_")) return `Task ${taskId.split("_").pop()}`;
  return taskId;
};

const mapBackendGradebookToFrontend = (
    backendData: GradebookDTO
): StudentGradebook => ({
  studentId: backendData.studentId,
  studentName: backendData.studentName,
  courseId: backendData.courseId,
  calculatedTotal: backendData.calculatedTotal,
  finalGrade: backendData.finalGrade,
  finalFeedback: backendData.finalFeedback,
  lastCalculated: backendData.lastCalculated,
  tasks: [],
});

const mapBackendUnitGradesToFrontendTasks = (
    backendData: UnitGradeDTO[]
): StudentGradebookTask[] => {
  const tasks: StudentGradebookTask[] = [];

  backendData.forEach((unit) => {
    const unitName = unit.unitName || "Unit";

    Object.entries(convertMapToObject(unit.assignmentGrades)).forEach(
        ([id, grade]: any) => {
          tasks.push({
            id,
            name: extractTaskName(id),
            unitName,
            maxPoints: parseFloat(grade.maxScore) || 100,
            score: grade.value ? parseFloat(grade.value) : null,
            type: "ASSIGNMENT",
          });
        }
    );

    Object.entries(convertMapToObject(unit.quizGrades)).forEach(
        ([id, grade]: any) => {
          tasks.push({
            id,
            name: extractTaskName(id),
            unitName,
            maxPoints: parseFloat(grade.maxScore) || 100,
            score: grade.value ? parseFloat(grade.value) : null,
            type: "QUIZ",
          });
        }
    );
  });

  return tasks;
};

const mapCompleteBackendDataToFrontend = (
    gradebook: GradebookDTO,
    unitGrades: UnitGradeDTO[]
): StudentGradebook => {
  const result = mapBackendGradebookToFrontend(gradebook);
  result.tasks = mapBackendUnitGradesToFrontendTasks(unitGrades);
  return result;
};

export async function fetchStudentGradebook(
    courseId: string,
    studentId: string
): Promise<StudentGradebook> {
  try {
    const gradebookRes = await apiClient.get<GradebookDTO>(
        `/api/gradebook/course/${courseId}/student/${studentId}`
    );

    return mapCompleteBackendDataToFrontend(
        gradebookRes.data,
        []
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function fetchStudentGradebookByUnitGrades(
    courseId: string,
    studentId: string
): Promise<StudentGradebook> {
  try {
    const unitsRes = await apiClient.get(
        `/api/courses/${courseId}/units`
    );

    const unitGradesResponses = await Promise.all(
        unitsRes.data.map((unit: any) =>
            apiClient.get<UnitGradeDTO[]>(
                `/api/unit-grades/unit/${unit.id}`
            )
        )
    );

    const unitGrades = unitGradesResponses
        .flatMap((r) => r.data)
        .filter((u) => u.studentId === studentId);

    const gradebookRes = await apiClient.get<GradebookDTO>(
        `/api/gradebook/course/${courseId}/student/${studentId}`
    );

    return mapCompleteBackendDataToFrontend(
        gradebookRes.data,
        unitGrades
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function fetchStudentFinalGrade(
    courseId: string,
    studentId: string
): Promise<{ grade: string; feedback: string }> {
  try {
    const res = await apiClient.get<GradebookDTO[]>(
        `/api/gradebook/course/${courseId}`
    );

    const gb = res.data.find((g) => g.studentId === studentId);

    return gb
        ? { grade: gb.finalGrade, feedback: gb.finalFeedback }
        : { grade: "N/A", feedback: "No data" };
  } catch (error) {
    return handleApiError(error);
  }
}

export async function assignFinalGrade(
    courseId: string,
    studentId: string,
    gradeValue: string,
    feedback?: string
): Promise<void> {
  try {
    await apiClient.put(
        `/api/gradebook/course/${courseId}/student/${studentId}/final-grade`,
        { gradeValue, feedback: feedback || "" }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function assignUnitFinalGrade(
    unitId: string,
    studentId: string,
    gradeValue: string,
    feedback?: string
): Promise<void> {
  try {
    await apiClient.put(
        `/api/unit-grades/unit/${unitId}/student/${studentId}/final-grade`,
        { gradeValue, feedback: feedback || "" }
    );

    console.log(`Assigned final grade for student ${studentId} in unit ${unitId}: ${gradeValue}`);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function fetchUnitGrades(
    unitId: string
): Promise<UnitGradeDTO[]> {
  try {
    const res = await apiClient.get<UnitGradeDTO[]>(
        `/api/unit-grades/unit/${unitId}`
    );
    return res.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function exportStudentGrades(
    courseId: string,
    studentId: string
): Promise<Blob> {
  try {
    const res = await apiClient.get(
        `/api/gradebook/course/${courseId}/student/${studentId}/export`,
        { responseType: "blob" }
    );
    return res.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function fetchCourseGradebooks(
    courseId: string
): Promise<GradebookDTO[]> {
  try {
    const res = await apiClient.get<GradebookDTO[]>(
        `/api/gradebook/course/${courseId}`
    );
    return res.data;
  } catch (error) {
    return handleApiError(error);
  }
}
