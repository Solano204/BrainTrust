// File: src/app/features/courses/api/unit-keys.ts

import { CourseId, UnitId } from "@/app/domain/valueObjects";

/**
 * Query key factory for unit-related queries
 */
export const unitKeys = {
  all: ["units"] as const,
  
  // Units by course
  lists: () => [...unitKeys.all, "list"] as const,
  list: (courseId: CourseId) => [...unitKeys.lists(), courseId] as const,
  
  // Individual unit
  details: () => [...unitKeys.all, "detail"] as const,
  detail: (id: UnitId) => [...unitKeys.details(), id] as const,
  
  // Unit mutations
  mutations: () => [...unitKeys.all, "mutation"] as const,
  create: () => [...unitKeys.mutations(), "create"] as const,
  update: () => [...unitKeys.mutations(), "update"] as const,
  delete: () => [...unitKeys.mutations(), "delete"] as const,
  reorder: () => [...unitKeys.mutations(), "reorder"] as const,
  
  // Resources
  resources: () => [...unitKeys.all, "resources"] as const,
  resourceList: (unitId: UnitId) => [...unitKeys.resources(), unitId] as const,
} as const;