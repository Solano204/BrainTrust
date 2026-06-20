"use server";

import { apiClient } from "@/app/shared/api/http";
import { handleApiError } from "@/app/shared/utils/api-error";


export interface OverallStatsDTO {
  totalAssignments: number;
  totalAnalyzed: number;
  totalPending: number;
  percentageAnalyzed: number;
}

export interface AIAnalysisStatsDTO {
  percentageFullAI: number;
  percentageHighAI: number;
  percentageLowAI: number;
  percentageHuman: number;
  countFullAI: number;
  countHighAI: number;
  countLowAI: number;
  countHuman: number;
  averageAIProbability: number;
}

export interface AssignmentByUnitDTO {
  unitId: string;
  unitName: string;
  courseName: string; // ← NEW: course name for display
  count: number;
  averageAIProbability: number;
}

export interface AssignmentStatsDTO {
  totalActive: number;
  totalInactive: number;
  totalGroupAssignments: number;
  totalIndividualAssignments: number;
  assignmentsByUnit: AssignmentByUnitDTO[];
}

export interface TeacherCountDTO {
  teacherId: string;
  teacherName: string;
  assignmentCount: number;
  averageAIProbability: number;
}

export interface StudentCountDTO {
  studentId: string;
  studentName: string;
  submissionCount: number;
  averageGrade: number;
}

export interface UserStatsDTO {
  totalTeachers: number;
  totalStudents: number;
  totalEnrolled: number;
  teachersWithMostAssignments: TeacherCountDTO[];
  studentsWithMostSubmissions: StudentCountDTO[];
}

export interface OverdueAssignmentDTO {
  assignmentId: string;
  assignmentTitle: string;
  teacherId: string;
  teacherName: string;
  courseId: string;
  courseName: string;
  dueDate: string;
  daysOverdue: number;
  aiProbability: number;
}

export interface DeadlineStatsDTO {
  overdue: number;
  dueSoon: number;
  upcoming: number;
  overdueAssignments: OverdueAssignmentDTO[];
}

export interface AssignmentDetailDTO {
  assignmentId: string;
  title: string;
  courseId: string;
  courseName: string;
  aiProbability: number;
  analysisStatus: string;
  dueDate: string;
}

export interface TeacherAssignmentStatsDTO {
  teacherId: string;
  teacherName: string;
  totalAssignments: number;
  aiDetectedCount: number;
  averageAIProbability: number;
  recentAssignments: AssignmentDetailDTO[];
}

export interface AdminStatsDTO {
  overallStats: OverallStatsDTO;
  aiAnalysisStats: AIAnalysisStatsDTO;
  assignmentStats: AssignmentStatsDTO;
  userStats: UserStatsDTO;
  deadlineStats: DeadlineStatsDTO;
  teacherStats: TeacherAssignmentStatsDTO[];
}

export interface AIAssignmentPageDTO {
  assignmentId: string;
  assignmentTitle: string;
  courseId: string;
  courseName: string;
  dueDate: string;
  aiProbability: number;
  analysisStatus: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  submissionId: string;
  submittedAt: string;
  isLate: boolean;
}

export interface AIStatsBreakdownDTO {
  averageAIProbability: number;
  countFullAI: number;
  percentageFullAI: number;
  countHighAI: number;
  percentageHighAI: number;
  countLowAI: number;
  percentageLowAI: number;
  countHuman: number;
  percentageHuman: number;
  totalAnalyzed: number;
  totalSubmissions: number;
}

export interface UserCountDTO {
  totalStudents: number;
  totalTeachers: number;
  totalActiveStudents: number;
  totalActiveTeachers: number;
}

export interface LateSubmissionDTO {
  submissionId: string;
  assignmentId: string;
  assignmentTitle: string;
  courseId: string;
  courseName: string;
  studentId: string;
  studentName: string;
  dueDate: string;
  submittedAt: string;
  minutesLate: number;
  aiProbability: number;
  grade: string;
}

export interface CourseAIStatsDTO {
  courseId: string;
  courseName: string;
  teacherId: string;
  teacherName: string;
  totalSubmissions: number;
  aiDetectedSubmissions: number;
  aiPercentage: number;
  lateSubmissions: number;
  latePercentage: number;
  averageAIProbability: number;
}

export interface QuizTopDTO {
  quizId: string;
  quizTitle: string;
  courseId: string;
  courseName: string;
  studentId: string;
  studentName: string;
  grade: number;
  maxScore: number;
  percentage: number;
  submittedAt: string;
  attemptNumber: number;
}

export interface PaginatedStatsDTO<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}


const BASE = "/api/admin/stats";

/** GET /api/admin/stats — full composite dashboard */
export async function getAdminStats(): Promise<AdminStatsDTO> {
  try {
    const { data } = await apiClient.get<AdminStatsDTO>(BASE);
    return data;
  } catch (error) {
    return handleApiError(error);
  }
}

/** GET /api/admin/stats/ai-assignments?page=&size=&month= */
export async function getAIAssignmentsPaginated(
  page = 0,
  size = 20,
  month?: string
): Promise<PaginatedStatsDTO<AIAssignmentPageDTO>> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    if (month) {
      params.append("month", month);
    }
    const { data } = await apiClient.get<PaginatedStatsDTO<AIAssignmentPageDTO>>(
      `${BASE}/ai-assignments?${params}`
    );
    return data;
  } catch (error) {
    return handleApiError(error);
  }
}

/** GET /api/admin/stats/ai-breakdown */
export async function getAIBreakdown(): Promise<AIStatsBreakdownDTO> {
  try {
    const { data } = await apiClient.get<AIStatsBreakdownDTO>(
      `${BASE}/ai-breakdown`
    );
    return data;
  } catch (error) {
    return handleApiError(error);
  }
}

/** GET /api/admin/stats/user-counts */
export async function getUserCounts(): Promise<UserCountDTO> {
  try {
    const { data } = await apiClient.get<UserCountDTO>(
      `${BASE}/user-counts`
    );
    return data;
  } catch (error) {
    return handleApiError(error);
  }
}

/** GET /api/admin/stats/late-submissions?page=&size=&month= */
export async function getLateSubmissionsPaginated(
  page = 0,
  size = 20,
  month?: string
): Promise<PaginatedStatsDTO<LateSubmissionDTO>> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    if (month) {
      params.append("month", month);
    }
    const { data } = await apiClient.get<PaginatedStatsDTO<LateSubmissionDTO>>(
      `${BASE}/late-submissions?${params}`
    );
    return data;
  } catch (error) {
    return handleApiError(error);
  }
}

/** GET /api/admin/stats/courses/by-ai?sort=desc */
export async function getCoursesByAI(
  sort: "asc" | "desc" = "desc"
): Promise<CourseAIStatsDTO[]> {
  try {
    const { data } = await apiClient.get<CourseAIStatsDTO[]>(
      `${BASE}/courses/by-ai?sort=${sort}`
    );
    return data;
  } catch (error) {
    return handleApiError(error);
  }
}

/** GET /api/admin/stats/courses/by-late?sort=desc */
export async function getCoursesByLate(
  sort: "asc" | "desc" = "desc"
): Promise<CourseAIStatsDTO[]> {
  try {
    const { data } = await apiClient.get<CourseAIStatsDTO[]>(
      `${BASE}/courses/by-late?sort=${sort}`
    );
    return data;
  } catch (error) {
    return handleApiError(error);
  }
}

/** GET /api/admin/stats/quizzes/top?limit=20 */
export async function getTopQuizzes(limit = 20): Promise<QuizTopDTO[]> {
  try {
    const { data } = await apiClient.get<QuizTopDTO[]>(
      `${BASE}/quizzes/top?limit=${limit}`
    );
    return data;
  } catch (error) {
    return handleApiError(error);
  }
}

/** GET /api/admin/stats/overdue-assignments?page=&size= */
export async function getOverdueAssignmentsPaginated(
  page = 0,
  size = 20
): Promise<PaginatedStatsDTO<OverdueAssignmentDTO>> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    const { data } = await apiClient.get<PaginatedStatsDTO<OverdueAssignmentDTO>>(
      `${BASE}/overdue-assignments?${params}`
    );
    return data;
  } catch (error) {
    return handleApiError(error);
  }
}

/** GET /api/admin/stats/health */
export async function getAdminStatsHealth(): Promise<string> {
  try {
    const { data } = await apiClient.get<string>(`${BASE}/health`);
    return data;
  } catch (error) {
    return handleApiError(error);
  }
}
