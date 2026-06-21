"use client";

import { useQuery } from "@tanstack/react-query";
import { adminStatsKeys } from "./admin-stats-keys";

import {
  getAdminStats,
  getAIBreakdown,
  getUserCounts,
  getAIAssignmentsPaginated,
  getLateSubmissionsPaginated,
  getCoursesByAI,
  getCoursesByLate,
  getTopQuizzes,
  getOverdueAssignmentsPaginated,
  getCourseEnrollments,
} from "@/components/admin/api/adminStatsApi";

import { generateAIInsights } from "@/components/admin/api/aiinsightsApi";

import type {
  AdminStatsDTO,
  AIStatsBreakdownDTO,
  UserCountDTO,
  AIAssignmentPageDTO,
  LateSubmissionDTO,
  CourseAIStatsDTO,
  QuizTopDTO,
  OverdueAssignmentDTO,
  PaginatedStatsDTO,
} from "@/components/admin/api/adminStatsApi";

import type { AdminEnrollment } from "@/app/shared/models/admin-course.model";

import type { AIInsightsResponse } from "@/components/admin/api/aiinsightsApi";

export function useAdminStats() {
  return useQuery<AdminStatsDTO, Error>({
    queryKey: adminStatsKeys.dashboard(),
    queryFn: getAdminStats,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useAIBreakdown() {
  return useQuery<AIStatsBreakdownDTO, Error>({
    queryKey: adminStatsKeys.aiBreakdown(),
    queryFn: getAIBreakdown,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useUserCounts() {
  return useQuery<UserCountDTO, Error>({
    queryKey: adminStatsKeys.userCounts(),
    queryFn: getUserCounts,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useAIAssignmentsPaginated(page = 0, size = 20, month?: string) {
  return useQuery<PaginatedStatsDTO<AIAssignmentPageDTO>, Error>({
    queryKey: adminStatsKeys.aiAssignments(page, size, month),
    queryFn: () => getAIAssignmentsPaginated(page, size, month),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useLateSubmissionsPaginated(page = 0, size = 20, month?: string) {
  return useQuery<PaginatedStatsDTO<LateSubmissionDTO>, Error>({
    queryKey: adminStatsKeys.lateSubmissions(page, size, month),
    queryFn: () => getLateSubmissionsPaginated(page, size, month),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useCoursesByAI(sort: "asc" | "desc" = "desc") {
  return useQuery<CourseAIStatsDTO[], Error>({
    queryKey: adminStatsKeys.coursesByAI(sort),
    queryFn: () => getCoursesByAI(sort),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useCoursesByLate(sort: "asc" | "desc" = "desc") {
  return useQuery<CourseAIStatsDTO[], Error>({
    queryKey: adminStatsKeys.coursesByLate(sort),
    queryFn: () => getCoursesByLate(sort),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useTopQuizzes(limit = 20) {
  return useQuery<QuizTopDTO[], Error>({
    queryKey: adminStatsKeys.topQuizzes(limit),
    queryFn: () => getTopQuizzes(limit),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useOverdueAssignmentsPaginated(page = 0, size = 20) {
  return useQuery<PaginatedStatsDTO<OverdueAssignmentDTO>, Error>({
    queryKey: adminStatsKeys.overdueAssignments(page, size),
    queryFn: () => getOverdueAssignmentsPaginated(page, size),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useCourseEnrollments(courseId: string | null) {
  return useQuery<AdminEnrollment[], Error>({
    queryKey: adminStatsKeys.courseEnrollments(courseId ?? ""),
    queryFn: () => getCourseEnrollments(courseId!),
    enabled: !!courseId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

/**
 * ✅ MANUAL AI INSIGHTS - Does NOT fetch by default
 * Call refetch() to generate insights
 */
export function useAIInsights(
  stats: AdminStatsDTO | undefined,
  breakdown: AIStatsBreakdownDTO | undefined,
  userCounts: UserCountDTO | undefined,
  coursesByAI: CourseAIStatsDTO[] | undefined
) {
  return useQuery<AIInsightsResponse, Error>({
    queryKey: adminStatsKeys.aiInsights(),
    queryFn: () =>
      generateAIInsights(
        stats!,
        breakdown ?? null,
        userCounts ?? null,
        coursesByAI ?? null
      ),
    enabled: false, // ← MANUAL ONLY - user must click "Regenerar IA"
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}