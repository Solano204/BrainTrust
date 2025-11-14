import { CourseId, UnitId } from "@/app/domain/valueObjects";

// File: src/app/features/courses/api/assignment-keys.ts
export const assignmentKeys = {
  all: ["assignments"] as const,
  lists: () => [...assignmentKeys.all, "list"] as const,
  list: (courseId: CourseId, unitId: UnitId) => [...assignmentKeys.lists(), courseId, unitId] as const,
  details: () => [...assignmentKeys.all, "detail"] as const,
  detail: (id: string) => [...assignmentKeys.details(), id] as const,
  mutations: () => [...assignmentKeys.all, "mutation"] as const,
  create: () => [...assignmentKeys.mutations(), "create"] as const,
  update: () => [...assignmentKeys.mutations(), "update"] as const,
  delete: () => [...assignmentKeys.mutations(), "delete"] as const,
} as const;