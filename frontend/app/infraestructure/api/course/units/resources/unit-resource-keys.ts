// File: src/app/features/courses/api/unit-resource-keys.ts

import { CourseId, UnitId } from "@/app/domain/valueObjects";

/**
 * Query key factory for unit resource-related queries
 */
export const unitResourceKeys = {
  all: ["unitResources"] as const,
  
  // Resources by unit
  lists: () => [...unitResourceKeys.all, "list"] as const,
  list: (courseId: CourseId, unitId: UnitId) => [...unitResourceKeys.lists(), courseId, unitId] as const,
  
  // Individual resource
  details: () => [...unitResourceKeys.all, "detail"] as const,
  detail: (id: string) => [...unitResourceKeys.details(), id] as const,
  
  // Resource mutations
  mutations: () => [...unitResourceKeys.all, "mutation"] as const,
  createAssignment: () => [...unitResourceKeys.mutations(), "createAssignment"] as const,
  createQuiz: () => [...unitResourceKeys.mutations(), "createQuiz"] as const,
  createPage: () => [...unitResourceKeys.mutations(), "createPage"] as const,
  update: () => [...unitResourceKeys.mutations(), "update"] as const,
  delete: () => [...unitResourceKeys.mutations(), "delete"] as const,
  
  // Statistics
  stats: () => [...unitResourceKeys.all, "stats"] as const,
  statsByUnit: (courseId: CourseId, unitId: UnitId) => [...unitResourceKeys.stats(), courseId, unitId] as const,
} as const;