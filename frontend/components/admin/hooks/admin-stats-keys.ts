export const adminStatsKeys = {
  all: ["admin-stats"] as const,
  dashboard: () => [...adminStatsKeys.all, "dashboard"] as const,
  aiBreakdown: () => [...adminStatsKeys.all, "ai-breakdown"] as const,
  userCounts: () => [...adminStatsKeys.all, "user-counts"] as const,
  aiAssignments: (page: number, size: number, month?: string) =>
    [...adminStatsKeys.all, "ai-assignments", { page, size, month }] as const,
  lateSubmissions: (page: number, size: number, month?: string) =>
    [...adminStatsKeys.all, "late-submissions", { page, size, month }] as const,
  coursesByAI: (sort: "asc" | "desc") =>
    [...adminStatsKeys.all, "courses-by-ai", sort] as const,
  coursesByLate: (sort: "asc" | "desc") =>
    [...adminStatsKeys.all, "courses-by-late", sort] as const,
  topQuizzes: (limit: number) =>
    [...adminStatsKeys.all, "top-quizzes", limit] as const,
  overdueAssignments: (page: number, size: number) =>
    [...adminStatsKeys.all, "overdue-assignments", { page, size }] as const,
  aiInsights: () => [...adminStatsKeys.all, "ai-insights"] as const,
};